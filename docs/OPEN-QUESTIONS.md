# Open Questions Before Production Integration

These decisions are intentionally unresolved. The interactive product prototype
can continue to be refined, but durable backend, real metrics, and real-money
integration decisions should not be finalized until the relevant questions are
answered.

## Blocking Product Decisions

1. What is the final product name and primary domain?
2. Is V1 limited to invited creators, or can any creator request to join?
3. Is 100 views the fixed V1 reward block, or can a company choose from approved
   sizes such as 100, 500, or 1,000?
4. Who is allowed to finalize earnings during the pilot?
5. What is the exact validation delay and dispute window?
6. What happens when X corrects metrics downward after an earning is finalized?
7. What creator disclosure is required on sponsored posts?
8. What minimum payout, per-creator cap, and total pilot budget are acceptable?
9. What minimum available balance must a creator reach before withdrawal?
10. At campaign end, is the remaining available balance sent automatically or
    after an operator approval?
11. How should reward-block progress behave between authoritative X snapshots?
12. Will X provide written approval for using API metrics in a
    performance-compensated paid-partnership product?
13. If X approval is unavailable, do we switch V1 rewards to first-party clicks
    or verified conversions?

## Blocking Money and Legal Decisions

1. Does the platform custody pooled USDC, or does each company control a separate
   treasury?
2. Who signs payouts and how is that key isolated?
3. Which countries can companies and creators join during the pilot?
4. Are KYC, sanctions screening, tax collection, or money-transmission controls
   required for the chosen pilot structure?
5. What evidence and approval are required before a disputed payout is released?

These require qualified legal and compliance review before real-money launch.

## Technical Decisions

1. Prisma or Drizzle for PostgreSQL?
2. Which wallet authentication/session library?
3. Which job hosting and Redis provider?
4. Which Solana network and USDC mint for each environment?
5. Which MagicBlock API version and signer flow are supported for the pilot?
6. Which X API tier and fields are available, at what polling cost?
7. What idempotency-key format spans database intent and chain submission?
8. How long are OAuth tokens, raw evidence, and metric snapshots retained?

## Pilot Questions

1. Which company will run the first campaign?
2. Which five to ten creators will participate?
3. What content brief produces useful quality instead of cheap impressions?
4. What campaign result makes the company willing to run a second campaign?
5. What support and dispute response time can the team realistically provide?

## Recommended Next Planning Session

Resolve these five first:

1. Final V1 campaign rules.
2. Treasury and signer model.
3. X access and policy position, including the first-party metric fallback.
4. Pilot participants and budget.
5. Exact success metrics for company, creator, and platform.
