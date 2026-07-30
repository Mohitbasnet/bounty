import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

import db, { createId, decryptSecret } from "@/lib/db";
import {
  getConnection,
  USDC_DECIMALS,
  USDC_MINT,
} from "@/lib/solana";

type PayoutRow = {
  id: string;
  campaign_id: string;
  creator_wallet: string;
  status: string;
  ownership_verified: number;
  accrued_micro: number;
  paid_micro: number;
  payout_state: string;
  encrypted_treasury_secret: string;
};

function getFeeConfig() {
  const configuredBps = Number(process.env.PLATFORM_FEE_BPS ?? "200");
  const bps = Math.max(
    0,
    Math.min(Number.isFinite(configuredBps) ? configuredBps : 200, 1_000),
  );
  const wallet = process.env.PLATFORM_FEE_WALLET;
  if (bps > 0 && !wallet) {
    throw new Error(
      "PLATFORM_FEE_WALLET is required when PLATFORM_FEE_BPS is greater than zero.",
    );
  }
  return { bps, wallet: wallet ? new PublicKey(wallet) : null };
}

async function ensureDevnetFeeBalance(treasury: PublicKey) {
  const connection = getConnection();
  if ((await connection.getBalance(treasury)) >= 0.005 * LAMPORTS_PER_SOL) {
    return;
  }
  const signature = await connection.requestAirdrop(
    treasury,
    0.05 * LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(signature, "confirmed");
}

function finalizePayout(
  payoutId: string,
  submissionId: string,
  campaignId: string,
  grossMicro: number,
  signature: string,
) {
  db.transaction(() => {
    const payoutUpdate = db.prepare(
      `UPDATE payouts
       SET status = 'confirmed', confirmed_at = ?
       WHERE id = ? AND status = 'pending'`,
    ).run(new Date().toISOString(), payoutId);
    if (payoutUpdate.changes !== 1) return;
    db.prepare(
      `UPDATE submissions
       SET paid_micro = paid_micro + ?, payout_signature = ?,
           payout_state = 'idle'
       WHERE id = ?`,
    ).run(grossMicro, signature, submissionId);
    db.prepare(
      `UPDATE campaigns
       SET paid_micro = paid_micro + ?,
           reserved_micro = MAX(reserved_micro - ?, 0)
       WHERE id = ?`,
    ).run(grossMicro, grossMicro, campaignId);
  })();
}

async function reconcilePendingPayout(submissionId: string) {
  const pending = db
    .prepare(
      `SELECT * FROM payouts
       WHERE submission_id = ? AND status = 'pending'
       ORDER BY created_at DESC LIMIT 1`,
    )
    .get(submissionId) as
    | {
        id: string;
        campaign_id: string;
        gross_micro: number;
        signature: string;
      }
    | undefined;
  if (!pending) return null;

  const status = (
    await getConnection().getSignatureStatuses([pending.signature], {
      searchTransactionHistory: true,
    })
  ).value[0];
  if (status?.err) {
    db.transaction(() => {
      db.prepare(
        `UPDATE payouts SET status = 'failed', error = ? WHERE id = ?`,
      ).run(JSON.stringify(status.err), pending.id);
      db.prepare(
        `UPDATE submissions SET payout_state = 'idle' WHERE id = ?`,
      ).run(submissionId);
    })();
    return null;
  }
  if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
    finalizePayout(
      pending.id,
      submissionId,
      pending.campaign_id,
      pending.gross_micro,
      pending.signature,
    );
    return { signature: pending.signature, reconciled: true };
  }
  throw new Error(
    `Payout ${pending.signature} is still pending confirmation.`,
  );
}

export async function payoutSubmission(id: string) {
  const reconciled = await reconcilePendingPayout(id);
  if (reconciled) return reconciled;

  const row = db
    .prepare(
      `SELECT submissions.*, campaigns.encrypted_treasury_secret
       FROM submissions
       JOIN campaigns ON campaigns.id = submissions.campaign_id
       WHERE submissions.id = ?`,
    )
    .get(id) as PayoutRow | undefined;
  if (
    !row ||
    row.status !== "approved" ||
    row.ownership_verified !== 1
  ) {
    throw new Error(
      "Only approved, X-verified submissions can be paid.",
    );
  }

  const grossMicro = row.accrued_micro - row.paid_micro;
  if (grossMicro <= 0) throw new Error("No accrued balance is payable.");

  const lock = db
    .prepare(
      `UPDATE submissions SET payout_state = 'processing'
       WHERE id = ? AND payout_state = 'idle'`,
    )
    .run(id);
  if (lock.changes !== 1) {
    throw new Error("A payout is already processing for this submission.");
  }

  let payoutId = "";
  let signature = "";
  let broadcasted = false;
  try {
    const connection = getConnection();
    const treasury = Keypair.fromSecretKey(
      decryptSecret(row.encrypted_treasury_secret),
    );
    await ensureDevnetFeeBalance(treasury.publicKey);

    const creator = new PublicKey(row.creator_wallet);
    const treasuryAta = await getAssociatedTokenAddress(
      USDC_MINT,
      treasury.publicKey,
    );
    const creatorAta = await getAssociatedTokenAddress(USDC_MINT, creator);
    const { bps, wallet: feeWallet } = getFeeConfig();
    const feeMicro = Math.floor((grossMicro * bps) / 10_000);
    const creatorMicro = grossMicro - feeMicro;
    const transaction = new Transaction();

    if (!(await connection.getAccountInfo(creatorAta))) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          treasury.publicKey,
          creatorAta,
          creator,
          USDC_MINT,
        ),
      );
    }
    transaction.add(
      createTransferCheckedInstruction(
        treasuryAta,
        USDC_MINT,
        creatorAta,
        treasury.publicKey,
        BigInt(creatorMicro),
        USDC_DECIMALS,
      ),
    );

    if (feeWallet && feeMicro > 0) {
      const feeAta = await getAssociatedTokenAddress(USDC_MINT, feeWallet);
      if (!(await connection.getAccountInfo(feeAta))) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            treasury.publicKey,
            feeAta,
            feeWallet,
            USDC_MINT,
          ),
        );
      }
      transaction.add(
        createTransferCheckedInstruction(
          treasuryAta,
          USDC_MINT,
          feeAta,
          treasury.publicKey,
          BigInt(feeMicro),
          USDC_DECIMALS,
        ),
      );
    }

    transaction.feePayer = treasury.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash("confirmed")
    ).blockhash;
    transaction.sign(treasury);
    signature = bs58.encode(transaction.signature!);
    payoutId = createId("payout");
    db.prepare(
      `INSERT INTO payouts
        (id, submission_id, campaign_id, gross_micro, creator_micro,
         fee_micro, signature, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    ).run(
      payoutId,
      id,
      row.campaign_id,
      grossMicro,
      creatorMicro,
      feeMicro,
      signature,
      new Date().toISOString(),
    );

    await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    broadcasted = true;
    await connection.confirmTransaction(signature, "confirmed");
    finalizePayout(payoutId, id, row.campaign_id, grossMicro, signature);
    return {
      signature,
      grossMicro,
      creatorMicro,
      feeMicro,
      reconciled: false,
    };
  } catch (cause) {
    if (!signature || !broadcasted) {
      db.prepare(
        `UPDATE submissions SET payout_state = 'idle' WHERE id = ?`,
      ).run(id);
    }
    if (payoutId && !broadcasted) {
      db.prepare(
        `UPDATE payouts SET status = 'failed', error = ? WHERE id = ?`,
      ).run(
        cause instanceof Error ? cause.message : "Payout failed.",
        payoutId,
      );
    }
    throw cause;
  }
}

export async function payoutAllEligibleSubmissions() {
  const rows = db
    .prepare(
      `SELECT submissions.id
       FROM submissions
       JOIN campaigns ON campaigns.id = submissions.campaign_id
       WHERE submissions.status = 'approved'
         AND submissions.ownership_verified = 1
         AND submissions.accrued_micro > submissions.paid_micro
         AND campaigns.status = 'live'
       ORDER BY submissions.created_at ASC`,
    )
    .all() as { id: string }[];

  const results = [];
  for (const row of rows) {
    try {
      results.push({
        id: row.id,
        status: "paid",
        payout: await payoutSubmission(row.id),
      });
    } catch (cause) {
      results.push({
        id: row.id,
        status: "failed",
        error: cause instanceof Error ? cause.message : "Payout failed.",
      });
    }
  }
  return results;
}
