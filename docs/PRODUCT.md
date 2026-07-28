# Product Definition

## Working Positioning

**Performance payroll for Web3 creators.**

> Every qualified creator earns under a public formula as verified results grow.

The first customer is a Web3 company that already pays creators but currently
uses spreadsheets, screenshots, manual metric checks, and slow wallet transfers.

V1 is specifically for original creator-led X content: writing, short video, and
visual storytelling. It is not a developer-work marketplace, generic job board,
winner-take-all bounty platform, or high-volume clipping marketplace. See
`docs/POSITIONING.md` for the competitive analysis and product contract.

## Problem

Traditional bounty platforms collect submissions and later choose winners or
manually decide a fixed reward. They do not let a creator become eligible and
then watch a small earning stream grow as additional verified-view blocks
complete.
Creators do not know what they have earned, what is still being verified, or
when payment will arrive.

## Solution

Companies create and pre-fund measurable campaigns. Creators submit content.
Once a submission crosses its eligibility threshold, verified views begin
filling reward blocks. Each completed block, such as 100 views, creates a
micro-earning. The platform shows block progress and accumulated earnings,
separates provisional and available balances, and privately settles accumulated
USDC through MagicBlock.

## Core Campaign Example

```text
Campaign duration: 7 days
Eligibility unlock: 1,000 verified views
Reward block: 100 verified views after unlock
Reward: $0.20 per completed block
Maximum per creator: $100

Views 0-999       -> Not eligible
View 1,000        -> Earning unlocks
Views 1,001-1,099 -> Progress toward first reward block
View 1,100        -> $0.20 micro-earning recorded
View 1,200        -> Total earning becomes $0.40
Creator withdraws -> Available amount is privately settled
Campaign end      -> Remaining amount is privately settled and reconciled
```

V1 uses a fixed view block rather than a per-view rate. Internally rewards are
calculated in integer USDC base units.

A proposed gamified layer can add fixed four-hour momentum bonus epochs based on
new verified views during each epoch. The predictable base rate remains intact,
and epoch bonuses accrue in the ledger before batched private settlement. See
`docs/GAMIFIED-MICROPAYMENTS.md`; its exact defaults are not yet locked.

## V1 User Journey

### Company

1. Connect a wallet and create an organization.
2. Fund a campaign budget in USDC.
3. Define content requirements, eligibility, reward rate, cap, and validation
   delay.
4. Review creators, submissions, metrics, and risk flags.
5. Monitor creator withdrawals and campaign-end settlement.

### Creator

1. Connect a wallet and X account.
2. Join an eligible campaign.
3. Publish and submit an X post URL.
4. See eligibility progress and the micro-earning stream.
5. See finalized and available balances.
6. Request a private USDC withdrawal.
7. See payout status and history.

### Operator

1. Review failed ownership checks and suspicious metrics.
2. Approve or reject finalization during the pilot.
3. Retry or reconcile failed payments.
4. Record an audit reason for every manual action.

## Product Principles

- **Fund first:** no unfunded promises.
- **Performance creates the stream:** time alone never increases earnings.
- **Unlock, then fill blocks:** the eligibility threshold controls when reward
  progress begins.
- **Evidence before money:** payment uses verified snapshots, not UI animation.
- **Ledger before balance:** every money change is auditable.
- **One payout engine:** every trigger follows identical safety checks.
- **Manual is acceptable in V1:** risky automation is worse than visible review.
- **Privacy with precision:** explain exactly which payment data is private.
- **Private Payments only in V1:** no MagicBlock ER, PER, or custom program.
- **Adapter boundaries:** X and MagicBlock are providers, not the core domain.

## Success Hypotheses

V1 should answer:

- Will companies pre-fund performance-based creator campaigns?
- Do creators trust provisional and finalized balances?
- Can we validate X performance reliably enough to support payment?
- Does the live micropayment experience motivate creators and differentiate the
  product from winner-based bounty platforms?
- Does private USDC payout improve the settlement experience after earnings
  accrue?
- Can one operator safely manage disputes and failed payouts?

## Business Model Hypothesis

Start with a platform fee on successfully paid campaign value. Do not finalize
pricing until pilot interviews establish whether companies prefer a percentage,
campaign fee, or subscription.
