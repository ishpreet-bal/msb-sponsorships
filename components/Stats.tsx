"use client";
import type { Opportunity } from "@/lib/types";
import { useStatuses } from "@/lib/store";

export default function Stats({ items }: { items: Opportunity[] }) {
  const [statuses] = useStatuses();
  const vals = Object.values(statuses);
  const cards = [
    { label: "Opportunities", value: items.length, tone: "text-ink" },
    { label: "Email-ready", value: items.filter((o) => o.email).length, tone: "text-leaf" },
    { label: "Contacted / applied", value: vals.filter((s) => ["contacted", "follow-up", "applied"].includes(s)).length, tone: "text-saffron-deep" },
    { label: "Won", value: vals.filter((s) => s === "won").length, tone: "text-phulkari" },
  ];
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-line bg-card p-4">
          <div className={`font-display text-3xl font-extrabold ${c.tone}`}>{c.value}</div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
