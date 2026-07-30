import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { refundExpiredCampaigns } from "@/lib/refunds";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const results = await refundExpiredCampaigns();
  return Response.json({
    processed: results.length,
    refunded: results.filter((result) => result.status === "refunded").length,
    results,
  });
}
