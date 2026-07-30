import { completeXOAuth } from "@/lib/x-oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return Response.redirect(new URL("/dashboard?x=missing", url.origin));
  }
  try {
    const result = await completeXOAuth(code, state);
    return Response.redirect(
      new URL(`${result.returnTo}?x=connected`, url.origin),
    );
  } catch {
    return Response.redirect(new URL("/dashboard?x=failed", url.origin));
  }
}
