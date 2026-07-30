import { z } from "zod";

import {
  assertFreshMessage,
  signedRequestSchema,
  verifySignedMessage,
} from "@/lib/auth";
import db from "@/lib/db";
import { verifyActionMessage } from "@/lib/messages";

export const runtime = "nodejs";

const bodySchema = signedRequestSchema.extend({
  decision: z.enum(["approved", "rejected"]),
});

export async function POST(
  request: Request,
  context: RouteContext<"/api/submissions/[id]/approve">,
) {
  const { id } = await context.params;
  const parsed = bodySchema.safeParse(await request.json());
  if (
    !parsed.success ||
    !verifySignedMessage(parsed.data) ||
    !assertFreshMessage(parsed.data.message) ||
    !verifyActionMessage({
      message: parsed.data.message,
      action: "submission.review",
      wallet: parsed.data.wallet,
      payload: { submissionId: id, decision: parsed.data.decision },
    })
  ) {
    return Response.json(
      { error: "A fresh valid company-wallet signature is required." },
      { status: 401 },
    );
  }

  const submission = db
    .prepare(
      `SELECT submissions.id, submissions.status, companies.owner_wallet
       FROM submissions
       JOIN campaigns ON campaigns.id = submissions.campaign_id
       JOIN companies ON companies.id = campaigns.company_id
       WHERE submissions.id = ?`,
    )
    .get(id) as
    | { id: string; status: string; owner_wallet: string }
    | undefined;
  if (!submission || submission.owner_wallet !== parsed.data.wallet) {
    return Response.json({ error: "Submission not found." }, { status: 404 });
  }
  if (submission.status !== "pending") {
    return Response.json(
      { error: "This submission was already reviewed." },
      { status: 409 },
    );
  }

  db.prepare(
    `UPDATE submissions SET status = ?, approved_at = ? WHERE id = ?`,
  ).run(
    parsed.data.decision,
    parsed.data.decision === "approved" ? new Date().toISOString() : null,
    id,
  );
  return Response.json({
    submission: { id, status: parsed.data.decision },
  });
}
