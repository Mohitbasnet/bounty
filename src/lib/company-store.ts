import db from "@/lib/db";
import { mapStoredCampaign, type Project } from "@/lib/data";

type CompanyRow = {
  slug: string;
  name: string;
  description: string;
  website: string;
  active_campaigns: number;
  total_campaigns: number;
  total_paid_micro: number;
};

function mapCompany(row: CompanyRow): Project {
  return {
    slug: row.slug,
    name: row.name,
    mark: row.name.slice(0, 1).toUpperCase(),
    description: row.description || "Company-funded creator campaigns on FlowEarn.",
    website: row.website,
    xHandle: "",
    verified: false,
    activeCampaigns: row.active_campaigns,
    totalCampaigns: row.total_campaigns,
    totalPaid: row.total_paid_micro / 1_000_000,
    accent: "lime",
  };
}

const companyQuery = `
  SELECT companies.*,
    SUM(CASE WHEN campaigns.status = 'live' THEN 1 ELSE 0 END) AS active_campaigns,
    COUNT(campaigns.id) AS total_campaigns,
    COALESCE(SUM(campaigns.paid_micro), 0) AS total_paid_micro
  FROM companies
  LEFT JOIN campaigns ON campaigns.company_id = companies.id
`;

export function getCompanies() {
  return (db
    .prepare(`${companyQuery} GROUP BY companies.id ORDER BY companies.created_at DESC`)
    .all() as CompanyRow[]).map(mapCompany);
}

export function getCompany(slug: string) {
  const row = db
    .prepare(`${companyQuery} WHERE companies.slug = ? GROUP BY companies.id`)
    .get(slug) as CompanyRow | undefined;
  if (!row) return undefined;

  const campaignRows = db
    .prepare(
      `SELECT campaigns.*, companies.name AS company_name,
        companies.slug AS company_slug,
        COUNT(submissions.id) AS submission_count
       FROM campaigns
       JOIN companies ON companies.id = campaigns.company_id
       LEFT JOIN submissions ON submissions.campaign_id = campaigns.id
       WHERE companies.slug = ? AND campaigns.status = 'live'
       GROUP BY campaigns.id
       ORDER BY campaigns.created_at DESC`,
    )
    .all(slug);
  return {
    company: mapCompany(row),
    campaigns: campaignRows.map((campaign) =>
      mapStoredCampaign(
        campaign as Parameters<typeof mapStoredCampaign>[0],
      ),
    ),
  };
}
