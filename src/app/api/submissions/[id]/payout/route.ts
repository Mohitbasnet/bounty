import {
  assertFreshMessage,
  signedRequestSchema,
  verifySignedMessage,
} from "@/lib/auth";
import db from "@/lib/db";
import { payoutSubmission } from "@/lib/payouts";
import { verifyActionMessage } from "@/lib/messages";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: RouteContext<"/api/submissions/[id]/payout">,
) {
  const { id } = await context.params;
  const authorization = signedRequestSchema.safeParse(await request.json());
  if (
    !authorization.success ||
    !verifySignedMessage(authorization.data) ||
    !assertFreshMessage(authorization.data.message) ||
    !verifyActionMessage({
      message: authorization.data.message,
      action: "submission.payout",
      wallet: authorization.data.wallet,
      payload: { submissionId: id },
    })
  ) {
    return Response.json(
      { error: "A fresh valid company-wallet signature is required." },
      { status: 401 },
    );
  }

  const row = db
    .prepare(
      `SELECT companies.owner_wallet
       FROM submissions
       JOIN campaigns ON campaigns.id = submissions.campaign_id
       JOIN companies ON companies.id = campaigns.company_id
       WHERE submissions.id = ?`,
    )
    .get(id) as { owner_wallet: string } | undefined;
  if (!row || row.owner_wallet !== authorization.data.wallet) {
    return Response.json({ error: "Submission not found." }, { status: 404 });
  }

  try {
    return Response.json({ payout: await payoutSubmission(id) });
  } catch (cause) {
    return Response.json(
      { error: cause instanceof Error ? cause.message : "Payout failed." },
      { status: 409 },
    );
  }
}
