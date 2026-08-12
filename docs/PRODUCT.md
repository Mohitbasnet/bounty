# Product

FlowEarn lets ordinary companies fund X creator campaigns in USDC and pay for
verified reach instead of a flat post fee.

## Users

- Companies create briefs, define a view rate, fund a hard budget, approve
  submissions, and recover unused funds.
- Creators publish on X, submit the public URL, and earn from official
  impression snapshots after approval.

## Core Rule

```text
eligible_views = max(verified_views - unlock_views, 0)
blocks = floor(eligible_views / views_per_block)
gross = min(blocks * reward_per_block, creator_cap)
payable = gross - already_paid
```

Accounting uses integer micro-USDC. Metrics do not create a transaction.
The app shows live earning as verified impressions are synced, while confirmed
public Solana transfers settle accumulated earnings in practical batches.

## Settlement Lifecycle

```text
Every 30 minutes -> verify linked X author and update impressions
Every day 12 UTC -> pay creator USDC and split the 2% platform fee
Campaign expiry  -> pay outstanding earnings, then refund remaining USDC
```

Company approval controls which posts enter tracking. It does not let a company
change the published rate or take funds reserved for accrued creator earnings.

## Not V1

- Project-token payouts or token-holder gates
- Developer, design, job, or generic bounty listings
- Private payments or MagicBlock
- Custom Solana programs
- AI features
