"use client";

import { useEffect, useState } from "react";
import { STORE_STORAGE_KEY, useStore } from "@/lib/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    void Promise.resolve(useStore.persist.rehydrate()).then(() => {
      if (active) setHydrated(true);
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORE_STORAGE_KEY) {
        void useStore.persist.rehydrate();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
