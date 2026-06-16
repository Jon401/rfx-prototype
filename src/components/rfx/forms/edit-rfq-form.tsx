"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { toDateInputValue } from "@/lib/format";
import type { RfqLineItem, RfqRecord } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

function uid() {
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export function EditRfqForm({ rfx }: { rfx: RfqRecord }) {
  const router = useRouter();
  const updateRfx = useStore((s) => s.updateRfx);
  const logActivity = useStore((s) => s.logActivity);
  const currentUserId = useStore((s) => s.currentUserId);

  const [title, setTitle] = useState(rfx.title);
  const [description, setDescription] = useState(rfx.description);
  const [dueDate, setDueDate] = useState(toDateInputValue(rfx.dueDate));
  const [lineItems, setLineItems] = useState<RfqLineItem[]>(rfx.lineItems);

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: uid(), description: "", quantity: 1, unit: "each" },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  };

  const updateLineItem = (id: string, updates: Partial<RfqLineItem>) => {
    setLineItems((prev) =>
      prev.map((li) => (li.id === id ? { ...li, ...updates } : li))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    const validItems = lineItems.filter((li) => li.description.trim());
    if (validItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }
    updateRfx(rfx.id, {
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      lineItems: validItems,
    });
    logActivity({
      rfxId: rfx.id,
      userId: currentUserId,
      action: "Updated RFQ",
      details: title,
    });
    toast.success("RFQ updated");
    router.push(`/buyer/rfqs/${rfx.id}`);
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
          <h3 className="font-medium">Line Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>
        {lineItems.map((li, i) => (
          <Card key={li.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Item {i + 1}</span>
                {lineItems.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(li.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Description"
                value={li.description}
                onChange={(e) => updateLineItem(li.id, { description: e.target.value })}
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={li.quantity}
                    onChange={(e) => updateLineItem(li.id, { quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Unit</Label>
                  <Input
                    value={li.unit}
                    onChange={(e) => updateLineItem(li.id, { unit: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Est. Unit Price</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Optional"
                    value={li.estimatedUnitPrice ?? ""}
                    onChange={(e) =>
                      updateLineItem(li.id, {
                        estimatedUnitPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(`/buyer/rfqs/${rfx.id}`)}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
