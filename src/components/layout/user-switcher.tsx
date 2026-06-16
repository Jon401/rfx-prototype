"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useStore, getCurrentUser } from "@/lib/store";

export function UserSwitcher() {
  const router = useRouter();
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);
  const setCurrentUser = useStore((s) => s.setCurrentUser);

  const state = useStore();
  const user = getCurrentUser(state);

  const handleSwitch = (userId: string) => {
    setCurrentUser(userId);
    const u = users.find((usr) => usr.id === userId);
    if (u?.role === "buyer") {
      router.push("/buyer/rfis");
    } else {
      router.push("/supplier/solicitations");
    }
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm hover:bg-muted transition-colors outline-none">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col items-start">
          <span className="font-medium leading-none">{user.name}</span>
          <span className="text-muted-foreground text-xs">{user.organization}</span>
        </div>
        <Badge variant="secondary" className="text-xs capitalize hidden sm:inline-flex">
          {user.role}
        </Badge>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch User</DropdownMenuLabel>
          {users.map((u) => (
            <DropdownMenuItem
              key={u.id}
              onClick={() => handleSwitch(u.id)}
              className={u.id === currentUserId ? "bg-muted" : ""}
            >
              <div className="flex flex-col">
                <span className="font-medium">{u.name}</span>
                <span className="text-muted-foreground text-xs">
                  {u.organization} · {u.role}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
