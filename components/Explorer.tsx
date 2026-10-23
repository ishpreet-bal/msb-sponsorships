"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Opportunity, OppType, Status } from "@/lib/types";
import { TYPE_LABEL } from "@/lib/types";
import { useTeam } from "@/lib/team";
import { DeadlineBadge, PriorityBadge, STATUS_BORDER, StatusBadge, TypeBadge, daysSince, shortDate } from "./Badges";

type Bucket = "todo" | "active" | "won" | "closed" | "all";

const BUCKETS: { key: Bucket; label: string; match: (s: Status) => boolean }[] = [
  { key: "todo", label: "Not contacted yet", match: (s) => s === "not-started" || s === "drafted" },
  { key: "active", label: "In progress", match: (s) => s === "contacted" || s === "follow-up" || s === "applied" },
  { key: "won", label: "Won", match: (s) => s === "won" },
  { key: "closed", label: "Declined", match: (s) => s === "declined" },
  { key: "all", label: "Everything", match: () => true },
];

export default function Explorer({ items }: { items: Opportunity[] }) {
  const t = useTeam();
  const [bucket, setBucket] = useState<Bucket>("todo");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"" | "grants" | "sponsors">("");
  const [type, setType] = useState<OppType | "">("");
  const [emailOnly, setEmailOnly] = useState(false);
  const [researchedOnly, setResearchedOnly] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { todo: 0, active: 0, won: 0, closed: 0, all: items.length };
    for (const o of items) {
      const s = t.statusOf(o.slug);
      for (const b of BUCKETS) if (b.key !== "all" && b.match(s)) c[b.key]++;
    }
    return c;
  }, [items, t]);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    const b = BUCKETS.find((x) => x.key === bucket)!;
    return items.filter((o) => {
      if (!b.match(t.statusOf(o.slug))) return false;
      if (kind === "grants" && !["university", "government", "foundation"].includes(o.type)) return false;
      if (kind === "sponsors" && !["corporate", "business"].includes(o.type)) return false;
      if (type && o.type !== type) return false;
      if (emailOnly && !o.email) return false;
      if (researchedOnly && !o.research) return false;
      if (needle && !`${o.name} ${o.industry} ${o.region} ${o.summary} ${o.research?.about ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [items, t, q, bucket, kind, type, emailOnly, researchedOnly]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap gap-2">
        {BUCKETS.map((b) => (
          <button
            key={b.key}
            onClick={() => setBucket(b.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              bucket === b.key ? "bg-ink text-paper" : "border border-line bg-card hover:border-ink"
            }`}
          >
            {b.label} <span className="ml-1 opacity-60">{counts[b.key]}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 grid gap-3 rounded-xl border border-line bg-card p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <input className="input" placeholder="Search name, industry, region…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="">Grants and sponsors</option>
          <option value="grants">Grants and funds only</option>
          <option value="sponsors">Sponsors only</option>
        </select>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as OppType | "")}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABEL).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-sm">
          <label className="flex items-center gap-1.5 whitespace-nowrap">
            <input type="checkbox" checked={emailOnly} onChange={(e) => setEmailOnly(e.target.checked)} /> Has email
          </label>
          <label className="flex items-center gap-1.5 whitespace-nowrap">
            <input type="checkbox" checked={researchedOnly} onChange={(e) => setResearchedOnly(e.target.checked)} /> Researched
          </label>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted">{filtered.length} shown</p>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((o) => {
          const s = t.statusOf(o.slug);
          const row = t.outreachOf(o.slug);
          const lastSend = t.logFor(o.slug).find((l) => l.action === "sent");
          const followDue = (s === "contacted") && lastSend && daysSince(lastSend.created_at) >= 7;
          return (
            <Link
              key={o.slug}
              href={`/o/${o.slug}`}
              className={`group flex flex-col rounded-xl border border-l-[6px] border-line ${STATUS_BORDER[s]} bg-card p-4 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[4px_4px_0_#1c1426]`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <StatusBadge s={s} />
                {row && s !== "not-started" && (
                  <span className="text-xs text-muted">
                    {row.updated_by ? `${row.updated_by}, ` : ""}{shortDate(row.updated_at)}
                  </span>
                )}
              </div>
              {followDue && (
                <p className="mb-2 rounded-md bg-phulkari-soft px-2 py-1 text-xs font-semibold text-phulkari">
                  Emailed {daysSince(lastSend!.created_at)} days ago with no update. Time to follow up.
                </p>
              )}
              <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-phulkari">{o.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{o.research?.about || o.summary}</p>
              <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
                <TypeBadge o={o} />
                <PriorityBadge p={o.priority} />
                <DeadlineBadge o={o} />
                {o.email && <span className="chip bg-leaf-soft text-leaf">✉ Email</span>}
                {!o.email && o.contact?.confidence === "form-only" && <span className="chip bg-indigo-soft text-indigo">Web form only</span>}
                {!o.email && o.contact?.confidence === "phone-only" && <span className="chip bg-line text-ink">Phone only</span>}
                {(o.applyMethod === "form" || o.applyMethod === "portal") && <span className="chip bg-indigo-soft text-indigo">Application form</span>}
                {o.research && <span className="chip bg-saffron-soft text-saffron-deep">Researched</span>}
                {o.source === "auto-search" && <span className="chip bg-saffron text-white">New</span>}
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">Nothing here with these filters.</p>
      )}
    </section>
  );
}
