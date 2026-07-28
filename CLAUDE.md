@AGENTS.md

# Project Context

This repository contains an interactive, mock-first V1 frontend for a real-time,
performance-based creator micropayment bounty platform. After an eligibility
threshold, completed blocks of verified views create small earnings; accumulated
payouts use MagicBlock Private Payments.

## Development Guardrails

- Frontend V1 development was explicitly approved on July 23, 2026.
- Read `README.md` and every file in `docs/` before proposing implementation.
- Keep Version 1 narrow: X campaigns, one primary metric, USDC, and MagicBlock.
- Preserve the core distinction between reward-block micro-earning accrual and
  creator-requested or campaign-end private settlement.
- V1 uses MagicBlock Private Payments API only. Do not add MagicBlock ER, PER,
  delegated accounts, or a custom Solana program.
- Do not add AI features, a custom Anchor program, MagicBlock ER, extra social
  platforms, or microservices to Version 1.
- Treat money as integer base units and design all monetary changes as
  append-only, idempotent ledger events.
- Never mark a payout paid before blockchain confirmation is reconciled.
