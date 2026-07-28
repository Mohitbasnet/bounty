export type CampaignStatus = "live" | "ending-soon" | "upcoming";
export type CampaignCategory = "Writing" | "Video" | "Visuals";

export type Campaign = {
  slug: string;
  company: string;
  companyMark: string;
  title: string;
  description: string;
  category: CampaignCategory;
  platform: "X";
  status: CampaignStatus;
  rewardPool: number;
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

export const campaigns: Campaign[] = [
  {
    slug: "explain-private-payments",
    company: "MagicBlock",
    companyMark: "M",
    title: "Explain private payments without the jargon",
    description:
      "Create an original X thread that helps people understand why private settlement matters for everyday products.",
    category: "Writing",
    platform: "X",
    status: "live",
    rewardPool: 2500,
    maxPerCreator: 75,
    unlockViews: 1000,
    viewsPerBlock: 100,
    rewardPerBlock: 0.2,
    daysLeft: 7,
    submissions: 28,
    accent: "lime",
    featured: true,
    requirements: [
      "The post must be original and published from your connected X account.",
      "Keep the thread live through the 48-hour validation window.",
      "Views must be organic. Paid promotion and engagement farms are not eligible.",
    ],
    deliverables: [
      "One public X thread with at least four posts",
      "A working link to your published thread",
      "A short note explaining your creative angle",
    ],
  },
  {
    slug: "solana-story-in-motion",
    company: "Helius",
    companyMark: "H",
    title: "Turn Solana activity into a story people remember",
    description:
      "Create a short X video that turns live Solana activity into a clear, memorable story for a broad audience.",
    category: "Video",
    platform: "X",
    status: "ending-soon",
    rewardPool: 5000,
    maxPerCreator: 250,
    unlockViews: 500,
    viewsPerBlock: 100,
    rewardPerBlock: 1,
    daysLeft: 2,
    submissions: 16,
    accent: "sky",
    requirements: [
      "Publish from your connected X account.",
      "Keep every claim accurate and easy for a new audience to follow.",
      "Use original footage, narration, or visual storytelling.",
    ],
    deliverables: [
      "One original public X video",
      "A clear opening hook and one memorable takeaway",
      "Optional context about your creative approach",
    ],
  },
  {
    slug: "wallet-safety-story",
    company: "Backpack",
    companyMark: "B",
    title: "Tell a wallet safety story people remember",
    description:
      "Make wallet safety practical and memorable through a short video, visual thread, or illustrated guide.",
    category: "Visuals",
    platform: "X",
    status: "live",
    rewardPool: 1800,
    maxPerCreator: 90,
    unlockViews: 1500,
    viewsPerBlock: 100,
    rewardPerBlock: 0.25,
    daysLeft: 12,
    submissions: 9,
    accent: "sun",
    requirements: [
      "Use your own examples and visual assets.",
      "Do not promote token prices or financial returns.",
      "Mention at least three actionable safety practices.",
    ],
    deliverables: [
      "One public X post or thread",
      "Original visuals included directly in the post",
      "Optional context about the intended audience",
    ],
  },
];

export const featuredCampaign = campaigns[0];

export function getCampaign(slug: string) {
  return campaigns.find((campaign) => campaign.slug === slug);
}

export function calculateEarnings(
  views: number,
  campaign: Pick<
    Campaign,
    "unlockViews" | "viewsPerBlock" | "rewardPerBlock" | "maxPerCreator"
  >,
) {
  const postThresholdViews = Math.max(views - campaign.unlockViews, 0);
  const completedBlocks = Math.floor(
    postThresholdViews / campaign.viewsPerBlock,
  );
  return Math.min(
    completedBlocks * campaign.rewardPerBlock,
    campaign.maxPerCreator,
  );
}
