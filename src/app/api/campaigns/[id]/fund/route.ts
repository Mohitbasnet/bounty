import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";

import db from "@/lib/db";
import { getConnection, USDC_MINT } from "@/lib/solana";

export const runtime = "nodejs";

const bodySchema = z.object({
  signature: z.string().min(32),
  ownerWallet: z.string().min(32),
});

export async function POST(
  request: Request,
  context: RouteContext<"/api/campaigns/[id]/fund">,
) {
  const { id } = await context.params;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid funding proof." }, { status: 400 });
  }

  const campaign = db
    .prepare(
      `SELECT campaigns.*, companies.owner_wallet
       FROM campaigns JOIN companies ON companies.id = campaigns.company_id
       WHERE campaigns.id = ?`,
    )
    .get(id) as
    | {
        id: string;
        owner_wallet: string;
        treasury_wallet: string;
        budget_micro: number;
        status: string;
      }
    | undefined;

  if (!campaign || campaign.owner_wallet !== parsed.data.ownerWallet) {
    return Response.json({ error: "Campaign not found." }, { status: 404 });
  }
  if (campaign.status !== "draft") {
    return Response.json({ error: "Campaign is already funded." }, { status: 409 });
  }

  const connection = getConnection();
  const transaction = await connection.getParsedTransaction(
    parsed.data.signature,
    { commitment: "confirmed", maxSupportedTransactionVersion: 0 },
  );
  const signedByOwner = transaction?.transaction.message.accountKeys.some(
    (account) =>
      account.pubkey.toBase58() === parsed.data.ownerWallet && account.signer,
  );
  if (!transaction || transaction.meta?.err || !signedByOwner) {
    return Response.json(
      { error: "The funding transaction is not confirmed or was not signed by the owner." },
      { status: 400 },
    );
  }

  const treasuryAta = await getAssociatedTokenAddress(
    USDC_MINT,
    new PublicKey(campaign.treasury_wallet),
  );
  const balance = await connection.getTokenAccountBalance(treasuryAta).catch(
    () => null,
  );
  const fundedMicro = Number(balance?.value.amount ?? 0);
  if (fundedMicro < campaign.budget_micro) {
    return Response.json(
      {
        error: `Treasury received insufficient USDC. Expected ${campaign.budget_micro} base units.`,
      },
      { status: 400 },
    );
  }

  const now = new Date();
  const endsAt = new Date(
    now.getTime() +
      Number(
        (
          db.prepare("SELECT duration_days FROM campaigns WHERE id = ?").get(id) as {
            duration_days: number;
          }
        ).duration_days,
      ) *
        86_400_000,
  );
  db.prepare(
    `UPDATE campaigns
     SET status = 'live', funded_micro = ?, funding_signature = ?,
         starts_at = ?, ends_at = ?
     WHERE id = ?`,
  ).run(fundedMicro, parsed.data.signature, now.toISOString(), endsAt.toISOString(), id);

  return Response.json({
    campaign: { id, status: "live", fundingSignature: parsed.data.signature },
  });
}
