"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { toDateInputValue } from "@/lib/format";
import type { RfiQuestion, RfiRecord } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

function uid() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export function EditRfiForm({ rfx }: { rfx: RfiRecord }) {
  const router = useRouter();
  const updateRfx = useStore((s) => s.updateRfx);
  const logActivity = useStore((s) => s.logActivity);
  const currentUserId = useStore((s) => s.currentUserId);

  const [title, setTitle] = useState(rfx.title);
  const [description, setDescription] = useState(rfx.description);
  const [dueDate, setDueDate] = useState(toDateInputValue(rfx.dueDate));
  const [questions, setQuestions] = useState<RfiQuestion[]>(rfx.questions);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: uid(), text: "", required: true, type: "textarea" },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<RfiQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    const validQuestions = questions.filter((q) => q.text.trim());
    if (validQuestions.length === 0) {
      toast.error("Add at least one question");
      return;
    }
    updateRfx(rfx.id, {
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      questions: validQuestions,
    });
    logActivity({
      rfxId: rfx.id,
      userId: currentUserId,
      action: "Updated RFI",
      details: title,
    });
    toast.success("RFI updated");
    router.push(`/buyer/rfis/${rfx.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
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
          <h3 className="font-medium">Questionnaire</h3>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="mr-1 h-4 w-4" /> Add Question
          </Button>
        </div>
        {questions.map((q, i) => (
          <Card key={q.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Question {i + 1}</span>
                {questions.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Enter question..."
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                rows={2}
              />
              <div className="flex items-center gap-4">
                <Select
                  value={q.type}
                  onValueChange={(v) => v && updateQuestion(q.id, { type: v as RfiQuestion["type"] })}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Short Text</SelectItem>
                    <SelectItem value="textarea">Long Text</SelectItem>
                    <SelectItem value="yes_no">Yes / No</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={q.required}
                    onCheckedChange={(v) => updateQuestion(q.id, { required: v })}
                  />
                  <Label className="text-sm">Required</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(`/buyer/rfis/${rfx.id}`)}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
