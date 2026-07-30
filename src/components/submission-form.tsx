"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  LoaderCircle,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { readApiResponse } from "@/lib/api";
import type { Campaign } from "@/lib/data";
import { buildActionMessage } from "@/lib/messages";
import { XAccountButton } from "@/components/x-account-button";

type FormState = "idle" | "submitting" | "success";

export function SubmissionForm({ campaign }: { campaign: Campaign }) {
  const { publicKey, signMessage } = useWallet();
  const [state, setState] = useState<FormState>("idle");
  const [postUrl, setPostUrl] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^https:\/\/(x\.com|twitter\.com)\/.+\/status\/\d+/i.test(postUrl)) {
      setError("Enter a valid public X post URL.");
      return;
    }
    if (!publicKey || !signMessage) {
      setError("Connect a wallet that supports message signing first.");
      return;
    }
    try {
      setState("submitting");
      const submissionPayload = {
        campaignSlug: campaign.slug,
        postUrl,
        note,
      };
      const message = buildActionMessage({
        action: "submission.create",
        wallet: publicKey.toBase58(),
        payload: submissionPayload,
      });
      const signature = await signMessage(new TextEncoder().encode(message));
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          message,
          signature: bs58.encode(signature),
          submission: submissionPayload,
        }),
      });
      await readApiResponse(response);
      setState("success");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Submission failed.");
      setState("idle");
    }
  }

  if (state === "success") {
    return (
      <main className="form-page">
        <section className="success-panel">
          <span className="success-icon">
            <CircleCheck size={32} aria-hidden />
          </span>
          <span className="section-kicker">Submission received</span>
          <h1>Your post is in the tracking queue.</h1>
          <p>
            Your wallet-authorized submission was sent to {campaign.company}.
            X ownership and metrics remain pending until the official X API
            confirms them; tracking starts only after company approval.
          </p>
          <div className="success-timeline">
            <div className="timeline-done">
              <Check size={14} aria-hidden />
              Wallet ownership verified
            </div>
            <div className="timeline-active">
              <LoaderCircle size={14} aria-hidden />
              Waiting for company approval
            </div>
            <div>Official X ownership and metrics after approval</div>
            <div>Finalized USDC enters the next public settlement batch</div>
          </div>
          <Link className="primary-button focus-ring" href="/dashboard">
            View live earnings <ArrowRight size={17} aria-hidden />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="form-page">
      <div className="form-wrap">
        <Link
          className="back-link focus-ring"
          href={`/campaigns/${campaign.slug}`}
        >
          <ArrowLeft size={16} aria-hidden />
          Back to campaign
        </Link>
        <div className="form-layout">
          <div className="form-intro">
            <span className="section-kicker">Submit your work</span>
            <h1>{campaign.title}</h1>
            <p>
              Submit the public X post you want tracked. We verify ownership,
              then {campaign.company} reviews it before earnings can accrue.
            </p>
            <div className="form-rule-card">
              <div>
                <span>Unlock</span>
                <strong>{campaign.unlockViews.toLocaleString()} views</strong>
              </div>
              <div>
                <span>Rate</span>
                <strong>
                  $
                  {(
                    (campaign.rewardPerBlock / campaign.viewsPerBlock) *
                    1000
                  ).toFixed(2)}{" "}
                  per 1K views
                </strong>
              </div>
              <div>
                <span>Maximum</span>
                <strong>${campaign.maxPerCreator} USDC</strong>
              </div>
            </div>
          </div>

          <form className="submission-form" onSubmit={submit}>
            <div className="submission-form-head">
              <span className="section-kicker">X post submission</span>
              <h2>Share the post you want approved.</h2>
              <p>
                You can edit this submission until the campaign deadline.
              </p>
            </div>
            <div className="field-group">
              <label>Creator identity</label>
              <p className="field-hint">
                Connect the X account that published the post. FlowEarn compares
                its official X user ID before any earnings can accrue.
              </p>
              <XAccountButton
                returnTo={`/campaigns/${campaign.slug}/submit`}
              />
            </div>
            <div className="form-divider" />
            <div className="field-group">
              <label htmlFor="post-url">Link to your X content*</label>
              <p className="field-hint">
                Use the public post URL from the X account connected to your
                profile.
              </p>
              <input
                id="post-url"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://x.com/yourname/status/..."
                value={postUrl}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "post-url-error" : undefined}
                onChange={(event) => {
                  setPostUrl(event.target.value);
                  setError("");
                }}
              />
              {error && (
                <p className="field-error" id="post-url-error">
                  {error}
                </p>
              )}
              <p className="field-hint">
                FlowEarn does not mark ownership or views verified until the
                official X API returns them.
              </p>
            </div>

            <div className="form-divider" />
            <div className="field-group">
              <label htmlFor="submission-note">Anything else?</label>
              <p className="field-hint">
                Add optional context that helps the campaign team understand
                your content.
              </p>
              <textarea
                id="submission-note"
                rows={5}
                maxLength={500}
                placeholder="Share your creative angle, audience, or any useful context."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <span className="character-count">{note.length}/500</span>
            </div>

            <label className="terms-check">
              <input required type="checkbox" />
              <span>
                I made this work, will keep the post public through validation,
                and understand that suspicious or paid traffic is ineligible.
              </span>
            </label>

            <button
              className="primary-button submit-button focus-ring"
              type="submit"
              disabled={state === "submitting"}
              aria-busy={state === "submitting"}
            >
              {state === "submitting" ? (
                <>
                  <LoaderCircle className="spin" size={16} aria-hidden />
                  Submitting
                </>
              ) : (
                <>
                  Submit for approval <ArrowRight size={17} aria-hidden />
                </>
              )}
            </button>
            <p className="submission-terms-note">
              By submitting, you agree to the campaign verification rules.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
