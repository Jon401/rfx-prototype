"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { toDateInputValue } from "@/lib/format";
import type { RfpRecord, RfpSection, ScoringCriterion } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export function EditRfpForm({ rfx }: { rfx: RfpRecord }) {
  const router = useRouter();
  const updateRfx = useStore((s) => s.updateRfx);
  const logActivity = useStore((s) => s.logActivity);
  const currentUserId = useStore((s) => s.currentUserId);

  const [title, setTitle] = useState(rfx.title);
  const [description, setDescription] = useState(rfx.description);
  const [dueDate, setDueDate] = useState(toDateInputValue(rfx.dueDate));
  const [sections, setSections] = useState<RfpSection[]>(rfx.sections);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(rfx.scoringCriteria);

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { id: uid("sec"), title: "", description: "", required: true },
    ]);
  };

  const addCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      { id: uid("crit"), name: "", description: "", maxPoints: 25, weight: 25 },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    const validSections = sections.filter((s) => s.title.trim());
    const validCriteria = criteria.filter((c) => c.name.trim());
    if (validSections.length === 0) {
      toast.error("Add at least one proposal section");
      return;
    }
    if (validCriteria.length === 0) {
      toast.error("Add at least one scoring criterion");
      return;
    }
    updateRfx(rfx.id, {
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      sections: validSections,
      scoringCriteria: validCriteria,
    });
    logActivity({
      rfxId: rfx.id,
      userId: currentUserId,
      action: "Updated RFP",
      details: title,
    });
    toast.success("RFP updated");
    router.push(`/buyer/rfps/${rfx.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div>
          <Label htmlFor="due">Due Date</Label>
          <Input id="due" type="date" className="mt-1.5 w-48" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Proposal Sections</h3>
          <Button type="button" variant="outline" size="sm" onClick={addSection}>
            <Plus className="mr-1 h-4 w-4" /> Add Section
          </Button>
        </div>
        {sections.map((sec, i) => (
          <Card key={sec.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Section {i + 1}</span>
                {sections.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSections((prev) => prev.filter((s) => s.id !== sec.id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Section title"
                value={sec.title}
                onChange={(e) =>
                  setSections((prev) =>
                    prev.map((s) => (s.id === sec.id ? { ...s, title: e.target.value } : s))
                  )
                }
              />
              <Textarea
                placeholder="Instructions for this section..."
                value={sec.description}
                onChange={(e) =>
                  setSections((prev) =>
                    prev.map((s) => (s.id === sec.id ? { ...s, description: e.target.value } : s))
                  )
                }
                rows={2}
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={sec.required}
                  onCheckedChange={(v) =>
                    setSections((prev) =>
                      prev.map((s) => (s.id === sec.id ? { ...s, required: v } : s))
                    )
                  }
                />
                <Label className="text-sm">Required</Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Scoring Criteria</h3>
          <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
            <Plus className="mr-1 h-4 w-4" /> Add Criterion
          </Button>
        </div>
        {criteria.map((crit, i) => (
          <Card key={crit.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Criterion {i + 1}</span>
                {criteria.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCriteria((prev) => prev.filter((c) => c.id !== crit.id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Criterion name"
                value={crit.name}
                onChange={(e) =>
                  setCriteria((prev) =>
                    prev.map((c) => (c.id === crit.id ? { ...c, name: e.target.value } : c))
                  )
                }
              />
              <Textarea
                placeholder="Description..."
                value={crit.description}
                onChange={(e) =>
                  setCriteria((prev) =>
                    prev.map((c) => (c.id === crit.id ? { ...c, description: e.target.value } : c))
                  )
                }
                rows={2}
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs">Max Points</Label>
                  <Input
                    type="number"
                    min={1}
                    value={crit.maxPoints}
                    onChange={(e) =>
                      setCriteria((prev) =>
                        prev.map((c) =>
                          c.id === crit.id ? { ...c, maxPoints: Number(e.target.value) } : c
                        )
                      )
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Weight (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={crit.weight}
                    onChange={(e) =>
                      setCriteria((prev) =>
                        prev.map((c) =>
                          c.id === crit.id ? { ...c, weight: Number(e.target.value) } : c
                        )
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(`/buyer/rfps/${rfx.id}`)}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
