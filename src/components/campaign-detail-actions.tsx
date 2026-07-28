"use client";

import { Bookmark, Check, Share2 } from "lucide-react";
import { useState } from "react";

export function CampaignDetailActions() {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function shareCampaign() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="listing-header-actions">
      <button
        aria-pressed={saved}
        className={`listing-action-button focus-ring ${
          saved ? "listing-action-active" : ""
        }`}
        type="button"
        onClick={() => setSaved((current) => !current)}
      >
        <Bookmark fill={saved ? "currentColor" : "none"} size={16} aria-hidden />
        {saved ? "Saved" : "Save"}
      </button>
      <button
        className="listing-action-button focus-ring"
        type="button"
        onClick={shareCampaign}
      >
        {copied ? (
          <Check size={16} aria-hidden />
        ) : (
          <Share2 size={16} aria-hidden />
        )}
        {copied ? "Copied" : "Share"}
      </button>
    </div>
  );
}
