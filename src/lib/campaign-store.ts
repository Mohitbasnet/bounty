import db from "@/lib/db";
import { mapStoredCampaign } from "@/lib/data";

const campaignSelect = `
  SELECT campaigns.*, companies.name AS company_name,
    companies.slug AS company_slug,
    COUNT(submissions.id) AS submission_count
  FROM campaigns
  JOIN companies ON companies.id = campaigns.company_id
  LEFT JOIN submissions ON submissions.campaign_id = campaigns.id
`;

export function getLiveCampaigns() {
  const rows = db
    .prepare(
      `${campaignSelect}
       WHERE campaigns.status = 'live'
       GROUP BY campaigns.id
       ORDER BY campaigns.created_at DESC`,
    )
    .all();
  return rows.map((row) =>
    mapStoredCampaign(row as Parameters<typeof mapStoredCampaign>[0]),
  );
}

export function getLiveCampaign(slug: string) {
  const row = db
    .prepare(
      `${campaignSelect}
       WHERE campaigns.slug = ? AND campaigns.status = 'live'
       GROUP BY campaigns.id`,
    )
    .get(slug);
  return row
    ? mapStoredCampaign(row as Parameters<typeof mapStoredCampaign>[0])
    : undefined;
}
