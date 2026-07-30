import {
  ArrowRight,
  CircleDollarSign,
  Eye,
  FileCheck2,
  Plus,
  Radio,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { CampaignCloseButton } from "@/components/campaign-close-button";
import { getLiveCampaigns } from "@/lib/campaign-store";

export const dynamic = "force-dynamic";

export default function CompanyDashboardPage() {
  const campaigns = getLiveCampaigns();
  const totalBudget = campaigns.reduce(
    (sum, campaign) => sum + campaign.rewardPool,
    0,
  );
  const totalSubmissions = campaigns.reduce(
    (sum, campaign) => sum + campaign.submissions,
    0,
  );
  return (
    <main className="dashboard-page">
      <div className="dashboard-wrap">
        <div className="dashboard-heading">
          <div>
            <span className="section-kicker">Company workspace</span>
            <h1>Creator campaigns</h1>
            <p>Fund verified X reach, approve posts, and monitor public USDC payouts.</p>
          </div>
          <Link
            className="primary-button focus-ring"
            href="/campaigns/new"
          >
            <Plus size={17} aria-hidden />
            Create campaign
          </Link>
        </div>

        <section className="company-stats" aria-label="Campaign overview">
          <div>
            <span>
              <Radio size={16} aria-hidden />
              Active campaigns
            </span>
            <strong>{campaigns.length}</strong>
            <small>Funded and accepting submissions</small>
          </div>
          <div>
            <span>
              <CircleDollarSign size={16} aria-hidden />
              Campaign treasuries
            </span>
            <strong>${totalBudget.toLocaleString()}</strong>
            <small>USDC reserved</small>
          </div>
          <div>
            <span>
              <UsersRound size={16} aria-hidden />
              Active creators
            </span>
            <strong>{totalSubmissions}</strong>
            <small>Submitted posts</small>
          </div>
          <div>
            <span>
              <FileCheck2 size={16} aria-hidden />
              Awaiting approval
            </span>
            <strong>{totalSubmissions}</strong>
            <small>Review in submissions workspace</small>
          </div>
        </section>

        <section className="company-panel">
          <div className="company-panel-heading">
            <div>
              <h2>Your campaigns</h2>
              <p>Pool usage, verified reach, and settlement health.</p>
            </div>
            <Link className="text-link focus-ring" href="/company/submissions">
              Review submissions <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <div className="campaign-table" role="table">
            <div className="campaign-table-header" role="row">
              <span role="columnheader">Campaign</span>
              <span role="columnheader">Creators</span>
              <span role="columnheader">Verified views</span>
              <span role="columnheader">Accrued</span>
              <span role="columnheader">Budget</span>
              <span role="columnheader">Status</span>
              <span aria-hidden />
            </div>
            {campaigns.map((campaign) => (
              <div className="campaign-table-row" role="row" key={campaign.slug}>
                <div className="table-campaign" role="cell">
                  <span className={`mini-mark accent-${campaign.accent}`}>
                    {campaign.companyMark}
                  </span>
                  <span>
                    <strong>{campaign.title}</strong>
                    <small>{campaign.daysLeft} days left</small>
                  </span>
                </div>
                <span role="cell">{campaign.submissions}</span>
                <span className="metric-text" role="cell">
                  <Eye size={14} aria-hidden />
                  Awaiting sync
                </span>
                <span className="metric-text" role="cell">
                  ${campaign.paidOut.toFixed(2)}
                </span>
                <span className="metric-text" role="cell">
                  ${campaign.rewardPool.toLocaleString()}
                </span>
                <span role="cell">
                  <span className="table-status">
                    <span aria-hidden />
                    Live
                  </span>
                </span>
                <span className="review-summary">
                  <Link
                    className="card-link focus-ring"
                    href="/company/submissions"
                    aria-label={`Open ${campaign.title}`}
                  >
                    <ArrowRight size={17} aria-hidden />
                  </Link>
                  <CampaignCloseButton
                    campaignId={campaign.id}
                    title={campaign.title}
                  />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
