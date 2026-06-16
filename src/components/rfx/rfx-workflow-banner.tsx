"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  WORKFLOW_STEPS,
  canPublishRfx,
  canInviteSuppliers,
  getWorkflowStepIndex,
} from "@/lib/rfx-workflow";
import type { RfxRecord } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Check, Circle } from "lucide-react";
import { toast } from "sonner";

export function RfxWorkflowBanner({
  rfx,
  onGoToInvitations,
}: {
  rfx: RfxRecord;
  onGoToInvitations?: () => void;
}) {
  const publishRfx = useStore((s) => s.publishRfx);
  const currentUserId = useStore((s) => s.currentUserId);

  if (rfx.status === "closed" || rfx.status === "awarded") {
    return (
      <Card className="border-muted">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            This solicitation is {rfx.status === "awarded" ? "awarded" : "closed"}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stepIndex = getWorkflowStepIndex(rfx.status);

  const handlePublish = () => {
    publishRfx(rfx.id, currentUserId);
    toast.success(`${rfx.type} published — you can now invite suppliers`);
  };

  return (
    <Card>
      <CardContent className="py-4 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 gap-2 sm:gap-4">
            {WORKFLOW_STEPS.map((step, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={step.status} className="flex flex-1 items-start gap-2 min-w-0">
                  <div
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                      done && "border-stim-primary bg-stim-primary text-white",
                      active && "border-stim-primary text-stim-primary",
                      !done && !active && "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        active ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    )}
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="hidden sm:block flex-1 h-px bg-border mt-3 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-muted-foreground sm:hidden">
          {WORKFLOW_STEPS[stepIndex]?.description}
        </p>

        {canPublishRfx(rfx) && (
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t">
            <p className="text-sm flex-1 min-w-[200px]">
              Publish when you are ready to invite suppliers. Until then, only buyers can see this{" "}
              {rfx.type}.
            </p>
            <Button onClick={handlePublish}>Publish {rfx.type}</Button>
          </div>
        )}

        {rfx.status === "published" && (
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t">
            <p className="text-sm flex-1 min-w-[200px]">
              Published successfully. Invite suppliers to open the solicitation for Q&amp;A and
              submissions.
            </p>
            {onGoToInvitations && (
              <Button onClick={onGoToInvitations}>Invite Suppliers</Button>
            )}
          </div>
        )}

        {canInviteSuppliers(rfx) && rfx.status === "open" && (
          <p className="text-sm text-muted-foreground pt-1 border-t">
            Solicitation is open. Suppliers can accept invitations, ask questions, and submit
            responses.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
