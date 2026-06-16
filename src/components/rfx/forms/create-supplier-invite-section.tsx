"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useStore, getSuppliers } from "@/lib/store";

export function CreateSupplierInviteSection({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const suppliers = getSuppliers(useStore());

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((sid) => sid !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="font-medium text-sm">Invite suppliers</h3>
        <p className="text-muted-foreground text-xs mt-1">
          Select suppliers to publish and invite immediately. They will see this
          solicitation on their dashboard (shared via localStorage — works across
          tabs when you switch users or open a second window).
        </p>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {suppliers.map((s) => (
          <label
            key={s.id}
            className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50"
          >
            <Checkbox
              checked={selectedIds.includes(s.id)}
              onCheckedChange={() => toggle(s.id)}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{s.organization}</p>
              <p className="text-muted-foreground text-xs">{s.name}</p>
            </div>
            {s.diversityTag && (
              <Badge variant="outline" className="text-xs shrink-0">
                {s.diversityTag}
              </Badge>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
