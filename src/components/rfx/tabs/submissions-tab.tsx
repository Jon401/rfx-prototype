"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useStore,
  getRfxSubmissions,
  getRfxInvitations,
} from "@/lib/store";
import { formatDate, formatCurrency } from "@/lib/format";
import { isDeadlinePassed } from "@/lib/rfx-status";
import { isRfxLive } from "@/lib/rfx-workflow";
import type { RfpRecord, RfqRecord, RfiRecord, RfxRecord } from "@/lib/types";
import { RfqComparisonTable } from "@/components/rfx/rfq-comparison-table";
import { SUBMISSION_STATUS_COLORS } from "@/lib/stimulus-styles";
import { toast } from "sonner";

type IncompleteStatus = "not_submitted" | "draft" | "not_started";

function getIncompleteStatus(
  rfx: RfxRecord,
  submission?: { status: "draft" | "submitted" }
): IncompleteStatus {
  if (isDeadlinePassed(rfx.dueDate)) return "not_submitted";
  if (submission?.status === "draft") return "draft";
  return "not_started";
}

const INCOMPLETE_LABELS: Record<IncompleteStatus, string> = {
  not_submitted: "Not Submitted",
  draft: "Draft in progress",
  not_started: "Not started",
};

export function SubmissionsTab({ rfx }: { rfx: RfxRecord }) {
  const state = useStore();
  const submissions = getRfxSubmissions(state, rfx.id);
  const invitations = getRfxInvitations(state, rfx.id).filter(
    (i) =>
      (i.supplierType === "internal" || !i.supplierType) &&
      i.supplierId &&
      i.status === "accepted"
  );
  const users = useStore((s) => s.users);
  const scoreSubmission = useStore((s) => s.scoreSubmission);
  const currentUserId = useStore((s) => s.currentUserId);

  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});

  const submitted = submissions.filter((s) => s.status === "submitted");
  const submittedIds = new Set(submitted.map((s) => s.supplierId));

  const handleScore = (submissionId: string, rfp: RfpRecord) => {
    const subScores = scores[submissionId];
    if (!subScores) return;
    const criterionScores = rfp.scoringCriteria.map((c) => ({
      criterionId: c.id,
      score: subScores[c.id] ?? 0,
    }));
    scoreSubmission(submissionId, criterionScores, currentUserId);
    toast.success("Scores saved");
  };

  const incomplete = invitations
    .filter((inv) => !submittedIds.has(inv.supplierId!))
    .map((inv) => {
      const sub = submissions.find((s) => s.supplierId === inv.supplierId);
      const status = getIncompleteStatus(rfx, sub);
      return { supplierId: inv.supplierId!, sub, status };
    });

  if (!isRfxLive(rfx)) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        Submissions appear after you publish and invite suppliers.
      </p>
    );
  }

  if (submitted.length === 0 && incomplete.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        No submissions yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {rfx.type === "RFQ" && submitted.length >= 2 && (
        <RfqComparisonTable
          rfx={rfx as RfqRecord}
          submissions={submissions}
          suppliers={users}
        />
      )}

      {submitted.map((sub) => {
        const supplier = users.find((u) => u.id === sub.supplierId);
        return (
          <Card key={sub.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{supplier?.organization}</CardTitle>
                <div className="flex items-center gap-2">
                  {sub.totalScore !== undefined && (
                    <Badge variant="secondary">Score: {sub.totalScore}</Badge>
                  )}
                  <Badge className={SUBMISSION_STATUS_COLORS.submitted}>Submitted</Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                {supplier?.name} · {sub.submittedAt && formatDate(sub.submittedAt)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {rfx.type === "RFI" && sub.rfiAnswers && (
                <div className="space-y-2">
                  {(rfx as RfiRecord).questions.map((q) => {
                    const answer = sub.rfiAnswers?.find((a) => a.questionId === q.id);
                    return (
                      <div key={q.id} className="text-sm border-b pb-2 last:border-0">
                        <p className="font-medium">{q.text}</p>
                        <p className="text-muted-foreground mt-1">
                          {answer?.value ?? "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {rfx.type === "RFQ" && sub.rfqQuotes && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(rfx as RfqRecord).lineItems.map((li) => {
                      const quote = sub.rfqQuotes?.find((q) => q.lineItemId === li.id);
                      const total = quote ? quote.unitPrice * li.quantity : 0;
                      return (
                        <TableRow key={li.id}>
                          <TableCell className="text-sm">{li.description}</TableCell>
                          <TableCell>{li.quantity}</TableCell>
                          <TableCell>{quote ? formatCurrency(quote.unitPrice) : "—"}</TableCell>
                          <TableCell>{quote ? formatCurrency(total) : "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {rfx.type === "RFP" && sub.rfpResponses && (
                <>
                  <div className="space-y-3">
                    {(rfx as RfpRecord).sections.map((sec) => {
                      const resp = sub.rfpResponses?.find((r) => r.sectionId === sec.id);
                      return (
                        <div key={sec.id} className="text-sm border-b pb-3 last:border-0">
                          <p className="font-medium">{sec.title}</p>
                          <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                            {resp?.content ?? "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {(rfx as RfpRecord).scoringCriteria.length > 0 && (
                    <div className="rounded-md border p-4 space-y-3">
                      <p className="font-medium text-sm">Score Submission</p>
                      {(rfx as RfpRecord).scoringCriteria.map((c) => (
                        <div key={c.id} className="flex items-center justify-between gap-4">
                          <div className="text-sm">
                            <p>{c.name}</p>
                            <p className="text-muted-foreground text-xs">Max {c.maxPoints} pts</p>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            max={c.maxPoints}
                            className="w-20"
                            value={
                              scores[sub.id]?.[c.id] ??
                              sub.criterionScores?.find((s) => s.criterionId === c.id)?.score ??
                              ""
                            }
                            onChange={(e) =>
                              setScores((prev) => ({
                                ...prev,
                                [sub.id]: {
                                  ...prev[sub.id],
                                  [c.id]: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                      ))}
                      <Button size="sm" onClick={() => handleScore(sub.id, rfx as RfpRecord)}>
                        Save Scores
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}

      {incomplete.length > 0 && (
        <div>
          <h3 className="font-medium text-sm mb-3 text-muted-foreground">
            Incomplete Responses
          </h3>
          {incomplete.map(({ supplierId, sub, status }) => {
            const supplier = users.find((u) => u.id === supplierId);
            return (
              <div
                key={supplierId}
                className="flex items-center justify-between rounded-md border p-3 mb-2"
              >
                <div>
                  <span className="text-sm font-medium">{supplier?.organization}</span>
                  {status === "not_submitted" && sub && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Had a draft at deadline — not submitted in time
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={SUBMISSION_STATUS_COLORS[status]}
                >
                  {INCOMPLETE_LABELS[status]}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
