"use client";

import { useStore } from "@/lib/store";
import { SupplierSolicitationCard } from "@/components/supplier/solicitation-card";
import { useSupplierDashboard } from "@/hooks/use-supplier-dashboard";

function Section({
  title,
  items,
  empty,
  render,
}: {
  title: string;
  items: unknown[];
  empty: string;
  render: () => React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.length > 0 ? render() : (
        <p className="text-muted-foreground text-sm py-4">{empty}</p>
      )}
    </section>
  );
}

export default function SupplierDashboardPage() {
  const currentUserId = useStore((s) => s.currentUserId);
  const dashboard = useSupplierDashboard(currentUserId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Solicitations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All RFI, RFQ, and RFP invitations in one place
        </p>
      </div>

      <Section
        title="Needs Attention"
        items={dashboard.needsAttention}
        empty="Nothing needs your attention right now."
        render={() => (
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.needsAttention.map(({ rfx, badge }) => (
              <SupplierSolicitationCard key={rfx.id} rfx={rfx} badge={badge} />
            ))}
          </div>
        )}
      />

      <Section
        title="Active"
        items={dashboard.active}
        empty="No active solicitations."
        render={() => (
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.active.map((rfx) => (
              <SupplierSolicitationCard key={rfx.id} rfx={rfx} />
            ))}
          </div>
        )}
      />

      <Section
        title="My Q&A"
        items={dashboard.myQa}
        empty="No open Q&A threads."
        render={() => (
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.myQa.map((rfx) => (
              <SupplierSolicitationCard key={rfx.id} rfx={rfx} badge="Awaiting answer" />
            ))}
          </div>
        )}
      />

      <Section
        title="My Submissions"
        items={dashboard.mySubmission}
        empty="No submitted responses yet."
        render={() => (
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.mySubmission.map((rfx) => (
              <SupplierSolicitationCard key={rfx.id} rfx={rfx} badge="Submitted" />
            ))}
          </div>
        )}
      />

      <Section
        title="Closed"
        items={dashboard.closed}
        empty="No closed solicitations."
        render={() => (
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.closed.map((rfx) => (
              <SupplierSolicitationCard key={rfx.id} rfx={rfx} />
            ))}
          </div>
        )}
      />
    </div>
  );
}
