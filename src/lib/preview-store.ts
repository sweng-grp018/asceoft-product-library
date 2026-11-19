"use client";

import { useSyncExternalStore } from "react";

/** In-memory preview state survives navigation and resets on a full reload. */
export function createPreviewStore<T>(initialValue: T) {
  let value = initialValue;
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  function setValue(next: T | ((current: T) => T)) {
    value = typeof next === "function" ? (next as (current: T) => T)(value) : next;
    listeners.forEach((listener) => listener());
  }
  return {
    useValue: () =>
      useSyncExternalStore(
        subscribe,
        () => value,
        () => initialValue,
      ),
    setValue,
  };
}
