"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStore,
  getSupplierSubmission,
} from "@/lib/store";
import type {
  RfiRecord,
  RfqRecord,
  RfpRecord,
  RfxRecord,
  Submission,
} from "@/lib/types";
import { isSubmissionFrozen } from "@/lib/rfx-status";
import { toast } from "sonner";

function uid() {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

function SubmissionFrozenBanner() {
  return (
    <div className="rounded-md border border-stim-error/30 bg-stim-error/10 px-4 py-3 text-sm text-foreground">
      Submission deadline has passed — this response was not submitted.
    </div>
  );
}

export function SupplierSubmissionForm({
  rfx,
  supplierId,
}: {
  rfx: RfxRecord;
  supplierId: string;
}) {
  const state = useStore();
  const existing = getSupplierSubmission(state, rfx.id, supplierId);
  const saveSubmission = useStore((s) => s.saveSubmission);
  const submitResponse = useStore((s) => s.submitResponse);

  const isSubmitted = existing?.status === "submitted";
  const isClosed = rfx.status === "closed" || rfx.status === "awarded";
  const isFrozen = isSubmissionFrozen(rfx.dueDate, existing);
  const isReadOnly = isSubmitted || isClosed || isFrozen;

  if (rfx.type === "RFI") {
    return (
      <RfiSubmissionForm
        rfx={rfx}
        supplierId={supplierId}
        existing={existing}
        isSubmitted={isSubmitted}
        isReadOnly={isReadOnly}
        isFrozen={isFrozen}
        onSave={saveSubmission}
        onSubmit={submitResponse}
      />
    );
  }
  if (rfx.type === "RFQ") {
    return (
      <RfqSubmissionForm
        rfx={rfx}
        supplierId={supplierId}
        existing={existing}
        isSubmitted={isSubmitted}
        isReadOnly={isReadOnly}
        isFrozen={isFrozen}
        onSave={saveSubmission}
        onSubmit={submitResponse}
      />
    );
  }
  return (
    <RfpSubmissionForm
      rfx={rfx}
      supplierId={supplierId}
      existing={existing}
      isSubmitted={isSubmitted}
      isReadOnly={isReadOnly}
      isFrozen={isFrozen}
      onSave={saveSubmission}
      onSubmit={submitResponse}
    />
  );
}

interface FormProps {
  supplierId: string;
  existing?: Submission;
  isSubmitted: boolean;
  isReadOnly: boolean;
  isFrozen: boolean;
  onSave: (sub: Submission) => void;
  onSubmit: (id: string) => void;
}

function RfiSubmissionForm({
  rfx,
  supplierId,
  existing,
  isSubmitted,
  isReadOnly,
  isFrozen,
  onSave,
  onSubmit,
}: FormProps & { rfx: RfiRecord }) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    existing?.rfiAnswers?.forEach((a) => {
      map[a.questionId] = a.value;
    });
    return map;
  });

  const buildSubmission = (): Submission => ({
    id: existing?.id ?? uid(),
    rfxId: rfx.id,
    supplierId,
    status: existing?.status ?? "draft",
    updatedAt: new Date().toISOString(),
    rfiAnswers: rfx.questions.map((q) => ({
      questionId: q.id,
      value: answers[q.id] ?? "",
    })),
  });

  const handleSave = () => {
    onSave(buildSubmission());
    toast.success("Draft saved");
  };

  const handleSubmit = () => {
    const missing = rfx.questions.filter((q) => q.required && !answers[q.id]?.trim());
    if (missing.length > 0) {
      toast.error("Please answer all required questions");
      return;
    }
    const sub = { ...buildSubmission(), status: "draft" as const };
    onSave(sub);
    onSubmit(sub.id);
    toast.success("Response submitted!");
  };

  return (
    <div className="space-y-4">
      {isFrozen && <SubmissionFrozenBanner />}
      {rfx.questions.map((q, i) => (
        <Card key={q.id}>
          <CardContent className="pt-4 space-y-2">
            <Label className="text-sm">
              {i + 1}. {q.text}
              {q.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {q.type === "yes_no" ? (
              <Select
                value={answers[q.id] ?? ""}
                onValueChange={(v) => v && setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            ) : q.type === "textarea" ? (
              <Textarea
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                disabled={isReadOnly}
                rows={4}
              />
            ) : (
              <Input
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                disabled={isReadOnly}
              />
            )}
          </CardContent>
        </Card>
      ))}
      {!isReadOnly && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave}>Save Draft</Button>
          <Button onClick={handleSubmit}>Submit Response</Button>
        </div>
      )}
      {isSubmitted && (
        <p className="text-sm stim-text-success font-medium">✓ Response submitted</p>
      )}
    </div>
  );
}

function RfqSubmissionForm({
  rfx,
  supplierId,
  existing,
  isSubmitted,
  isReadOnly,
  isFrozen,
  onSave,
  onSubmit,
}: FormProps & { rfx: RfqRecord }) {
  const [quotes, setQuotes] = useState<Record<string, { unitPrice: string; notes: string }>>(() => {
    const map: Record<string, { unitPrice: string; notes: string }> = {};
    existing?.rfqQuotes?.forEach((q) => {
      map[q.lineItemId] = { unitPrice: String(q.unitPrice), notes: q.notes ?? "" };
    });
    return map;
  });

  const buildSubmission = (): Submission => ({
    id: existing?.id ?? uid(),
    rfxId: rfx.id,
    supplierId,
    status: existing?.status ?? "draft",
    updatedAt: new Date().toISOString(),
    rfqQuotes: rfx.lineItems.map((li) => ({
      lineItemId: li.id,
      unitPrice: Number(quotes[li.id]?.unitPrice ?? 0),
      notes: quotes[li.id]?.notes,
    })),
  });

  const handleSave = () => {
    onSave(buildSubmission());
    toast.success("Draft saved");
  };

  const handleSubmit = () => {
    const missingPrices = rfx.lineItems.filter((li) => {
      const price = quotes[li.id]?.unitPrice;
      return price === undefined || price === "" || Number(price) <= 0;
    });
    if (missingPrices.length > 0) {
      toast.warning(
        `${missingPrices.length} line item${missingPrices.length === 1 ? "" : "s"} missing a unit price — submitting anyway.`
      );
    }
    const sub = { ...buildSubmission(), status: "draft" as const };
    onSave(sub);
    onSubmit(sub.id);
    toast.success("Quote submitted!");
  };

  return (
    <div className="space-y-4">
      {isFrozen && <SubmissionFrozenBanner />}
      {rfx.lineItems.map((li) => (
        <Card key={li.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{li.description}</CardTitle>
            <p className="text-muted-foreground text-xs">Qty: {li.quantity} {li.unit}</p>
          </CardHeader>
          <CardContent className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs">Unit Price ($)</Label>
              <Input
                type="number"
                min={0}
                value={quotes[li.id]?.unitPrice ?? ""}
                onChange={(e) =>
                  setQuotes((prev) => ({
                    ...prev,
                    [li.id]: { ...prev[li.id], unitPrice: e.target.value, notes: prev[li.id]?.notes ?? "" },
                  }))
                }
                disabled={isReadOnly}
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Notes</Label>
              <Input
                value={quotes[li.id]?.notes ?? ""}
                onChange={(e) =>
                  setQuotes((prev) => ({
                    ...prev,
                    [li.id]: { unitPrice: prev[li.id]?.unitPrice ?? "", notes: e.target.value },
                  }))
                }
                disabled={isReadOnly}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      {!isReadOnly && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave}>Save Draft</Button>
          <Button onClick={handleSubmit}>Submit Quote</Button>
        </div>
      )}
      {isSubmitted && (
        <p className="text-sm stim-text-success font-medium">✓ Quote submitted</p>
      )}
    </div>
  );
}

function RfpSubmissionForm({
  rfx,
  supplierId,
  existing,
  isSubmitted,
  isReadOnly,
  isFrozen,
  onSave,
  onSubmit,
}: FormProps & { rfx: RfpRecord }) {
  const [responses, setResponses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    existing?.rfpResponses?.forEach((r) => {
      map[r.sectionId] = r.content;
    });
    return map;
  });
  const [attachments, setAttachments] = useState<{ id: string; name: string }[]>(
    () => existing?.attachments ?? []
  );

  const requiredSections = rfx.sections.filter((s) => s.required);
  const filledRequired = requiredSections.filter(
    (s) => (responses[s.id] ?? "").trim().length > 0
  ).length;
  const progress =
    requiredSections.length > 0
      ? Math.round((filledRequired / requiredSections.length) * 100)
      : 100;

  const buildSubmission = (): Submission => ({
    id: existing?.id ?? uid(),
    rfxId: rfx.id,
    supplierId,
    status: existing?.status ?? "draft",
    updatedAt: new Date().toISOString(),
    rfpResponses: rfx.sections.map((sec) => ({
      sectionId: sec.id,
      content: responses[sec.id] ?? "",
    })),
    attachments,
  });

  const handleSave = () => {
    onSave(buildSubmission());
    toast.success("Draft saved");
  };

  const handleSubmit = () => {
    const missing = rfx.sections.filter((s) => s.required && !responses[s.id]?.trim());
    if (missing.length > 0) {
      toast.error("Please complete all required sections");
      return;
    }
    const sub = { ...buildSubmission(), status: "draft" as const };
    onSave(sub);
    onSubmit(sub.id);
    toast.success("Proposal submitted!");
  };

  const addMockFile = () => {
    const name = `attachment-${attachments.length + 1}.pdf`;
    setAttachments((prev) => [...prev, { id: uid(), name }]);
  };

  return (
    <div className="space-y-4">
      {isFrozen && <SubmissionFrozenBanner />}
      {!isReadOnly && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {rfx.sections.map((sec, i) => (
        <Card key={sec.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {i + 1}. {sec.title}
              {sec.required && <span className="text-destructive ml-1">*</span>}
            </CardTitle>
            <p className="text-muted-foreground text-xs">{sec.description}</p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={responses[sec.id] ?? ""}
              onChange={(e) => setResponses((prev) => ({ ...prev, [sec.id]: e.target.value }))}
              disabled={isReadOnly}
              rows={6}
              placeholder="Enter your response..."
            />
          </CardContent>
        </Card>
      ))}

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {attachments.map((att) => (
            <Badge key={att.id} variant="secondary" className="gap-1 pr-1">
              {att.name}
              {!isReadOnly && (
                <button
                  type="button"
                  className="ml-1 hover:text-destructive"
                  onClick={() =>
                    setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                  }
                >
                  ×
                </button>
              )}
            </Badge>
          ))}
        </div>
        {!isReadOnly && (
          <Button type="button" variant="outline" size="sm" onClick={addMockFile}>
            Attach file (demo)
          </Button>
        )}
      </div>

      {!isReadOnly && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave}>Save Draft</Button>
          <Button onClick={handleSubmit}>Submit Proposal</Button>
        </div>
      )}
      {isSubmitted && (
        <p className="text-sm stim-text-success font-medium">✓ Proposal submitted</p>
      )}
    </div>
  );
}
