"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RfiRecord, RfqRecord, RfpRecord } from "@/lib/types";
import { useStore, getRfxInvitations, getRfxSubmissions, getRfxQa } from "@/lib/store";

export function OverviewTab({ rfx }: { rfx: RfiRecord | RfqRecord | RfpRecord }) {
  const state = useStore();
  const invitations = getRfxInvitations(state, rfx.id);
  const submissions = getRfxSubmissions(state, rfx.id);
  const qa = getRfxQa(state, rfx.id);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invitations.length}</p>
            <p className="text-xs text-muted-foreground">
              {invitations.filter((i) => i.status === "accepted").length} accepted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {submissions.filter((s) => s.status === "submitted").length}
            </p>
            <p className="text-xs text-muted-foreground">
              {submissions.filter((s) => s.status === "draft").length} drafts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Q&A Threads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{qa.length}</p>
            <p className="text-xs text-muted-foreground">
              {qa.filter((q) => !q.answer).length} unanswered ·{" "}
              {qa.filter((q) => q.isPublic && q.answer).length} published
            </p>
          </CardContent>
        </Card>
      </div>

      {rfx.type === "RFI" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questionnaire ({rfx.questions.length} questions)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rfx.questions.map((q, i) => (
              <div key={q.id} className="flex gap-3 text-sm">
                <span className="text-muted-foreground shrink-0">Q{i + 1}.</span>
                <div>
                  <p>{q.text}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline" className="text-xs">{q.type}</Badge>
                    {q.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {rfx.type === "RFQ" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Line Items ({rfx.lineItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rfx.lineItems.map((li) => (
                <div key={li.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span>{li.description}</span>
                  <span className="text-muted-foreground shrink-0 ml-4">
                    {li.quantity} {li.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {rfx.type === "RFP" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proposal Sections ({rfx.sections.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rfx.sections.map((sec, i) => (
                <div key={sec.id} className="text-sm">
                  <p className="font-medium">{i + 1}. {sec.title}</p>
                  <p className="text-muted-foreground mt-0.5">{sec.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scoring Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rfx.scoringCriteria.map((c) => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-muted-foreground text-xs">{c.description}</p>
                    </div>
                    <span className="text-muted-foreground">{c.maxPoints} pts ({c.weight}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
