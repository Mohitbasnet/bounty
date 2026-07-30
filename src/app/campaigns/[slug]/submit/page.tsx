import { notFound } from "next/navigation";

import { SubmissionForm } from "@/components/submission-form";
import { getLiveCampaign } from "@/lib/campaign-store";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = getLiveCampaign(slug);

  if (!campaign) notFound();

  return <SubmissionForm campaign={campaign} />;
}
