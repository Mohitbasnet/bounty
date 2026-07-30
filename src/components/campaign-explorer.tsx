"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { CampaignCard } from "@/components/campaign-card";
import { useProfile } from "@/components/profile-context";
import type { Campaign } from "@/lib/data";

type DiscoveryTab = "Active" | "Ending soon" | "All";

const categories = ["All formats", "Thread", "Video", "Visual"];

export function CampaignExplorer({ campaigns }: { campaigns: Campaign[] }) {
  const { profile } = useProfile();
  const [tab, setTab] = useState<DiscoveryTab>("Active");
  const [category, setCategory] = useState("All formats");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const visibleCampaigns = [...campaigns]
    .filter((campaign) => {
      if (tab === "Ending soon") return campaign.daysLeft <= 3;
      if (tab === "Active") return campaign.status !== "upcoming";
      return true;
    })
    .filter((campaign) =>
      category === "All formats" ? true : campaign.category === category,
    )
    .filter((campaign) => {
      const searchable =
        `${campaign.title} ${campaign.company} ${campaign.description}`.toLowerCase();
      return searchable.includes(query.trim().toLowerCase());
    })
    .sort((a, b) => {
      if (sort === "rate") {
        return (
          b.rewardPerBlock / b.viewsPerBlock -
          a.rewardPerBlock / a.viewsPerBlock
        );
      }
      if (sort === "budget") return b.rewardPool - a.rewardPool;
      return a.daysLeft - b.daysLeft;
    });

  return (
    <section className="market-section" id="campaigns">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Live campaigns</span>
          <h2>Pick a brief. Earn by the view.</h2>
        </div>
        <p>
          Every campaign shows its funded USDC pool, verified-view rate, unlock,
          creator cap, and tracking window before you post.
        </p>
      </div>

      <div className="campaign-toolbar">
        <div className="browse-tabs" aria-label="Campaign views">
          {(["Active", "Ending soon", "All"] as DiscoveryTab[]).map(
            (item) => (
              <button
                aria-pressed={tab === item}
                className={`browse-tab focus-ring ${
                  tab === item ? "browse-tab-active" : ""
                }`}
                key={item}
                type="button"
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>
        {profile?.mode === "creator" && (
          <span className="feed-context">
            Your focus: {profile.focus}
          </span>
        )}
      </div>

      <div className="campaign-search-row">
        <label className="campaign-search" htmlFor="campaign-search">
          <Search size={17} aria-hidden />
          <span className="sr-only">Search campaigns</span>
          <input
            autoComplete="off"
            id="campaign-search"
            placeholder="Search campaign or project"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="campaign-sort">
          <span className="sr-only">Sort campaigns</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Ending soonest</option>
            <option value="rate">Highest rate</option>
            <option value="budget">Biggest pool</option>
          </select>
        </label>
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
              setCategory("All formats");
              setTab("All");
              setQuery("");
            }}
          >
            Show all campaigns
          </button>
        </div>
      )}
    </section>
  );
}
