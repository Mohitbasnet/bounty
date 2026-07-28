# X Metrics Strategy

Research date: July 23, 2026.

## Conclusion

There is no trustworthy, production-ready, completely free source of live X
impression data.

The recommended approach is:

1. Develop for free with the official X API Playground and a deterministic mock
   adapter.
2. Seek written confirmation from X that the paid-creator use case is permitted.
3. If approved, run the pilot with the official pay-per-use Post Lookup API.
4. Keep first-party clicks and conversions as the policy-safer, real-time metric
   fallback.
5. Do not use a scraper as the payment oracle.

## Important Separation

X is not the payment provider:

```text
X or first-party tracking -> performance evidence
Application ledger        -> reward-block calculation
MagicBlock                -> private USDC payout
```

The platform does not need an X payment API. It only needs an authoritative
metric source.

## Option 1: Official X API

### Available data

Post Lookup can return:

- `public_metrics.impression_count`
- Likes, reposts, replies, quotes, and bookmarks
- Post author ID and creation time
- Video view count when media fields are requested

Public metrics can use app authentication. Creator-authorized OAuth is required
for non-public, organic, and promoted metrics on the creator's own recent posts.

### Current cost model

X currently documents pay-per-use pricing:

- Post read: $0.005 per resource.
- No monthly minimum.
- The same Post is generally deduplicated within one UTC day, even when fetched
  repeatedly that day.
- Deduplication is described as a soft guarantee, so budgets should include a
  margin.

Approximate seven-day campaign cost for one Post per creator:

| Active creators | Resource-days | Approximate Post-read cost |
| ---: | ---: | ---: |
| 10 | 70 | $0.35 |
| 100 | 700 | $3.50 |
| 1,000 | 7,000 | $35.00 |

This excludes any separately billed resources or endpoints. Confirm actual rates
in the X Developer Console before launching.

### Polling design

X does not provide a webhook each time an existing Post's impression count
changes. Filtered Stream webhooks deliver matching Posts, not changing impression
totals.

Recommended V1 schedule:

```text
New active submission       -> every 5 minutes
Older low-growth submission -> every 15-30 minutes
Campaign ending             -> immediate final snapshot
After campaign end          -> one delayed reconciliation snapshot
```

Use the multi-Post endpoint to fetch up to 100 Posts per request. Billing remains
resource-based, but batching reduces request count and simplifies rate limiting.

Every successful fetch creates an immutable snapshot. The worker calculates
newly completed 100-view reward blocks and pushes the updated balance to the web
application through Server-Sent Events or WebSockets.

This is near-real-time verification, not second-by-second X data.

## Option 2: Official X API Playground

The official open-source Playground is a local mock server for X API v2. It uses
no real X credits and returns simulated data.

Use it for:

- OAuth-independent application development.
- Post lookup response contracts.
- Increasing impression snapshots.
- Rate-limit and error scenarios.
- Deleted Post and stale-data scenarios.
- Reward-block and payout demos.

It cannot prove real campaign performance and must never finalize a real payout.

## Option 3: First-Party Click and Conversion Tracking

This is the strongest fallback when X approval is unavailable.

Each creator receives a unique campaign URL:

```text
https://our-domain.example/r/{campaign}/{creator}
```

The redirect service:

1. Receives the click.
2. Records timestamp, campaign, creator, and privacy-safe anti-fraud signals.
3. Rejects obvious bots and duplicate bursts.
4. Redirects the visitor to the company's destination.
5. Emits a verified performance event immediately.

For conversions, the company sends a signed server-to-server event:

```text
CLICK_VERIFIED
SIGNUP_VERIFIED
PURCHASE_VERIFIED
```

Advantages:

- Controlled by our system.
- Near-real-time.
- No X API cost.
- Better business value than raw impressions.
- Works across X, blogs, newsletters, and other channels.

Limitations:

- Does not measure views of the X Post itself.
- Requires a link or conversion action.
- Needs bot filtering, attribution windows, and privacy controls.

## Option 4: Creator Evidence and Manual Review

For a tiny prototype, creators can submit an analytics screenshot or export and
an operator can record a verified snapshot.

Use only for:

- Customer interviews.
- A no-code pilot.
- Resolving a disputed API snapshot.

It is not real-time, is easy to manipulate, and should not become the production
payment oracle.

## Option 5: Unofficial Scrapers

Third-party services advertise trial credits and may return public Post view
counts without an X API key.

Do not use them for production payouts because:

- X expressly prohibits scraping without prior written consent.
- Page and anti-bot changes can break collection.
- A provider may return stale or mismatched counts.
- Disputes have no authoritative evidence.
- Trial credits are not a durable free-data strategy.

Scrapers may be useful for disposable research only after reviewing contractual
and legal risk. They should never finalize money.

## Policy Risk

Two current X policies create tension:

- X allows paid partnerships when properly disclosed.
- X Developer Policy says API-based services must not provide monetary or virtual
  compensation for X actions, explicitly including Posts.

Our performance-paid Post model may fall inside the restricted category even
though normal brand sponsorships are recognized elsewhere. X also restricts
paid-partnership promotion of some financial and crypto products in certain
jurisdictions.

Before using X API data to calculate real payouts:

1. Submit the exact use case to X.
2. Explain that creators produce disclosed paid-partnership content.
3. Explain that compensation is based on verified campaign performance.
4. Ask for written approval or a written interpretation.
5. Restrict pilot geography and campaign categories based on that response and
   qualified legal advice.

Do not hide the intended use case or bypass a rejection with scraping.

## Recommended V1 Decision

### Development

Use mock metrics and the X API Playground. Build the complete seven-day campaign
simulation and 100-view reward-block ledger for zero data cost.

### Pilot A, if X approves

Use official Post Lookup with creator OAuth, five-minute polling, immutable
snapshots, manual finalization, and a tightly capped X credit budget.

### Pilot B, if X does not approve

Keep X as a distribution channel, but pay for verified first-party clicks,
signups, or purchases. Do not use X impressions as the payout oracle.

### Alternative public-view provider

YouTube Data API provides public video `viewCount` and a default daily quota
rather than per-read billing. It is a viable future adapter if its terms and the
exact paid-creator use case pass a separate policy review.

## Sources

- [X API pricing](https://docs.x.com/x-api/getting-started/pricing)
- [X usage and billing](https://docs.x.com/x-api/fundamentals/post-cap)
- [X metrics reference](https://docs.x.com/x-api/fundamentals/metrics)
- [X Post Lookup integration guide](https://docs.x.com/x-api/posts/lookup/integrate)
- [X rate limits](https://docs.x.com/x-api/fundamentals/rate-limits)
- [X developer tools and Playground](https://docs.x.com/tools-and-libraries)
- [X Playground repository](https://github.com/xdevplatform/playground)
- [X Developer Policy](https://docs.x.com/developer-terms/policy)
- [X Paid Partnerships Policy](https://help.x.com/en/rules-and-policies/paid-partnerships-policy.html)
- [X Terms of Service](https://x.com/en/tos)
- [YouTube Data API overview](https://developers.google.com/youtube/v3/getting-started)
- [YouTube video statistics](https://developers.google.com/youtube/v3/docs/videos)
