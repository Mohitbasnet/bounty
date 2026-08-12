# FlowEarn

> Pay for verified X reach, not just the post.

FlowEarn is a company-funded creator marketing platform. A company creates an X
campaign, funds a dedicated treasury with devnet USDC, reviews creator posts,
and pays approved creators according to official X impression metrics.

FlowEarn is not a token-project marketplace. V1 uses USDC only. It does not use
MagicBlock, private payments, a custom Solana program, or fabricated X data.

## V1 Flow

1. A company connects a Solana wallet and defines a campaign.
2. FlowEarn creates a dedicated encrypted campaign treasury.
3. The company signs a real devnet USDC funding transaction.
4. The campaign becomes live only after on-chain balance verification.
5. A creator connects a wallet and submits a public X post URL.
6. The creator links X through wallet-signed OAuth 2.0 PKCE.
7. The company wallet approves or rejects the submission.
8. Every 30 minutes an authorized scheduler checks the linked account and
   official X metrics.
9. Earnings accrue in integer micro-USDC reward blocks.
10. At 12:00 UTC the treasury sends creator USDC and the 2% platform fee.
11. The payout is marked paid only after Solana confirmation.
12. At campaign end, remaining USDC is refunded to the company wallet.

No blockchain transaction happens per view. Views update the internal ledger;
USDC transfers are batched into practical settlements.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required for real X identity and metrics:

```bash
X_BEARER_TOKEN=...
X_CLIENT_ID=...
X_CLIENT_SECRET=...
X_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/x/callback
CRON_SECRET=use-a-long-random-secret
PLATFORM_FEE_WALLET=your-solana-wallet
```

The app defaults to Solana devnet and the devnet USDC mint. The company wallet
needs devnet USDC to fund a campaign. Campaign treasury secrets are encrypted
with a machine-local key under `.data/`, which is gitignored. Production must
move signing to a managed KMS/HSM.

## Commands

```bash
npm run lint
npm run build
```

## Current Limits

- Official X credentials and a matching Developer Console redirect URI are
  required for ownership and metrics verification.
- The local SQLite and encrypted signer are development infrastructure. On
  Vercel, SQLite falls back to ephemeral `/tmp` storage for demo deployment;
  production still requires Postgres and managed custody.
- On Vercel Hobby, settlement runs daily at 12:00 UTC and expired-campaign
  refunds run at 12:15 UTC. The repository's GitHub Actions workflow calls the
  metrics endpoint every 30 minutes; configure `FLOWEARN_URL` and `CRON_SECRET`
  as GitHub repository secrets.
- Payout and refund transitions use database locks and pre-recorded transaction
  signatures to reduce duplicate settlement risk.
- Production still requires Postgres, a durable queue, and managed custody.

See [docs/IMPLEMENTATION-STATUS.md](docs/IMPLEMENTATION-STATUS.md) for the exact
completion boundary.
