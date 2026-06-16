"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore, getSuppliers } from "@/lib/store";
import type { ExternalContact, RfxRecord } from "@/lib/types";
import { Building2, Globe, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

type InviteStep = "choose" | "internal" | "external";

interface ExternalRow extends ExternalContact {
  id: string;
}

function emptyExternalRow(): ExternalRow {
  return {
    id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    name: "",
    email: "",
    company: "",
  };
}

interface InviteSuppliersDialogProps {
  rfx: RfxRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitedInternalIds: Set<string>;
  invitedExternalEmails: Set<string>;
}

export function InviteSuppliersDialog({
  rfx,
  open,
  onOpenChange,
  invitedInternalIds,
  invitedExternalEmails,
}: InviteSuppliersDialogProps) {
  const suppliers = getSuppliers(useStore());
  const sendInvitations = useStore((s) => s.sendInvitations);

  const [step, setStep] = useState<InviteStep>("choose");
  const [selectedInternal, setSelectedInternal] = useState<string[]>([]);
  const [externalRows, setExternalRows] = useState<ExternalRow[]>([
    emptyExternalRow(),
  ]);
  const [search, setSearch] = useState("");

  const availableInternal = useMemo(() => {
    const list = suppliers.filter((s) => !invitedInternalIds.has(s.id));
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (s) =>
        s.organization.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.diversityTag?.toLowerCase().includes(q)
    );
  }, [suppliers, invitedInternalIds, search]);

  const validExternal = externalRows.filter(
    (row) =>
      row.name.trim() &&
      row.email.trim() &&
      row.company.trim() &&
      !invitedExternalEmails.has(row.email.trim().toLowerCase())
  );

  const totalToSend = selectedInternal.length + validExternal.length;

  const resetForm = () => {
    setStep("choose");
    setSelectedInternal([]);
    setExternalRows([emptyExternalRow()]);
    setSearch("");
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const toggleInternal = (id: string) => {
    setSelectedInternal((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const updateExternalRow = (
    id: string,
    field: keyof ExternalContact,
    value: string
  ) => {
    setExternalRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSend = () => {
    if (totalToSend === 0) {
      toast.error("Select at least one supplier to invite");
      return;
    }

    sendInvitations(rfx.id, {
      internalSupplierIds: selectedInternal,
      externalSuppliers: validExternal.map(({ name, email, company }) => ({
        name,
        email,
        company,
      })),
    });

    const parts: string[] = [];
    if (selectedInternal.length > 0) {
      parts.push(`${selectedInternal.length} internal`);
    }
    if (validExternal.length > 0) {
      parts.push(`${validExternal.length} external`);
    }

    toast.success(
      rfx.status === "published"
        ? `Opened solicitation — invited ${parts.join(" + ")} supplier(s)`
        : `Invited ${parts.join(" + ")} supplier(s)`
    );
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Suppliers</DialogTitle>
          <DialogDescription>
            {rfx.status === "published"
              ? "Inviting suppliers will open this solicitation for Q&A and submissions. "
              : "Add more suppliers to this open solicitation. "}
            Invite internal suppliers from your directory or add external contacts by email.
            You can combine both in a single send.
          </DialogDescription>
        </DialogHeader>

        {step === "choose" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStep("internal")}
              className="flex flex-col items-start gap-2 rounded-lg border p-4 text-left hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Internal Supplier</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Select from your registered supplier directory
                </p>
              </div>
              {selectedInternal.length > 0 && (
                <Badge variant="secondary">{selectedInternal.length} selected</Badge>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep("external")}
              className="flex flex-col items-start gap-2 rounded-lg border p-4 text-left hover:bg-muted transition-colors"
            >
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">External Supplier</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Add contacts by name, email, and company
                </p>
              </div>
              {validExternal.length > 0 && (
                <Badge variant="secondary">{validExternal.length} added</Badge>
              )}
            </button>
          </div>
        )}

        {step === "internal" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {availableInternal.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  {search ? "No suppliers match your search." : "All internal suppliers are already invited."}
                </p>
              ) : (
                availableInternal.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <Checkbox
                      id={`dlg-${s.id}`}
                      checked={selectedInternal.includes(s.id)}
                      onCheckedChange={() => toggleInternal(s.id)}
                    />
                    <Label htmlFor={`dlg-${s.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{s.organization}</p>
                        {s.diversityTag && (
                          <Badge variant="outline" className="text-xs">
                            {s.diversityTag}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">{s.name}</p>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === "external" && (
          <div className="space-y-3">
            {externalRows.map((row, index) => (
              <div key={row.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    External contact {index + 1}
                  </span>
                  {externalRows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExternalRows((prev) => prev.filter((r) => r.id !== row.id))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Contact name"
                  value={row.name}
                  onChange={(e) => updateExternalRow(row.id, "name", e.target.value)}
                />
                <Input
                  placeholder="Email address"
                  type="email"
                  value={row.email}
                  onChange={(e) => updateExternalRow(row.id, "email", e.target.value)}
                />
                <Input
                  placeholder="Company name"
                  value={row.company}
                  onChange={(e) => updateExternalRow(row.id, "company", e.target.value)}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExternalRows((prev) => [...prev, emptyExternalRow()])}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add another external supplier
            </Button>
          </div>
        )}

        {(selectedInternal.length > 0 || validExternal.length > 0) && (
          <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
            <p className="font-medium">Ready to invite</p>
            {selectedInternal.length > 0 && (
              <p className="text-muted-foreground">
                {selectedInternal.length} internal supplier(s)
              </p>
            )}
            {validExternal.length > 0 && (
              <p className="text-muted-foreground">
                {validExternal.length} external contact(s)
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step !== "choose" ? (
            <Button type="button" variant="outline" onClick={() => setStep("choose")}>
              Back
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2 ml-auto">
            {step === "choose" && totalToSend > 0 && (
              <Button onClick={handleSend}>
                {rfx.status === "published" ? "Open & Send Invitations" : "Send Invitations"}
                {" "}({totalToSend})
              </Button>
            )}
            {step !== "choose" && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(step === "internal" ? "external" : "internal")}
                >
                  {step === "internal" ? (
                    <>
                      <Globe className="mr-1.5 h-4 w-4" />
                      Add External
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-1.5 h-4 w-4" />
                      Add Internal
                    </>
                  )}
                </Button>
                <Button onClick={handleSend} disabled={totalToSend === 0}>
                  {rfx.status === "published" ? "Open & Send" : "Send"}
                  {totalToSend > 0 && ` (${totalToSend})`}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function getInvitationDisplay(
  inv: {
    supplierType?: "internal" | "external";
    supplierId?: string;
    externalContact?: ExternalContact;
  },
  users: { id: string; name: string; email: string; organization: string; diversityTag?: string }[]
) {
  if (inv.supplierType === "external" && inv.externalContact) {
    return {
      organization: inv.externalContact.company,
      name: inv.externalContact.name,
      email: inv.externalContact.email,
      type: "external" as const,
      diversityTag: undefined as string | undefined,
    };
  }
  const supplier = users.find((u) => u.id === inv.supplierId);
  return {
    organization: supplier?.organization ?? "Unknown",
    name: supplier?.name ?? "",
    email: supplier?.email,
    type: "internal" as const,
    diversityTag: supplier?.diversityTag,
  };
}
