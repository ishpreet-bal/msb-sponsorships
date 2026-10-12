import raw from "@/data/opportunities.json";
import type { Opportunity } from "./types";

const db = raw as { updated: string; opportunities: Opportunity[] };

export const UPDATED = db.updated;

export function allOpportunities(): Opportunity[] {
  return [...db.opportunities].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const da = a.deadlineDate ? Date.parse(a.deadlineDate) : Infinity;
    const dbb = b.deadlineDate ? Date.parse(b.deadlineDate) : Infinity;
    if (da !== dbb) return da - dbb;
    return a.name.localeCompare(b.name);
  });
}

export function getOpportunity(slug: string) {
  return db.opportunities.find((o) => o.slug === slug);
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const ms = Date.parse(date + "T23:59:59") - Date.now();
  return Math.ceil(ms / 86400000);
}
