"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cart } from "../cart/store";

/** The order exists on the server now, so the bag can be emptied. */
export function ClearBag() {
  useEffect(() => cart.clear(), []);
  return null;
}

/** Re-render the server status every 2s (for up to a minute) until the webhook lands. */
export function RefreshWhilePending() {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const t = setInterval(() => {
      if (++tries > 30) return clearInterval(t);
      router.refresh();
    }, 2000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
