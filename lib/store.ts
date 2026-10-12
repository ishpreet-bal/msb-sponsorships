"use client";
import { useEffect, useState, useCallback } from "react";
import { DEFAULT_PROFILE, type ClubProfile, type Status } from "./types";

// Per-browser storage. Wrapped in try/catch so the site works in private mode.
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("msb-store"));
  } catch {}
}

function useStored<T>(key: string, fallback: T) {
  const [val, setVal] = useState<T>(fallback);
  useEffect(() => {
    const sync = () => setVal(read(key, fallback));
    sync();
    window.addEventListener("msb-store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("msb-store", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((next: T) => write(key, next), [key]);
  return [val, set] as const;
}

export function useProfile() {
  const [p, set] = useStored<ClubProfile>("msb-profile", DEFAULT_PROFILE);
  return [{ ...DEFAULT_PROFILE, ...p }, set] as const;
}

export function useStatuses() {
  return useStored<Record<string, Status>>("msb-status", {});
}

export function useNotes(slug: string) {
  return useStored<Record<string, string>>(`msb-notes-${slug}`, {});
}
