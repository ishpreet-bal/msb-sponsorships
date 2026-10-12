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
  if (d === null) return <span className="chip bg-card border border-line text-muted">{o.deadline.length < 22 ? o.deadline : "See details"}</span>;
  if (d < 0) return <span className="chip bg-line text-muted">Closed</span>;
  const urgent = d <= 21;
  return (
    <span className={`chip ${urgent ? "bg-phulkari-soft text-phulkari" : "bg-leaf-soft text-leaf"}`}>
      ⏳ {d === 0 ? "Due today" : `${d} days left`}
    </span>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  "not-started": "bg-card border border-line text-muted",
  drafted: "bg-indigo-soft text-indigo",
  contacted: "bg-saffron-soft text-saffron-deep",
  "follow-up": "bg-phulkari-soft text-phulkari",
  applied: "bg-indigo text-white",
  won: "bg-leaf text-white",
  declined: "bg-line text-muted line-through",
};

export function StatusBadge({ s }: { s: Status }) {
  return <span className={`chip ${STATUS_STYLE[s]}`}>{STATUS_LABEL[s]}</span>;
}
