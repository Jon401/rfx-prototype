"use client";

import { useMemo, useState } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { RfxList } from "@/components/rfx/rfx-list";
import { StatusFilter } from "@/components/rfx/status-filter";
import { useStore, getRfxByType } from "@/lib/store";
import { getDisplayStatus, type DisplayStatus } from "@/lib/rfx-status";
import type { RfxType } from "@/lib/types";
import { Plus } from "lucide-react";

interface BuyerListPageProps {
  type: RfxType;
  title: string;
  description: string;
  createHref: string;
  basePath: string;
}

export function BuyerListPage({
  type,
  title,
  description,
  createHref,
  basePath,
}: BuyerListPageProps) {
  const state = useStore();
  const currentUserId = useStore((s) => s.currentUserId);
  const [filter, setFilter] = useState<DisplayStatus | "all" | "mine">("all");

  const records = useMemo(() => {
    let all = getRfxByType(state, type);
    if (filter === "mine") {
      all = all.filter((r) => r.buyerId === currentUserId);
    } else if (filter !== "all") {
      all = all.filter((r) => getDisplayStatus(r, state) === filter);
    }
    return all.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [state, type, filter, currentUserId]);

  const counts = useMemo(() => {
    const all = getRfxByType(state, type);
    const c: Partial<Record<DisplayStatus | "all" | "mine", number>> = {
      all: all.length,
      mine: all.filter((r) => r.buyerId === currentUserId).length,
    };
    all.forEach((r) => {
      const ds = getDisplayStatus(r, state);
      c[ds] = (c[ds] ?? 0) + 1;
    });
    return c;
  }, [state, type, currentUserId]);

  const invitationCounts = useMemo(() => {
    const map: Record<string, number> = {};
    state.invitations.forEach((inv) => {
      map[inv.rfxId] = (map[inv.rfxId] ?? 0) + 1;
    });
    return map;
  }, [state.invitations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </div>
        <LinkButton href={createHref}>
          <Plus className="mr-1.5 h-4 w-4" /> Create {type}
        </LinkButton>
      </div>
      <StatusFilter
        type={type}
        value={filter}
        onChange={setFilter}
        counts={counts}
        showMineFilter
      />
      <RfxList
        records={records}
        basePath={basePath}
        state={state}
        invitationCounts={invitationCounts}
      />
    </div>
  );
}
