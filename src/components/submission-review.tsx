"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import {
  Check,
  CircleDollarSign,
  ExternalLink,
  Eye,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { readApiResponse } from "@/lib/api";
import { buildActionMessage } from "@/lib/messages";
import { explorerTransactionUrl } from "@/lib/solana";

type Submission = {
  id: string;
  campaign_title: string;
  creator_wallet: string;
  x_post_url: string;
  note: string;
  status: "pending" | "approved" | "rejected";
  views: number;
  accrued_micro: number;
  paid_micro: number;
  payout_signature: string | null;
};

type Action = "approved" | "rejected" | "sync" | "payout";

export function SubmissionReview() {
  const { publicKey, signMessage } = useWallet();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  async function loadSubmissions() {
    setLoading(true);
    try {
      const response = await fetch("/api/submissions", { cache: "no-store" });
      const body = await readApiResponse<{ submissions: Submission[] }>(response);
      setSubmissions(body.submissions);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load submissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSubmissions(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function runAction(submission: Submission, action: Action) {
    if (!publicKey || !signMessage) {
      setError("Connect the company wallet first.");
      return;
    }
    setWorkingId(submission.id);
    setError("");
    try {
      const messageAction =
        action === "approved" || action === "rejected"
          ? "submission.review"
          : `submission.${action}`;
      const payload =
        action === "approved" || action === "rejected"
          ? { submissionId: submission.id, decision: action }
          : { submissionId: submission.id };
      const message = buildActionMessage({
        action: messageAction,
        wallet: publicKey.toBase58(),
        payload,
      });
      const signature = await signMessage(new TextEncoder().encode(message));
      const endpoint =
        action === "approved" || action === "rejected"
          ? `/api/submissions/${submission.id}/approve`
          : `/api/submissions/${submission.id}/${action}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          message,
          signature: bs58.encode(signature),
          ...(action === "approved" || action === "rejected"
            ? { decision: action }
            : {}),
        }),
      });
      await readApiResponse(response);
      await loadSubmissions();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action failed.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <main className="review-page">
      <div className="review-heading">
        <div>
          <span className="section-kicker">Company review</span>
          <h1>Creator submissions</h1>
          <p>Approve content, sync official X metrics, and settle accrued USDC.</p>
        </div>
      </div>

      {!publicKey && (
        <div className="funding-notice">
          Connect the campaign owner wallet to perform company actions.
        </div>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}
      {loading && (
        <p className="field-hint"><LoaderCircle className="spin" size={15} /> Loading submissions</p>
      )}
      {!loading && !submissions.length && (
        <section className="campaign-card-empty">
          <Eye size={24} aria-hidden />
          <h2>No creator submissions yet.</h2>
          <p>Pending submissions appear after a creator signs and submits an X post.</p>
        </section>
      )}

      <section className="submission-list" aria-label="Creator submissions">
        {submissions.map((submission) => {
          const working = workingId === submission.id;
          return (
            <article className="review-detail" key={submission.id}>
              <div className="review-detail-head">
                <div className="review-person">
                  <span className="creator-avatar">
                    {submission.creator_wallet.slice(0, 2)}
                  </span>
                  <span>
                    <strong>{submission.campaign_title}</strong>
                    <small>
                      {submission.creator_wallet.slice(0, 6)}...
                      {submission.creator_wallet.slice(-4)} · {submission.status}
                    </small>
                  </span>
                </div>
                <a
                  className="secondary-button focus-ring"
                  href={submission.x_post_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open post <ExternalLink size={14} aria-hidden />
                </a>
              </div>
              <p>{submission.note || "No creator note supplied."}</p>
              <div className="review-summary">
                <span><Eye size={15} aria-hidden />{submission.views.toLocaleString()} verified views</span>
                <span><CircleDollarSign size={15} aria-hidden />${(submission.accrued_micro / 1_000_000).toFixed(2)} accrued</span>
              </div>
              <div className="ppv-hero-actions">
                {submission.status === "pending" && (
                  <>
                    <button
                      className="primary-button focus-ring"
                      type="button"
                      disabled={working}
                      onClick={() => void runAction(submission, "approved")}
                    >
                      <Check size={15} aria-hidden /> Approve
                    </button>
                    <button
                      className="secondary-button focus-ring"
                      type="button"
                      disabled={working}
                      onClick={() => void runAction(submission, "rejected")}
                    >
                      <X size={15} aria-hidden /> Reject
                    </button>
                  </>
                )}
                {submission.status === "approved" && (
                  <>
                    <button
                      className="secondary-button focus-ring"
                      type="button"
                      disabled={working}
                      onClick={() => void runAction(submission, "sync")}
                    >
                      <RefreshCw size={15} aria-hidden /> Sync official X metrics
                    </button>
                    <button
                      className="primary-button focus-ring"
                      type="button"
                      disabled={working || submission.accrued_micro <= submission.paid_micro}
                      onClick={() => void runAction(submission, "payout")}
                    >
                      <CircleDollarSign size={15} aria-hidden /> Pay accrued USDC
                    </button>
                  </>
                )}
                {submission.payout_signature && (
                  <a
                    className="text-arrow-link focus-ring"
                    href={explorerTransactionUrl(submission.payout_signature)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View payout transaction <ExternalLink size={14} aria-hidden />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
