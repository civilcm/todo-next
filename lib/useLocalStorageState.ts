"use client";

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;

const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  // Sync across browser tabs as well.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

// getSnapshot must return a stable reference while the underlying raw
// string is unchanged, otherwise useSyncExternalStore re-renders forever.
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T;
  try {
    value = raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    value = fallback;
  }
  snapshotCache.set(key, { raw, value });
  return value;
}

export function useLocalStorageState<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      localStorage.setItem(key, JSON.stringify(resolved));
      emit();
    },
    [key, fallback],
  );

  return [value, setValue] as const;
}

export function useMediaQuery(query: string): boolean {
  const subscribeMedia = useCallback(
    (listener: Listener) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribeMedia,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
