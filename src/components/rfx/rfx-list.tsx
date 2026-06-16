"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StatusBadge,
  TypeBadge,
  OriginBadge,
  DeadlineBadge,
  LateDraftBadge,
  AttributionLine,
} from "./rfx-badges";
import { formatDate } from "@/lib/format";
import { getDisplayStatus } from "@/lib/rfx-status";
import type { RfpRecord, RfxRecord } from "@/lib/types";
import type { AppState } from "@/lib/types";
import { Calendar, Users } from "lucide-react";

interface RfxListProps {
  records: RfxRecord[];
  basePath: string;
  state: AppState;
  invitationCounts?: Record<string, number>;
}

export function RfxList({ records, basePath, state, invitationCounts }: RfxListProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-muted-foreground text-sm">No solicitations found.</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Try adjusting your filters or create a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((rfx) => {
        const displayStatus = getDisplayStatus(rfx, state);
        return (
          <Link key={rfx.id} href={`${basePath}/${rfx.id}`}>
            <Card className="transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TypeBadge type={rfx.type} />
                      <StatusBadge rfx={rfx} state={state} />
                      <DeadlineBadge dueDate={rfx.dueDate} displayStatus={displayStatus} />
                      <LateDraftBadge rfx={rfx} />
                      {rfx.type === "RFP" && (
                        <OriginBadge rfp={rfx as RfpRecord} state={state} />
                      )}
                    </div>
                    <CardTitle className="text-base">{rfx.title}</CardTitle>
                    <AttributionLine
                      state={state}
                      buyerId={rfx.buyerId}
                      rfxId={rfx.id}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {rfx.description}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Due {formatDate(rfx.dueDate)}
                  </span>
                  {invitationCounts?.[rfx.id] !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {invitationCounts[rfx.id]} invited
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
