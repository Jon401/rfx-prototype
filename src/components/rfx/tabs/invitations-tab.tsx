"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStore, getRfxInvitations } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { canPublishRfx, canInviteSuppliers } from "@/lib/rfx-workflow";
import { STIMULUS_BADGE } from "@/lib/stimulus-styles";
import type { RfxRecord } from "@/lib/types";
import { UserPlus } from "lucide-react";
import {
  InviteSuppliersDialog,
  getInvitationDisplay,
} from "@/components/rfx/invite-suppliers-dialog";

export function InvitationsTab({ rfx }: { rfx: RfxRecord }) {
  const state = useStore();
  const invitations = getRfxInvitations(state, rfx.id);
  const users = useStore((s) => s.users);
  const [dialogOpen, setDialogOpen] = useState(false);

  const invitedInternalIds = useMemo(
    () =>
      new Set(
        invitations
          .filter((i) => i.supplierType === "internal" || !i.supplierType)
          .map((i) => i.supplierId!)
          .filter(Boolean)
      ),
    [invitations]
  );

  const invitedExternalEmails = useMemo(
    () =>
      new Set(
        invitations
          .filter((i) => i.supplierType === "external")
          .map((i) => i.externalContact?.email.toLowerCase())
          .filter(Boolean) as string[]
      ),
    [invitations]
  );

  const canInvite = canInviteSuppliers(rfx);
  const isDraft = canPublishRfx(rfx);

  return (
    <div className="space-y-6">
      {isDraft && (
        <Card className="border-stim-warning/30 bg-stim-warning/5">
          <CardContent className="py-4">
            <p className="text-sm">
              This {rfx.type} is still a <strong>draft</strong>. Publish it from the workflow
              banner above before inviting suppliers.
            </p>
          </CardContent>
        </Card>
      )}

      {canInvite && (
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Invite Suppliers
        </Button>
      )}

      {invitations.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Invited Suppliers</h3>
          {invitations.map((inv) => {
            const display = getInvitationDisplay(inv, users);
            return (
              <Card key={inv.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{display.organization}</p>
                      <Badge
                        variant="outline"
                        className={
                          display.type === "external"
                            ? `text-xs ${STIMULUS_BADGE.info}`
                            : `text-xs ${STIMULUS_BADGE.primary}`
                        }
                      >
                        {display.type === "external" ? "External" : "Internal"}
                      </Badge>
                      {display.diversityTag && (
                        <Badge variant="outline" className="text-xs">
                          {display.diversityTag}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">{display.name}</p>
                    {display.email && (
                      <p className="text-muted-foreground text-xs">{display.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">
                      Invited {formatDate(inv.invitedAt)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={
                        inv.status === "accepted"
                          ? STIMULUS_BADGE.success
                          : inv.status === "declined"
                            ? STIMULUS_BADGE.error
                            : STIMULUS_BADGE.warning
                      }
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        canInvite && (
          <p className="text-muted-foreground text-sm">
            No suppliers invited yet. Sending invitations will open this solicitation for
            supplier responses.
          </p>
        )
      )}

      <InviteSuppliersDialog
        rfx={rfx}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invitedInternalIds={invitedInternalIds}
        invitedExternalEmails={invitedExternalEmails}
      />
    </div>
  );
}
