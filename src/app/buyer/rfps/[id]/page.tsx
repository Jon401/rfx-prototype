"use client";

import { use } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { RfxHubHeader, RfxHubTabs } from "@/components/rfx/rfx-hub";
import { OverviewTab } from "@/components/rfx/tabs/overview-tab";
import { InvitationsTab } from "@/components/rfx/tabs/invitations-tab";
import { QaTabBuyer } from "@/components/rfx/tabs/qa-tab";
import { SubmissionsTab } from "@/components/rfx/tabs/submissions-tab";
import { AwardCloseTab } from "@/components/rfx/tabs/award-close-tab";
import { ActivityTab } from "@/components/rfx/tabs/activity-tab";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

export default function RfpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const rfx = useStore((s) => s.rfxRecords.find((r) => r.id === id));

  if (!rfx || rfx.type !== "RFP") {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">RFP not found</p>
        <LinkButton href="/buyer/rfps" variant="link" className="mt-2">
          Back to My RFPs
        </LinkButton>
      </div>
    );
  }

  return (
    <div>
      <LinkButton href="/buyer/rfps" variant="ghost" size="sm" className="mb-4 -ml-2">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> My RFPs
        </LinkButton>
      <RfxHubHeader rfx={rfx} />
      <RfxHubTabs
        rfx={rfx}
        overview={<OverviewTab rfx={rfx} />}
        invitations={<InvitationsTab rfx={rfx} />}
        qa={<QaTabBuyer rfx={rfx} />}
        submissions={<SubmissionsTab rfx={rfx} />}
        awardClose={<AwardCloseTab rfx={rfx} />}
        activity={<ActivityTab rfx={rfx} />}
      />
    </div>
  );
}
