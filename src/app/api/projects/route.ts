import { z } from "zod";

import {
  assertFreshMessage,
  signedRequestSchema,
  verifySignedMessage,
} from "@/lib/auth";
import db, { createId, slugify } from "@/lib/db";
import { verifyActionMessage } from "@/lib/messages";

export const runtime = "nodejs";

const createProjectSchema = signedRequestSchema.extend({
  company: z.object({
    name: z.string().trim().min(2).max(80),
    website: z.string().trim().max(200).default(""),
    description: z.string().trim().max(500).default(""),
  }),
});

export async function GET() {
  const companies = db
    .prepare(
      `SELECT companies.*, COUNT(campaigns.id) AS campaign_count
       FROM companies
       LEFT JOIN campaigns ON campaigns.company_id = companies.id
       GROUP BY companies.id
       ORDER BY companies.created_at DESC`,
    )
    .all();
  return Response.json({ companies });
}

export async function POST(request: Request) {
  const parsed = createProjectSchema.safeParse(await request.json());
  if (
    !parsed.success ||
    !verifySignedMessage(parsed.data) ||
    !assertFreshMessage(parsed.data.message) ||
    !verifyActionMessage({
      message: parsed.data.message,
      action: "company.create",
      wallet: parsed.data.wallet,
      payload: parsed.data.company,
    })
  ) {
    return Response.json(
      { error: "A fresh valid wallet signature is required." },
      { status: 401 },
    );
  }

  const existing = db
    .prepare("SELECT * FROM companies WHERE owner_wallet = ?")
    .get(parsed.data.wallet);
  if (existing) return Response.json({ company: existing });

  const company = {
    id: createId("company"),
    slug: slugify(parsed.data.company.name),
    name: parsed.data.company.name,
    owner_wallet: parsed.data.wallet,
    website: parsed.data.company.website,
    description: parsed.data.company.description,
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO companies
      (id, slug, name, owner_wallet, website, description, created_at)
     VALUES (@id, @slug, @name, @owner_wallet, @website, @description, @created_at)`,
  ).run(company);

  return Response.json({ company }, { status: 201 });
}
