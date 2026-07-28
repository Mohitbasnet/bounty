"use client";

import { Search, Sparkles } from "lucide-react";
import { useState } from "react";

import { CampaignCard } from "@/components/campaign-card";
import { useProfile } from "@/components/profile-context";
import type { Campaign } from "@/lib/data";

type DiscoveryTab = "All campaigns" | "For you" | "Ending soon";

const categories = ["Writing", "Video", "Visuals"];

export function CampaignExplorer({ campaigns }: { campaigns: Campaign[] }) {
  const { profile, openOnboarding } = useProfile();
  const [tab, setTab] = useState<DiscoveryTab>("All campaigns");
  const [category, setCategory] = useState("All campaigns");

  const visibleCampaigns = campaigns
    .filter((campaign) => {
      if (tab === "Ending soon") return campaign.daysLeft <= 3;
      if (tab === "For you" && profile?.mode === "creator") {
        return campaign.category === profile.focus || campaign.featured;
      }
      return true;
    })
    .filter((campaign) =>
      category === "All campaigns" ? true : campaign.category === category,
    )
    .slice(0, 3);

  function selectTab(nextTab: DiscoveryTab) {
    if (nextTab === "For you" && (!profile || profile.mode !== "creator")) {
      openOnboarding();
      return;
    }
    if (nextTab === "All campaigns") setCategory("All campaigns");
    setTab(nextTab);
  }

  return (
    <section className="market-section" id="campaigns">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Open now</span>
          <h2>Campaigns worth making for.</h2>
        </div>
        <p>
          The pool is funded upfront. Your payout grows from verified
          performance, not a fixed winner prize.
        </p>
      </div>

      <div className="campaign-toolbar">
        <div className="browse-tabs" aria-label="Campaign views">
          {(["All campaigns", "For you", "Ending soon"] as DiscoveryTab[]).map(
            (item) => (
              <button
                aria-pressed={tab === item}
                className={`browse-tab focus-ring ${
                  tab === item ? "browse-tab-active" : ""
                }`}
                key={item}
                type="button"
                onClick={() => selectTab(item)}
              >
                {item === "For you" && <Sparkles size={13} aria-hidden />}
                {item}
              </button>
            ),
          )}
        </div>
        <div className="filter-row" aria-label="Campaign categories">
          {categories.map((item) => (
            <button
              aria-pressed={category === item}
              className={`filter-button focus-ring ${
                category === item ? "filter-active" : ""
              }`}
              key={item}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {visibleCampaigns.length ? (
        <div className="campaign-grid">
          {visibleCampaigns.map((campaign) => (
            <CampaignCard campaign={campaign} key={campaign.slug} />
          ))}
        </div>
      ) : (
        <div className="campaign-card-empty">
          <Search size={22} aria-hidden />
          <h3>No matching campaigns yet.</h3>
          <p>Try another category or return to all campaigns.</p>
          <button
            className="secondary-button focus-ring"
            type="button"
            onClick={() => {
              setCategory("All campaigns");
              setTab("All campaigns");
            }}
          >
            Show all campaigns
          </button>
        </div>
      )}
    </section>
  );
}
