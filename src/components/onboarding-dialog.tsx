"use client";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Clapperboard,
  Megaphone,
  Palette,
  PenLine,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import {
  type AccountMode,
  type CreatorFocus,
  useProfile,
} from "@/components/profile-context";

const creatorFocuses: {
  value: CreatorFocus;
  label: string;
  description: string;
  icon: typeof Megaphone;
}[] = [
  {
    value: "Thread",
    label: "Threads",
    description: "Threads, stories, and explainers",
    icon: PenLine,
  },
  {
    value: "Video",
    label: "Video",
    description: "Short-form videos and on-camera stories",
    icon: Clapperboard,
  },
  {
    value: "Visual",
    label: "Visuals",
    description: "Illustrations, carousels, and motion",
    icon: Palette,
  },
];

const skillOptions: Record<CreatorFocus, string[]> = {
  Thread: ["X threads", "Copywriting", "Storytelling", "Education", "Research"],
  Video: ["Short video", "Scripting", "Editing", "Voiceover", "UGC"],
  Visual: ["Graphic design", "Motion", "Illustration", "Carousels", "Memes"],
};

export function OnboardingDialog() {
  const {
    onboardingOpen,
    closeOnboarding,
    profile,
    saveProfile,
  } = useProfile();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<AccountMode>("creator");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [focus, setFocus] = useState<CreatorFocus>("Thread");
  const [skills, setSkills] = useState<string[]>(["X threads"]);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!onboardingOpen) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prepareDialog = window.setTimeout(() => {
      setStep(profile ? 2 : 1);
      if (profile) {
        setMode(profile.mode);
        setName(profile.name);
        setHandle(profile.handle);
        setFocus(profile.focus);
        setSkills(profile.skills);
      }
      dialogRef.current
        ?.querySelector<HTMLElement>("button, input")
        ?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeOnboarding();
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
        ) ?? [],
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(prepareDialog);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [closeOnboarding, onboardingOpen, profile]);

  if (!onboardingOpen) return null;

  function toggleSkill(skill: string) {
    setSkills((current) => {
      if (current.includes(skill)) {
        return current.length === 1
          ? current
          : current.filter((item) => item !== skill);
      }
      return current.length === 3 ? current : [...current, skill];
    });
  }

  function selectFocus(nextFocus: CreatorFocus) {
    setFocus(nextFocus);
    setSkills([skillOptions[nextFocus][0]]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(mode === "creator" ? "Add your display name." : "Add your company name.");
      return;
    }
    if (mode === "company" && !handle.trim()) {
      setError("Add your company website.");
      return;
    }

    saveProfile({
      mode,
      name: name.trim(),
      handle:
        mode === "creator"
          ? profile?.handle ?? ""
          : handle.trim().replace(/^@/, ""),
      focus,
      skills,
    });
  }

  return (
    <div className="dialog-backdrop" onMouseDown={closeOnboarding}>
      <div
        aria-labelledby="onboarding-title"
        aria-modal="true"
        className="onboarding-dialog"
        ref={dialogRef}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-topbar">
          <div className="dialog-progress" aria-label={`Step ${step} of 2`}>
            <span className="dialog-progress-active" />
            <span className={step === 2 ? "dialog-progress-active" : ""} />
          </div>
          <button
            aria-label="Close onboarding"
            className="dialog-close focus-ring"
            type="button"
            onClick={closeOnboarding}
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {step === 1 ? (
          <section className="account-step">
            <span className="section-kicker">Start with your lane</span>
            <h1 id="onboarding-title">How will you use FlowEarn?</h1>
            <p>
              This sets up the right workspace. You can switch modes anytime.
            </p>
            <div className="account-options">
              <button
                className={`account-option focus-ring ${
                  mode === "creator" ? "account-option-active" : ""
                }`}
                type="button"
                onClick={() => setMode("creator")}
              >
                <span><UserRound size={21} aria-hidden /></span>
                <strong>Earn as a creator</strong>
                <small>Publish on X and earn from verified reach.</small>
                {mode === "creator" && <Check size={17} aria-hidden />}
              </button>
              <button
                className={`account-option focus-ring ${
                  mode === "company" ? "account-option-active" : ""
                }`}
                type="button"
                onClick={() => setMode("company")}
              >
                <span><BriefcaseBusiness size={21} aria-hidden /></span>
                <strong>Run a project campaign</strong>
                <small>Fund USDC and pay only for verified reach.</small>
                {mode === "company" && <Check size={17} aria-hidden />}
              </button>
            </div>
            <button
              className="primary-button dialog-primary focus-ring"
              type="button"
              onClick={() => setStep(2)}
            >
              Continue <ArrowRight size={17} aria-hidden />
            </button>
          </section>
        ) : (
          <form className="profile-step" onSubmit={submit}>
            <button
              className="dialog-back focus-ring"
              type="button"
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={15} aria-hidden /> Account type
            </button>
            <span className="section-kicker">
              {mode === "creator" ? "Creator profile" : "Company profile"}
            </span>
            <h1 id="onboarding-title">
              {mode === "creator"
                ? "Make your campaign feed useful."
                : "Set up your funding workspace."}
            </h1>

            <div className="onboarding-fields">
              <div className="field-group">
                <label htmlFor="profile-name">
                  {mode === "creator" ? "Display name*" : "Company name*"}
                </label>
                <input
                  autoComplete={mode === "creator" ? "name" : "organization"}
                  id="profile-name"
                  placeholder={mode === "creator" ? "Suman Giri" : "Acme Studio"}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              {mode === "company" && (
                <div className="field-group">
                  <label htmlFor="profile-handle">Company website*</label>
                  <input
                    autoComplete="url"
                    id="profile-handle"
                    inputMode="url"
                    placeholder="acme.example"
                    type="text"
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                  />
                </div>
              )}
            </div>

            {mode === "creator" && (
              <>
                <fieldset className="focus-fieldset">
                  <legend>Primary focus*</legend>
                  <div className="focus-options">
                    {creatorFocuses.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          className={`focus-option focus-ring ${
                            focus === item.value ? "focus-option-active" : ""
                          }`}
                          key={item.value}
                          type="button"
                          onClick={() => selectFocus(item.value)}
                        >
                          <Icon size={17} aria-hidden />
                          <span>
                            <strong>{item.label}</strong>
                            <small>{item.description}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <fieldset className="skills-fieldset">
                  <legend>Pick up to 3 skills*</legend>
                  <div className="skill-options">
                    {skillOptions[focus].map((skill) => (
                      <button
                        aria-pressed={skills.includes(skill)}
                        className={`skill-option focus-ring ${
                          skills.includes(skill) ? "skill-option-active" : ""
                        }`}
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skills.includes(skill) && <Check size={13} aria-hidden />}
                        {skill}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {error && (
              <p className="onboarding-error" role="alert">
                {error}
              </p>
            )}
            <p className="profile-note">
              {mode === "creator"
                ? "Your publishing X account is verified later through official OAuth. No signature is needed to browse."
                : "Wallet connection comes later when you fund a campaign. No signature is needed to browse."}
            </p>
            <button
              className="primary-button dialog-primary focus-ring"
              type="submit"
            >
              {profile ? "Save profile" : "Finish setup"}
              <ArrowRight size={17} aria-hidden />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
