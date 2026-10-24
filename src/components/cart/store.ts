"use client";

import { useSyncExternalStore } from "react";
import type { CatalogProduct } from "@/lib/catalog";

export type CartLine = { slug: string; color: string; size: string; qty: number };

type State = { lines: CartLine[]; open: boolean };

const KEY = "ghost-cart-v1";
const EMPTY: State = { lines: [], open: false };
let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state.lines));
  } catch {}
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    const lines = raw ? (JSON.parse(raw) as CartLine[]) : [];
    state = { ...state, lines };
  } catch {}
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const sameLine = (a: CartLine, b: Omit<CartLine, "qty">) =>
  a.slug === b.slug && a.color === b.color && a.size === b.size;

export const cart = {
  add(line: Omit<CartLine, "qty">, qty = 1) {
    const existing = state.lines.find((l) => sameLine(l, line));
    const lines = existing
      ? state.lines.map((l) => (l === existing ? { ...l, qty: Math.min(10, l.qty + qty) } : l))
      : [...state.lines, { ...line, qty }];
    emit({ lines, open: true });
  },
  setQty(line: CartLine, qty: number) {
    const lines =
      qty <= 0
        ? state.lines.filter((l) => l !== line)
        : state.lines.map((l) => (l === line ? { ...l, qty: Math.min(10, qty) } : l));
    emit({ ...state, lines });
  },
  remove(line: CartLine) {
    emit({ ...state, lines: state.lines.filter((l) => l !== line) });
  },
  setOpen(open: boolean) {
    emit({ ...state, open });
  },
  clear() {
    emit({ lines: [], open: false });
  },
};

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );
}

/** Display totals only. The server recomputes everything from the database at checkout. */
export function cartTotals(lines: CartLine[], find: (slug: string) => CatalogProduct | undefined) {
  const live = lines.filter((l) => find(l.slug));
  const subtotal = live.reduce((sum, l) => sum + (find(l.slug)?.price ?? 0) * l.qty, 0);
  const count = live.reduce((n, l) => n + l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 150 ? 0 : 12;
  return { subtotal, count, shipping, total: subtotal + shipping };
}
