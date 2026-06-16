import type { RfxRecord, RfxStatus } from "./types";

export const WORKFLOW_STEPS: { status: RfxStatus; label: string; description: string }[] = [
  {
    status: "draft",
    label: "Draft",
    description: "Edit details. Not visible to suppliers.",
  },
  {
    status: "published",
    label: "Published",
    description: "Ready to invite suppliers. Not yet open for responses.",
  },
  {
    status: "open",
    label: "Open",
    description: "Suppliers invited — Q&A and submissions are active.",
  },
];

export function canPublishRfx(rfx: RfxRecord): boolean {
  return rfx.status === "draft";
}

export function canInviteSuppliers(rfx: RfxRecord): boolean {
  return rfx.status === "published" || rfx.status === "open";
}

export function isRfxLive(rfx: RfxRecord): boolean {
  return rfx.status === "open";
}

export function getWorkflowStepIndex(status: RfxStatus): number {
  if (status === "draft") return 0;
  if (status === "published") return 1;
  if (status === "open") return 2;
  return 3;
}
