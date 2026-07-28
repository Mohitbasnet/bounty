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
import Link from "next/link";
import { FormEvent, useState } from "react";

type BuilderState = "editing" | "funding" | "published";

export function CampaignBuilder() {
  const [state, setState] = useState<BuilderState>("editing");
  const [title, setTitle] = useState(
    "Explain private payments without the jargon",
  );
  const [threshold, setThreshold] = useState(1000);
  const [viewsPerBlock, setViewsPerBlock] = useState(100);
  const [rewardPerBlock, setRewardPerBlock] = useState(0.2);
  const [creatorCap, setCreatorCap] = useState(75);
  const [budget, setBudget] = useState(2500);

  function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("funding");
    window.setTimeout(() => setState("published"), 1100);
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
            ${budget.toLocaleString()} USDC is now reserved in the demo
            treasury. Creators can submit work and verified performance can
            begin accruing.
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
          <h1>Turn performance into a clear earning rule.</h1>
          <p>
            Creators should know exactly what unlocks earnings, how each block
            pays, and where the cap ends.
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
                  defaultValue="Create original X content that makes private payments clear and memorable for a broad audience."
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
                  <select id="campaign-duration" defaultValue="7">
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
                  <p>Choose one transparent formula for every creator.</p>
                </div>
              </div>
              <div className="two-fields">
                <div className="field-group">
                  <label htmlFor="unlock-threshold">Eligibility views*</label>
                  <input
                    id="unlock-threshold"
                    type="number"
                    inputMode="numeric"
                    min={100}
                    step={100}
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
                    type="number"
                    inputMode="numeric"
                    min={10}
                    step={10}
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
                    type="number"
                    inputMode="decimal"
                    min={0.01}
                    step={0.01}
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
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step={1}
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
                  type="number"
                  inputMode="decimal"
                  min={100}
                  step={10}
                  required
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                />
              </div>
              <div className="funding-notice">
                <ShieldCheck size={17} aria-hidden />
                <span>
                  Demo mode reserves this amount locally. Production funding
                  will require an explicit wallet signature.
                </span>
              </div>
            </section>

            <button
              className="primary-button submit-button focus-ring"
              type="submit"
              disabled={state === "funding"}
              aria-busy={state === "funding"}
            >
              {state === "funding" ? (
                <>
                  <LoaderCircle className="spin" size={16} aria-hidden />
                  Reserving USDC
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
                +${rewardPerBlock.toFixed(2)}
                <small>every {viewsPerBlock} views</small>
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
              ledger, then finalized USDC settles in batches.
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
