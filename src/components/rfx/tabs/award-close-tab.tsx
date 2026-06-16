"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStore,
  getRfxSubmissions,
  getRfxInvitations,
} from "@/lib/store";
import type { RfiRecord, RfqRecord, RfpRecord, RfxRecord } from "@/lib/types";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { isRfxLive } from "@/lib/rfx-workflow";

export function AwardCloseTab({ rfx }: { rfx: RfxRecord }) {
  const router = useRouter();
  const state = useStore();
  const submissions = getRfxSubmissions(state, rfx.id).filter(
    (s) => s.status === "submitted"
  );
  const invitations = getRfxInvitations(state, rfx.id);
  const users = useStore((s) => s.users);
  const awardRfx = useStore((s) => s.awardRfx);
  const closeRfx = useStore((s) => s.closeRfx);
  const closeRfi = useStore((s) => s.closeRfi);
  const toggleShortlist = useStore((s) => s.toggleShortlist);
  const convertRfiToRfp = useStore((s) => s.convertRfiToRfp);

  const [awardNotes, setAwardNotes] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [confirmAward, setConfirmAward] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmCloseRfi, setConfirmCloseRfi] = useState(false);
  const [confirmConvert, setConfirmConvert] = useState(false);

  const isClosed = rfx.status === "closed" || rfx.status === "awarded";

  if (!isClosed && !isRfxLive(rfx)) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center max-w-md mx-auto">
        Publish and invite suppliers to open this solicitation before closing or awarding.
      </p>
    );
  }

  if (rfx.type === "RFI") {
    const rfi = rfx as RfiRecord;
    const invitedSuppliers = invitations
      .filter((i) => (i.supplierType === "internal" || !i.supplierType) && i.status === "accepted")
      .map((i) => users.find((u) => u.id === i.supplierId))
      .filter(Boolean);

    const handleCloseRfi = () => {
      if (!closeNotes.trim()) {
        toast.error("Please add closing notes");
        return;
      }
      closeRfi(rfi.id, closeNotes);
      setConfirmCloseRfi(false);
      toast.success("RFI closed");
    };

    const handleConvert = () => {
      const rfpId = convertRfiToRfp(rfi.id);
      setConfirmConvert(false);
      if (rfpId) {
        toast.success("Converted to RFP — shortlisted suppliers invited");
        router.push(`/buyer/rfps/${rfpId}`);
      }
    };

    return (
      <div className="space-y-6 max-w-lg">
        {!isClosed && (
          <div className="space-y-4">
            <div>
              <Label>Closing Notes</Label>
              <Textarea
                className="mt-1.5"
                placeholder="Summary of RFI review and next steps..."
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={() => setConfirmCloseRfi(true)}>Close RFI</Button>
          </div>
        )}

        {isClosed && rfi.closeNotes && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-1">Closing Notes</p>
              <p className="text-muted-foreground text-sm">{rfi.closeNotes}</p>
            </CardContent>
          </Card>
        )}

        {invitedSuppliers.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Shortlist Suppliers</h3>
            {invitedSuppliers.map((supplier) => (
              <div
                key={supplier!.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="font-medium text-sm">{supplier!.organization}</p>
                  <p className="text-muted-foreground text-xs">{supplier!.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`sl-${supplier!.id}`} className="text-xs">
                    Shortlisted
                  </Label>
                  <Switch
                    id={`sl-${supplier!.id}`}
                    checked={rfi.shortlistedSupplierIds.includes(supplier!.id)}
                    onCheckedChange={() => toggleShortlist(rfi.id, supplier!.id)}
                    disabled={!isClosed}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {isClosed && !rfi.convertedToRfpId && (
          <Button onClick={() => setConfirmConvert(true)} variant="outline">
            Convert to RFP
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {rfi.convertedToRfpId && (
          <Button
            variant="link"
            onClick={() => router.push(`/buyer/rfps/${rfi.convertedToRfpId}`)}
          >
            View converted RFP →
          </Button>
        )}

        <Dialog open={confirmCloseRfi} onOpenChange={setConfirmCloseRfi}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close RFI?</DialogTitle>
              <DialogDescription>
                This will close the RFI to new responses. You can still shortlist suppliers and convert to RFP.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmCloseRfi(false)}>Cancel</Button>
              <Button onClick={handleCloseRfi}>Confirm Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmConvert} onOpenChange={setConfirmConvert}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert to RFP?</DialogTitle>
              <DialogDescription>
                Creates a new RFP pre-filled from this RFI and auto-invites {rfi.shortlistedSupplierIds.length} shortlisted supplier(s).
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmConvert(false)}>Cancel</Button>
              <Button onClick={handleConvert}>Convert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const rfqOrRfp = rfx as RfqRecord | RfpRecord;
  const selectedOrg = users.find((u) => u.id === selectedSupplier)?.organization;

  const handleAward = () => {
    if (!selectedSupplier) {
      toast.error("Select a supplier to award");
      return;
    }
    awardRfx(rfx.id, selectedSupplier, awardNotes);
    setConfirmAward(false);
    toast.success("Contract awarded!");
  };

  const handleClose = () => {
    closeRfx(rfx.id);
    setConfirmClose(false);
    toast.success("Solicitation closed");
  };

  return (
    <div className="space-y-6 max-w-lg">
      {rfqOrRfp.awardedSupplierId ? (
        <Card>
          <CardContent className="pt-4">
            <p className="font-medium text-sm mb-1">Awarded To</p>
            <p className="text-sm">
              {users.find((u) => u.id === rfqOrRfp.awardedSupplierId)?.organization}
            </p>
            {rfqOrRfp.awardNotes && (
              <p className="text-muted-foreground text-sm mt-2">{rfqOrRfp.awardNotes}</p>
            )}
          </CardContent>
        </Card>
      ) : (
        rfx.status !== "closed" && (
          <div className="space-y-4">
            <div>
              <Label>Award To</Label>
              <Select value={selectedSupplier} onValueChange={(v) => v && setSelectedSupplier(v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select winning supplier" />
                </SelectTrigger>
                <SelectContent>
                  {submissions.map((sub) => {
                    const supplier = users.find((u) => u.id === sub.supplierId);
                    return (
                      <SelectItem key={sub.supplierId} value={sub.supplierId}>
                        {supplier?.organization}
                        {sub.totalScore !== undefined && ` (Score: ${sub.totalScore})`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Award Notes</Label>
              <Textarea
                className="mt-1.5"
                placeholder="Reason for selection..."
                value={awardNotes}
                onChange={(e) => setAwardNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={() => setConfirmAward(true)}
              disabled={submissions.length === 0}
            >
              Award Contract
            </Button>
          </div>
        )
      )}

      {rfx.status === "awarded" && (
        <Button variant="outline" onClick={() => setConfirmClose(true)}>
          Close Solicitation
        </Button>
      )}

      <Dialog open={confirmAward} onOpenChange={setConfirmAward}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award contract?</DialogTitle>
            <DialogDescription>
              Award {rfx.title} to {selectedOrg ?? "selected supplier"}? In-app notifications will be sent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAward(false)}>Cancel</Button>
            <Button onClick={handleAward}>Confirm Award</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmClose} onOpenChange={setConfirmClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close solicitation?</DialogTitle>
            <DialogDescription>
              This will mark {rfx.title} as closed. This action can be used after awarding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClose(false)}>Cancel</Button>
            <Button onClick={handleClose}>Confirm Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
