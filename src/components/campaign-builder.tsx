"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Coins,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { readApiResponse } from "@/lib/api";
import { buildActionMessage } from "@/lib/messages";
import { explorerTransactionUrl, USDC_DECIMALS, USDC_MINT } from "@/lib/solana";

type BuilderState = "editing" | "funding" | "published";

export function CampaignBuilder() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signMessage } = useWallet();
  const [state, setState] = useState<BuilderState>("editing");
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [threshold, setThreshold] = useState(1000);
  const [viewsPerBlock, setViewsPerBlock] = useState(100);
  const [rewardPerBlock, setRewardPerBlock] = useState(0.2);
  const [creatorCap, setCreatorCap] = useState(75);
  const [budget, setBudget] = useState(2500);
  const [error, setError] = useState("");
  const [fundingSignature, setFundingSignature] = useState("");

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!publicKey || !signMessage) {
      setError("Connect a wallet that supports message signing first.");
      return;
    }

    try {
      setState("funding");
      const campaignPayload = {
        companyName,
        title,
        description,
        durationDays,
        budgetMicro: Math.round(budget * 1_000_000),
        unlockViews: threshold,
        viewsPerBlock,
        rewardPerBlockMicro: Math.round(rewardPerBlock * 1_000_000),
        maxPerCreatorMicro: Math.round(creatorCap * 1_000_000),
      };
      const message = buildActionMessage({
        action: "campaign.create",
        wallet: publicKey.toBase58(),
        payload: campaignPayload,
      });
      const signature = await signMessage(new TextEncoder().encode(message));
      const createResponse = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          message,
          signature: bs58.encode(signature),
          campaign: campaignPayload,
        }),
      });
      const created = await readApiResponse<{
        campaign: {
          id: string;
          treasuryWallet: string;
          budgetMicro: number;
        };
      }>(createResponse);

      const treasuryOwner = new (await import("@solana/web3.js")).PublicKey(
        created.campaign.treasuryWallet,
      );
      const ownerAta = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const treasuryAta = await getAssociatedTokenAddress(
        USDC_MINT,
        treasuryOwner,
      );
      const transaction = new Transaction();
      if (!(await connection.getAccountInfo(treasuryAta))) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            treasuryAta,
            treasuryOwner,
            USDC_MINT,
          ),
        );
      }
      transaction.add(
        createTransferCheckedInstruction(
          ownerAta,
          USDC_MINT,
          treasuryAta,
          publicKey,
          BigInt(created.campaign.budgetMicro),
          USDC_DECIMALS,
        ),
      );
      const txSignature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(txSignature, "confirmed");

      const fundingResponse = await fetch(
        `/api/campaigns/${created.campaign.id}/fund`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signature: txSignature,
            ownerWallet: publicKey.toBase58(),
          }),
        },
      );
      await readApiResponse(fundingResponse);
      setFundingSignature(txSignature);
      setState("published");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Funding failed.");
      setState("editing");
    }
  }

  if (state === "published") {
    return (
      <main className="form-page">
        <section className="success-panel">
          <span className="success-icon">
            <CircleCheck size={32} aria-hidden />
          </span>
          <span className="section-kicker">Campaign funded</span>
          <h1>Your campaign is live.</h1>
          <p>
            ${budget.toLocaleString()} USDC is confirmed in the campaign
            treasury. Creators can submit X posts; only company-approved posts
            begin accruing verified-view earnings.
          </p>
          <div className="success-timeline">
            <div className="timeline-done">
              <Check size={14} aria-hidden />
              Campaign rules locked
            </div>
            <div className="timeline-done">
              <Check size={14} aria-hidden />
              USDC budget reserved
            </div>
            <div className="timeline-active">
              <LoaderCircle size={14} aria-hidden />
              Accepting creator submissions
            </div>
          </div>
          <Link className="primary-button focus-ring" href="/company">
            Open company dashboard <ArrowRight size={17} aria-hidden />
          </Link>
          <a
            className="secondary-button focus-ring"
            href={explorerTransactionUrl(fundingSignature)}
            target="_blank"
            rel="noreferrer"
          >
            View funding transaction
          </a>
        </section>
      </main>
    );
  }

  const maxPayableBlocks = Math.floor(
    Math.max(creatorCap, 0) / Math.max(rewardPerBlock, 0.01),
  );
  const maxPerformanceViews =
    threshold + maxPayableBlocks * viewsPerBlock;

  return (
    <main className="form-page builder-page">
      <div className="form-wrap">
        <Link className="back-link focus-ring" href="/company">
          <ArrowLeft size={16} aria-hidden />
          Company dashboard
        </Link>
        <div className="builder-heading">
          <span className="section-kicker">New campaign</span>
          <h1>Price verified X reach before creators post.</h1>
          <p>
            Set the brief, per-1K-view rate, eligibility gate, creator cap, and
            funded USDC pool in one transparent campaign.
          </p>
        </div>

        <form className="builder-grid" onSubmit={publish}>
          <div className="builder-form">
            <section className="builder-section">
              <div className="form-step">
                <span>1</span>
                <div>
                  <h2>Campaign brief</h2>
                  <p>Set the public instructions and campaign window.</p>
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="company-name">Company name*</label>
                <input
                  id="company-name"
                  type="text"
                  required
                  maxLength={80}
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
              </div>
              <div className="field-group">
                <label htmlFor="campaign-title">Campaign title*</label>
                <input
                  id="campaign-title"
                  type="text"
                  required
                  maxLength={80}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="field-group">
                <label htmlFor="campaign-description">What should creators make?*</label>
                <textarea
                  id="campaign-description"
                  rows={5}
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the X content, audience, and campaign rules."
                />
              </div>
              <div className="two-fields">
                <div className="field-group">
                  <label htmlFor="campaign-platform">Platform*</label>
                  <select id="campaign-platform" defaultValue="X">
                    <option>X</option>
                    <option>First-party clicks</option>
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="campaign-duration">Duration*</label>
                  <select
                    id="campaign-duration"
                    value={durationDays}
                    onChange={(event) =>
                      setDurationDays(Number(event.target.value))
                    }
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="builder-section">
              <div className="form-step">
                <span>2</span>
                <div>
                  <h2>Performance rule</h2>
                  <p>Choose one transparent verified-view formula.</p>
                </div>
              </div>
              <div className="two-fields">
                <div className="field-group">
                  <label htmlFor="unlock-threshold">Eligibility views*</label>
                  <input
                    id="unlock-threshold"
                    type="text"
                    inputMode="numeric"
                    required
                    value={threshold}
                    onChange={(event) =>
                      setThreshold(Number(event.target.value))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="views-block">Views per reward block*</label>
                  <input
                    id="views-block"
                    type="text"
                    inputMode="numeric"
                    required
                    value={viewsPerBlock}
                    onChange={(event) =>
                      setViewsPerBlock(Number(event.target.value))
                    }
                  />
                </div>
              </div>
              <div className="two-fields">
                <div className="field-group">
                  <label htmlFor="reward-block">USDC per block*</label>
                  <input
                    id="reward-block"
                    type="text"
                    inputMode="decimal"
                    required
                    value={rewardPerBlock}
                    onChange={(event) =>
                      setRewardPerBlock(Number(event.target.value))
                    }
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="creator-cap">Maximum per creator*</label>
                  <input
                    id="creator-cap"
                    type="text"
                    inputMode="decimal"
                    required
                    value={creatorCap}
                    onChange={(event) =>
                      setCreatorCap(Number(event.target.value))
                    }
                  />
                </div>
              </div>
            </section>

            <section className="builder-section">
              <div className="form-step">
                <span>3</span>
                <div>
                  <h2>Fund the budget</h2>
                  <p>V1 reserves campaign funds before publishing.</p>
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="campaign-budget">Campaign budget (USDC)*</label>
                <input
                  id="campaign-budget"
                  type="text"
                  inputMode="decimal"
                  required
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                />
              </div>
              <div className="funding-notice">
                <ShieldCheck size={17} aria-hidden />
                <span>
                  Your wallet signs one real devnet USDC transfer into this
                  campaign&apos;s dedicated treasury. Unspent funds remain
                  refundable to the company wallet.
                </span>
              </div>
            </section>

            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="primary-button submit-button focus-ring"
              type="submit"
              disabled={state === "funding"}
              aria-busy={state === "funding"}
            >
              {state === "funding" ? (
                <>
                  <LoaderCircle className="spin" size={16} aria-hidden />
                  Confirming USDC
                </>
              ) : (
                <>
                  <Coins size={17} aria-hidden />
                  Fund and publish
                </>
              )}
            </button>
          </div>

          <aside className="rule-preview">
            <span className="section-kicker">Live preview</span>
            <h2>{title || "Untitled campaign"}</h2>
            <p>Creator earning curve</p>
            <div className="formula-box">
              <span>After {threshold.toLocaleString()} verified views</span>
              <strong>
                $
                {((rewardPerBlock / Math.max(viewsPerBlock, 1)) * 1000).toFixed(
                  2,
                )}
                <small>per 1,000 verified views</small>
              </strong>
            </div>
            <div className="preview-row">
              <span>Maximum per creator</span>
              <strong>${creatorCap.toFixed(2)}</strong>
            </div>
            <div className="preview-row">
              <span>Cap reached around</span>
              <strong>{maxPerformanceViews.toLocaleString()} views</strong>
            </div>
            <div className="preview-row">
              <span>Total funded pool</span>
              <strong>${budget.toLocaleString()} USDC</strong>
            </div>
            <div className="preview-footnote">
              No transaction happens per reward block. Earnings accrue in the
              ledger, then finalized USDC is paid in a confirmed public batch.
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
