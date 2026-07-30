export type CampaignStatus = "live" | "ending-soon" | "upcoming";
export type CampaignCategory = "Thread" | "Video" | "Visual";

export type Project = {
  slug: string;
  name: string;
  mark: string;
  description: string;
  website: string;
  xHandle: string;
  verified: boolean;
  activeCampaigns: number;
  totalCampaigns: number;
  totalPaid: number;
  accent: "lime" | "sun" | "sky";
};

export type Campaign = {
  id: string;
  slug: string;
  projectSlug: string;
  company: string;
  companyMark: string;
  title: string;
  description: string;
  category: CampaignCategory;
  platform: "X";
  status: CampaignStatus;
  rewardPool: number;
  paidOut: number;
  reserved: number;
  maxPerCreator: number;
  unlockViews: number;
  viewsPerBlock: number;
  rewardPerBlock: number;
  daysLeft: number;
  submissions: number;
  accent: "lime" | "sun" | "sky";
  featured?: boolean;
  requirements: string[];
  deliverables: string[];
};

type StoredCampaignRow = {
  id: string;
  slug: string;
  company_name: string;
  company_slug: string;
  title: string;
  description: string;
  status: "draft" | "live" | "closed";
  budget_micro: number;
  paid_micro: number;
  reserved_micro: number;
  max_per_creator_micro: number;
  unlock_views: number;
  views_per_block: number;
  reward_per_block_micro: number;
  ends_at: string | null;
  submission_count: number;
};

export function mapStoredCampaign(row: StoredCampaignRow): Campaign {
  const daysLeft = row.ends_at
    ? Math.max(
        0,
        Math.ceil((Date.parse(row.ends_at) - Date.now()) / 86_400_000),
      )
    : 0;
  return {
    id: row.id,
    slug: row.slug,
    projectSlug: row.company_slug,
    company: row.company_name,
    companyMark: row.company_name.slice(0, 1).toUpperCase(),
    title: row.title,
    description: row.description,
    category: "Thread",
    platform: "X",
    status: daysLeft <= 3 ? "ending-soon" : "live",
    rewardPool: row.budget_micro / 1_000_000,
    paidOut: row.paid_micro / 1_000_000,
    reserved: row.reserved_micro / 1_000_000,
    maxPerCreator: row.max_per_creator_micro / 1_000_000,
    unlockViews: row.unlock_views,
    viewsPerBlock: row.views_per_block,
    rewardPerBlock: row.reward_per_block_micro / 1_000_000,
    daysLeft,
    submissions: row.submission_count,
    accent: "lime",
    requirements: [
      "Publish original content from the X account you control.",
      "Keep the post public throughout the campaign and validation window.",
      "Paid traffic, bots, and engagement manipulation are not eligible.",
    ],
    deliverables: [
      "One public X post, thread, or video matching the campaign brief",
      "The direct public X post URL",
      "Optional context for the company reviewer",
    ],
  };
}

export function getRatePerThousand(campaign: Campaign) {
  return (campaign.rewardPerBlock / campaign.viewsPerBlock) * 1000;
}

export function getCampaignAvailable(campaign: Campaign) {
  return Math.max(campaign.rewardPool - campaign.paidOut - campaign.reserved, 0);
}

export function calculateEarnings(
  views: number,
  campaign: Pick<
    Campaign,
    "unlockViews" | "viewsPerBlock" | "rewardPerBlock" | "maxPerCreator"
  >,
) {
  const eligibleViews = Math.max(views - campaign.unlockViews, 0);
  const completedBlocks = Math.floor(eligibleViews / campaign.viewsPerBlock);
  return Math.min(
    completedBlocks * campaign.rewardPerBlock,
    campaign.maxPerCreator,
  );
}
