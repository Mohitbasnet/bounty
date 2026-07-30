import crypto from "node:crypto";
import { z } from "zod";

import db, { decryptSecret, encryptSecret } from "@/lib/db";

const tokenSchema = z.object({
  token_type: z.string(),
  expires_in: z.number().optional(),
  access_token: z.string(),
  scope: z.string().optional(),
  refresh_token: z.string().optional(),
});

const meSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
  }),
});

function base64Url(value: Buffer) {
  return value.toString("base64url");
}

export function createXOAuthRequest(
  wallet: string,
  redirectUri: string,
  returnTo: string,
) {
  const clientId = process.env.X_CLIENT_ID;
  if (!clientId) throw new Error("X_CLIENT_ID is not configured.");

  const state = base64Url(crypto.randomBytes(32));
  const verifier = base64Url(crypto.randomBytes(64));
  const challenge = base64Url(
    crypto.createHash("sha256").update(verifier).digest(),
  );
  db.prepare("DELETE FROM x_oauth_states WHERE expires_at < ?").run(
    new Date().toISOString(),
  );
  db.prepare(
    `INSERT INTO x_oauth_states
      (state, wallet, code_verifier, redirect_uri, return_to, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    state,
    wallet,
    verifier,
    redirectUri,
    returnTo,
    new Date(Date.now() + 10 * 60_000).toISOString(),
  );

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "tweet.read users.read offline.access",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `https://x.com/i/oauth2/authorize?${params.toString()}`;
}

export async function completeXOAuth(code: string, state: string) {
  const oauthState = db
    .prepare(
      `SELECT * FROM x_oauth_states
       WHERE state = ? AND expires_at >= ?`,
    )
    .get(state, new Date().toISOString()) as
    | {
        wallet: string;
        code_verifier: string;
        redirect_uri: string;
        return_to: string;
      }
    | undefined;
  if (!oauthState) throw new Error("The X authorization session expired.");

  const clientId = process.env.X_CLIENT_ID;
  if (!clientId) throw new Error("X_CLIENT_ID is not configured.");
  const clientSecret = process.env.X_CLIENT_SECRET;
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(
      `${clientId}:${clientSecret}`,
    ).toString("base64")}`;
  }
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    redirect_uri: oauthState.redirect_uri,
    code_verifier: oauthState.code_verifier,
  });
  if (!clientSecret) body.set("client_id", clientId);

  const tokenResponse = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    throw new Error(`X token exchange returned ${tokenResponse.status}.`);
  }
  const token = tokenSchema.parse(await tokenResponse.json());
  const meResponse = await fetch("https://api.x.com/2/users/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (!meResponse.ok) {
    throw new Error(`X user lookup returned ${meResponse.status}.`);
  }
  const user = meSchema.parse(await meResponse.json()).data;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO x_accounts
      (wallet, x_user_id, username, display_name, encrypted_access_token,
       encrypted_refresh_token, token_expires_at, connected_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(wallet) DO UPDATE SET
       x_user_id = excluded.x_user_id,
       username = excluded.username,
       display_name = excluded.display_name,
       encrypted_access_token = excluded.encrypted_access_token,
       encrypted_refresh_token = excluded.encrypted_refresh_token,
       token_expires_at = excluded.token_expires_at,
       updated_at = excluded.updated_at`,
  ).run(
    oauthState.wallet,
    user.id,
    user.username,
    user.name,
    encryptSecret(new TextEncoder().encode(token.access_token)),
    token.refresh_token
      ? encryptSecret(new TextEncoder().encode(token.refresh_token))
      : null,
    token.expires_in
      ? new Date(Date.now() + token.expires_in * 1_000).toISOString()
      : null,
    now,
    now,
  );
  db.prepare("DELETE FROM x_oauth_states WHERE state = ?").run(state);
  return { wallet: oauthState.wallet, user, returnTo: oauthState.return_to };
}

export function getXAccount(wallet: string) {
  return db
    .prepare(
      `SELECT wallet, x_user_id, username, display_name, connected_at, updated_at
       FROM x_accounts WHERE wallet = ?`,
    )
    .get(wallet) as
    | {
        wallet: string;
        x_user_id: string;
        username: string;
        display_name: string;
        connected_at: string;
        updated_at: string;
      }
    | undefined;
}

export function decryptXAccessToken(payload: string) {
  return new TextDecoder().decode(decryptSecret(payload));
}
