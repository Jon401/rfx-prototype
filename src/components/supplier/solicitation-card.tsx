"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StatusBadge,
  TypeBadge,
  DeadlineBadge,
  DeadlineMissedBadge,
} from "@/components/rfx/rfx-badges";
import { formatDate } from "@/lib/format";
import { getDisplayStatus } from "@/lib/rfx-status";
import type { RfxRecord } from "@/lib/types";
import { useStore, getSupplierSubmission } from "@/lib/store";
import { STIMULUS_BADGE } from "@/lib/stimulus-styles";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export function SupplierSolicitationCard({
  rfx,
  badge,
}: {
  rfx: RfxRecord;
  badge?: string;
}) {
  const state = useStore();
  const currentUserId = useStore((s) => s.currentUserId);
  const submission = getSupplierSubmission(state, rfx.id, currentUserId);
  const displayStatus = getDisplayStatus(rfx, state);

  return (
    <Link href={`/supplier/solicitations/${rfx.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={rfx.type} />
            <StatusBadge rfx={rfx} state={state} />
            <DeadlineBadge dueDate={rfx.dueDate} displayStatus={displayStatus} />
            <DeadlineMissedBadge dueDate={rfx.dueDate} submission={submission} />
            {badge && (
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STIMULUS_BADGE.warning)}>
                {badge}
              </span>
            )}
          </div>
          <CardTitle className="text-base">{rfx.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2 text-sm">{rfx.description}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Due {formatDate(rfx.dueDate)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
