import {
  ArrowUpRight,
  Clock3,
  Eye,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import {
  getCampaignAvailable,
  getRatePerThousand,
  type Campaign,
} from "@/lib/data";

const statusLabels: Record<Campaign["status"], string> = {
  live: "Live",
  "ending-soon": "Ending soon",
  upcoming: "Upcoming",
};

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const available = getCampaignAvailable(campaign);
  const committedPercent = Math.min(
    ((campaign.paidOut + campaign.reserved) / campaign.rewardPool) * 100,
    100,
  );

  return (
    <article className="campaign-card">
      <div className={`campaign-card-top accent-${campaign.accent}`}>
        <div className="company-mark" aria-hidden>
          {campaign.companyMark}
        </div>
        <span className={`status-chip status-${campaign.status}`}>
          <span className="status-dot" aria-hidden />
          {statusLabels[campaign.status]}
        </span>
      </div>
      <div className="campaign-card-body">
        <div className="campaign-company">{campaign.company}</div>
        <h3>{campaign.title}</h3>
        <p>{campaign.description}</p>
        <div className="campaign-tags">
          <span>{campaign.category}</span>
          <span>{campaign.platform}</span>
        </div>
        <div className="campaign-rule campaign-rate-rule">
          <div>
            <span>Verified-view rate</span>
            <strong>
              <Eye size={14} aria-hidden />
              ${getRatePerThousand(campaign).toFixed(2)} / 1K views
            </strong>
          </div>
          <div>
            <span>Unlock</span>
            <strong>{campaign.unlockViews.toLocaleString()} views</strong>
          </div>
        </div>
        <div className="pool-progress">
          <div>
            <span>${available.toLocaleString()} available</span>
            <span>${campaign.rewardPool.toLocaleString()} pool</span>
          </div>
          <span className="pool-progress-track" aria-hidden>
            <span style={{ width: `${committedPercent}%` }} />
          </span>
        </div>
        <div className="campaign-card-footer">
          <div className="campaign-meta">
            <span>
              <Clock3 size={14} aria-hidden /> {campaign.daysLeft}d left
            </span>
            <span><UsersRound size={14} aria-hidden /> {campaign.submissions} posts</span>
          </div>
          <Link
            className="card-link focus-ring"
            href={`/campaigns/${campaign.slug}`}
            aria-label={`View ${campaign.title}`}
          >
            <ArrowUpRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
