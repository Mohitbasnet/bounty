import db from "@/lib/db";
import { fetchXPostMetrics } from "@/lib/x-api";

type SubmissionMetricRow = {
  id: string;
  campaign_id: string;
  status: string;
  x_post_id: string;
  x_post_url: string;
  views: number;
  accrued_micro: number;
  unlock_views: number;
  views_per_block: number;
  reward_per_block_micro: number;
  max_per_creator_micro: number;
  funded_micro: number;
  paid_micro: number;
  reserved_micro: number;
  linked_x_user_id: string | null;
  linked_x_handle: string | null;
};

export async function syncSubmissionMetrics(id: string) {
  const submission = db
    .prepare(
      `SELECT submissions.*, campaigns.unlock_views,
        campaigns.views_per_block, campaigns.reward_per_block_micro,
        campaigns.max_per_creator_micro, campaigns.funded_micro,
        campaigns.paid_micro, campaigns.reserved_micro
       FROM submissions
       JOIN campaigns ON campaigns.id = submissions.campaign_id
       WHERE submissions.id = ?`,
    )
    .get(id) as SubmissionMetricRow | undefined;

  if (!submission || submission.status !== "approved") {
    throw new Error("Only approved submissions can sync metrics.");
  }

  const post = await fetchXPostMetrics(submission.x_post_id);
  const ownershipVerified =
    Boolean(submission.linked_x_user_id) &&
    post.author_id === submission.linked_x_user_id;
  if (!ownershipVerified) {
    throw new Error(
      "The post author does not match the X account linked to this wallet.",
    );
  }

  const views = Math.max(post.public_metrics.impression_count, submission.views);
  const eligibleViews = Math.max(views - submission.unlock_views, 0);
  const blocks = Math.floor(eligibleViews / submission.views_per_block);
  const calculatedMicro = Math.min(
    blocks * submission.reward_per_block_micro,
    submission.max_per_creator_micro,
  );
  const requestedIncrease = Math.max(
    calculatedMicro - submission.accrued_micro,
    0,
  );

  const committed = db.transaction(() => {
    const campaign = db
      .prepare(
        `SELECT funded_micro, paid_micro, reserved_micro
         FROM campaigns WHERE id = ?`,
      )
      .get(submission.campaign_id) as {
        funded_micro: number;
        paid_micro: number;
        reserved_micro: number;
      };
    const campaignAvailable = Math.max(
      campaign.funded_micro - campaign.paid_micro - campaign.reserved_micro,
      0,
    );
    const reserveIncrease = Math.min(requestedIncrease, campaignAvailable);
    const accruedMicro = submission.accrued_micro + reserveIncrease;
    const update = db.prepare(
      `UPDATE submissions
       SET views = ?, likes = ?, reposts = ?, replies = ?,
           accrued_micro = ?, last_synced_at = ?, x_author_id = ?,
           x_author_handle = ?, ownership_verified = 1
       WHERE id = ? AND accrued_micro = ?`,
    ).run(
      views,
      post.public_metrics.like_count,
      post.public_metrics.retweet_count,
      post.public_metrics.reply_count,
      accruedMicro,
      new Date().toISOString(),
      post.author_id ?? null,
      post.author?.username ?? null,
      id,
      submission.accrued_micro,
    );
    if (update.changes !== 1) return null;
    db.prepare(
      `UPDATE campaigns SET reserved_micro = reserved_micro + ?
       WHERE id = (SELECT campaign_id FROM submissions WHERE id = ?)`,
    ).run(reserveIncrease, id);
    return { accruedMicro, reserveIncrease };
  })();
  if (!committed) {
    throw new Error("Metrics changed concurrently; retry the synchronization.");
  }

  return {
    views,
    likes: post.public_metrics.like_count,
    reposts: post.public_metrics.retweet_count,
    replies: post.public_metrics.reply_count,
    accruedMicro: committed.accruedMicro,
    reserveIncrease: committed.reserveIncrease,
    ownershipVerified,
  };
}

export async function syncAllApprovedSubmissions() {
  const rows = db
    .prepare(
      `SELECT submissions.id
       FROM submissions
       JOIN campaigns ON campaigns.id = submissions.campaign_id
       WHERE submissions.status = 'approved'
         AND campaigns.status = 'live'
         AND (campaigns.ends_at IS NULL OR campaigns.ends_at >= ?)`,
    )
    .all(new Date().toISOString()) as { id: string }[];

  const results = [];
  for (const row of rows) {
    try {
      results.push({
        id: row.id,
        status: "synced",
        metrics: await syncSubmissionMetrics(row.id),
      });
    } catch (cause) {
      results.push({
        id: row.id,
        status: "failed",
        error: cause instanceof Error ? cause.message : "Metrics sync failed.",
      });
    }
  }
  return results;
}
