import { z } from "zod";

import {
  assertFreshMessage,
  signedRequestSchema,
  verifySignedMessage,
} from "@/lib/auth";
import db, { createId } from "@/lib/db";
import { verifyActionMessage } from "@/lib/messages";
import { getXAccount } from "@/lib/x-oauth";

export const runtime = "nodejs";

const submissionSchema = signedRequestSchema.extend({
  submission: z.object({
    campaignSlug: z.string().min(1),
    postUrl: z.url(),
    note: z.string().max(500).default(""),
  }),
});

function extractPostId(url: string) {
  return url.match(/(?:x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/i)?.[1];
}

export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get("wallet");
  const rows = wallet
    ? db
        .prepare(
          `SELECT submissions.*, campaigns.title AS campaign_title,
            campaigns.slug AS campaign_slug,
            COALESCE(SUM(CASE WHEN payouts.status = 'confirmed'
              THEN payouts.creator_micro ELSE 0 END), 0) AS creator_paid_micro,
            COALESCE(SUM(CASE WHEN payouts.status = 'confirmed'
              THEN payouts.fee_micro ELSE 0 END), 0) AS platform_fee_micro
           FROM submissions
           JOIN campaigns ON campaigns.id = submissions.campaign_id
           LEFT JOIN payouts ON payouts.submission_id = submissions.id
           WHERE submissions.creator_wallet = ?
           GROUP BY submissions.id
           ORDER BY submissions.created_at DESC`,
        )
        .all(wallet)
    : db
        .prepare(
          `SELECT submissions.*, campaigns.title AS campaign_title,
            campaigns.slug AS campaign_slug,
            COALESCE(SUM(CASE WHEN payouts.status = 'confirmed'
              THEN payouts.creator_micro ELSE 0 END), 0) AS creator_paid_micro,
            COALESCE(SUM(CASE WHEN payouts.status = 'confirmed'
              THEN payouts.fee_micro ELSE 0 END), 0) AS platform_fee_micro
           FROM submissions
           JOIN campaigns ON campaigns.id = submissions.campaign_id
           LEFT JOIN payouts ON payouts.submission_id = submissions.id
           GROUP BY submissions.id
           ORDER BY submissions.created_at DESC`,
        )
        .all();
  return Response.json({ submissions: rows });
}

export async function POST(request: Request) {
  const parsed = submissionSchema.safeParse(await request.json());
  const postId = parsed.success
    ? extractPostId(parsed.data.submission.postUrl)
    : undefined;
  if (!parsed.success || !postId) {
    return Response.json({ error: "Enter a valid public X post URL." }, { status: 400 });
  }
  if (
    !verifySignedMessage(parsed.data) ||
    !assertFreshMessage(parsed.data.message) ||
    !verifyActionMessage({
      message: parsed.data.message,
      action: "submission.create",
      wallet: parsed.data.wallet,
      payload: parsed.data.submission,
    })
  ) {
    return Response.json(
      { error: "A fresh valid wallet signature is required." },
      { status: 401 },
    );
  }

  const campaign = db
    .prepare("SELECT id, status FROM campaigns WHERE slug = ?")
    .get(parsed.data.submission.campaignSlug) as
    | { id: string; status: string }
    | undefined;
  if (!campaign || campaign.status !== "live") {
    return Response.json(
      { error: "This campaign is not accepting submissions." },
      { status: 409 },
    );
  }
  const xAccount = getXAccount(parsed.data.wallet);
  if (!xAccount) {
    return Response.json(
      { error: "Connect and verify your X account before submitting." },
      { status: 409 },
    );
  }

  const submission = {
    id: createId("submission"),
    campaign_id: campaign.id,
    creator_wallet: parsed.data.wallet,
    x_post_url: parsed.data.submission.postUrl,
    x_post_id: postId,
    note: parsed.data.submission.note,
    status: "pending",
    linked_x_user_id: xAccount.x_user_id,
    linked_x_handle: xAccount.username,
    created_at: new Date().toISOString(),
  };
  try {
    db.prepare(
      `INSERT INTO submissions
        (id, campaign_id, creator_wallet, x_post_url, x_post_id, note, status,
         linked_x_user_id, linked_x_handle, created_at)
       VALUES
        (@id, @campaign_id, @creator_wallet, @x_post_url, @x_post_id, @note,
         @status, @linked_x_user_id, @linked_x_handle, @created_at)`,
    ).run(submission);
  } catch {
    return Response.json(
      { error: "This X post has already been submitted to the campaign." },
      { status: 409 },
    );
  }

  return Response.json({ submission }, { status: 201 });
}
