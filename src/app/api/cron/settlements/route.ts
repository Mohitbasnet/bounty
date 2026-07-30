import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { payoutAllEligibleSubmissions } from "@/lib/payouts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const results = await payoutAllEligibleSubmissions();
  return Response.json({
    processed: results.length,
    succeeded: results.filter((result) => result.status === "paid").length,
    results,
  });
}
