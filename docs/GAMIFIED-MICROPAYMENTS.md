# Gamified Micropayment Model

Status: proposed product model; exact campaign defaults are not locked.

## Goal

Make creator earnings feel alive throughout a campaign without sending one
blockchain transaction for every metric update.

The recommended model has two earning layers:

```text
Predictable base earning
  + competitive momentum bonus
  = creator's live campaign earning
```

The base layer protects creator trust. The bonus layer creates the recurring
competition and excitement.

## Why Not Divide the Entire Pool Every Four Hours

A pure rolling pool would make payout unpredictable:

- Creators could not know what one view is worth before publishing.
- Large accounts could dominate every interval.
- A bot spike could drain irreversible funds.
- Early high-performance intervals could consume budget needed later.
- Late creators would enter an unfairly depleted campaign.
- Corrected or removed metrics would be difficult to recover after settlement.

Therefore, an epoch should create provisional ledger earnings, not immediately
send irreversible payments.

## Recommended Campaign Budget

Example for a 2,500 USDC campaign:

```text
Base performance pool:  2,000 USDC
Momentum bonus pool:      375 USDC
Safety/unspent reserve:   125 USDC
Total funded:           2,500 USDC
```

The exact split remains configurable within safe platform limits.

### Base Performance Pool

Every qualified creator earns a fixed public rate:

```text
Eligibility unlock: 1,000 verified views
Reward block:         100 new verified views
Reward:              0.20 USDC per completed block
Creator cap:        75.00 USDC
```

This is the micropayment foundation. Each completed block creates a small
earning event in the application ledger.

### Momentum Bonus Pool

The campaign is divided into fixed epochs, initially proposed as four hours.
Only new verified views inside that epoch count.

```text
creator delta = max(epoch end views - epoch start views, 0)
creator share = eligible creator delta / all eligible creator deltas
creator bonus = epoch bonus pool * creator share
creator bonus = min(creator bonus, epoch creator cap)
```

Use incremental views, not lifetime campaign views. This gives every epoch a new
race and prevents one early viral post from winning the entire campaign forever.

Example:

```text
Four-hour bonus pool: 12 USDC

Creator A: 3,000 new verified views -> 50% -> 6 USDC
Creator B: 2,000 new verified views -> 33% -> 4 USDC
Creator C: 1,000 new verified views -> 17% -> 2 USDC
```

If an epoch has too little valid activity, its bonus rolls forward instead of
being forced out.

## Earning and Settlement Are Different

At each verified snapshot:

```text
X metrics snapshot
  -> calculate new base reward blocks
  -> calculate completed epoch bonus
  -> write provisional ledger events
  -> update creator dashboard
```

Example events:

```text
BASE_EARNING_PROVISIONAL    +0.20
EPOCH_BONUS_PROVISIONAL     +6.00
BASE_EARNING_FINALIZED      +0.20
EPOCH_BONUS_FINALIZED       +6.00
PAYOUT_RESERVED             -6.20
PAYOUT_CONFIRMED             6.20
```

The UI can update after every snapshot or completed epoch. The blockchain does
not need a transaction for each event.

## Private Payout Flow

V1 settlement:

```text
Finalized balance reaches minimum threshold
        or creator requests withdrawal
        or campaign ends
                    |
                    v
Application atomically reserves creator balance and campaign budget
                    |
                    v
MagicBlock Private Payments builds the private USDC transfer
                    |
                    v
Server-side treasury signer signs and submits
                    |
                    v
Solana confirmation is reconciled into the ledger
```

Recommended initial minimum withdrawal: 5 USDC. Automatic settlement can run
once daily, while creator-requested withdrawal can run whenever the finalized
balance is above the threshold.

MagicBlock is the private settlement rail. It does not fetch X views, calculate
epoch winners, prevent duplicate ledger events, or decide how campaign budget is
allocated.

## V1 Versus Future On-Chain Logic

### V1

- Metrics and epoch calculation run in the application worker.
- PostgreSQL stores immutable snapshots and append-only ledger events.
- The campaign treasury is funded before activation.
- A secured server signer submits batched private payouts.
- No custom Solana program or MagicBlock Ephemeral Rollup is required.

### Future

A custom escrow program, oracle-signed snapshots, or MagicBlock Ephemeral Rollup
can be considered if creators require program-enforced allocation and self-claim.
Even then, an off-chain oracle must provide social metrics because a Solana
program cannot poll X directly.

## Required Safety Rules

- A creator must pass the campaign eligibility threshold before base or bonus
  earnings begin.
- Only the increase between authoritative snapshots counts in an epoch.
- Snapshot and epoch processing must be idempotent.
- Every creator has base, epoch, and campaign payout caps.
- Suspicious traffic keeps earnings provisional.
- Corrected metrics cannot create a second payout for the same views.
- A completed epoch is finalized only after its validation window.
- The total of finalized earnings, reservations, and payouts cannot exceed the
  funded campaign pools.
- Unused or invalidated budget is reconciled and refundable.
- Settlement failure must retry safely or release the reservation.

## Decisions To Lock Before Implementation

1. Two-hour or four-hour epochs.
2. Base pool, momentum pool, and reserve percentages.
3. Fixed rate per 100 or per 1,000 verified views.
4. Minimum eligibility views.
5. Per-epoch and per-campaign creator caps.
6. Validation delay before an epoch bonus becomes available.
7. Minimum private withdrawal amount.
8. Daily automatic payout versus creator-request-only payout.
9. How zero-activity and low-activity epoch budgets roll forward.
10. Whether V1 uses X impressions after written approval or first-party tracked
    performance.

