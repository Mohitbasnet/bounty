import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  CalendarClock,
  Check,
  CircleDollarSign,
  Eye,
  Globe2,
  LockKeyhole,
  Radio,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CampaignDetailActions } from "@/components/campaign-detail-actions";
import { CampaignSubmitAction } from "@/components/campaign-submit-action";
import { getCampaign } from "@/lib/data";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = getCampaign(slug);

  if (!campaign) notFound();

  const firstExampleViews = campaign.unlockViews + campaign.viewsPerBlock;
  const secondExampleViews = campaign.unlockViews + campaign.viewsPerBlock * 5;

  return (
    <main className="listing-detail-page">
      <div className="listing-detail-wrap">
        <Link className="back-link focus-ring" href="/#campaigns">
          <ArrowLeft size={16} aria-hidden />
          All campaigns
        </Link>

        <header className="listing-detail-header">
          <div className="listing-header-identity">
            <span className={`listing-company-mark accent-${campaign.accent}`}>
              <span>{campaign.companyMark}</span>
            </span>
            <div>
              <h1>{campaign.title}</h1>
              <div className="listing-header-meta">
                <span>by {campaign.company}</span>
                <span aria-hidden>·</span>
                <span>{campaign.category} campaign</span>
                <span aria-hidden>·</span>
                <span className="listing-open-status">
                  <span aria-hidden />
                  Submissions open
                </span>
                <span aria-hidden>·</span>
                <span><Globe2 size={14} aria-hidden /> Global</span>
                <span aria-hidden>·</span>
                <span><UsersRound size={14} aria-hidden /> {campaign.submissions}</span>
              </div>
            </div>
          </div>
          <CampaignDetailActions />
        </header>

        <div className="listing-column-labels" aria-hidden>
          <span>Earning terms</span>
          <span>Campaign details</span>
        </div>

        <div className="listing-detail-grid">
          <aside className="listing-terms-column">
            <div className="listing-terms-card">
              <div className="listing-pool">
                <span className="listing-pool-icon">
                  <CircleDollarSign size={22} aria-hidden />
                </span>
                <div>
                  <strong>${campaign.rewardPool.toLocaleString()}</strong>
                  <span>USDC funded pool</span>
                </div>
              </div>

              <div className="listing-rate-flow">
                <div>
                  <span className="rate-node" aria-hidden />
                  <span>
                    <small>Eligibility unlock</small>
                    <strong>{campaign.unlockViews.toLocaleString()} verified views</strong>
                  </span>
                </div>
                <div>
                  <span className="rate-node" aria-hidden />
                  <span>
                    <small>Performance rate</small>
                    <strong>
                      ${campaign.rewardPerBlock.toFixed(2)} per{" "}
                      {campaign.viewsPerBlock} views
                    </strong>
                  </span>
                </div>
                <div>
                  <span className="rate-node" aria-hidden />
                  <span>
                    <small>Creator safety cap</small>
                    <strong>Up to ${campaign.maxPerCreator} USDC</strong>
                  </span>
                </div>
              </div>

              <div className="listing-quick-stats">
                <div>
                  <UsersRound size={17} aria-hidden />
                  <strong>{campaign.submissions}</strong>
                  <span>Submissions</span>
                </div>
                <div>
                  <CalendarClock size={17} aria-hidden />
                  <strong>{campaign.daysLeft} days</strong>
                  <span>Remaining</span>
                </div>
              </div>

              <CampaignSubmitAction campaignSlug={campaign.slug} />
              <p className="listing-action-note">
                No winner ranking. Every eligible creator earns from verified
                performance while budget remains.
              </p>
            </div>

            <section className="listing-side-section">
              <h2>Skills needed</h2>
              <div className="listing-skill-tags">
                <span>{campaign.category}</span>
                <span>{campaign.platform}</span>
              </div>
            </section>

            <section className="listing-side-section">
              <h2>Settlement</h2>
              <p>
                Live earnings accrue off-chain. Finalized USDC settles
                privately on Solana.
              </p>
              <span className="listing-secured">
                <LockKeyhole size={14} aria-hidden />
                Funded before submissions open
              </span>
            </section>

            <section className="listing-side-section">
              <h2>Questions?</h2>
              <p>Contact {campaign.company} before submitting if the brief is unclear.</p>
            </section>
          </aside>

          <article className="listing-document">
            <section className="listing-document-section listing-overview">
              <span className="section-kicker">Campaign overview</span>
              <h2>{campaign.title}</h2>
              <p>{campaign.description}</p>
              <p>
                Create useful, original work that makes the subject easier to
                understand. Publish it from the account connected to your
                FlowEarn profile so ownership and performance can be verified.
              </p>
            </section>

            <section className="listing-document-section">
              <h2>What you need to submit</h2>
              <p>
                Your submission enters tracking only after ownership and the
                required deliverables pass verification.
              </p>
              <ul className="listing-check-list">
                {campaign.deliverables.map((item) => (
                  <li key={item}>
                    <span><Check size={14} aria-hidden /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="listing-document-section">
              <h2>How performance earnings work</h2>
              <p>
                The funded pool is not divided among fixed winners. Once your
                post reaches {campaign.unlockViews.toLocaleString()} verified
                views, every complete {campaign.viewsPerBlock}-view block adds{" "}
                ${campaign.rewardPerBlock.toFixed(2)} to your live earning.
              </p>
              <div className="listing-formula">
                <div>
                  <Eye size={18} aria-hidden />
                  <span>Verified views after unlock</span>
                </div>
                <ArrowRight size={17} aria-hidden />
                <div>
                  <BadgeDollarSign size={18} aria-hidden />
                  <span>Completed reward blocks</span>
                </div>
                <ArrowRight size={17} aria-hidden />
                <div>
                  <Radio size={18} aria-hidden />
                  <span>Live earning</span>
                </div>
              </div>
              <div className="listing-example-table">
                <div className="listing-example-head">
                  <span>Verified performance</span>
                  <span>Creator earning</span>
                </div>
                <div>
                  <span>{campaign.unlockViews.toLocaleString()} views</span>
                  <strong>Eligible</strong>
                </div>
                <div>
                  <span>{firstExampleViews.toLocaleString()} views</span>
                  <strong>${campaign.rewardPerBlock.toFixed(2)} live</strong>
                </div>
                <div>
                  <span>{secondExampleViews.toLocaleString()} views</span>
                  <strong>
                    ${(campaign.rewardPerBlock * 5).toFixed(2)} live
                  </strong>
                </div>
              </div>
            </section>

            <section className="listing-document-section">
              <h2>Verification requirements</h2>
              <ul className="listing-requirements">
                {campaign.requirements.map((item) => (
                  <li key={item}>
                    <ShieldCheck size={17} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="listing-document-section">
              <h2>From submission to settlement</h2>
              <div className="listing-timeline">
                <div>
                  <span>01</span>
                  <strong>Submit</strong>
                  <p>Add your public X content and optional context.</p>
                </div>
                <div>
                  <span>02</span>
                  <strong>Verify</strong>
                  <p>Ownership and campaign requirements are checked.</p>
                </div>
                <div>
                  <span>03</span>
                  <strong>Track</strong>
                  <p>Verified reward blocks grow your live earning.</p>
                </div>
                <div>
                  <span>04</span>
                  <strong>Settle</strong>
                  <p>Validated USDC becomes available for private withdrawal.</p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
