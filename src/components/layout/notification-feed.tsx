"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore, getCurrentUser, getUserNotifications } from "@/lib/store";
import { formatRelative } from "@/lib/format";

export function NotificationFeed() {
  const router = useRouter();
  const state = useStore();
  const user = getCurrentUser(state);
  const markNotificationRead = useStore((s) => s.markNotificationRead);

  if (!user) return null;

  const notifications = getUserNotifications(state, user.id);
  const unread = notifications.filter((n) => !n.read).length;

  const getLink = (rfxId: string) => {
    const rfx = state.rfxRecords.find((r) => r.id === rfxId);
    if (!rfx) return "/";
    if (user.role === "supplier") {
      return `/supplier/solicitations/${rfxId}`;
    }
    const base =
      rfx.type === "RFI"
        ? "/buyer/rfis"
        : rfx.type === "RFQ"
          ? "/buyer/rfqs"
          : "/buyer/rfps";
    return `${base}/${rfxId}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                {unread}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            Notifications
            {unread > 0 && (
              <span className="ml-2 text-muted-foreground font-normal text-xs">
                {unread} unread
              </span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-muted-foreground text-sm">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-72">
            {notifications.slice(0, 20).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  markNotificationRead(n.id);
                  router.push(getLink(n.rfxId));
                }}
                className={`w-full text-left px-3 py-2 hover:bg-muted transition-colors ${n.read ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{n.title}</span>
                  <span className="text-muted-foreground text-xs line-clamp-2">
                    {n.message}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {formatRelative(n.createdAt)}
                  </span>
                </div>
              </button>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
