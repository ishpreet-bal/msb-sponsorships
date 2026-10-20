"use client";
import Link from "next/link";
import { useMemo } from "react";
import { allOpportunities } from "@/lib/data";
import { useTeam } from "@/lib/team";
import { STATUS_LABEL, type Status } from "@/lib/types";
import { StatusBadge, daysSince, shortDate } from "@/components/Badges";

const items = allOpportunities();
const bySlug = new Map(items.map((o) => [o.slug, o]));

export default function Tracker() {
  const t = useTeam();

  const rows = useMemo(
    () =>
      items
        .map((o) => ({ o, s: t.statusOf(o.slug), row: t.outreachOf(o.slug), sent: t.logFor(o.slug).find((l) => l.action === "sent") }))
        .filter((r) => r.s !== "not-started")
        .sort((a, b) => Date.parse(b.row?.updated_at ?? "0") - Date.parse(a.row?.updated_at ?? "0")),
    [t],
  );

  const followUps = rows.filter((r) => r.s === "contacted" && r.sent && daysSince(r.sent.created_at) >= 7);

  return (
    <div className="py-10">
      <h1 className="font-display text-3xl font-extrabold">Tracker</h1>
      <p className="mt-2 text-muted">Everything the team has started on, and who did what.</p>

      {followUps.length > 0 && (
        <section className="mt-6 rounded-2xl border-2 border-phulkari bg-phulkari-soft p-5">
          <h2 className="font-display text-lg font-semibold text-phulkari">Follow-ups due ({followUps.length})</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {followUps.map(({ o, sent }) => (
              <li key={o.slug}>
                <Link href={`/o/${o.slug}`} className="font-semibold underline">{o.name}</Link>{" "}
                <span className="text-muted">emailed by {sent!.actor} {daysSince(sent!.created_at)} days ago</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="p-3">Opportunity</th>
              <th className="p-3">Status</th>
              <th className="p-3">Last emailed</th>
              <th className="p-3">Last update</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ o, s, row, sent }) => (
              <tr key={o.slug} className="border-b border-line last:border-0">
                <td className="p-3"><Link href={`/o/${o.slug}`} className="font-medium hover:text-phulkari">{o.name}</Link></td>
                <td className="p-3"><StatusBadge s={s} /></td>
                <td className="p-3 text-muted">{sent ? `${shortDate(sent.created_at)} by ${sent.actor}` : "Not yet"}</td>
                <td className="p-3 text-muted">{row ? `${shortDate(row.updated_at)}${row.updated_by ? ` by ${row.updated_by}` : ""}` : ""}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted">Nothing started yet. Open an opportunity and send the first email.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">Recent activity</h2>
        <ol className="mt-3 space-y-2 text-sm">
          {t.log.slice(0, 60).map((l) => (
            <li key={l.id} className="flex flex-wrap gap-x-2">
              <span className="w-28 shrink-0 text-xs text-muted">{new Date(l.created_at).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              <span>
                <strong>{l.actor ?? "Someone"}</strong>{" "}
                {l.action === "sent" ? "emailed" : l.action === "status" ? `marked "${STATUS_LABEL[(l.status ?? "not-started") as Status]}" on` : "added a note on"}{" "}
                <Link className="underline" href={`/o/${l.slug}`}>{bySlug.get(l.slug)?.name ?? l.slug}</Link>
                {l.note ? <span className="text-muted">: {l.note}</span> : null}
              </span>
            </li>
          ))}
          {!t.log.length && <li className="text-muted">No activity yet.</li>}
        </ol>
      </section>
    </div>
  );
}
