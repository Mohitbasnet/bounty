import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  ExternalLink,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CampaignCard } from "@/components/campaign-card";
import { getCompany } from "@/lib/company-store";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getCompany(slug);
  if (!result) notFound();
  const { company: project, campaigns: projectCampaigns } = result;

  return (
    <main className="project-profile-page">
      <div className="project-profile-wrap">
        <Link className="back-link focus-ring" href="/projects">
          <ArrowLeft size={16} aria-hidden />
          All companies
        </Link>
        <header className="project-profile-hero">
          <span className={`project-profile-mark accent-${project.accent}`}>
            <span>{project.mark}</span>
          </span>
          <div>
            <div className="project-profile-title">
              <h1>{project.name}</h1>
              {project.verified && (
                <span><BadgeCheck size={17} aria-hidden /> Verified company</span>
              )}
            </div>
            <p>{project.description}</p>
            <div className="project-profile-links">
              {project.website && <a
                className="focus-ring"
                href={`https://${project.website}`}
                rel="noreferrer"
                target="_blank"
              >
                {project.website} <ExternalLink size={13} aria-hidden />
              </a>}
              {project.xHandle && <a
                className="focus-ring"
                href={`https://x.com/${project.xHandle}`}
                rel="noreferrer"
                target="_blank"
              >
                @{project.xHandle} <ExternalLink size={13} aria-hidden />
              </a>}
            </div>
          </div>
        </header>

        <section className="project-profile-stats" aria-label="Project activity">
          <div><Radio size={17} aria-hidden /><span><strong>{project.activeCampaigns}</strong> active campaigns</span></div>
          <div><span><strong>{project.totalCampaigns}</strong> campaigns launched</span></div>
          <div><CircleDollarSign size={17} aria-hidden /><span><strong>${project.totalPaid.toLocaleString()}</strong> creator USDC paid</span></div>
        </section>

        <section className="project-campaigns">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Campaigns</span>
              <h2>Funded by {project.name}.</h2>
            </div>
            <Link className="text-arrow-link focus-ring" href="/campaigns">
              Browse all <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="campaign-grid">
            {projectCampaigns.map((campaign) => (
              <CampaignCard campaign={campaign} key={campaign.slug} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
