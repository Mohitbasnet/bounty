"use client";

import {
  Check,
  CircleDollarSign,
  ExternalLink,
  Eye,
  FileCheck2,
  Flag,
  Heart,
  LoaderCircle,
  MessageCircle,
  Repeat2,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";

const submissions = [
  {
    id: "sub-1",
    name: "Suman Giri",
    handle: "@sumanbuilds",
    initials: "SG",
    views: 8400,
    likes: 624,
    reposts: 91,
    replies: 34,
    live: 14.8,
    available: 12,
    status: "Verified",
  },
  {
    id: "sub-2",
    name: "Maya K.",
    handle: "@mayamakes",
    initials: "MK",
    views: 3220,
    likes: 208,
    reposts: 41,
    replies: 19,
    live: 4.4,
    available: 0,
    status: "Validating",
  },
  {
    id: "sub-3",
    name: "Alex Chen",
    handle: "@alexbuilds",
    initials: "AC",
    views: 780,
    likes: 77,
    reposts: 8,
    replies: 5,
    live: 0,
    available: 0,
    status: "Not eligible",
  },
];

export function SubmissionReview() {
  const [selectedId, setSelectedId] = useState(submissions[0].id);
  const [action, setAction] = useState<
    "idle" | "approving" | "paying" | "paid" | "flagged"
  >("idle");
  const selected =
    submissions.find((submission) => submission.id === selectedId) ??
    submissions[0];

  function runAction(next: "approving" | "paying") {
    setAction(next);
    window.setTimeout(
      () => setAction(next === "paying" ? "paid" : "idle"),
      900,
    );
  }

  return (
    <main className="review-page">
      <div className="review-heading">
        <div>
          <span className="section-kicker">Campaign submissions</span>
          <h1>Review performance</h1>
          <p>Explain private payments without the jargon</p>
        </div>
        <div className="review-summary">
          <span>
            <FileCheck2 size={15} aria-hidden /> 28 total
          </span>
          <span>
            <ShieldAlert size={15} aria-hidden /> 8 need review
          </span>
        </div>
      </div>

      {action === "paid" && (
        <div className="success-banner review-banner" role="status">
          <Check size={17} aria-hidden />
          ${selected.available.toFixed(2)} payout reserved and submitted for
          private Solana settlement.
        </div>
      )}

      <div className="review-workspace">
        <section className="submission-list" aria-label="Creator submissions">
          <div className="submission-list-head">
            <strong>Creators</strong>
            <span>Sorted by newest snapshot</span>
          </div>
          {submissions.map((submission) => (
            <button
              className={`submission-list-item focus-ring ${
                submission.id === selectedId ? "submission-selected" : ""
              }`}
              key={submission.id}
              type="button"
              onClick={() => {
                setSelectedId(submission.id);
                setAction("idle");
              }}
            >
              <span className="creator-avatar">{submission.initials}</span>
              <span className="creator-identity">
                <strong>{submission.name}</strong>
                <small>{submission.handle}</small>
              </span>
              <span className="list-metric">
                <strong>{submission.views.toLocaleString()}</strong>
                <small>views</small>
              </span>
              <span className={`review-status status-${submission.status.toLowerCase().replace(" ", "-")}`}>
                {submission.status}
              </span>
            </button>
          ))}
        </section>

        <section className="review-detail">
          <div className="review-detail-head">
            <div className="review-person">
              <span className="creator-avatar large-avatar">
                {selected.initials}
              </span>
              <span>
                <strong>{selected.name}&apos;s submission</strong>
                <small>{selected.handle} · 7xKX...p2aB</small>
              </span>
            </div>
            <a
              className="secondary-button focus-ring"
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
            >
              Open post <ExternalLink size={14} aria-hidden />
            </a>
          </div>

          <div className="review-content-grid">
            <div>
              <section className="metrics-card">
                <div className="metrics-head">
                  <span>
                    <span className="x-mark">X</span>
                    Latest verified snapshot
                  </span>
                  <small>Updated 1 min ago</small>
                </div>
                <div className="metrics-grid">
                  <div>
                    <Eye size={17} aria-hidden />
                    <strong>{selected.views.toLocaleString()}</strong>
                    <span>Views</span>
                  </div>
                  <div>
                    <Heart size={17} aria-hidden />
                    <strong>{selected.likes.toLocaleString()}</strong>
                    <span>Likes</span>
                  </div>
                  <div>
                    <Repeat2 size={17} aria-hidden />
                    <strong>{selected.reposts.toLocaleString()}</strong>
                    <span>Reposts</span>
                  </div>
                  <div>
                    <MessageCircle size={17} aria-hidden />
                    <strong>{selected.replies.toLocaleString()}</strong>
                    <span>Replies</span>
                  </div>
                </div>
              </section>

              <section className="submission-copy">
                <span>Creator note</span>
                <p>
                  I used a simple payroll analogy to explain privacy without
                  leading with cryptography. The final post includes a diagram
                  and a short audience takeaway.
                </p>
              </section>

              <section className="verification-checks">
                <h2>Verification checks</h2>
                <div>
                  <span>
                    <ShieldCheck size={16} aria-hidden />
                    Post ownership
                  </span>
                  <strong>Passed</strong>
                </div>
                <div>
                  <span>
                    <ShieldCheck size={16} aria-hidden />
                    Post remains public
                  </span>
                  <strong>Passed</strong>
                </div>
                <div>
                  <span>
                    <ShieldCheck size={16} aria-hidden />
                    Traffic anomaly scan
                  </span>
                  <strong>No flags</strong>
                </div>
              </section>
            </div>

            <aside className="review-money-card">
              <span className="section-kicker">Entitlement</span>
              <div className="review-money-row">
                <span>Live earning</span>
                <strong>${selected.live.toFixed(2)}</strong>
              </div>
              <div className="review-money-row">
                <span>Available now</span>
                <strong>${selected.available.toFixed(2)}</strong>
              </div>
              <div className="review-money-row">
                <span>Pending validation</span>
                <strong>
                  ${Math.max(selected.live - selected.available, 0).toFixed(2)}
                </strong>
              </div>
              <div className="review-money-rule">
                <Eye size={15} aria-hidden />
                <span>
                  1,000 unlock, then $0.20 per complete 100-view block.
                </span>
              </div>
              <button
                className="secondary-button full-button focus-ring"
                type="button"
                disabled={action === "approving"}
                onClick={() => runAction("approving")}
              >
                {action === "approving" ? (
                  <>
                    <LoaderCircle className="spin" size={15} aria-hidden />
                    Saving review
                  </>
                ) : (
                  <>
                    <Check size={15} aria-hidden />
                    Approve verification
                  </>
                )}
              </button>
              <button
                className="primary-button full-button focus-ring"
                type="button"
                disabled={
                  action === "paying" ||
                  action === "paid" ||
                  selected.available === 0
                }
                onClick={() => runAction("paying")}
              >
                {action === "paying" ? (
                  <>
                    <LoaderCircle className="spin" size={15} aria-hidden />
                    Reserving balance
                  </>
                ) : action === "paid" ? (
                  <>
                    <Check size={15} aria-hidden />
                    Payout submitted
                  </>
                ) : (
                  <>
                    <CircleDollarSign size={16} aria-hidden />
                    Pay available now
                  </>
                )}
              </button>
              <button
                className="flag-button focus-ring"
                type="button"
                onClick={() =>
                  setAction((current) =>
                    current === "flagged" ? "idle" : "flagged",
                  )
                }
              >
                {action === "flagged" ? (
                  <>
                    <X size={15} aria-hidden />
                    Remove flag
                  </>
                ) : (
                  <>
                    <Flag size={15} aria-hidden />
                    Flag for manual review
                  </>
                )}
              </button>
              <div className="treasury-note">
                <WalletCards size={15} aria-hidden />
                <span>Paid from treasury 9dJ...3Pe on Solana devnet.</span>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
