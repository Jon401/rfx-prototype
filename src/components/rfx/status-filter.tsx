"use client";

import { cn } from "@/lib/utils";
import type { RfxType } from "@/lib/types";
import {
  getFiltersForType,
  RFI_DISPLAY_LABELS,
  RFQ_RFP_DISPLAY_LABELS,
  type DisplayStatus,
  type RfiDisplayStatus,
  type RfqRfpDisplayStatus,
} from "@/lib/rfx-status";

interface StatusFilterProps {
  type: RfxType;
  value: DisplayStatus | "all" | "mine";
  onChange: (status: DisplayStatus | "all" | "mine") => void;
  counts?: Partial<Record<DisplayStatus | "all" | "mine", number>>;
  showMineFilter?: boolean;
}

export function StatusFilter({
  type,
  value,
  onChange,
  counts,
  showMineFilter,
}: StatusFilterProps) {
  const filters = getFiltersForType(type);

  const allFilters: (DisplayStatus | "all" | "mine")[] = showMineFilter
    ? ["all", "mine", ...filters]
    : ["all", ...filters];

  return (
    <div className="flex flex-wrap gap-2">
      {allFilters.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === status
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {status === "all"
            ? "All"
            : status === "mine"
              ? "Created by me"
              : type === "RFI"
                ? RFI_DISPLAY_LABELS[status as RfiDisplayStatus]
                : RFQ_RFP_DISPLAY_LABELS[status as RfqRfpDisplayStatus]}
          {counts?.[status] !== undefined && (
            <span className="ml-1 opacity-70">({counts[status]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
