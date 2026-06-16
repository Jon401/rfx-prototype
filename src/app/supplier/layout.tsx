"use client";

import { PageLayout } from "@/components/layout/app-shell";

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
