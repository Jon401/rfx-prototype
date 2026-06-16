"use client";

import { use } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { EditRfqForm } from "@/components/rfx/forms/edit-rfq-form";
import { useStore } from "@/lib/store";
import { canEditRfx } from "@/lib/rfx-status";
import { ArrowLeft } from "lucide-react";

export default function EditRfqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const rfx = useStore((s) => s.rfxRecords.find((r) => r.id === id));

  if (!rfx || rfx.type !== "RFQ") {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">RFQ not found</p>
        <LinkButton href="/buyer/rfqs" variant="link" className="mt-2">
          Back to My RFQs
        </LinkButton>
      </div>
    );
  }

  if (!canEditRfx(rfx)) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">This RFQ can no longer be edited.</p>
        <LinkButton href={`/buyer/rfqs/${rfx.id}`} variant="link" className="mt-2">
          Back to RFQ
        </LinkButton>
      </div>
    );
  }

  return (
    <div>
      <LinkButton href={`/buyer/rfqs/${rfx.id}`} variant="ghost" size="sm" className="mb-4 -ml-2">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to RFQ
      </LinkButton>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit RFQ</h1>
      <EditRfqForm rfx={rfx} />
    </div>
  );
}
