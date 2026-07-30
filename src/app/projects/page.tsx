import { Search } from "lucide-react";

import { ProjectCard } from "@/components/project-card";
import { getCompanies } from "@/lib/company-store";

export const dynamic = "force-dynamic";

export default function CompaniesPage() {
  const companies = getCompanies();
  return (
    <main className="directory-page">
      <header className="directory-hero">
        <span className="section-kicker">Companies</span>
        <h1>Who is funding creator reach.</h1>
        <p>
          Browse registered companies, their live campaigns, and confirmed
          creator USDC payouts.
        </p>
      </header>
      <section className="project-directory">
        {companies.length ? (
          <div className="project-list">
            {companies.map((company) => (
              <ProjectCard key={company.slug} project={company} />
            ))}
          </div>
        ) : (
          <div className="campaign-card-empty">
            <Search size={22} aria-hidden />
            <h2>No registered companies yet.</h2>
            <p>The first company appears after it creates a signed campaign.</p>
          </div>
        )}
      </section>
    </main>
  );
}
