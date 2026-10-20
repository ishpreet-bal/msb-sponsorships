import type { Opportunity, Status } from "@/lib/types";
import { STATUS_LABEL, TYPE_LABEL } from "@/lib/types";
import { daysUntil } from "@/lib/data";

const TYPE_STYLE: Record<string, string> = {
  university: "bg-indigo-soft text-indigo",
  government: "bg-leaf-soft text-leaf",
  foundation: "bg-phulkari-soft text-phulkari",
  corporate: "bg-saffron-soft text-saffron-deep",
  business: "bg-line text-ink",
};

export function TypeBadge({ o }: { o: Opportunity }) {
  return <span className={`chip ${TYPE_STYLE[o.type]}`}>{TYPE_LABEL[o.type]}</span>;
}

export function PriorityBadge({ p }: { p: number }) {
  if (p === 1) return <span className="chip bg-phulkari text-white">★ Top priority</span>;
  if (p === 2) return <span className="chip border border-saffron text-saffron-deep">Good fit</span>;
  return null;
}

export function DeadlineBadge({ o }: { o: Opportunity }) {
  const d = daysUntil(o.deadlineDate);
  if (d === null) return <span className="chip border border-line bg-card text-muted">{o.deadline.length < 22 ? o.deadline : "Rolling / see details"}</span>;
  if (d < 0) return <span className="chip bg-line text-muted">Deadline passed</span>;
  return (
    <span className={`chip ${d <= 21 ? "bg-phulkari-soft text-phulkari" : "bg-leaf-soft text-leaf"}`}>
      {d === 0 ? "Due today" : `${d} days left`}
    </span>
  );
}

export const STATUS_STYLE: Record<Status, string> = {
  "not-started": "bg-card border border-line text-muted",
  drafted: "bg-indigo-soft text-indigo",
  contacted: "bg-saffron text-white",
  "follow-up": "bg-phulkari text-white",
  applied: "bg-indigo text-white",
  won: "bg-leaf text-white",
  declined: "bg-line text-muted",
};

export const STATUS_BORDER: Record<Status, string> = {
  "not-started": "border-l-line",
  drafted: "border-l-indigo",
  contacted: "border-l-saffron",
  "follow-up": "border-l-phulkari",
  applied: "border-l-indigo",
  won: "border-l-leaf",
  declined: "border-l-muted",
};

export function StatusBadge({ s, big = false }: { s: Status; big?: boolean }) {
  const icon = s === "won" ? "✓ " : s === "contacted" || s === "applied" ? "✉ " : s === "declined" ? "✕ " : "";
  return <span className={`chip ${STATUS_STYLE[s]} ${big ? "!px-3 !py-1 !text-sm" : ""}`}>{icon}{STATUS_LABEL[s]}</span>;
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export function daysSince(iso: string) {
  return Math.floor((Date.now() - Date.parse(iso)) / 86400000);
}
