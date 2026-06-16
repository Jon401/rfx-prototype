"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useStore, getRfxActivity } from "@/lib/store";
import { formatRelative } from "@/lib/format";
import type { RfxRecord } from "@/lib/types";

export function ActivityTab({ rfx }: { rfx: RfxRecord }) {
  const state = useStore();
  const activity = getRfxActivity(state, rfx.id);
  const users = useStore((s) => s.users);

  if (activity.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activity.map((entry) => {
        const user = users.find((u) => u.id === entry.userId);
        return (
          <Card key={entry.id}>
            <CardContent className="flex items-start gap-3 py-3">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">{entry.action}</p>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {formatRelative(entry.createdAt)}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-0.5">{entry.details}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {user?.name} · {user?.role}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
