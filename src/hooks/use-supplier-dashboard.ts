"use client";

import { useMemo } from "react";
import {
  useStore,
  getSupplierInvitations,
  getSupplierSubmission,
  getUserNotifications,
} from "@/lib/store";
import { isSubmissionFrozen } from "@/lib/rfx-status";
import type { RfxRecord } from "@/lib/types";

export function useSupplierDashboard(supplierId: string) {
  const state = useStore();

  return useMemo(() => {
    const invitations = getSupplierInvitations(state, supplierId);
    const invitedRfxIds = new Set(invitations.map((i) => i.rfxId));
    const allRfx = state.rfxRecords.filter((r) => invitedRfxIds.has(r.id));

    const needsAttention: { rfx: RfxRecord; badge: string }[] = [];
    const active: RfxRecord[] = [];
    const myQa: RfxRecord[] = [];
    const mySubmission: RfxRecord[] = [];
    const closed: RfxRecord[] = [];

    allRfx.forEach((rfx) => {
      const inv = invitations.find((i) => i.rfxId === rfx.id);
      const sub = getSupplierSubmission(state, rfx.id, supplierId);
      const myQuestions = state.qaThreads.filter(
        (q) => q.rfxId === rfx.id && q.supplierId === supplierId
      );
      const unreadNotifs = getUserNotifications(state, supplierId).filter(
        (n) => n.rfxId === rfx.id && !n.read
      );

      if (rfx.status === "closed" || rfx.status === "awarded") {
        closed.push(rfx);
        return;
      }

      if (inv?.status === "pending") {
        needsAttention.push({ rfx, badge: "Invitation pending" });
        return;
      }

      if (
        inv?.status === "accepted" &&
        isSubmissionFrozen(rfx.dueDate, sub)
      ) {
        needsAttention.push({ rfx, badge: "Deadline passed — not submitted" });
        active.push(rfx);
        return;
      }

      if (unreadNotifs.length > 0) {
        needsAttention.push({ rfx, badge: `${unreadNotifs.length} notification(s)` });
      }

      if (myQuestions.some((q) => !q.answer)) {
        myQa.push(rfx);
      }

      if (sub?.status === "submitted") {
        mySubmission.push(rfx);
      } else if (rfx.status === "open") {
        if (!sub || sub.status === "draft") {
          needsAttention.push({ rfx, badge: sub ? "Draft in progress" : "Response needed" });
        }
        active.push(rfx);
      }
    });

    const uniqueNeedsAttention = needsAttention.filter(
      (item, idx, arr) => arr.findIndex((a) => a.rfx.id === item.rfx.id) === idx
    );

    return {
      needsAttention: uniqueNeedsAttention,
      active,
      myQa: [...new Set(myQa.map((r) => r.id))].map(
        (id) => allRfx.find((r) => r.id === id)!
      ),
      mySubmission,
      closed,
    };
  }, [state, supplierId]);
}
