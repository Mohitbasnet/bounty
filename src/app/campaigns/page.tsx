import { CampaignExplorer } from "@/components/campaign-explorer";
import { getLiveCampaigns } from "@/lib/campaign-store";

export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  const campaigns = getLiveCampaigns();
  return (
    <main className="directory-page">
      <header className="directory-hero">
        <span className="section-kicker">Live campaigns</span>
        <h1>Make the post. Earn from the reach.</h1>
        <p>
          Browse funded X campaigns with transparent USDC rates, verification
          rules, tracking windows, and creator caps.
        </p>
      </header>
      <CampaignExplorer campaigns={campaigns} />
    </main>
  );
}
