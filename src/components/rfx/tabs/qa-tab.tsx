"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore, getRfxQa } from "@/lib/store";
import { formatRelative } from "@/lib/format";
import { isRfxLive } from "@/lib/rfx-workflow";
import type { RfxRecord } from "@/lib/types";
import { toast } from "sonner";

export function QaTabBuyer({ rfx }: { rfx: RfxRecord }) {
  const state = useStore();
  const qaThreads = getRfxQa(state, rfx.id);
  const users = useStore((s) => s.users);
  const answerQuestion = useStore((s) => s.answerQuestion);
  const currentUserId = useStore((s) => s.currentUserId);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [publishToAll, setPublishToAll] = useState<Record<string, boolean>>({});

  const handleAnswer = (qaId: string) => {
    const answer = answers[qaId]?.trim();
    if (!answer) return;
    const isPublic = publishToAll[qaId] ?? true;
    answerQuestion(qaId, answer, currentUserId, isPublic);
    toast.success(isPublic ? "Answer published to all suppliers" : "Answer posted");
    setAnswers((prev) => ({ ...prev, [qaId]: "" }));
  };

  if (!isRfxLive(rfx)) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        Q&amp;A opens after you publish and invite suppliers.
      </p>
    );
  }

  if (qaThreads.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        No questions yet. Suppliers can ask questions from their solicitation view.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {qaThreads.map((qa) => {
        const supplier = users.find((u) => u.id === qa.supplierId);
        return (
          <Card key={qa.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{supplier?.organization}</p>
                  <p className="text-muted-foreground text-xs">{formatRelative(qa.askedAt)}</p>
                </div>
                {qa.isPublic && qa.answer && (
                  <Badge variant="outline" className="text-xs">Published to all</Badge>
                )}
              </div>
              <p className="text-sm">{qa.question}</p>
              {qa.answer ? (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Answer</p>
                  <p className="text-sm">{qa.answer}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {qa.answeredAt && formatRelative(qa.answeredAt)}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write your answer..."
                    value={answers[qa.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [qa.id]: e.target.value }))
                    }
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`pub-${qa.id}`}
                        checked={publishToAll[qa.id] ?? true}
                        onCheckedChange={(v) =>
                          setPublishToAll((prev) => ({ ...prev, [qa.id]: v }))
                        }
                      />
                      <Label htmlFor={`pub-${qa.id}`} className="text-sm cursor-pointer">
                        Publish answer to all suppliers
                      </Label>
                    </div>
                    <Button size="sm" onClick={() => handleAnswer(qa.id)}>
                      Post Answer
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
