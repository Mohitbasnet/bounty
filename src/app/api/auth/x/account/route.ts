import { getXAccount } from "@/lib/x-oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get("wallet");
  if (!wallet) {
    return Response.json({ error: "Wallet is required." }, { status: 400 });
  }
  return Response.json({ account: getXAccount(wallet) ?? null });
}
