# X Identity And Metrics Strategy

## Production Rule

Only the official X API can create payable impressions. Screenshots, manually
entered numbers, scraped metrics, and client-side counters never affect money.

## Identity

1. The creator connects a Solana wallet.
2. The wallet signs the OAuth-start request.
3. X OAuth 2.0 PKCE returns the authenticated `/2/users/me` identity.
4. FlowEarn stores the X user ID against that wallet.
5. Every submission snapshots the linked X user ID.
6. Post Lookup must return the same `author_id` before accrual or payout.

Required scopes:

```text
tweet.read users.read offline.access
```

## Polling

The authorized scheduler runs every 30 minutes and requests public metrics for
all approved submissions in live campaigns. On Vercel Hobby, GitHub Actions
provides this external schedule because Vercel's native Hobby cron is limited
to daily jobs. A failed or unavailable API request does not change earnings.

Metrics stored:

- Impressions/views
- Likes
- Reposts
- Replies
- X author ID and username
- Last successful synchronization time

Views are monotonic in the earning ledger: a later lower API value does not
remove already accrued money. Traffic review and reversal handling remain a
production risk-control requirement.

## Cost Control

- Poll only approved submissions in live campaigns.
- Stop polling after campaign expiry.
- Avoid per-page or client-triggered automatic requests.
- Keep a manual owner-triggered sync only for operational recovery.
- Batch Tweet Lookup requests when moving from the local worker to a production
  queue.

There is no fake X sandbox in the money path. Development without credentials
must fail closed.
