# Performance Bounty Platform

Working title for a real-time micropayment bounty platform where companies fund
creator campaigns and creators earn small amounts continuously as verified
performance grows.

> Unlock at eligibility, then earn for every verified block of views.

This repository includes the **interactive V1 product prototype**. It
demonstrates the intended creator and company journey with local mock data. It
is not yet the production end-to-end V1: the database, authenticated wallets,
authoritative metrics tracker, ledger, campaign funding, MagicBlock settlement,
and reconciliation remain engineering work.

See [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md) for the
code-backed completion matrix, exact remaining work, and V2 start gate.

## Product Goal

Build one trustworthy path from campaign funding to a real-time micro-earning
stream:

```text
Company funds campaign
  -> Creator joins and submits an X post
  -> Post ownership and metrics are verified
  -> Minimum-view threshold unlocks earning
  -> Every completed block of 100 verified views adds a micro-earning
  -> Creator watches the balance grow during the campaign
  -> Accrued earnings are privately paid in practical batches
  -> Final campaign balance is reconciled
```

Like a real-time salary stream, the creator sees earnings grow while the work is
producing results. The difference is that performance, not time, drives the
stream.

The product does not send an on-chain transaction for every view. After
eligibility, verified views fill configurable reward blocks, such as 100 views.
Each completed block creates a small earning entitlement in the internal ledger.
Those micro-earnings are accumulated and settled through MagicBlock Private
Payments when the creator withdraws or the campaign ends. Privacy is a payout
feature; it is not the main product category.

## Who It Is For

- **Companies:** Web3 teams running measurable creator campaigns.
- **Creators:** Approved creators who want transparent earnings and dependable
  stablecoin payouts.
- **Operators:** The internal team reviewing risk, disputes, and payment failures
  during the controlled MVP.

## Version Strategy

### Version 1: Prove the real-time micropayment workflow

V1 supports one narrow use case: a Web3 company funds a seven-day creator
campaign, creators submit content, verified performance unlocks reward blocks,
and accumulated USDC is settled through MagicBlock. Manual review is acceptable
where automation would create fraud or payment risk.

The V1 implementation order is:

1. Simulate the entire workflow with mock metrics and mock settlement.
2. Build the real ledger, reward-block engine, balances, and payout state machine.
3. Pass the X policy gate and select the pilot metric.
4. Integrate either official X impressions or first-party tracked clicks.
5. Integrate MagicBlock Private Payments on devnet.
6. Run one small, manually supervised USDC pilot.

See [`docs/V1.md`](docs/V1.md) for the exact scope and acceptance criteria.

#### V1 Pilot Metric Gate

There is no trustworthy, production-ready, completely free source of live X
impressions.

If X provides written approval, V1 uses official Post Lookup:

- `public_metrics.impression_count` as the campaign metric.
- Poll active Posts approximately every five minutes.
- Store every authoritative response as an immutable metric snapshot.
- Recalculate completed 100-view reward blocks after each snapshot.
- Push the updated balance to the dashboard immediately.
- Treat the experience as near-real-time, not second-by-second X data.

X currently documents Post reads at `$0.005` per resource and generally
deduplicates repeat reads of the same Post within one UTC day. At that rate, one
seven-day Post campaign is approximately `$0.035` per creator, before other
resources and edge cases.

If X does not approve the compensated-Post use case, V1 keeps X as a distribution
channel but pays for first-party tracked clicks or verified conversions instead
of X impressions. Unofficial scrapers are not an acceptable payment oracle.

Development remains free by using the official X API Playground and deterministic
mock snapshots. See
[`docs/X-METRICS-STRATEGY.md`](docs/X-METRICS-STRATEGY.md) for the evidence,
cost model, policy conflict, and fallback design.

### Version 2: Reduce trust and expand the engine

V2 adds more metric providers, stronger automation, program-controlled escrow,
MagicBlock Ephemeral Rollups where justified, and creator self-claim.

V2 starts only after V1 has produced real usage and reliable payout data. See
[`docs/V2.md`](docs/V2.md).

## Core Product Rules

- Campaign money must be funded before earnings can be paid.
- Metrics are collected off-chain and stored as immutable snapshots.
- After the eligibility threshold, every completed reward block, such as 100
  verified views, adds a micro-earning according to the campaign rate.
- Earnings use an append-only ledger; balances are derived, not overwritten.
- The live counter is a real-time representation of accrued entitlement, not a
  claim that X provides a new verified metric every second.
- Provisional earnings cannot be withdrawn.
- Payout creation reserves both creator balance and campaign budget atomically.
- Creator withdrawal and campaign-end settlement share one payout engine.
- Micro-earnings accumulate before settlement; there is no blockchain
  transaction per view or per 100-view reward block.
- A payment is not complete until blockchain confirmation is reconciled.
- Animated live earnings are estimates; verified snapshots are authoritative.
- Private settlement must not be marketed as making all activity invisible.

## V1 Stack

| Area | Choice |
| --- | --- |
| Web application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL |
| ORM | Prisma or Drizzle, decision pending |
| Background jobs | Redis + BullMQ |
| Authentication | Wallet signature; X OAuth only for approved X path |
| Metrics | Mock adapter + X or first-party tracking adapter |
| Blockchain | Solana + USDC |
| Micropayment ledger | Integer USDC micro-units in PostgreSQL |
| Private payout rail | MagicBlock Private Payments |
| Monitoring | Structured logs + Sentry |

V1 does not use MagicBlock Ephemeral Rollups, Private Ephemeral Rollups, account
delegation, or a custom Solana program.

The current frontend is a mock-first Next.js application. The backend target is
a modular application with a separate worker, not a microservice fleet and not a
custom Anchor program.

## Implemented Demo Routes

- `/`: campaign marketplace and product positioning.
- `/campaigns/explain-private-payments`: campaign brief and earning formula.
- `/campaigns/explain-private-payments/submit`: post ownership verification and
  creator submission flow.
- `/dashboard`: live earning, reward-block progress, validation balances, and
  private withdrawal simulation.
- `/company`: funded campaign and treasury dashboard.
- `/company/campaigns/new`: campaign rule builder and funding simulation.
- `/company/submissions`: creator metrics, verification, review, and payout
  simulation.

The simulation intentionally labels devnet and demo data. It does not claim to
read live X metrics or move real USDC.

## Planning Documents

- [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md): what is
  implemented, what is simulated, what remains for V1, and when V2 can start.
- [`docs/POSITIONING.md`](docs/POSITIONING.md): differentiation, first customer,
  product contract, competitive position, and moat path.
- [`docs/GAMIFIED-MICROPAYMENTS.md`](docs/GAMIFIED-MICROPAYMENTS.md): proposed
  base earning, momentum epochs, safety rules, and private settlement model.
- [`docs/competitive-landscape.html`](docs/competitive-landscape.html): visual
  competitor matrix and recommended market wedge.
- [`docs/PRODUCT.md`](docs/PRODUCT.md): product definition, users, and principles.
- [`docs/V1.md`](docs/V1.md): complete MVP scope, stages, and acceptance criteria.
- [`docs/V2.md`](docs/V2.md): post-validation expansion.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): boundaries, data flow, and states.
- [`docs/X-METRICS-STRATEGY.md`](docs/X-METRICS-STRATEGY.md): researched
  options for X data, cost, latency, policy, and fallbacks.
- [`docs/DECISIONS.md`](docs/DECISIONS.md): decisions already made and why.
- [`docs/OPEN-QUESTIONS.md`](docs/OPEN-QUESTIONS.md): decisions required before
  production integrations and a real-money pilot.

## Local Setup

Requirements:

- Node.js 20.9 or newer
- npm 10 or newer

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Quality commands:

```bash
npm run lint
npm run build
```

## Current Status

- Product planning and the interactive creator/company prototype are complete.
- Reward-block calculations and payout states are demonstrated in browser state.
- The production V1 is not complete: there is no real wallet authentication,
  database, metrics worker, append-only ledger, funded treasury transfer,
  MagicBlock payout, reconciliation worker, or automated test suite.
- The next engineering milestone is a durable local MVP: PostgreSQL persistence,
  domain APIs, integer money math, a replay-safe ledger, and deterministic mock
  metrics and settlement adapters.
- `npm audit` currently reports upstream findings in the generated Next.js
  dependency tree. Do not run the suggested force fix because it proposes a
  breaking downgrade; reassess before development or deployment.
