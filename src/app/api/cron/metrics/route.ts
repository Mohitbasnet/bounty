import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { syncAllApprovedSubmissions } from "@/lib/metrics";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const results = await syncAllApprovedSubmissions();
  return Response.json({
    processed: results.length,
    succeeded: results.filter((result) => result.status === "synced").length,
    results,
  });
}
