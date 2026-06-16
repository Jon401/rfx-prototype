"use client";

import { PageLayout, SideNav } from "@/components/layout/app-shell";

const buyerNav = [
  { href: "/buyer/rfis", label: "My RFIs" },
  { href: "/buyer/rfqs", label: "My RFQs" },
  { href: "/buyer/rfps", label: "My RFPs" },
];

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageLayout sidebar={<SideNav items={buyerNav} />}>{children}</PageLayout>
    </>
  );
}
