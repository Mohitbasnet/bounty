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

import { campaigns } from "@/lib/data";

export default function CompanyDashboardPage() {
  return (
    <main className="dashboard-page">
      <div className="dashboard-wrap">
        <div className="dashboard-heading">
          <div>
            <span className="section-kicker">MagicBlock workspace</span>
            <h1>Performance campaigns</h1>
            <p>Fund work, monitor results, and control final settlement.</p>
          </div>
          <Link
            className="primary-button focus-ring"
            href="/company/campaigns/new"
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
            <strong>2</strong>
            <small>1 ending this week</small>
          </div>
          <div>
            <span>
              <CircleDollarSign size={16} aria-hidden />
              Funded treasury
            </span>
            <strong>$7,500</strong>
            <small>USDC reserved</small>
          </div>
          <div>
            <span>
              <UsersRound size={16} aria-hidden />
              Active creators
            </span>
            <strong>44</strong>
            <small>Across all campaigns</small>
          </div>
          <div>
            <span>
              <FileCheck2 size={16} aria-hidden />
              Needs review
            </span>
            <strong>8</strong>
            <small>Ownership or fraud checks</small>
          </div>
        </section>

        <section className="company-panel">
          <div className="company-panel-heading">
            <div>
              <h2>Your campaigns</h2>
              <p>Budget, performance, and settlement health.</p>
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
            {campaigns.slice(0, 2).map((campaign, index) => (
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
                  {index === 0 ? "184.2K" : "72.8K"}
                </span>
                <span className="metric-text" role="cell">
                  ${index === 0 ? "368.40" : "122.00"}
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
                <Link
                  className="card-link focus-ring"
                  href="/company/submissions"
                  aria-label={`Open ${campaign.title}`}
                >
                  <ArrowRight size={17} aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
