"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { useProfile } from "@/components/profile-context";

export function CampaignSubmitAction({
  campaignSlug,
}: {
  campaignSlug: string;
}) {
  const { profile, isReady, openOnboarding } = useProfile();

  if (isReady && profile?.mode === "creator") {
    return (
      <Link
        className="primary-button listing-submit-action focus-ring"
        href={`/campaigns/${campaignSlug}/submit`}
      >
        Submit your work
        <ArrowRight size={17} aria-hidden />
      </Link>
    );
  }

  return (
    <button
      className="primary-button listing-submit-action focus-ring"
      type="button"
      onClick={openOnboarding}
    >
      {profile?.mode === "company" ? "Create a creator profile" : "Sign in to submit"}
      <ArrowRight size={17} aria-hidden />
    </button>
  );
}
