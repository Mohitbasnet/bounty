# Decision Log

## Accepted

### Real-time micropayments are the core product

The primary experience is not a company selecting bounty winners. After a
submission crosses its configured threshold, each completed block of verified
views adds a small earning during the active campaign.

### Separate accrual from settlement

Reward-block micro-earnings accrue in the application ledger. A creator can
withdraw the available accumulated amount, or the system settles the remainder
when the campaign ends. This preserves the real-time earning experience without
requiring a blockchain transaction for every view or reward block.

### Privacy belongs to payout

The campaign, submission, and performance experience is not described as fully
private. MagicBlock Private Payments is used for the accumulated creator payout.

### Do not use MagicBlock ER or PER in V1

The earning engine and ledger remain in the application. V1 uses no delegated
accounts, Ephemeral Rollup, Private Ephemeral Rollup, or custom Solana program.

### Narrow V1 to X creator campaigns

The broad vision supports any verified external event. V1 uses one channel and
one primary metric so data quality, fraud, and payout correctness can be tested.

### Focus V1 on creators, not developer work

V1 creator profiles and campaign discovery use Writing, Video, and Visuals.
Developer tasks, code submissions, repositories, and technical-work categories
are outside the product scope.

### Keep gamification additive

The fixed public reward-block rate remains the predictable earning foundation.
Time-boxed momentum bonuses may add competition based on new verified views, but
they do not replace the base formula or trigger one blockchain transaction per
epoch.

### Use off-chain metrics and ledgering

X data is collected by a worker and written to PostgreSQL. The blockchain does
not fetch X data, and each view does not create a transaction.

### Settle only finalized balances

The interface may show estimated growth, but payments use finalized ledger state
derived from stored metric snapshots.

### Integrate before building a program

V1 uses MagicBlock Private Payments through an adapter. No custom Anchor or ER
program is planned until customer demand justifies trust-minimized escrow or
self-claim.

### Use an append-only money ledger

Every earning, finalization, reservation, release, and payment is an event.
Current balances are projections that can be audited and rebuilt.

### Share one payout engine

Creator withdrawal and campaign-end settlement differ only by trigger.
Reservation, signing, submission, and reconciliation are identical.

### Build mock adapters first

Metrics and settlement mocks allow the complete product and money logic to be
tested before depending on X access or real funds.

### Gate X impressions behind written approval

The core engine must not depend on X approval. If approval is unavailable, the
pilot uses first-party tracked clicks or conversions through the same metric
snapshot interface.

### Do not use scrapers as a payment oracle

Unofficial X scrapers are operationally fragile, contractually risky, and not
authoritative enough to settle creator money.

### Keep V1 operationally supervised

Manual review, small caps, and invited users are intentional controls, not
unfinished features.

## Deferred

- Final product and company name.
- Prisma versus Drizzle.
- Authentication provider versus custom wallet session.
- Platform treasury versus company-specific treasury.
- Mainnet custody and signer model.
- Exact X API access and paid-content policy approval.
- Pricing model.
- Jurisdiction, KYC, sanctions, tax, and disclosure requirements.
