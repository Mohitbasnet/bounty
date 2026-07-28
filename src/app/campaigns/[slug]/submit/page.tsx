import { notFound } from "next/navigation";

import { SubmissionForm } from "@/components/submission-form";
import { getCampaign } from "@/lib/data";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = getCampaign(slug);

  if (!campaign) notFound();

  return <SubmissionForm campaign={campaign} />;
}
