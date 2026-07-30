import { z } from "zod";

import {
  assertFreshMessage,
  signedRequestSchema,
  verifySignedMessage,
} from "@/lib/auth";
import { createXOAuthRequest } from "@/lib/x-oauth";
import { verifyActionMessage } from "@/lib/messages";

export const runtime = "nodejs";

const bodySchema = signedRequestSchema.extend({
  returnTo: z
    .string()
    .regex(/^\/(?!\/)[a-zA-Z0-9/_-]*$/)
    .max(200)
    .default("/dashboard"),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (
    !parsed.success ||
    !verifySignedMessage(parsed.data) ||
    !assertFreshMessage(parsed.data.message) ||
    !verifyActionMessage({
      message: parsed.data.message,
      action: "x.connect",
      wallet: parsed.data.wallet,
      payload: { returnTo: parsed.data.returnTo },
    })
  ) {
    return Response.json(
      { error: "A fresh valid wallet signature is required." },
      { status: 401 },
    );
  }
  try {
    const configuredRedirect = process.env.X_OAUTH_REDIRECT_URI;
    const redirectUri =
      configuredRedirect ?? `${new URL(request.url).origin}/api/auth/x/callback`;
    return Response.json({
      authorizationUrl: createXOAuthRequest(
        parsed.data.wallet,
        redirectUri,
        parsed.data.returnTo,
      ),
    });
  } catch (cause) {
    return Response.json(
      { error: cause instanceof Error ? cause.message : "Unable to connect X." },
      { status: 503 },
    );
  }
}
