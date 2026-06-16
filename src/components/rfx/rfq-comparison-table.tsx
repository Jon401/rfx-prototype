"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { RfqRecord } from "@/lib/types";
import type { Submission, User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RfqComparisonTableProps {
  rfx: RfqRecord;
  submissions: Submission[];
  suppliers: User[];
}

export function RfqComparisonTable({
  rfx,
  submissions,
  suppliers,
}: RfqComparisonTableProps) {
  const submitted = submissions.filter((s) => s.status === "submitted");
  if (submitted.length === 0) return null;

  const cols = submitted.map((sub) => {
    const supplier = suppliers.find((u) => u.id === sub.supplierId);
    return { sub, label: supplier?.organization ?? "Supplier" };
  });

  const rowTotals = cols.map(({ sub }) => {
    return rfx.lineItems.reduce((sum, li) => {
      const quote = sub.rfqQuotes?.find((q) => q.lineItemId === li.id);
      return sum + (quote ? quote.unitPrice * li.quantity : 0);
    }, 0);
  });

  const grandTotalMin = Math.min(...rowTotals);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Price Comparison</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Line Item</TableHead>
              <TableHead>Qty</TableHead>
              {cols.map(({ sub, label }) => (
                <TableHead key={sub.id} className="text-right min-w-[120px]">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfx.lineItems.map((li) => {
              const prices = cols.map(({ sub }) => {
                const quote = sub.rfqQuotes?.find((q) => q.lineItemId === li.id);
                return quote?.unitPrice ?? null;
              });
              const validPrices = prices.filter((p): p is number => p !== null);
              const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

              return (
                <TableRow key={li.id}>
                  <TableCell className="text-sm">{li.description}</TableCell>
                  <TableCell className="text-sm">
                    {li.quantity} {li.unit}
                  </TableCell>
                  {cols.map(({ sub }, i) => {
                    const quote = sub.rfqQuotes?.find((q) => q.lineItemId === li.id);
                    const isLowest =
                      quote && minPrice !== null && quote.unitPrice === minPrice;
                    return (
                      <TableCell
                        key={sub.id}
                        className={cn(
                          "text-right text-sm",
                          isLowest && "bg-stim-success/10 font-medium text-stim-success"
                        )}
                      >
                        {quote ? (
                          <>
                            {formatCurrency(quote.unitPrice)}
                            <span className="block text-xs text-muted-foreground">
                              {formatCurrency(quote.unitPrice * li.quantity)} total
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            <TableRow className="font-medium bg-muted/50">
              <TableCell colSpan={2}>Grand Total</TableCell>
              {cols.map(({ sub }, i) => (
                <TableCell
                  key={sub.id}
                  className={cn(
                    "text-right",
                    rowTotals[i] === grandTotalMin &&
                      "bg-stim-success/15 text-stim-success font-semibold"
                  )}
                >
                  {formatCurrency(rowTotals[i])}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
