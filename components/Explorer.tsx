"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Opportunity, OppType, Status } from "@/lib/types";
import { STATUS_LABEL, TYPE_LABEL } from "@/lib/types";
import { useStatuses } from "@/lib/store";
import { DeadlineBadge, PriorityBadge, StatusBadge, TypeBadge } from "./Badges";

type Tab = "all" | "grants" | "sponsors";

export default function Explorer({ items }: { items: Opportunity[] }) {
  const [statuses] = useStatuses();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [type, setType] = useState<OppType | "">("");
  const [status, setStatus] = useState<Status | "">("");
  const [emailOnly, setEmailOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return items.filter((o) => {
      const st = statuses[o.slug] ?? "not-started";
      if (tab === "grants" && !["university", "government", "foundation"].includes(o.type)) return false;
      if (tab === "sponsors" && !["corporate", "business"].includes(o.type)) return false;
      if (type && o.type !== type) return false;
      if (status && st !== status) return false;
      if (emailOnly && !o.email) return false;
      if (newOnly && o.source !== "auto-search") return false;
      if (needle && !`${o.name} ${o.industry} ${o.region} ${o.summary}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [items, statuses, q, tab, type, status, emailOnly, newOnly]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "grants", "sponsors"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t ? "bg-ink text-paper" : "bg-card border border-line hover:border-ink"
            }`}
          >
            {t === "all" ? "Everything" : t === "grants" ? "Grants & funds" : "Sponsors"}
          </button>
        ))}
      </div>

      <div className="mb-5 grid gap-3 rounded-xl border border-line bg-card p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <input className="input" placeholder="Search name, industry, region…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={type} onChange={(e) => setType(e.target.value as OppType | "")}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABEL).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Status | "")}>
          <option value="">Any status</option>
          {Object.entries(STATUS_LABEL).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>
        <div className="flex items-center gap-4 px-1 text-sm">
          <label className="flex items-center gap-1.5 whitespace-nowrap">
            <input type="checkbox" checked={emailOnly} onChange={(e) => setEmailOnly(e.target.checked)} /> Has email
          </label>
          <label className="flex items-center gap-1.5 whitespace-nowrap">
            <input type="checkbox" checked={newOnly} onChange={(e) => setNewOnly(e.target.checked)} /> Auto-found
          </label>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted">{filtered.length} opportunities</p>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((o) => (
          <Link
            key={o.slug}
            href={`/o/${o.slug}`}
            className="group flex flex-col rounded-xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[4px_4px_0_#1c1426]"
          >
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <TypeBadge o={o} />
              <PriorityBadge p={o.priority} />
              <DeadlineBadge o={o} />
              {o.source === "auto-search" && <span className="chip bg-saffron text-white">New</span>}
            </div>
            <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-phulkari">{o.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{o.summary}</p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 text-xs">
              <span className="text-muted">
                {o.region} · {o.amount.length > 40 ? o.amount.slice(0, 40) + "…" : o.amount}
              </span>
              <span className="flex items-center gap-1.5">
                {o.applyMethod === "email" && <span className="chip bg-leaf-soft text-leaf">✉ Email ready</span>}
                {(o.applyMethod === "form" || o.applyMethod === "portal") && <span className="chip bg-indigo-soft text-indigo">📝 Application</span>}
                {o.applyMethod === "find-contact" && <span className="chip bg-line text-muted">🔎 Find contact</span>}
                <StatusBadge s={statuses[o.slug] ?? "not-started"} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
