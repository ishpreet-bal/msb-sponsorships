import Link from "next/link";
import { MONITOR } from "@/lib/monitor";
import { allOpportunities } from "@/lib/data";

export const metadata = { title: "Updates · MSB Sponsorships" };

const names = new Map(allOpportunities().map((o) => [o.slug, o.name]));

function fmt(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default function Updates() {
  const m = MONITOR;
  const pages = Object.entries(m.pages);
  const changed = pages.filter(([, p]) => p.status === "changed").sort((a, b) => (b[1].lastChanged ?? "").localeCompare(a[1].lastChanged ?? ""));
  const broken = pages.filter(([, p]) => p.status === "broken");
  const leads = m.leads.slice(0, 80);

  return (
    <div className="py-10">
      <h1 className="font-display text-3xl font-extrabold">Updates</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every Monday and Thursday a free check (no AI) re-reads each opportunity&apos;s page and scans news and McMaster and Hamilton
        feeds for new funding. {m.updated ? <>Last run {fmt(m.updated)}.</> : <>It hasn&apos;t run yet; the first run is the next Monday or Thursday morning.</>}
      </p>

      {m.updated && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Pages checked", m.summary.pagesChecked],
            ["Pages changed", changed.length],
            ["Broken links", broken.length],
            ["New leads (last run)", m.summary.newLeads],
          ].map(([l, v]) => (
            <div key={l as string} className="rounded-xl border border-line bg-card p-4">
              <div className="font-display text-3xl font-extrabold">{v}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">{l}</div>
            </div>
          ))}
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">New leads to look at</h2>
        <p className="mt-1 text-sm text-muted">
          Headlines that mention grants, sponsors or South Asian cultural events. Skim them, and if one is worth pursuing, ask the
          sponsorship lead to add it as an opportunity.
        </p>
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-card">
          {leads.map((l) => (
            <li key={l.link} className="p-3 text-sm">
              <a href={l.link} target="_blank" rel="noreferrer" className="font-medium hover:text-phulkari">{l.title}</a>
              <div className="text-xs text-muted">
                {l.source}{l.published ? ` · ${fmt(l.published)}` : ""} · found {fmt(l.found)}
              </div>
            </li>
          ))}
          {!leads.length && <li className="p-6 text-center text-sm text-muted">No leads yet.</li>}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Pages that changed</h2>
        <p className="mt-1 text-sm text-muted">The page behind these opportunities changed since the last check. That often means a new deadline or a new funding cycle, so open it and update the entry.</p>
        <ul className="mt-4 space-y-2">
          {changed.map(([slug, p]) => (
            <li key={slug} className="rounded-xl border border-line bg-card p-3 text-sm">
              <Link href={`/o/${slug}`} className="font-semibold hover:text-phulkari">{names.get(slug) ?? slug}</Link>
              <span className="text-muted"> · changed {fmt(p.lastChanged)}</span>
              {!!p.deadlineHints?.length && <div className="mt-1 text-xs">Dates on the page: {p.deadlineHints.join(", ")}</div>}
              <a href={p.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-xs text-indigo underline">{p.url}</a>
            </li>
          ))}
          {!changed.length && <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">Nothing changed.</li>}
        </ul>
      </section>

      {broken.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Broken links</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {broken.map(([slug, p]) => (
              <li key={slug}>
                <Link href={`/o/${slug}`} className="font-medium hover:text-phulkari">{names.get(slug) ?? slug}</Link>{" "}
                <span className="text-muted">({p.httpStatus}) {p.url}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
