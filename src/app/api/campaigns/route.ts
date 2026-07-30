import { Keypair } from "@solana/web3.js";
import { z } from "zod";

import {
  assertFreshMessage,
  signedRequestSchema,
  verifySignedMessage,
} from "@/lib/auth";
import db, { createId, encryptSecret, slugify } from "@/lib/db";
import { verifyActionMessage } from "@/lib/messages";

export const runtime = "nodejs";

const campaignInputSchema = z.object({
  companyName: z.string().trim().min(2).max(80),
  title: z.string().trim().min(8).max(100),
  description: z.string().trim().min(20).max(2_000),
  durationDays: z.number().int().min(1).max(90),
  budgetMicro: z.number().int().min(1_000_000),
  unlockViews: z.number().int().min(0).max(100_000_000),
  viewsPerBlock: z.number().int().min(1).max(1_000_000),
  rewardPerBlockMicro: z.number().int().min(1),
  maxPerCreatorMicro: z.number().int().min(1),
});

const createCampaignSchema = signedRequestSchema.extend({
  campaign: campaignInputSchema,
});

export async function GET() {
  const campaigns = db
    .prepare(
      `SELECT campaigns.*, companies.name AS company_name,
        companies.slug AS company_slug
       FROM campaigns
       JOIN companies ON companies.id = campaigns.company_id
       ORDER BY campaigns.created_at DESC`,
    )
    .all();
  return Response.json({ campaigns });
}

export async function POST(request: Request) {
  const parsed = createCampaignSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid campaign." },
      { status: 400 },
    );
  }
  if (
    !verifySignedMessage(parsed.data) ||
    !assertFreshMessage(parsed.data.message) ||
    !verifyActionMessage({
      message: parsed.data.message,
      action: "campaign.create",
      wallet: parsed.data.wallet,
      payload: parsed.data.campaign,
    })
  ) {
    return Response.json(
      { error: "A fresh valid wallet signature is required." },
      { status: 401 },
    );
  }

  let company = db
    .prepare("SELECT * FROM companies WHERE owner_wallet = ?")
    .get(parsed.data.wallet) as { id: string } | undefined;

  if (!company) {
    const id = createId("company");
    db.prepare(
      `INSERT INTO companies
        (id, slug, name, owner_wallet, website, description, created_at)
       VALUES (?, ?, ?, ?, '', '', ?)`,
    ).run(
      id,
      slugify(parsed.data.campaign.companyName),
      parsed.data.campaign.companyName,
      parsed.data.wallet,
      new Date().toISOString(),
    );
    company = { id };
  }

  const treasury = Keypair.generate();
  const campaign = {
    id: createId("campaign"),
    slug: slugify(parsed.data.campaign.title),
    company_id: company.id,
    title: parsed.data.campaign.title,
    description: parsed.data.campaign.description,
    status: "draft",
    treasury_wallet: treasury.publicKey.toBase58(),
    encrypted_treasury_secret: encryptSecret(treasury.secretKey),
    budget_micro: parsed.data.campaign.budgetMicro,
    unlock_views: parsed.data.campaign.unlockViews,
    views_per_block: parsed.data.campaign.viewsPerBlock,
    reward_per_block_micro: parsed.data.campaign.rewardPerBlockMicro,
    max_per_creator_micro: parsed.data.campaign.maxPerCreatorMicro,
    duration_days: parsed.data.campaign.durationDays,
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO campaigns
      (id, slug, company_id, title, description, status, treasury_wallet,
       encrypted_treasury_secret, budget_micro, unlock_views, views_per_block,
       reward_per_block_micro, max_per_creator_micro, duration_days, created_at)
     VALUES
      (@id, @slug, @company_id, @title, @description, @status, @treasury_wallet,
       @encrypted_treasury_secret, @budget_micro, @unlock_views, @views_per_block,
       @reward_per_block_micro, @max_per_creator_micro, @duration_days, @created_at)`,
  ).run(campaign);

  return Response.json(
    {
      campaign: {
        id: campaign.id,
        slug: campaign.slug,
        status: campaign.status,
        treasuryWallet: campaign.treasury_wallet,
        budgetMicro: campaign.budget_micro,
      },
    },
    { status: 201 },
  );
}
