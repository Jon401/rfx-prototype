import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DISPLAY_STATUS_COLORS,
  getDisplayLabel,
  getDisplayStatus,
  getDeadlineBadge,
  isLateDraft,
  isSubmissionFrozen,
  getRfxOwnerName,
  getLastActorName,
  type DisplayStatus,
} from "@/lib/rfx-status";
import type { RfxStatus, RfxType, RfpRecord } from "@/lib/types";
import type { AppState } from "@/lib/types";
import { TYPE_COLORS, STIMULUS_BADGE } from "@/lib/stimulus-styles";

export function StatusBadge({
  status,
  rfx,
  state,
}: {
  status?: RfxStatus;
  rfx?: { type: RfxType; status: RfxStatus };
  state?: AppState;
}) {
  if (rfx && state) {
    const display = getDisplayStatus(rfx as Parameters<typeof getDisplayStatus>[0], state);
    return (
      <Badge
        variant="secondary"
        className={cn("font-normal", DISPLAY_STATUS_COLORS[display])}
      >
        {getDisplayLabel(rfx as Parameters<typeof getDisplayLabel>[0], display)}
      </Badge>
    );
  }
  const fallback: Record<RfxStatus, string> = {
    draft: "Draft",
    published: "Published",
    open: "Open",
    closed: "Closed",
    awarded: "Awarded",
  };
  return (
    <Badge variant="secondary" className="font-normal">
      {status ? fallback[status] : "Unknown"}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: RfxType }) {
  return (
    <Badge variant="secondary" className={cn("font-normal", TYPE_COLORS[type])}>
      {type}
    </Badge>
  );
}

export function OriginBadge({
  rfp,
  state,
}: {
  rfp: RfpRecord;
  state: AppState;
}) {
  if (!rfp.linkedFromRfiId) return null;
  const source = state.rfxRecords.find((r) => r.id === rfp.linkedFromRfiId);
  if (!source) return null;
  return (
    <Badge variant="outline" className="text-xs font-normal">
      Originated from RFI: {source.title}
    </Badge>
  );
}

export function DeadlineBadge({
  dueDate,
  displayStatus,
}: {
  dueDate: string;
  displayStatus: DisplayStatus;
}) {
  const label = getDeadlineBadge(dueDate, displayStatus);
  if (!label) return null;
  const isOverdue = label === "Overdue";
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-xs font-normal",
        isOverdue ? STIMULUS_BADGE.error : STIMULUS_BADGE.warning
      )}
    >
      {label}
    </Badge>
  );
}

export function LateDraftBadge({ rfx }: { rfx: { status: RfxStatus; dueDate: string } }) {
  if (!isLateDraft(rfx as Parameters<typeof isLateDraft>[0])) return null;
  return (
    <Badge variant="secondary" className={cn("text-xs font-normal", STIMULUS_BADGE.error)}>
      Late draft
    </Badge>
  );
}

export function DeadlineMissedBadge({
  dueDate,
  submission,
}: {
  dueDate: string;
  submission?: { status: "draft" | "submitted" } | null;
}) {
  if (!isSubmissionFrozen(dueDate, submission)) return null;
  return (
    <Badge variant="secondary" className={cn("text-xs font-normal", STIMULUS_BADGE.error)}>
      Deadline passed — not submitted
    </Badge>
  );
}

export function AttributionLine({
  state,
  buyerId,
  rfxId,
}: {
  state: AppState;
  buyerId: string;
  rfxId: string;
}) {
  const owner = getRfxOwnerName(state, buyerId);
  const lastActor = getLastActorName(state, rfxId);
  return (
    <span className="text-xs text-muted-foreground">
      Created by {owner}
      {lastActor && lastActor !== owner && ` · Last updated by ${lastActor}`}
    </span>
  );
}
