import {
  assertFreshMessage,
  signedRequestSchema,
  verifySignedMessage,
} from "@/lib/auth";
import db from "@/lib/db";
import { syncSubmissionMetrics } from "@/lib/metrics";
import { verifyActionMessage } from "@/lib/messages";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: RouteContext<"/api/submissions/[id]/sync">,
) {
  const { id } = await context.params;
  const authorization = signedRequestSchema.safeParse(await request.json());
  if (
    !authorization.success ||
    !verifySignedMessage(authorization.data) ||
    !assertFreshMessage(authorization.data.message) ||
    !verifyActionMessage({
      message: authorization.data.message,
      action: "submission.sync",
      wallet: authorization.data.wallet,
      payload: { submissionId: id },
    })
  ) {
    return Response.json(
      { error: "A fresh valid company-wallet signature is required." },
      { status: 401 },
    );
  }
  const submission = db
    .prepare(
      `SELECT submissions.*, campaigns.unlock_views,
        campaigns.views_per_block, campaigns.reward_per_block_micro,
        campaigns.max_per_creator_micro, companies.owner_wallet
       FROM submissions
       JOIN campaigns ON campaigns.id = submissions.campaign_id
       JOIN companies ON companies.id = campaigns.company_id
       WHERE submissions.id = ?`,
    )
    .get(id) as
    | {
        id: string;
        status: string;
        x_post_id: string;
        views: number;
        accrued_micro: number;
        unlock_views: number;
        views_per_block: number;
        reward_per_block_micro: number;
        max_per_creator_micro: number;
        owner_wallet: string;
      }
    | undefined;
  if (submission?.owner_wallet !== authorization.data.wallet) {
    return Response.json({ error: "Submission not found." }, { status: 404 });
  }
  if (!submission || submission.status !== "approved") {
    return Response.json(
      { error: "Only approved submissions can sync metrics." },
      { status: 409 },
    );
  }

  try {
    return Response.json({ metrics: await syncSubmissionMetrics(id) });
  } catch (cause) {
    return Response.json(
      { error: cause instanceof Error ? cause.message : "X sync failed." },
      { status: 502 },
    );
  }
}
