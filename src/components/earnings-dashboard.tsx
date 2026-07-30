"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Eye,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";

type Submission = {
  id: string;
  campaign_title: string;
  campaign_slug: string;
  x_post_url: string;
  status: "pending" | "approved" | "rejected";
  views: number;
  accrued_micro: number;
  paid_micro: number;
  creator_paid_micro: number;
  platform_fee_micro: number;
  last_synced_at: string | null;
  payout_signature: string | null;
};

export function EarningsDashboard() {
  const { publicKey } = useWallet();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!publicKey) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/submissions?wallet=${publicKey.toBase58()}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          const body = (await response.json()) as {
            submissions?: Submission[];
            error?: string;
          };
          if (!response.ok) throw new Error(body.error ?? "Unable to load earnings.");
          setSubmissions(body.submissions ?? []);
          setError("");
        })
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

  const accruedMicro = submissions.reduce(
    (sum, submission) => sum + submission.accrued_micro,
    0,
  );
  const paidMicro = submissions.reduce(
    (sum, submission) => sum + submission.creator_paid_micro,
    0,
  );
  const settledGrossMicro = submissions.reduce(
    (sum, submission) => sum + submission.paid_micro,
    0,
  );

  return (
    <main className="dashboard-page">
      <div className="dashboard-wrap">
        <div className="dashboard-heading">
          <div>
            <span className="section-kicker">Creator dashboard</span>
            <h1>Your verified reach.</h1>
            <p>
              Real submissions, official X snapshots, and confirmed USDC
              payouts appear here.
            </p>
          </div>
        </div>

        {!publicKey ? (
          <section className="campaign-card-empty">
            <WalletCards size={24} aria-hidden />
            <h2>Connect your creator wallet.</h2>
            <p>The wallet in the header identifies your submissions and payouts.</p>
          </section>
        ) : (
          <>
            <section className="balance-grid" aria-label="Earning balances">
              <div className="balance-card balance-live">
                <span><Eye size={17} aria-hidden />Accrued</span>
                <strong>${(accruedMicro / 1_000_000).toFixed(2)}</strong>
                <small>From latest official snapshots</small>
              </div>
              <div className="balance-card">
                <span><CircleDollarSign size={17} aria-hidden />Paid</span>
                <strong>${(paidMicro / 1_000_000).toFixed(2)}</strong>
                <small>Confirmed public USDC payouts</small>
              </div>
              <div className="balance-card">
                <span><Clock3 size={17} aria-hidden />Awaiting payout</span>
                <strong>
                  ${((accruedMicro - settledGrossMicro) / 1_000_000).toFixed(2)}
                </strong>
                <small>Approved and accrued, not yet settled</small>
              </div>
            </section>

            {loading && (
              <p className="field-hint"><RefreshCw className="spin" size={15} /> Loading submissions</p>
            )}
            {error && <p className="field-error" role="alert">{error}</p>}
            {!loading && !submissions.length && (
              <section className="campaign-card-empty">
                <Eye size={24} aria-hidden />
                <h2>No submissions yet.</h2>
                <p>Submit an X post to a funded live campaign to begin.</p>
              </section>
            )}
            {!!submissions.length && (
              <section className="company-panel">
                <div className="company-panel-heading">
                  <div><h2>Your submissions</h2><p>No estimated or fabricated metrics.</p></div>
                </div>
                <div className="campaign-table" role="table">
                  {submissions.map((submission) => (
                    <div className="campaign-table-row" role="row" key={submission.id}>
                      <div className="table-campaign" role="cell">
                        <span>
                          <strong>{submission.campaign_title}</strong>
                          <small>{submission.status}</small>
                        </span>
                      </div>
                      <span role="cell">{submission.views.toLocaleString()} views</span>
                      <span role="cell">
                        ${(submission.accrued_micro / 1_000_000).toFixed(2)} accrued
                      </span>
                      <span role="cell">
                        ${(submission.creator_paid_micro / 1_000_000).toFixed(2)} received
                      </span>
                      <a
                        className="card-link focus-ring"
                        href={submission.x_post_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open X post"
                      >
                        <ExternalLink size={17} aria-hidden />
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
