import { notFound } from "next/navigation";
import Link from "next/link";
import { allOpportunities, getOpportunity } from "@/lib/data";
import { clean } from "@/lib/email";
import { DeadlineBadge, PriorityBadge, TypeBadge } from "@/components/Badges";
import Composer from "@/components/Composer";
import OutreachPanel from "@/components/OutreachPanel";
import QuestionDrafts from "@/components/QuestionDrafts";

export function generateStaticParams() {
  return allOpportunities().map((o) => ({ slug: o.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const o = getOpportunity(params.slug);
  return { title: o ? `${o.name} · MSB Sponsorships` : "Not found" };
}

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="label">{title}</h3>
      <ul className="space-y-1.5 text-sm">
        {items.map((x) => (
          <li key={x} className="flex gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />
            <span>{clean(x)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FIT_STYLE = { high: "bg-leaf text-white", medium: "bg-saffron text-white", low: "bg-line text-muted" } as const;

export default function OpportunityPage({ params }: { params: { slug: string } }) {
  const o = getOpportunity(params.slug);
  if (!o) notFound();
  const r = o.research;
  const allSources = Array.from(new Set([...(r?.sources ?? []), ...(o.sources ?? [])]));

  return (
    <article className="py-8">
      <Link href="/" className="text-sm text-muted hover:text-ink">← All opportunities</Link>

      <header className="mt-4 rounded-2xl border border-line bg-card p-5 sm:p-7">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <TypeBadge o={o} />
          <PriorityBadge p={o.priority} />
          <DeadlineBadge o={o} />
          {r && <span className={`chip ${FIT_STYLE[r.fit]}`}>{r.fit === "high" ? "Strong fit" : r.fit === "medium" ? "Possible fit" : "Long shot"}</span>}
          {!o.verified && !r && <span className="chip bg-line text-muted">Contact unverified</span>}
        </div>
        <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">{o.name}</h1>
        <p className="mt-2 max-w-3xl text-muted">{clean(r?.about || o.summary)}</p>

        <dl className="mt-6 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="label">Amount</dt>
            <dd className="font-medium">{clean(o.amount)}</dd>
          </div>
          <div>
            <dt className="label">Deadline</dt>
            <dd className="font-medium">{clean(o.deadline)}</dd>
          </div>
          <div>
            <dt className="label">How to reach them</dt>
            <dd className="space-y-2">
              {o.email && <div className="font-medium">✉ {o.email}</div>}
              {o.contact?.name && <div>Contact: {o.contact.name}</div>}
              {(o.contact?.route || r?.contactRoute) && <div className="text-muted">{clean(o.contact?.route || r!.contactRoute)}</div>}
              {o.contact && ["low", "unknown"].includes(o.contact.confidence) && (
                <div className="chip bg-phulkari-soft text-phulkari">Double-check this contact before sending</div>
              )}
              <div className="flex flex-wrap gap-2">
                {o.applyUrl && (
                  <a href={o.applyUrl} target="_blank" rel="noreferrer" className="btn-primary !py-1.5">
                    {o.applyMethod === "email" ? "Program page ↗" : "Open application ↗"}
                  </a>
                )}
                {o.website && o.website !== o.applyUrl && (
                  <a href={o.website} target="_blank" rel="noreferrer" className="btn-ghost !py-1.5">Website ↗</a>
                )}
                {!o.applyUrl && !o.email && (
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(o.name + " sponsorship OR donation request contact")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost !py-1.5"
                  >
                    Search for a contact ↗
                  </a>
                )}
              </div>
            </dd>
          </div>
        </dl>
      </header>

      <div className="mt-4">
        <OutreachPanel slug={o.slug} />
      </div>

      {o.notes && (
        <div className="mt-4 rounded-xl border-l-4 border-saffron bg-saffron-soft p-4 text-sm">
          <strong>Notes: </strong>
          {clean(o.notes)}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="space-y-6 self-start rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Research</h2>
          {r ? (
            <>
              <div>
                <h3 className="label">Why they would fund MSB</h3>
                <p className="text-sm">{clean(r.connection)}</p>
                {r.fitReason && <p className="mt-2 text-sm text-muted">{clean(r.fitReason)}</p>}
              </div>
              <div>
                <h3 className="label">Suggested ask</h3>
                <p className="text-sm font-medium">{clean(r.ask)}</p>
              </div>
              <List title="What they have supported before" items={r.givingHistory} tone="bg-leaf" />
              {r.contactName && (
                <div>
                  <h3 className="label">Who to address</h3>
                  <p className="text-sm">{r.contactName}</p>
                </div>
              )}
            </>
          ) : (
            <div>
              <h3 className="label">Why they would fund MSB</h3>
              <p className="text-sm">{clean(o.angle || o.summary)}</p>
              <p className="mt-2 text-xs text-muted">Not researched in depth yet. The automatic search works through these over time.</p>
            </div>
          )}
          <List title="Eligibility" items={o.eligibility} tone="bg-indigo" />
          <List title="What they fund" items={o.funds} tone="bg-leaf" />
          <List title="Won't fund" items={o.excludes} tone="bg-phulkari" />
          <List title="Documents to prepare" items={o.requiredDocs} tone="bg-saffron" />
          {allSources.length > 0 && (
            <div>
              <h3 className="label">Sources</h3>
              <ul className="space-y-1 text-xs">
                {allSources.map((s) => (
                  <li key={s}>
                    <a href={s} target="_blank" rel="noreferrer" className="break-all text-indigo underline">{s}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-muted">Last checked {r?.researchedOn ?? o.lastChecked}</p>
        </section>

        <div className="space-y-6">
          {o.questions?.length > 0 && <QuestionDrafts slug={o.slug} questions={o.questions.map(clean)} />}
          <Composer o={o} />
        </div>
      </div>
    </article>
  );
}
