"use client";

import {
  ArrowRight,
  Check,
  CircleDollarSign,
  Clock3,
  Eye,
  LoaderCircle,
  LockKeyhole,
  Radar,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { calculateEarnings, featuredCampaign } from "@/lib/data";

export function EarningsDashboard() {
  const [views, setViews] = useState(8400);
  const [available, setAvailable] = useState(12);
  const [updating, setUpdating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const live = calculateEarnings(views, featuredCampaign);
  const pending = Math.max(live - available, 0);
  const nextBlockProgress =
    Math.max(views - featuredCampaign.unlockViews, 0) %
    featuredCampaign.viewsPerBlock;

  function refreshMetrics() {
    setUpdating(true);
    window.setTimeout(() => {
      setViews((current) => current + 237);
      setUpdating(false);
    }, 700);
  }

  function withdraw() {
    setWithdrawing(true);
    window.setTimeout(() => {
      setWithdrawing(false);
      setWithdrawn(true);
      setAvailable(0);
    }, 1000);
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-wrap">
        <div className="dashboard-heading">
          <div>
            <span className="section-kicker">Creator dashboard</span>
            <h1>Your work is earning.</h1>
            <p>
              Track provisional growth, validation, and finalized USDC in one
              place.
            </p>
          </div>
          <button
            className="secondary-button focus-ring"
            type="button"
            disabled={updating}
            onClick={refreshMetrics}
          >
            <RefreshCw
              className={updating ? "spin" : ""}
              size={16}
              aria-hidden
            />
            {updating ? "Updating" : "Simulate snapshot"}
          </button>
        </div>

        <section className="balance-grid" aria-label="Earning balances">
          <div className="balance-card balance-live">
            <span>
              <Radar size={17} aria-hidden />
              Live earning
            </span>
            <strong>${live.toFixed(2)}</strong>
            <small>Based on latest verified snapshot</small>
          </div>
          <div className="balance-card">
            <span>
              <WalletCards size={17} aria-hidden />
              Available
            </span>
            <strong>${available.toFixed(2)}</strong>
            <small>Finalized and ready to withdraw</small>
          </div>
          <div className="balance-card">
            <span>
              <Clock3 size={17} aria-hidden />
              Pending validation
            </span>
            <strong>${pending.toFixed(2)}</strong>
            <small>Finalizes after the 48h review</small>
          </div>
        </section>

        {withdrawn && (
          <div className="success-banner" role="status">
            <Check size={17} aria-hidden />
            $12.00 private USDC payout submitted. Treasury transaction is
            confirming on Solana devnet.
          </div>
        )}

        <div className="dashboard-grid">
          <section className="tracking-panel">
            <div className="panel-heading">
              <div>
                <span className="live-indicator">
                  <span aria-hidden />
                  Tracking live
                </span>
                <h2>{featuredCampaign.title}</h2>
                <p>by {featuredCampaign.company}</p>
              </div>
              <Link
                className="card-link focus-ring"
                href={`/campaigns/${featuredCampaign.slug}`}
                aria-label="Open campaign"
              >
                <ArrowRight size={18} aria-hidden />
              </Link>
            </div>

            <div className="large-metric">
              <span>Verified views</span>
              <strong>{views.toLocaleString()}</strong>
              <small>
                <Eye size={14} aria-hidden />
                Last checked just now
              </small>
            </div>

            <div className="block-progress">
              <div className="block-progress-label">
                <span>Next ${featuredCampaign.rewardPerBlock.toFixed(2)}</span>
                <strong>
                  {nextBlockProgress}/{featuredCampaign.viewsPerBlock} views
                </strong>
              </div>
              <div className="progress-track">
                <span
                  style={{
                    width: `${
                      (nextBlockProgress / featuredCampaign.viewsPerBlock) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="tracking-facts">
              <div>
                <span>Eligibility threshold</span>
                <strong className="fact-complete">
                  <Check size={14} aria-hidden />
                  {featuredCampaign.unlockViews.toLocaleString()} passed
                </strong>
              </div>
              <div>
                <span>Reward blocks completed</span>
                <strong>
                  {Math.floor(
                    Math.max(views - featuredCampaign.unlockViews, 0) /
                      featuredCampaign.viewsPerBlock,
                  )}
                </strong>
              </div>
              <div>
                <span>Creator cap</span>
                <strong>${featuredCampaign.maxPerCreator} USDC</strong>
              </div>
            </div>
          </section>

          <aside className="withdraw-panel">
            <div className="withdraw-icon">
              <LockKeyhole size={21} aria-hidden />
            </div>
            <span className="section-kicker">Private settlement</span>
            <h2>Withdraw available USDC</h2>
            <p>
              The payout engine reserves your available balance, prevents
              duplicates, and submits one private settlement transaction.
            </p>
            <div className="withdraw-amount">
              <span>Ready now</span>
              <strong>${available.toFixed(2)} USDC</strong>
            </div>
            <button
              className="primary-button submit-button focus-ring"
              type="button"
              disabled={withdrawing || available === 0}
              aria-busy={withdrawing}
              onClick={withdraw}
            >
              {withdrawing ? (
                <>
                  <LoaderCircle className="spin" size={16} aria-hidden />
                  Reserving balance
                </>
              ) : available === 0 ? (
                "No balance available"
              ) : (
                <>
                  <CircleDollarSign size={17} aria-hidden />
                  Withdraw privately
                </>
              )}
            </button>
            <div className="withdraw-note">
              <ShieldCheck size={15} aria-hidden />
              <span>
                Demo transaction. Mainnet payouts require a configured treasury
                signer and MagicBlock credentials.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
