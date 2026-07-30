import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Eye,
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
    title: "Grow verified reach",
    copy: "Official X snapshots update your provisional USDC earning throughout the tracking window.",
  },
  {
    number: "04",
    title: "Settle on Solana",
    copy: "Finalized earnings are batched and paid in USDC from the funded campaign treasury.",
  },
];

export default function Home() {
  const campaigns = getLiveCampaigns();
  return (
    <main className="creator-marketing-home">
      <section className="ppv-hero">
        <div className="ppv-hero-copy">
          <span className="hero-label">Verified-view creator marketing</span>
          <h1>
            Pay for the reach.
            <span>Not just the post.</span>
          </h1>
          <p>
            Companies fund USDC campaigns. X creators publish, get approved,
            and earn as verified views grow. Final payouts settle publicly on
            Solana devnet.
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
            No seed phrase. No payment per click. Campaign accounting stays
            auditable.
          </p>
        </div>

        <div className="ppv-hero-board" aria-label="Example live campaign">
          <div className="board-topline">
            <span className="live-pill"><span aria-hidden /> Earning now</span>
            <span>Example company · 7d</span>
          </div>
          <h2>Explain a new product clearly</h2>
          <div className="board-rate">
            <span>Verified-view rate</span>
            <strong>$2.00 <small>/ 1K views</small></strong>
          </div>
          <div className="board-progress-copy">
            <span>8,400 verified views</span>
            <span>$14.80 live</span>
          </div>
          <div className="board-progress" aria-hidden><span /></div>
          <div className="board-balance-grid">
            <div><span>Available</span><strong>$12.00</strong></div>
            <div><span>Validating</span><strong>$2.80</strong></div>
            <div><span>Creator cap</span><strong>$75.00</strong></div>
          </div>
          <div className="board-settlement">
            <Link2 size={17} aria-hidden />
            <span><strong>Next public settlement</strong> Batched · USDC</span>
          </div>
        </div>
      </section>

      <section className="proof-rail" aria-label="Product guarantees">
        <span><Eye size={18} aria-hidden /> Official X metrics</span>
        <span><CircleDollarSign size={18} aria-hidden /> Funded USDC pools</span>
        <span><BadgeCheck size={18} aria-hidden /> Company-approved posts</span>
        <span><RefreshCw size={18} aria-hidden /> Refundable unspent budget</span>
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
