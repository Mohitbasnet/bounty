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

import db, { decryptSecret } from "@/lib/db";
import {
  getConnection,
  USDC_DECIMALS,
  USDC_MINT,
} from "@/lib/solana";

type RefundRow = {
  id: string;
  status: string;
  refund_state: string;
  refund_signature: string | null;
  refund_pending_micro: number;
  owner_wallet: string;
  encrypted_treasury_secret: string;
};

export async function refundCampaign(id: string) {
  let campaign = db
    .prepare(
      `SELECT campaigns.*, companies.owner_wallet
       FROM campaigns
       JOIN companies ON companies.id = campaigns.company_id
       WHERE campaigns.id = ?`,
    )
    .get(id) as RefundRow | undefined;
  if (!campaign) throw new Error("Campaign not found.");
  if (
    campaign.refund_state === "processing" &&
    campaign.refund_signature
  ) {
    const status = (
      await getConnection().getSignatureStatuses(
        [campaign.refund_signature],
        { searchTransactionHistory: true },
      )
    ).value[0];
    if (
      status?.confirmationStatus === "confirmed" ||
      status?.confirmationStatus === "finalized"
    ) {
      db.prepare(
        `UPDATE campaigns
         SET status = 'closed', refund_state = 'confirmed',
             refunded_micro = refund_pending_micro
         WHERE id = ?`,
      ).run(id);
      return {
        signature: campaign.refund_signature,
        refundMicro: campaign.refund_pending_micro,
        reconciled: true,
      };
    }
    if (status?.err) {
      db.prepare(
        `UPDATE campaigns
         SET refund_state = 'idle', refund_signature = NULL,
             refund_pending_micro = 0
         WHERE id = ?`,
      ).run(id);
      campaign = {
        ...campaign,
        refund_state: "idle",
        refund_signature: null,
        refund_pending_micro: 0,
      };
    } else {
      throw new Error(
        `Refund ${campaign.refund_signature} is still pending confirmation.`,
      );
    }
  }
  if (campaign.status === "closed") {
    return {
      signature: campaign.refund_signature,
      alreadyClosed: true,
    };
  }
  if (campaign.status !== "live") {
    throw new Error("Only funded live campaigns can be closed.");
  }

  const outstanding = db
    .prepare(
      `SELECT COALESCE(SUM(accrued_micro - paid_micro), 0) AS amount
       FROM submissions
       WHERE campaign_id = ? AND status = 'approved'`,
    )
    .get(id) as { amount: number };
  if (outstanding.amount > 0) {
    throw new Error(
      `Campaign has ${outstanding.amount} micro-USDC in unpaid creator earnings.`,
    );
  }

  const lock = db
    .prepare(
      `UPDATE campaigns SET refund_state = 'processing'
       WHERE id = ? AND refund_state = 'idle' AND status = 'live'`,
    )
    .run(id);
  if (lock.changes !== 1) {
    throw new Error("A refund is already processing for this campaign.");
  }

  let signature = "";
  let broadcasted = false;
  try {
    const connection = getConnection();
    const treasury = Keypair.fromSecretKey(
      decryptSecret(campaign.encrypted_treasury_secret),
    );
    const owner = new PublicKey(campaign.owner_wallet);
    const treasuryAta = await getAssociatedTokenAddress(
      USDC_MINT,
      treasury.publicKey,
    );
    const balance = await connection.getTokenAccountBalance(treasuryAta).catch(
      () => null,
    );
    const refundMicro = Number(balance?.value.amount ?? 0);
    if (refundMicro === 0) {
      db.prepare(
        `UPDATE campaigns
         SET status = 'closed', refund_state = 'confirmed',
             refunded_micro = 0
         WHERE id = ?`,
      ).run(id);
      return { signature: null, refundMicro: 0, alreadyClosed: false };
    }

    if (
      (await connection.getBalance(treasury.publicKey)) <
      0.005 * LAMPORTS_PER_SOL
    ) {
      const airdrop = await connection.requestAirdrop(
        treasury.publicKey,
        0.05 * LAMPORTS_PER_SOL,
      );
      await connection.confirmTransaction(airdrop, "confirmed");
    }

    const ownerAta = await getAssociatedTokenAddress(USDC_MINT, owner);
    const transaction = new Transaction();
    if (!(await connection.getAccountInfo(ownerAta))) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          treasury.publicKey,
          ownerAta,
          owner,
          USDC_MINT,
        ),
      );
    }
    transaction.add(
      createTransferCheckedInstruction(
        treasuryAta,
        USDC_MINT,
        ownerAta,
        treasury.publicKey,
        BigInt(refundMicro),
        USDC_DECIMALS,
      ),
    );
    transaction.feePayer = treasury.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash("confirmed")
    ).blockhash;
    transaction.sign(treasury);
    signature = bs58.encode(transaction.signature!);
    db.prepare(
      `UPDATE campaigns
       SET refund_signature = ?, refund_pending_micro = ?
       WHERE id = ?`,
    ).run(signature, refundMicro, id);

    await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    broadcasted = true;
    await connection.confirmTransaction(signature, "confirmed");
    db.prepare(
      `UPDATE campaigns
       SET status = 'closed', refund_state = 'confirmed',
           refunded_micro = ?
       WHERE id = ?`,
    ).run(refundMicro, id);
    return { signature, refundMicro, alreadyClosed: false };
  } catch (cause) {
    if (!signature || !broadcasted) {
      db.prepare(
        `UPDATE campaigns
         SET refund_state = 'idle', refund_signature = NULL,
             refund_pending_micro = 0
         WHERE id = ?`,
      ).run(id);
    }
    throw cause;
  }
}

export async function refundExpiredCampaigns() {
  const campaigns = db
    .prepare(
      `SELECT id FROM campaigns
       WHERE status = 'live' AND ends_at IS NOT NULL AND ends_at < ?
       ORDER BY ends_at ASC`,
    )
    .all(new Date().toISOString()) as { id: string }[];
  const results = [];
  for (const campaign of campaigns) {
    try {
      results.push({
        id: campaign.id,
        status: "refunded",
        refund: await refundCampaign(campaign.id),
      });
    } catch (cause) {
      results.push({
        id: campaign.id,
        status: "blocked",
        error: cause instanceof Error ? cause.message : "Refund failed.",
      });
    }
  }
  return results;
}
