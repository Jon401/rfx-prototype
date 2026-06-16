"use client";

import { use } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { EditRfiForm } from "@/components/rfx/forms/edit-rfi-form";
import { useStore } from "@/lib/store";
import { canEditRfx } from "@/lib/rfx-status";
import { ArrowLeft } from "lucide-react";

export default function EditRfiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const rfx = useStore((s) => s.rfxRecords.find((r) => r.id === id));

  if (!rfx || rfx.type !== "RFI") {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">RFI not found</p>
        <LinkButton href="/buyer/rfis" variant="link" className="mt-2">
          Back to My RFIs
        </LinkButton>
      </div>
    );
  }

  if (!canEditRfx(rfx)) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">This RFI can no longer be edited.</p>
        <LinkButton href={`/buyer/rfis/${rfx.id}`} variant="link" className="mt-2">
          Back to RFI
        </LinkButton>
      </div>
    );
  }

  return (
    <div>
      <LinkButton href={`/buyer/rfis/${rfx.id}`} variant="ghost" size="sm" className="mb-4 -ml-2">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to RFI
      </LinkButton>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit RFI</h1>
      <EditRfiForm rfx={rfx} />
    </div>
  );
}
