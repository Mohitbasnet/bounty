"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

import type { Campaign } from "@/lib/data";

type FormState = "idle" | "verifying" | "ready" | "submitting" | "success";

export function SubmissionForm({ campaign }: { campaign: Campaign }) {
  const [state, setState] = useState<FormState>("idle");
  const [postUrl, setPostUrl] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function verifyPost() {
    setError("");
    if (!/^https:\/\/(x\.com|twitter\.com)\/.+\/status\/\d+/i.test(postUrl)) {
      setError("Enter a valid public X post URL.");
      return;
    }
    setState("verifying");
    window.setTimeout(() => setState("ready"), 850);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state !== "ready") {
      setError("Verify the X post before submitting.");
      return;
    }
    setState("submitting");
    window.setTimeout(() => setState("success"), 900);
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
            We verified the post owner and saved the first metrics snapshot.
            Tracking begins now; earnings unlock after{" "}
            {campaign.unlockViews.toLocaleString()} verified views.
          </p>
          <div className="success-timeline">
            <div className="timeline-done">
              <Check size={14} aria-hidden />
              Post ownership verified
            </div>
            <div className="timeline-active">
              <LoaderCircle size={14} aria-hidden />
              Gathering performance snapshots
            </div>
            <div>48-hour validation after campaign close</div>
            <div>Available for private USDC withdrawal</div>
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
              Submit the public post you want us to track. We verify ownership
              before the campaign starts accruing earnings.
            </p>
            <div className="form-rule-card">
              <div>
                <span>Unlock</span>
                <strong>{campaign.unlockViews.toLocaleString()} views</strong>
              </div>
              <div>
                <span>Accrual</span>
                <strong>
                  ${campaign.rewardPerBlock.toFixed(2)} every{" "}
                  {campaign.viewsPerBlock}
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
              <span className="section-kicker">Content submission</span>
              <h2>Share the post you want tracked.</h2>
              <p>
                You can edit this submission until the campaign deadline.
              </p>
            </div>
            <div className="field-group">
              <label htmlFor="post-url">Link to your X content*</label>
              <p className="field-hint">
                Use the public post URL from the X account connected to your
                profile.
              </p>
              <div className="verify-field">
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
                    setState("idle");
                    setError("");
                  }}
                />
                <button
                  className="verify-button focus-ring"
                  type="button"
                  disabled={state === "verifying"}
                  onClick={verifyPost}
                >
                  {state === "verifying" ? (
                    <>
                      <LoaderCircle className="spin" size={15} aria-hidden />
                      Verifying
                    </>
                  ) : state === "ready" ? (
                    <>
                      <Check size={15} aria-hidden />
                      Verified
                    </>
                  ) : (
                    "Verify post"
                  )}
                </button>
              </div>
              {error && (
                <p className="field-error" id="post-url-error">
                  {error}
                </p>
              )}
              {state === "ready" && (
                <p className="field-success">
                  <ShieldCheck size={14} aria-hidden />
                  Owned by connected account @sumanbuilds
                </p>
              )}
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
                  Submit for tracking <ArrowRight size={17} aria-hidden />
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
