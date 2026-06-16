import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isSubmissionFrozen } from "./rfx-status";
import { SEED_DATA } from "./seed-data";
import { STATUS_COLORS, TYPE_COLORS } from "./stimulus-styles";
import type {
  ActivityEntry,
  AppState,
  CriterionScore,
  ExternalContact,
  Invitation,
  Notification,
  QaThread,
  RfiQuestion,
  RfiRecord,
  RfpRecord,
  RfpSection,
  RfqLineItem,
  RfqRecord,
  RfxRecord,
  RfxStatus,
  RfxType,
  ScoringCriterion,
  Submission,
  User,
} from "./types";

export const STORE_STORAGE_KEY = "rfx-portotype-store";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface StoreActions {
  setCurrentUser: (userId: string) => void;
  resetStore: () => void;

  createRfi: (data: {
    title: string;
    description: string;
    dueDate: string;
    questions: RfiQuestion[];
    buyerId: string;
  }) => string;
  createRfq: (data: {
    title: string;
    description: string;
    dueDate: string;
    lineItems: RfqLineItem[];
    buyerId: string;
  }) => string;
  createRfp: (data: {
    title: string;
    description: string;
    dueDate: string;
    sections: RfpSection[];
    scoringCriteria: ScoringCriterion[];
    buyerId: string;
    linkedFromRfiId?: string;
  }) => string;

  updateRfx: (id: string, updates: Partial<RfxRecord>) => void;
  publishRfx: (id: string, supplierIds: string[]) => void;
  closeRfi: (id: string, closeNotes: string) => void;
  toggleShortlist: (rfiId: string, supplierId: string) => void;
  convertRfiToRfp: (rfiId: string) => string | null;
  awardRfx: (id: string, supplierId: string, notes: string) => void;
  closeRfx: (id: string) => void;

  inviteSuppliers: (rfxId: string, supplierIds: string[]) => void;
  sendInvitations: (
    rfxId: string,
    payload: {
      internalSupplierIds: string[];
      externalSuppliers: ExternalContact[];
    }
  ) => void;
  respondInvitation: (
    invitationId: string,
    status: "accepted" | "declined"
  ) => void;

  askQuestion: (rfxId: string, supplierId: string, question: string) => void;
  answerQuestion: (
    qaId: string,
    answer: string,
    buyerId: string,
    publishToAll?: boolean
  ) => void;

  saveSubmission: (submission: Submission) => void;
  submitResponse: (submissionId: string) => void;
  scoreSubmission: (
    submissionId: string,
    scores: CriterionScore[],
    buyerId: string
  ) => void;

  markNotificationRead: (id: string) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => void;

  logActivity: (
    entry: Omit<ActivityEntry, "id" | "createdAt">
  ) => void;
}

type Store = AppState & StoreActions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...SEED_DATA,

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      resetStore: () => set(SEED_DATA),

      createRfi: (data) => {
        const id = uid("rfi");
        const now = new Date().toISOString();
        const record: RfiRecord = {
          id,
          type: "RFI",
          title: data.title,
          description: data.description,
          status: "draft",
          buyerId: data.buyerId,
          createdAt: now,
          updatedAt: now,
          dueDate: data.dueDate,
          questions: data.questions,
          shortlistedSupplierIds: [],
        };
        set((s) => ({ rfxRecords: [...s.rfxRecords, record] }));
        get().logActivity({
          rfxId: id,
          userId: data.buyerId,
          action: "Created RFI",
          details: `${data.title} created as draft`,
        });
        return id;
      },

      createRfq: (data) => {
        const id = uid("rfq");
        const now = new Date().toISOString();
        const record: RfqRecord = {
          id,
          type: "RFQ",
          title: data.title,
          description: data.description,
          status: "draft",
          buyerId: data.buyerId,
          createdAt: now,
          updatedAt: now,
          dueDate: data.dueDate,
          lineItems: data.lineItems,
        };
        set((s) => ({ rfxRecords: [...s.rfxRecords, record] }));
        get().logActivity({
          rfxId: id,
          userId: data.buyerId,
          action: "Created RFQ",
          details: `${data.title} created as draft`,
        });
        return id;
      },

      createRfp: (data) => {
        const id = uid("rfp");
        const now = new Date().toISOString();
        const record: RfpRecord = {
          id,
          type: "RFP",
          title: data.title,
          description: data.description,
          status: "draft",
          buyerId: data.buyerId,
          createdAt: now,
          updatedAt: now,
          dueDate: data.dueDate,
          sections: data.sections,
          scoringCriteria: data.scoringCriteria,
          linkedFromRfiId: data.linkedFromRfiId,
        };
        set((s) => ({ rfxRecords: [...s.rfxRecords, record] }));
        get().logActivity({
          rfxId: id,
          userId: data.buyerId,
          action: "Created RFP",
          details: data.linkedFromRfiId
            ? `${data.title} created from RFI conversion`
            : `${data.title} created as draft`,
        });
        return id;
      },

      updateRfx: (id, updates) => {
        set((s) => ({
          rfxRecords: s.rfxRecords.map((r) =>
            r.id === id
              ? ({ ...r, ...updates, updatedAt: new Date().toISOString() } as RfxRecord)
              : r
          ),
        }));
      },

      publishRfx: (id, supplierIds) => {
        get().sendInvitations(id, {
          internalSupplierIds: supplierIds,
          externalSuppliers: [],
        });
      },

      closeRfi: (id, closeNotes) => {
        const now = new Date().toISOString();
        set((s) => ({
          rfxRecords: s.rfxRecords.map((r) =>
            r.id === id && r.type === "RFI"
              ? {
                  ...r,
                  status: "closed" as RfxStatus,
                  closeNotes,
                  closedAt: now,
                  updatedAt: now,
                }
              : r
          ),
        }));
        const rfx = get().rfxRecords.find((r) => r.id === id);
        if (rfx) {
          get().logActivity({
            rfxId: id,
            userId: rfx.buyerId,
            action: "Closed RFI",
            details: closeNotes,
          });
        }
      },

      toggleShortlist: (rfiId, supplierId) => {
        set((s) => ({
          rfxRecords: s.rfxRecords.map((r) => {
            if (r.id !== rfiId || r.type !== "RFI") return r;
            const ids = r.shortlistedSupplierIds.includes(supplierId)
              ? r.shortlistedSupplierIds.filter((id) => id !== supplierId)
              : [...r.shortlistedSupplierIds, supplierId];
            return { ...r, shortlistedSupplierIds: ids, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      convertRfiToRfp: (rfiId) => {
        const rfi = get().rfxRecords.find(
          (r) => r.id === rfiId && r.type === "RFI"
        ) as RfiRecord | undefined;
        if (!rfi || rfi.status !== "closed") return null;

        const sections: RfpSection[] = rfi.questions.map((q, i) => ({
          id: uid("sec"),
          title: `Requirement ${i + 1}`,
          description: q.text,
          required: q.required,
        }));

        const rfpId = get().createRfp({
          title: `${rfi.title} (RFP)`,
          description: rfi.description,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          sections,
          scoringCriteria: [
            {
              id: uid("crit"),
              name: "Overall Fit",
              description: "Overall alignment with requirements gathered in RFI",
              maxPoints: 50,
              weight: 50,
            },
            {
              id: uid("crit"),
              name: "Cost",
              description: "Total cost competitiveness",
              maxPoints: 50,
              weight: 50,
            },
          ],
          buyerId: rfi.buyerId,
          linkedFromRfiId: rfiId,
        });

        set((s) => ({
          rfxRecords: s.rfxRecords.map((r) =>
            r.id === rfiId && r.type === "RFI"
              ? { ...r, convertedToRfpId: rfpId }
              : r
          ),
        }));

        get().logActivity({
          rfxId: rfiId,
          userId: rfi.buyerId,
          action: "Converted to RFP",
          details: `Created RFP ${rfpId} from this RFI`,
        });

        if (rfi.shortlistedSupplierIds.length > 0) {
          get().publishRfx(rfpId, rfi.shortlistedSupplierIds);
        }

        return rfpId;
      },

      awardRfx: (id, supplierId, notes) => {
        const now = new Date().toISOString();
        const rfx = get().rfxRecords.find((r) => r.id === id);
        if (!rfx || rfx.type === "RFI") return;

        set((s) => ({
          rfxRecords: s.rfxRecords.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "awarded" as RfxStatus,
                  awardedSupplierId: supplierId,
                  awardNotes: notes,
                  updatedAt: now,
                }
              : r
          ),
        }));

        get().addNotification({
          userId: supplierId,
          rfxId: id,
          title: "Contract Awarded!",
          message: `Congratulations! You have been awarded ${rfx.title}.`,
          type: "award",
          read: false,
        });

        const otherSuppliers = get()
          .invitations.filter(
            (i) =>
              i.rfxId === id &&
              i.supplierId &&
              i.supplierId !== supplierId &&
              (i.supplierType === "internal" || !i.supplierType)
          )
          .map((i) => i.supplierId!);
        otherSuppliers.forEach((sid) => {
          get().addNotification({
            userId: sid,
            rfxId: id,
            title: "Solicitation Closed",
            message: `${rfx.title} has been awarded to another vendor.`,
            type: "info",
            read: false,
          });
        });

        get().logActivity({
          rfxId: id,
          userId: rfx.buyerId,
          action: "Awarded",
          details: notes,
        });
      },

      closeRfx: (id) => {
        const now = new Date().toISOString();
        const rfx = get().rfxRecords.find((r) => r.id === id);
        if (!rfx) return;

        set((s) => ({
          rfxRecords: s.rfxRecords.map((r) =>
            r.id === id
              ? { ...r, status: "closed" as RfxStatus, closedAt: now, updatedAt: now }
              : r
          ),
        }));

        get().logActivity({
          rfxId: id,
          userId: rfx.buyerId,
          action: "Closed",
          details: `${rfx.type} closed`,
        });
      },

      inviteSuppliers: (rfxId, supplierIds) => {
        get().sendInvitations(rfxId, {
          internalSupplierIds: supplierIds,
          externalSuppliers: [],
        });
      },

      sendInvitations: (rfxId, payload) => {
        const rfx = get().rfxRecords.find((r) => r.id === rfxId);
        if (!rfx) return;

        const existing = get().invitations.filter((i) => i.rfxId === rfxId);
        const newInternalIds = payload.internalSupplierIds.filter(
          (sid) =>
            !existing.some(
              (i) =>
                (i.supplierType === "internal" || !i.supplierType) &&
                i.supplierId === sid
            )
        );
        const newExternal = payload.externalSuppliers.filter(
          (ext) =>
            ext.name.trim() &&
            ext.email.trim() &&
            ext.company.trim() &&
            !existing.some(
              (i) =>
                i.supplierType === "external" &&
                i.externalContact?.email.toLowerCase() ===
                  ext.email.trim().toLowerCase()
            )
        );

        const totalNew = newInternalIds.length + newExternal.length;
        if (totalNew === 0) return;

        const isDraft = rfx.status === "draft";
        const now = new Date().toISOString();

        if (isDraft) {
          set((s) => ({
            rfxRecords: s.rfxRecords.map((r) =>
              r.id === rfxId
                ? {
                    ...r,
                    status: "open" as RfxStatus,
                    publishedAt: now,
                    updatedAt: now,
                  }
                : r
            ),
          }));
        }

        const newInvitations: Invitation[] = [
          ...newInternalIds.map((supplierId) => ({
            id: uid("inv"),
            rfxId,
            supplierType: "internal" as const,
            supplierId,
            status: "pending" as const,
            invitedAt: now,
          })),
          ...newExternal.map((contact) => ({
            id: uid("inv"),
            rfxId,
            supplierType: "external" as const,
            externalContact: {
              name: contact.name.trim(),
              email: contact.email.trim(),
              company: contact.company.trim(),
            },
            status: "pending" as const,
            invitedAt: now,
          })),
        ];

        set((s) => ({
          invitations: [...s.invitations, ...newInvitations],
        }));

        newInternalIds.forEach((supplierId) => {
          get().addNotification({
            userId: supplierId,
            rfxId,
            title: `New ${rfx.type} Invitation`,
            message: `You have been invited to respond to ${rfx.title}.`,
            type: "info",
            read: false,
          });
        });

        get().logActivity({
          rfxId,
          userId: rfx.buyerId,
          action: isDraft ? "Published" : "Invited Suppliers",
          details: isDraft
            ? `${rfx.type} published with ${totalNew} invitation(s) (${newInternalIds.length} internal, ${newExternal.length} external)`
            : `Invited ${totalNew} supplier(s) (${newInternalIds.length} internal, ${newExternal.length} external)`,
        });
      },

      respondInvitation: (invitationId, status) => {
        const now = new Date().toISOString();
        set((s) => ({
          invitations: s.invitations.map((i) =>
            i.id === invitationId
              ? { ...i, status, respondedAt: now }
              : i
          ),
        }));
      },

      askQuestion: (rfxId, supplierId, question) => {
        const qa: QaThread = {
          id: uid("qa"),
          rfxId,
          supplierId,
          question,
          askedAt: new Date().toISOString(),
          isPublic: true,
        };
        set((s) => ({ qaThreads: [...s.qaThreads, qa] }));

        const rfx = get().rfxRecords.find((r) => r.id === rfxId);
        if (rfx) {
          get().addNotification({
            userId: rfx.buyerId,
            rfxId,
            title: "New Q&A Question",
            message: `A supplier asked a question on ${rfx.title}.`,
            type: "info",
            read: false,
          });
          get().logActivity({
            rfxId,
            userId: supplierId,
            action: "Asked Question",
            details: question.slice(0, 100),
          });
        }
      },

      answerQuestion: (qaId, answer, buyerId, publishToAll = true) => {
        const now = new Date().toISOString();
        const qa = get().qaThreads.find((q) => q.id === qaId);
        set((s) => ({
          qaThreads: s.qaThreads.map((q) =>
            q.id === qaId
              ? { ...q, answer, answeredAt: now, isPublic: publishToAll }
              : q
          ),
        }));
        if (qa) {
          get().addNotification({
            userId: qa.supplierId,
            rfxId: qa.rfxId,
            title: "Q&A Answer Received",
            message: publishToAll
              ? "Your question has been answered and published to all suppliers."
              : "Your question has been answered.",
            type: "info",
            read: false,
          });
          if (publishToAll) {
            const invited = get()
              .invitations.filter(
                (i) =>
                  i.rfxId === qa.rfxId &&
                  i.supplierId &&
                  i.supplierId !== qa.supplierId &&
                  (i.supplierType === "internal" || !i.supplierType)
              )
              .map((i) => i.supplierId!);
            invited.forEach((sid) => {
              get().addNotification({
                userId: sid,
                rfxId: qa.rfxId,
                title: "Q&A Update",
                message: "A new Q&A answer has been published.",
                type: "info",
                read: false,
              });
            });
          }
          get().logActivity({
            rfxId: qa.rfxId,
            userId: buyerId,
            action: "Answered Question",
            details: answer.slice(0, 100),
          });
        }
      },

      saveSubmission: (submission) => {
        const rfx = get().rfxRecords.find((r) => r.id === submission.rfxId);
        const existing = get().submissions.find((s) => s.id === submission.id);
        if (
          rfx &&
          submission.status !== "submitted" &&
          isSubmissionFrozen(rfx.dueDate, existing ?? submission)
        ) {
          return;
        }
        set((s) => {
          const idx = s.submissions.findIndex((sub) => sub.id === submission.id);
          if (idx >= 0) {
            const updated = [...s.submissions];
            updated[idx] = { ...submission, updatedAt: new Date().toISOString() };
            return { submissions: updated };
          }
          return { submissions: [...s.submissions, submission] };
        });
      },

      submitResponse: (submissionId) => {
        const now = new Date().toISOString();
        const sub = get().submissions.find((s) => s.id === submissionId);
        if (!sub) return;

        const rfx = get().rfxRecords.find((r) => r.id === sub.rfxId);
        if (rfx && isSubmissionFrozen(rfx.dueDate, sub)) return;

        set((s) => ({
          submissions: s.submissions.map((sub) =>
            sub.id === submissionId
              ? { ...sub, status: "submitted" as const, submittedAt: now, updatedAt: now }
              : sub
          ),
        }));

        if (rfx) {
          const supplier = get().users.find((u) => u.id === sub.supplierId);
          get().addNotification({
            userId: rfx.buyerId,
            rfxId: sub.rfxId,
            title: "New Submission",
            message: `${supplier?.organization ?? "A supplier"} submitted their ${rfx.type} response.`,
            type: "success",
            read: false,
          });
          get().logActivity({
            rfxId: sub.rfxId,
            userId: sub.supplierId,
            action: "Submitted Response",
            details: `${supplier?.organization ?? "Supplier"} submitted proposal`,
          });
        }
      },

      scoreSubmission: (submissionId, scores, buyerId) => {
        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        set((s) => ({
          submissions: s.submissions.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  criterionScores: scores,
                  totalScore,
                  updatedAt: new Date().toISOString(),
                }
              : sub
          ),
        }));
        const sub = get().submissions.find((s) => s.id === submissionId);
        if (sub) {
          get().logActivity({
            rfxId: sub.rfxId,
            userId: buyerId,
            action: "Scored Submission",
            details: `Total score: ${totalScore}`,
          });
        }
      },

      markNotificationRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      addNotification: (notification) => {
        const n: Notification = {
          ...notification,
          id: uid("notif"),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notifications: [...s.notifications, n] }));
      },

      logActivity: (entry) => {
        const act: ActivityEntry = {
          ...entry,
          id: uid("act"),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ activityLog: [...s.activityLog, act] }));
      },
    }),
    {
      name: STORE_STORAGE_KEY,
      skipHydration: true,
    }
  )
);

export function getCurrentUser(state: AppState): User | undefined {
  return state.users.find((u) => u.id === state.currentUserId);
}

export function getSuppliers(state: AppState): User[] {
  return state.users.filter((u) => u.role === "supplier");
}

export function getBuyers(state: AppState): User[] {
  return state.users.filter((u) => u.role === "buyer");
}

export function getRfxByType(state: AppState, type: RfxType) {
  return state.rfxRecords.filter((r) => r.type === type);
}

export function getSupplierInvitations(state: AppState, supplierId: string) {
  return state.invitations.filter(
    (i) =>
      i.supplierId === supplierId &&
      (i.supplierType === "internal" || !i.supplierType)
  );
}

export function getRfxInvitations(state: AppState, rfxId: string) {
  return state.invitations.filter((i) => i.rfxId === rfxId);
}

export function getRfxSubmissions(state: AppState, rfxId: string) {
  return state.submissions.filter((s) => s.rfxId === rfxId);
}

export function getRfxQa(state: AppState, rfxId: string) {
  return state.qaThreads.filter((q) => q.rfxId === rfxId);
}

export function getUserNotifications(state: AppState, userId: string) {
  return state.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRfxActivity(state: AppState, rfxId: string) {
  return state.activityLog
    .filter((a) => a.rfxId === rfxId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSupplierSubmission(
  state: AppState,
  rfxId: string,
  supplierId: string
) {
  return state.submissions.find(
    (s) => s.rfxId === rfxId && s.supplierId === supplierId
  );
}

export const STATUS_LABELS: Record<RfxStatus, string> = {
  draft: "Draft",
  published: "Published",
  open: "Open",
  closed: "Closed",
  awarded: "Awarded",
};

export { STATUS_COLORS, TYPE_COLORS } from "./stimulus-styles";
