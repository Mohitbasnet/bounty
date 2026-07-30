"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { AtSign, Check, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { readApiResponse } from "@/lib/api";
import { buildActionMessage } from "@/lib/messages";

type XAccount = {
  username: string;
  display_name: string;
};

export function XAccountButton({ returnTo }: { returnTo: string }) {
  const { publicKey, signMessage } = useWallet();
  const [account, setAccount] = useState<XAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!publicKey) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/auth/x/account?wallet=${publicKey.toBase58()}`, {
        signal: controller.signal,
      })
        .then((response) =>
          readApiResponse<{ account: XAccount | null }>(response),
        )
        .then((body) => setAccount(body.account))
        .catch((cause) => {
          if (cause instanceof Error && cause.name !== "AbortError") {
            setError(cause.message);
          }
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [publicKey]);

  async function connectX() {
    if (!publicKey || !signMessage) {
      setError("Connect a wallet that supports message signing first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = { returnTo };
      const message = buildActionMessage({
        action: "x.connect",
        wallet: publicKey.toBase58(),
        payload,
      });
      const signature = await signMessage(new TextEncoder().encode(message));
      const response = await fetch("/api/auth/x/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          message,
          signature: bs58.encode(signature),
          returnTo,
        }),
      });
      const body = await readApiResponse<{ authorizationUrl: string }>(
        response,
      );
      window.location.assign(body.authorizationUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to connect X.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        className={account ? "secondary-button focus-ring" : "primary-button focus-ring"}
        type="button"
        disabled={loading}
        onClick={() => void connectX()}
      >
        {loading ? (
          <LoaderCircle className="spin" size={16} aria-hidden />
        ) : account ? (
          <Check size={16} aria-hidden />
        ) : (
          <AtSign size={16} aria-hidden />
        )}
        {account ? `X connected · @${account.username}` : "Connect X account"}
      </button>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
