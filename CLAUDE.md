# FlowEarn Development Context

FlowEarn is a company-funded, USDC-only creator marketing platform for X.
Companies pay approved creators according to verified impressions.

## V1 Guardrails

- Focus only on X creators and company marketing campaigns.
- Use official X API data only. Never fabricate a successful verification.
- Use Solana devnet USDC and public settlement.
- Do not add project-token payouts, holder gates, AI, MagicBlock, private
  payments, Ephemeral Rollups, or a custom Anchor program.
- Every campaign is funded before it becomes live.
- Every company mutation requires the owner wallet signature.
- Every payout must be confirmed before database state changes.
- Keep accounting in integer micro-USDC.
- Preserve FlowEarn branding; do not copy Shillers source, text, or visual brand.
