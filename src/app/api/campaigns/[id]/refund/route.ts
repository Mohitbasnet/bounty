import {
  assertFreshMessage,
  signedRequestSchema,
  verifySignedMessage,
} from "@/lib/auth";
import db from "@/lib/db";
import { refundCampaign } from "@/lib/refunds";
import { verifyActionMessage } from "@/lib/messages";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: RouteContext<"/api/campaigns/[id]/refund">,
) {
  const { id } = await context.params;
  const authorization = signedRequestSchema.safeParse(await request.json());
  if (
    !authorization.success ||
    !verifySignedMessage(authorization.data) ||
    !assertFreshMessage(authorization.data.message) ||
    !verifyActionMessage({
      message: authorization.data.message,
      action: "campaign.refund",
      wallet: authorization.data.wallet,
      payload: { campaignId: id },
    })
  ) {
    return Response.json(
      { error: "A fresh valid company-wallet signature is required." },
      { status: 401 },
    );
  }

  const campaign = db
    .prepare(
      `SELECT companies.owner_wallet
       FROM campaigns
       JOIN companies ON companies.id = campaigns.company_id
       WHERE campaigns.id = ?`,
    )
    .get(id) as { owner_wallet: string } | undefined;
  if (!campaign || campaign.owner_wallet !== authorization.data.wallet) {
    return Response.json({ error: "Campaign not found." }, { status: 404 });
  }

  try {
    return Response.json({ refund: await refundCampaign(id) });
  } catch (cause) {
    return Response.json(
      { error: cause instanceof Error ? cause.message : "Refund failed." },
      { status: 409 },
    );
  }
}
