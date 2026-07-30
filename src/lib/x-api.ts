import { z } from "zod";

const xResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    author_id: z.string().optional(),
    public_metrics: z.object({
      impression_count: z.number().int().nonnegative().default(0),
      like_count: z.number().int().nonnegative().default(0),
      retweet_count: z.number().int().nonnegative().default(0),
      reply_count: z.number().int().nonnegative().default(0),
      quote_count: z.number().int().nonnegative().default(0),
      bookmark_count: z.number().int().nonnegative().optional(),
    }),
  }),
  includes: z
    .object({
      users: z
        .array(
          z.object({
            id: z.string(),
            username: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
});

export async function fetchXPostMetrics(postId: string) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    throw new Error(
      "X_BEARER_TOKEN is not configured. Metrics cannot be verified.",
    );
  }

  const response = await fetch(
    `https://api.x.com/2/tweets/${postId}?tweet.fields=author_id,public_metrics&expansions=author_id&user.fields=username`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(`Official X API returned ${response.status}.`);
  }
  const parsed = xResponseSchema.parse(await response.json());
  const author = parsed.includes?.users?.find(
    (user) => user.id === parsed.data.author_id,
  );
  return { ...parsed.data, author };
}
