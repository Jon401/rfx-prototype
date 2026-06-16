import type { AppState, RfxRecord, RfxType } from "./types";

export { DISPLAY_STATUS_COLORS } from "./stimulus-styles";

export type RfiDisplayStatus =
  | "draft"
  | "published"
  | "qa_open"
  | "responses"
  | "closed";

export type RfqRfpDisplayStatus =
  | "draft"
  | "published"
  | "qa_open"
  | "submissions_open"
  | "awarded"
  | "closed";

export type DisplayStatus = RfiDisplayStatus | RfqRfpDisplayStatus;

export const RFI_DISPLAY_LABELS: Record<RfiDisplayStatus, string> = {
  draft: "Draft",
  published: "Published",
  qa_open: "Q&A Open",
  responses: "Responses",
  closed: "Closed",
};

export const RFQ_RFP_DISPLAY_LABELS: Record<RfqRfpDisplayStatus, string> = {
  draft: "Draft",
  published: "Published",
  qa_open: "Q&A Open",
  submissions_open: "Submissions Open",
  awarded: "Awarded",
  closed: "Closed",
};

export function getDisplayStatus(
  rfx: RfxRecord,
  state: AppState
): DisplayStatus {
  if (rfx.status === "draft") return "draft";
  if (rfx.status === "closed") return "closed";
  if (rfx.status === "awarded") return "awarded";

  const qa = state.qaThreads.filter((q) => q.rfxId === rfx.id);
  const hasUnansweredQa = qa.some((q) => !q.answer);
  const subs = state.submissions.filter((s) => s.rfxId === rfx.id);
  const hasSubmitted = subs.some((s) => s.status === "submitted");
  const hasInvitations = state.invitations.some((i) => i.rfxId === rfx.id);

  if (!rfx.publishedAt && !hasInvitations) return "published";

  if (hasUnansweredQa) return "qa_open";

  if (rfx.type === "RFI") {
    if (hasSubmitted || subs.length > 0) return "responses";
    if (rfx.publishedAt || hasInvitations) return "published";
    return "published";
  }

  if (hasSubmitted || subs.length > 0) return "submissions_open";
  if (rfx.publishedAt || hasInvitations) return "published";
  return "published";
}

export function getDisplayLabel(rfx: RfxRecord, status: DisplayStatus): string {
  if (rfx.type === "RFI") {
    return RFI_DISPLAY_LABELS[status as RfiDisplayStatus] ?? status;
  }
  return RFQ_RFP_DISPLAY_LABELS[status as RfqRfpDisplayStatus] ?? status;
}

export function getFiltersForType(type: RfxType): DisplayStatus[] {
  if (type === "RFI") {
    return ["draft", "published", "qa_open", "responses", "closed"];
  }
  return [
    "draft",
    "published",
    "qa_open",
    "submissions_open",
    "awarded",
    "closed",
  ];
}

export function isLateDraft(rfx: RfxRecord): boolean {
  if (rfx.status !== "draft") return false;
  return new Date(rfx.dueDate) < new Date();
}

export function canEditRfx(rfx: RfxRecord): boolean {
  return rfx.status !== "closed" && rfx.status !== "awarded";
}

export function isDeadlinePassed(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

/** Draft or missing submission after due date — inputs frozen (Decision #3). */
export function isSubmissionFrozen(
  dueDate: string,
  submission?: { status: "draft" | "submitted" } | null
): boolean {
  if (!isDeadlinePassed(dueDate)) return false;
  return !submission || submission.status === "draft";
}

export function getDeadlineBadge(dueDate: string, status: string): string | null {
  if (status === "closed" || status === "awarded") return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays <= 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} left`;
  return null;
}

export function getRfxOwnerName(state: AppState, buyerId: string): string {
  return state.users.find((u) => u.id === buyerId)?.name ?? "Unknown";
}

export function getLastActorName(state: AppState, rfxId: string): string | null {
  const entries = state.activityLog
    .filter((a) => a.rfxId === rfxId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  if (entries.length === 0) return null;
  return state.users.find((u) => u.id === entries[0].userId)?.name ?? null;
}
