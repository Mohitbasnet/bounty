import bs58 from "bs58";
import nacl from "tweetnacl";
import { z } from "zod";

export const signedRequestSchema = z.object({
  wallet: z.string().min(32).max(64),
  message: z.string().min(1).max(2_000),
  signature: z.string().min(32),
});

export function verifySignedMessage(input: z.infer<typeof signedRequestSchema>) {
  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(input.message),
      bs58.decode(input.signature),
      bs58.decode(input.wallet),
    );
  } catch {
    return false;
  }
}

export function assertFreshMessage(message: string) {
  const match = message.match(/Timestamp: (.+)$/m);
  if (!match) return false;
  const timestamp = Date.parse(match[1]);
  return Number.isFinite(timestamp) && Math.abs(Date.now() - timestamp) < 300_000;
}
