import { ArrowUpRight, BadgeCheck, CircleDollarSign, Radio } from "lucide-react";
import Link from "next/link";

import type { Project } from "@/lib/data";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      className="project-card focus-ring"
      href={`/projects/${project.slug}`}
    >
      <span className={`project-card-mark accent-${project.accent}`}>
        <span>{project.mark}</span>
      </span>
      <div className="project-card-copy">
        <div className="project-card-title">
          <h2>{project.name}</h2>
          {project.verified && (
            <BadgeCheck aria-label="Verified project" size={17} />
          )}
        </div>
        <p>{project.description}</p>
        <div className="project-card-stats">
          <span><Radio size={14} aria-hidden /> {project.activeCampaigns} active</span>
          <span>{project.totalCampaigns} campaigns</span>
          <span>
            <CircleDollarSign size={14} aria-hidden />
            ${project.totalPaid.toLocaleString()} paid
          </span>
        </div>
      </div>
      <ArrowUpRight className="project-card-arrow" size={19} aria-hidden />
    </Link>
  );
}
