"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { ExternalLink, LoaderCircle, RotateCcw } from "lucide-react";
import { useState } from "react";

import { readApiResponse } from "@/lib/api";
import { buildActionMessage } from "@/lib/messages";
import { explorerTransactionUrl } from "@/lib/solana";

export function CampaignCloseButton({
  campaignId,
  title,
}: {
  campaignId: string;
  title: string;
}) {
  const { publicKey, signMessage } = useWallet();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [refundSignature, setRefundSignature] = useState("");

  async function closeCampaign() {
    if (!publicKey || !signMessage) {
      setError("Connect the campaign owner wallet first.");
      return;
    }
    setWorking(true);
    setError("");
    try {
      const message = buildActionMessage({
        action: "campaign.refund",
        wallet: publicKey.toBase58(),
        payload: { campaignId },
      });
      const signature = await signMessage(new TextEncoder().encode(message));
      const response = await fetch(`/api/campaigns/${campaignId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          message,
          signature: bs58.encode(signature),
        }),
      });
      const body = await readApiResponse<{
        refund: { signature: string | null };
      }>(response);
      setRefundSignature(body.refund.signature ?? "");
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Refund failed.");
    } finally {
      setWorking(false);
    }
  }

  if (refundSignature) {
    return (
      <a
        className="card-link focus-ring"
        href={explorerTransactionUrl(refundSignature)}
        target="_blank"
        rel="noreferrer"
        aria-label={`View ${title} refund`}
      >
        <ExternalLink size={17} aria-hidden />
      </a>
    );
  }

  return (
    <span>
      <button
        className="card-link focus-ring"
        type="button"
        disabled={working}
        onClick={() => void closeCampaign()}
        aria-label={`Close ${title} and refund unspent USDC`}
        title="Close campaign and refund unspent USDC"
      >
        {working ? (
          <LoaderCircle className="spin" size={16} aria-hidden />
        ) : (
          <RotateCcw size={16} aria-hidden />
        )}
      </button>
      {error && <span className="field-error" role="alert">{error}</span>}
    </span>
  );
}
