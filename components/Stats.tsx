"use client";
import type { Opportunity } from "@/lib/types";
import { useTeam } from "@/lib/team";

export default function Stats({ items }: { items: Opportunity[] }) {
  const t = useTeam();
  const st = items.map((o) => t.statusOf(o.slug));
  const cards = [
    { label: "Opportunities", value: items.length, tone: "text-ink" },
    { label: "Not contacted yet", value: st.filter((s) => s === "not-started" || s === "drafted").length, tone: "text-muted" },
    { label: "Emailed or applied", value: st.filter((s) => ["contacted", "follow-up", "applied"].includes(s)).length, tone: "text-saffron-deep" },
    { label: "Won", value: st.filter((s) => s === "won").length, tone: "text-leaf" },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-line bg-card p-4">
          <div className={`font-display text-3xl font-extrabold ${c.tone}`}>{c.value}</div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
