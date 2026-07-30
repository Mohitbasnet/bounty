# Architecture

```text
Next.js UI
  -> Route Handlers
    -> SQLite repository (local V1)
    -> Official X API adapter
    -> OAuth 2.0 PKCE identity binding
    -> Solana devnet RPC
      -> Campaign treasury USDC ATA
      -> Creator USDC ATA
```

## Trust Boundaries

- Company and creator mutations require wallet message signatures.
- Campaign activation requires a confirmed funding transaction and treasury
  token balance.
- X metrics fail closed without an official API credential.
- Payout requires the post author ID to match the X account linked to the
  creator wallet.
- Treasury keys are encrypted locally for development.
- Payout database state changes only after Solana confirmation.

## Production Migration

- SQLite to Postgres.
- Local encrypted signer to KMS/HSM or audited custody.
- Sequential cron workers to idempotent durable queue workers.
- Timestamp-only replay protection to stored nonces.
- Add multi-provider custody failover and refund monitoring.
