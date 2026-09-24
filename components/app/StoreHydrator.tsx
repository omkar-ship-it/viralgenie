"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function StoreHydrator() {
  useEffect(() => {
    useAppStore.persist.rehydrate();
    useAppStore.getState().setHasHydrated(true);

    function onStorage(e: StorageEvent) {
      if (e.key === "viralgenie-store-v2") {
        useAppStore.persist.rehydrate();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
