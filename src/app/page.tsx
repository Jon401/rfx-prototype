"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore, getCurrentUser } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const state = useStore();
  const user = getCurrentUser(state);

  useEffect(() => {
    if (user?.role === "supplier") {
      router.replace("/supplier/solicitations");
    } else {
      router.replace("/buyer/rfis");
    }
  }, [user, router]);

  return null;
}
