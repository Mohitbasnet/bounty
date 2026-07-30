# Implementation Status

## Implemented

- Creator-first and company-facing campaign UI.
- Solana wallet connection.
- SQLite persistence and migrations.
- Company and campaign creation APIs.
- Dedicated encrypted treasury per campaign.
- Wallet-signed devnet USDC campaign funding.
- Funding transaction and treasury balance verification.
- Request-time live campaign directory and detail pages.
- Wallet-signed creator X post submission.
- Wallet-signed X OAuth 2.0 PKCE account linking.
- Exact linked X user ID versus post author verification.
- Wallet-signed company approve/reject actions.
- Official X API metrics adapter with fail-closed missing-credential behavior.
- Thirty-minute scheduled metrics polling.
- Integer micro-USDC accrual calculation.
- Daily scheduled treasury-signed public devnet USDC payout.
- Configurable 2% creator/platform fee split in one transaction.
- Payout locking, transaction journal, and confirmation reconciliation.
- Manual campaign close and automatic expired-campaign refund.
- Creator dashboard backed by persisted data.
- Explorer links for funding and payout transactions.

## Required Before V1 Production

- Move SQLite to production Postgres.
- Move treasury secrets to KMS/HSM or audited custody.
- Replace sequential cron loops with a durable retry queue.
- Add rate limiting, nonce/replay storage, audit logs, integration tests, and
  monitoring.
- Complete legal review of X API policy and creator payout rules.

## Honest Boundary

The devnet vertical slice is implemented, but V1 is not production-complete.
Without `X_BEARER_TOKEN`, metrics sync correctly fails rather than inventing
views. A company wallet also needs devnet USDC for the funding flow.
