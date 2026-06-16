"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkButton } from "@/components/ui/link-button";
import {
  StatusBadge,
  TypeBadge,
  OriginBadge,
  DeadlineBadge,
  LateDraftBadge,
  AttributionLine,
} from "./rfx-badges";
import { RfxWorkflowBanner } from "./rfx-workflow-banner";
import { formatDate } from "@/lib/format";
import { canEditRfx, getDisplayStatus } from "@/lib/rfx-status";
import type { RfpRecord, RfxRecord } from "@/lib/types";
import { Calendar, Pencil } from "lucide-react";
import { useStore } from "@/lib/store";

function rfxEditPath(rfx: RfxRecord) {
  const segment = rfx.type === "RFI" ? "rfis" : rfx.type === "RFQ" ? "rfqs" : "rfps";
  return `/buyer/${segment}/${rfx.id}/edit`;
}

export function RfxHubHeader({ rfx }: { rfx: RfxRecord }) {
  const state = useStore();
  const displayStatus = getDisplayStatus(rfx, state);
  const editable = canEditRfx(rfx);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={rfx.type} />
          <StatusBadge rfx={rfx} state={state} />
          <DeadlineBadge dueDate={rfx.dueDate} displayStatus={displayStatus} />
          <LateDraftBadge rfx={rfx} />
          {rfx.type === "RFP" && (
            <OriginBadge rfp={rfx as RfpRecord} state={state} />
          )}
        </div>
        {editable && (
          <LinkButton href={rfxEditPath(rfx)} variant="outline" size="sm">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </LinkButton>
        )}
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{rfx.title}</h1>
      <p className="text-muted-foreground">{rfx.description}</p>
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          Due {formatDate(rfx.dueDate)}
        </span>
        <AttributionLine state={state} buyerId={rfx.buyerId} rfxId={rfx.id} />
      </div>
      {rfx.type === "RFP" && (rfx as RfpRecord).linkedFromRfiId && (
        <Link
          href={`/buyer/rfis/${(rfx as RfpRecord).linkedFromRfiId}`}
          className="text-sm text-primary hover:underline"
        >
          ← View source RFI
        </Link>
      )}
    </div>
  );
}

export function RfxHubTabs({
  rfx,
  overview,
  invitations,
  qa,
  submissions,
  awardClose,
  activity,
}: {
  rfx: RfxRecord;
  overview: React.ReactNode;
  invitations: React.ReactNode;
  qa: React.ReactNode;
  submissions: React.ReactNode;
  awardClose: React.ReactNode;
  activity: React.ReactNode;
}) {
  const showAward = rfx.type !== "RFI";
  const [tab, setTab] = useState("overview");

  return (
    <div className="mt-6 space-y-4">
      <RfxWorkflowBanner rfx={rfx} onGoToInvitations={() => setTab("invitations")} />
      <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="invitations">Invitations</TabsTrigger>
        <TabsTrigger value="qa">Q&A</TabsTrigger>
        <TabsTrigger value="submissions">Submissions</TabsTrigger>
        <TabsTrigger value="award">
          {showAward ? "Award / Close" : "Close / Convert"}
        </TabsTrigger>
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">{overview}</TabsContent>
      <TabsContent value="invitations" className="mt-4">{invitations}</TabsContent>
      <TabsContent value="qa" className="mt-4">{qa}</TabsContent>
      <TabsContent value="submissions" className="mt-4">{submissions}</TabsContent>
      <TabsContent value="award" className="mt-4">{awardClose}</TabsContent>
      <TabsContent value="activity" className="mt-4">{activity}</TabsContent>
      </Tabs>
    </div>
  );
}
