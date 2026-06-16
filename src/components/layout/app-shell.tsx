"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserSwitcher } from "./user-switcher";
import { NotificationFeed } from "./notification-feed";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
  const resetStore = useStore((s) => s.resetStore);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stim-primary text-white text-xs font-bold">
              RFX
            </span>
            <span className="hidden sm:inline">Procurement Portal</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={resetStore}
            className="text-muted-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Demo
          </Button>
          <NotificationFeed />
          <UserSwitcher />
        </div>
      </div>
    </header>
  );
}

interface NavItem {
  href: string;
  label: string;
}

export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PageLayout({
  sidebar,
  children,
}: {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-7xl flex-1 gap-8 px-4 py-6">
      {sidebar && (
        <aside className="hidden w-48 shrink-0 md:block">{sidebar}</aside>
      )}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
