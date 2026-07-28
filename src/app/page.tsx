import {
  ArrowRight,
  BadgeDollarSign,
  Check,
  CircleDollarSign,
  Eye,
  Radar,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { CampaignExplorer } from "@/components/campaign-explorer";
import { campaigns } from "@/lib/data";

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-overview">
        <div className="home-overview-grid">
          <section className="hero">
            <div className="hero-orbit orbit-one" aria-hidden />
            <div className="hero-orbit orbit-two" aria-hidden />
            <div className="hero-content">
              <div className="eyebrow">
                <Sparkles size={14} aria-hidden />
                Performance becomes payment
              </div>
              <h1>
                Do the work.
                <br />
                <span>Watch it earn.</span>
              </h1>
              <p>
                Join campaigns, publish your work, and earn continuously as
                verified results grow.
              </p>
              <div className="hero-actions">
                <a className="primary-button focus-ring" href="#campaigns">
                  Explore campaigns <ArrowRight size={17} aria-hidden />
                </a>
                <Link className="secondary-button focus-ring" href="/company">
                  Fund a campaign
                </Link>
              </div>
            </div>
            <div className="hero-proof">
              <div className="live-receipt">
                <div className="receipt-top">
                  <span>LIVE EARNING</span>
                  <span className="pulse-label">
                    <span aria-hidden />
                    tracking
                  </span>
                </div>
                <strong>$14.80</strong>
                <div className="receipt-progress">
                  <span style={{ width: "74%" }} />
                </div>
                <div className="receipt-stats">
                  <div>
                    <span>Views</span>
                    <b>8,400</b>
                  </div>
                  <div>
                    <span>Available</span>
                    <b>$12.00</b>
                  </div>
                  <div>
                    <span>Pending</span>
                    <b>$2.80</b>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="home-rail">
            <div className="rail-stats" aria-label="Platform activity">
              <div>
                <span className="rail-stat-icon">
                  <CircleDollarSign size={17} aria-hidden />
                </span>
                <span>
                  <strong>$24.8K</strong>
                  <small>Funded rewards</small>
                </span>
              </div>
              <div>
                <span className="rail-stat-icon">
                  <UsersRound size={17} aria-hidden />
                </span>
                <span>
                  <strong>186</strong>
                  <small>Active creators</small>
                </span>
              </div>
            </div>

            <div className="rail-flow-card">
              <div className="rail-flow-head">
                <span className="section-kicker">How you earn</span>
                <Radar size={18} aria-hidden />
              </div>
              <h2>One post. Clear milestones.</h2>
              <p>
                See every stage from submission to finalized private payout.
              </p>
              <div className="rail-steps">
                <div className="rail-step-complete">
                  <span>
                    <Check size={13} aria-hidden />
                  </span>
                  <div>
                    <strong>Submit your work</strong>
                    <small>Ownership verified</small>
                  </div>
                </div>
                <div className="rail-step-active">
                  <span>
                    <Eye size={13} aria-hidden />
                  </span>
                  <div>
                    <strong>Grow verified views</strong>
                    <small>Earnings update by reward block</small>
                  </div>
                </div>
                <div>
                  <span>
                    <ShieldCheck size={13} aria-hidden />
                  </span>
                  <div>
                    <strong>Withdraw USDC</strong>
                    <small>Private Solana settlement</small>
                  </div>
                </div>
              </div>
              <Link className="rail-link focus-ring" href="/dashboard">
                Open creator dashboard
                <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </aside>
        </div>

        <div className="trust-strip" aria-label="How FlowEarn works">
          <div>
            <Radar size={20} aria-hidden />
            <span>
              <strong>Verified metrics</strong>
              Tracked throughout the campaign
            </span>
          </div>
          <div>
            <BadgeDollarSign size={20} aria-hidden />
            <span>
              <strong>Micro-earnings</strong>
              Accrued in clear reward blocks
            </span>
          </div>
          <div>
            <ShieldCheck size={20} aria-hidden />
            <span>
              <strong>Private settlement</strong>
              Final payout powered by Solana
            </span>
          </div>
        </div>
      </section>

      <CampaignExplorer campaigns={campaigns} />
    </main>
  );
}
