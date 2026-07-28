# Architecture

## V1 Pattern

Use a modular monolith plus a separate background worker:

```text
Next.js web and API
        |
        v
PostgreSQL domain and append-only ledger
        |
        +----> Worker: metrics, finalization, reconciliation
        |
        +----> X adapter / mock metrics adapter
        |
        +----> MagicBlock adapter / mock settlement adapter
```

This keeps deployment and transactions simple while preserving boundaries that
can become separate services later.

## Target Backend Repository Shape

The folders below are the target for backend implementation. The current
simulation keeps frontend routes in `src/app`, reusable UI in `src/components`,
and deterministic demo data and calculations in `src/lib`.

```text
src/
  app/                    Next.js pages and route handlers
  modules/
    identity/             Users, wallets, X accounts
    organizations/        Companies and membership
    campaigns/            Campaign rules, funding, lifecycle
    submissions/          Creator enrollment and post evidence
    metrics/              Provider-neutral snapshots
    ledger/               Earning events and derived balances
    payouts/              Reservation and payout state machine
    risk/                 Eligibility and operator flags
    audit/                Immutable operational history
  adapters/
    metrics/
      mock/
      x/
    settlement/
      mock/
      magicblock/
  infrastructure/
    database/
    jobs/
    observability/
worker/
  metrics/
  finalization/
  payouts/
  reconciliation/
```

Create these domain folders as each backend stage begins; do not generate empty
modules ahead of the implemented behavior.

## Core Data Areas

- Identity: users, wallets, social accounts, organizations, members.
- Campaigns: campaigns, rules, funding, creator enrollment, submissions.
- Verification: metric snapshots, checks, risk flags, status history.
- Money: earning events, balances, budget reservations, payout intents,
  transactions, reconciliation events.
- Operations: audit events and operator actions.

## Real-Time Micropayment Model

The product has two separate clocks:

```text
Verification clock: X metrics are fetched periodically and stored as snapshots.
Experience clock:   the UI shows progress toward the next reward block.
Settlement clock:   accumulated micro-earnings are paid in practical batches.
```

“Real-time micropayment” means the creator's entitlement grows in very small
performance-based blocks throughout the campaign. It does not mean one X API
call or one Solana transaction per view or reward block.

## Money Model

Monetary state is append-only. Example events:

```text
EARNING_PROVISIONAL   +4.00
EARNING_FINALIZED     +4.00
PAYOUT_RESERVED       -4.00
PAYOUT_CONFIRMED      -4.00
RESERVATION_RELEASED  +4.00
```

Use integer USDC base units. Never use JavaScript floating-point values for money.

Derived balances:

```text
provisional = eligible but not finalized
finalized   = approved earning
reserved    = finalized funds locked by an active payout
paid        = confirmed settlement
available   = finalized - reserved - paid
```

The exact event signs and balance projection must be finalized before schema
implementation so one event cannot be counted twice.

## Accrual Rule

```text
post-threshold views  = max(current impressions - unlock threshold, 0)
completed blocks      = floor(post-threshold views / views per reward block)
total entitlement     = completed blocks * reward per block
total entitlement     = min(total entitlement, per-creator cap)
new earning           = total entitlement - recorded entitlement
```

Snapshot processing must be idempotent. An older or replayed sequence cannot
increase entitlement.

Example:

```text
Unlock threshold: 1,000 views
Reward block:     100 views
Block reward:     $0.20
Current views:    3,500
Post-threshold:   2,500
Completed blocks: 25
Entitlement:      $5.00
```

Rates and balances are stored as integer USDC base units. Campaign rules must
reject a rate that cannot be represented safely at the chosen token precision.

## Campaign Timeline

```text
Campaign starts
  -> Creator submits post
  -> Ownership verified
  -> Views approach threshold
  -> Threshold unlocks earning
  -> Verified views fill reward blocks
  -> Completed blocks create micro-earnings
  -> Creator withdrawal privately settles available amounts
  -> Campaign closes
  -> Final snapshot, remaining private payout, and budget reconciliation
```

## MagicBlock Boundary

V1 uses MagicBlock Private Payments API only as the payout adapter:

```text
Application ledger
  -> Create payout intent
  -> Reserve available creator balance
  -> Build and sign private transfer
  -> Submit and confirm
  -> Reconcile ledger
```

V1 does not delegate accounts, execute earning calculations in an Ephemeral
Rollup, use a Private Ephemeral Rollup, or deploy a custom Solana program.

## Payout Transaction Boundary

Inside one database transaction:

1. Lock the creator balance and campaign funding records.
2. Recalculate available creator balance and campaign budget.
3. Reserve both amounts.
4. Create one idempotent payout intent.

External transaction construction and submission happen after the database
transaction. A reconciliation worker moves the payout to confirmed, failed, or
manual-review state.

## State Models

Campaign:

```text
DRAFT -> FUNDED -> ACTIVE -> PAUSED -> COMPLETED
                    |                    |
                    +------> CANCELLED <-+
```

Submission:

```text
SUBMITTED -> VERIFYING -> ACTIVE -> FINALIZING -> FINALIZED
                 |          |             |
                 +------> REJECTED <-------+
```

Payout:

```text
CREATED -> RESERVED -> SIGNING -> SUBMITTED -> CONFIRMED
              |           |          |
              +-------> FAILED <------+
                            |
                            +-> REVIEW -> RETRYING or RELEASED
```

## Security Boundaries

- Wallet signatures authenticate users; they do not authorize arbitrary treasury
  transfers.
- Treasury keys never enter browser code, logs, or committed environment files.
- X OAuth tokens are encrypted at rest and scoped minimally.
- Every external call uses timeouts, retries, and idempotency identifiers.
- Ledger and audit records are not silently edited.
- Raw provider responses are minimized; store hashes and required evidence.

## Integration Strategy

V1 integrates existing payment infrastructure and does not introduce a custom
Solana program. Relevant future tooling includes Solana RPC/indexing support such
as Helius, but no external service is required to run the current mock-first
product simulation.
