import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Eye,
  Gauge,
  Link2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { CampaignExplorer } from "@/components/campaign-explorer";
import { getLiveCampaigns } from "@/lib/campaign-store";

export const dynamic = "force-dynamic";

const creatorBenefits = [
  "Browse funded campaigns with the rate and rules visible upfront",
  "Submit an X post from your linked account",
  "Watch earnings grow from official verified-view snapshots",
  "Receive finalized USDC through a public Solana settlement",
];

const companyBenefits = [
  "Set a USDC pool, per-1K-view rate, tracking window, and creator cap",
  "Review each submission before it can earn",
  "Pay only for approved, verified performance",
  "End a campaign and recover every uncommitted USDC",
];

const steps = [
  {
    number: "01",
    title: "Pick a campaign",
    copy: "See the funded pool, rate, unlock, cap, brief, and deadline before you make anything.",
  },
  {
    number: "02",
    title: "Post on X",
    copy: "Publish from your linked X account and submit the public post URL for ownership review.",
  },
  {
    number: "03",
    title: "Watch live earning accrue",
    copy: "Official X impression snapshots update your provisional USDC earning throughout the tracking window.",
  },
  {
    number: "04",
    title: "Settle publicly on Solana",
    copy: "Finalized earnings are batched and paid in USDC from the funded campaign treasury.",
  },
];

export default function Home() {
  const campaigns = getLiveCampaigns();
  return (
    <main className="creator-marketing-home">
      <section className="ppv-hero">
        <div className="ppv-hero-copy">
          <span className="hero-label">Verified-impression creator marketing</span>
          <h1>
            Micro-earnings that move
            <span>as reach moves.</span>
          </h1>
          <p>
            Companies fund USDC campaigns. X creators publish, get approved,
            and see live earning accrue in small blocks as official impressions
            are synced. Finalized USDC settles publicly on Solana devnet.
          </p>
          <div className="ppv-hero-actions">
            <Link className="primary-button focus-ring" href="/campaigns">
              Browse campaigns <ArrowRight size={17} aria-hidden />
            </Link>
            <Link className="secondary-button focus-ring" href="/campaigns/new">
              Launch a campaign
            </Link>
          </div>
          <p className="ppv-safety-note">
            <ShieldCheck size={15} aria-hidden />
            Live earning feedback. Public settlement. Auditable accounting.
          </p>
        </div>

        <div className="ppv-hero-board" aria-label="Illustrative live earning ledger">
          <div className="board-topline">
            <span className="live-pill"><span aria-hidden /> Live earning</span>
            <span>Illustrative ledger · 7d</span>
          </div>
          <h2>Earn as verified reach compounds.</h2>
          <div className="board-rate">
            <span>Verified impression rate</span>
            <strong>$2.00 <small>/ 1K impressions</small></strong>
          </div>
          <div className="board-progress-copy">
            <span>8,400 verified impressions</span>
            <span>$14.80 live earning</span>
          </div>
          <div className="board-progress" aria-hidden><span /></div>
          <div className="board-balance-grid">
            <div><span>Available</span><strong>$12.00</strong></div>
            <div><span>Validating</span><strong>$2.80</strong></div>
            <div><span>Creator cap</span><strong>$75.00</strong></div>
          </div>
          <div className="board-settlement">
            <Link2 size={17} aria-hidden />
            <span><strong>Next public settlement</strong> Confirmed batch · USDC</span>
          </div>
        </div>
      </section>

      <section className="proof-rail" aria-label="Product guarantees">
        <span><Eye size={18} aria-hidden /> Official X impressions</span>
        <span><CircleDollarSign size={18} aria-hidden /> Funded USDC pools</span>
        <span><BadgeCheck size={18} aria-hidden /> Company-approved posts</span>
        <span><RefreshCw size={18} aria-hidden /> Public batch settlement</span>
      </section>

      <section className="live-earning-section" aria-labelledby="live-earning-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Live micro-earning</span>
            <h2 id="live-earning-title">Fast feedback for creators. Clear settlement for everyone.</h2>
          </div>
          <p>
            FlowEarn updates a live earning ledger as official X impression
            snapshots arrive. Your balance moves in integer micro-USDC blocks;
            confirmed earnings settle in public Solana batches.
          </p>
        </div>

        <div className="live-earning-layout">
          <div className="live-earning-track" aria-label="Earning lifecycle">
            <article className="live-earning-step">
              <span className="live-earning-step-icon"><Eye size={18} aria-hidden /></span>
              <div>
                <span className="live-earning-step-label">01 / VERIFIED SIGNAL</span>
                <h3>Official impressions arrive</h3>
                <p>Approved posts are checked against the creator’s linked X account.</p>
              </div>
            </article>
            <article className="live-earning-step live-earning-step-active">
              <span className="live-earning-step-icon"><Activity size={18} aria-hidden /></span>
              <div>
                <span className="live-earning-step-label">02 / LIVE LEDGER</span>
                <h3>Micro-earnings update</h3>
                <p>Small integer USDC blocks accrue in the app as verified reach grows.</p>
              </div>
            </article>
            <article className="live-earning-step">
              <span className="live-earning-step-icon"><Gauge size={18} aria-hidden /></span>
              <div>
                <span className="live-earning-step-label">03 / PUBLIC SETTLEMENT</span>
                <h3>Available USDC is paid</h3>
                <p>Finalized earnings leave the funded treasury in a confirmed Solana batch.</p>
              </div>
            </article>
          </div>

          <aside className="live-earning-callout">
            <span className="section-kicker">The honest version</span>
            <h3>Live earning, not a transaction per impression.</h3>
            <p>
              Creators get fast performance feedback without paying a
              blockchain fee for every metric update. Companies and creators
              still get a public USDC transaction when the balance is settled.
            </p>
            <div className="live-earning-callout-note">
              <ShieldCheck size={16} aria-hidden />
              <span>Verified X data in. Confirmed Solana settlement out.</span>
            </div>
          </aside>
        </div>
      </section>

      <CampaignExplorer campaigns={campaigns} />

      <section className="audience-split">
        <article className="audience-panel audience-creator">
          <span className="section-kicker">For creators</span>
          <h2>A clearer way to monetize your X posts.</h2>
          <p>
            Know exactly what qualifies, what every verified view is worth, and
            when your USDC becomes available.
          </p>
          <ul>
            {creatorBenefits.map((benefit) => (
              <li key={benefit}><span><BadgeCheck size={15} aria-hidden /></span>{benefit}</li>
            ))}
          </ul>
          <Link className="text-arrow-link focus-ring" href="/campaigns">
            Find a campaign <ArrowRight size={16} aria-hidden />
          </Link>
        </article>

        <article className="audience-panel audience-project">
          <span className="section-kicker">For companies</span>
          <h2>Performance marketing with a hard budget.</h2>
          <p>
            Fund once, approve quality, and let the payout engine handle
            finalized creator earnings.
          </p>
          <ul>
            {companyBenefits.map((benefit) => (
              <li key={benefit}><span><BadgeCheck size={15} aria-hidden /></span>{benefit}</li>
            ))}
          </ul>
          <Link className="text-arrow-link focus-ring" href="/campaigns/new">
            Launch a campaign <ArrowRight size={16} aria-hidden />
          </Link>
        </article>
      </section>

      <section className="how-it-works">
        <div className="section-heading">
          <div>
            <span className="section-kicker">How it works</span>
            <h2>Four steps from post to payout.</h2>
          </div>
          <p>
            Earnings update in small blocks. Blockchain settlement happens in
            practical daily batches, not one transaction per view.
          </p>
        </div>
        <ol className="step-grid">
          {steps.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="final-cta">
        <span className="section-kicker">Creator reach, priced honestly</span>
        <h2>Fund the result. Pay verified reach.</h2>
        <div>
          <Link className="primary-button focus-ring" href="/campaigns">
            Start earning <ArrowRight size={17} aria-hidden />
          </Link>
          <Link className="secondary-button focus-ring" href="/projects">
            Explore companies
          </Link>
        </div>
      </section>
    </main>
  );
}
