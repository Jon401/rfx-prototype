"use client";

import { use } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { EditRfpForm } from "@/components/rfx/forms/edit-rfp-form";
import { useStore } from "@/lib/store";
import { canEditRfx } from "@/lib/rfx-status";
import { ArrowLeft } from "lucide-react";

export default function EditRfpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const rfx = useStore((s) => s.rfxRecords.find((r) => r.id === id));

  if (!rfx || rfx.type !== "RFP") {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">RFP not found</p>
        <LinkButton href="/buyer/rfps" variant="link" className="mt-2">
          Back to My RFPs
        </LinkButton>
      </div>
    );
  }

  if (!canEditRfx(rfx)) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">This RFP can no longer be edited.</p>
        <LinkButton href={`/buyer/rfps/${rfx.id}`} variant="link" className="mt-2">
          Back to RFP
        </LinkButton>
      </div>
    );
  }

  return (
    <div>
      <LinkButton href={`/buyer/rfps/${rfx.id}`} variant="ghost" size="sm" className="mb-4 -ml-2">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to RFP
      </LinkButton>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit RFP</h1>
      <EditRfpForm rfx={rfx} />
    </div>
  );
}
