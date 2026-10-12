import { notFound } from "next/navigation";
import Link from "next/link";
import { allOpportunities, getOpportunity } from "@/lib/data";
import { DeadlineBadge, PriorityBadge, TypeBadge } from "@/components/Badges";
import Composer from "@/components/Composer";
import StatusPicker from "@/components/StatusPicker";
import QuestionDrafts from "@/components/QuestionDrafts";

export function generateStaticParams() {
  return allOpportunities().map((o) => ({ slug: o.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const o = getOpportunity(params.slug);
  return { title: o ? `${o.name} · MSB Funding Hub` : "Not found" };
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
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OpportunityPage({ params }: { params: { slug: string } }) {
  const o = getOpportunity(params.slug);
  if (!o) notFound();
  const isGrant = ["university", "government", "foundation"].includes(o.type);

  return (
    <article className="py-8">
      <Link href="/" className="text-sm text-muted hover:text-ink">← All opportunities</Link>

      <header className="mt-4 rounded-2xl border border-line bg-card p-5 sm:p-7">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <TypeBadge o={o} />
          <PriorityBadge p={o.priority} />
          <DeadlineBadge o={o} />
          {!o.verified && <span className="chip bg-line text-muted">Contact unverified</span>}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">{o.name}</h1>
            <p className="mt-2 max-w-2xl text-muted">{o.summary}</p>
          </div>
          <StatusPicker slug={o.slug} />
        </div>

        <dl className="mt-6 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="label">Amount</dt>
            <dd className="font-medium">{o.amount}</dd>
          </div>
          <div>
            <dt className="label">Deadline</dt>
            <dd className="font-medium">{o.deadline}</dd>
          </div>
          <div>
            <dt className="label">How to apply</dt>
            <dd className="flex flex-wrap gap-2">
              {o.applyUrl && (
                <a href={o.applyUrl} target="_blank" rel="noreferrer" className="btn-primary !py-1.5">
                  Open application ↗
                </a>
              )}
              {o.website && o.website !== o.applyUrl && (
                <a href={o.website} target="_blank" rel="noreferrer" className="btn-ghost !py-1.5">Website ↗</a>
              )}
              {!o.applyUrl && !o.email && (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(o.name + " sponsorship OR donation request contact Canada")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost !py-1.5"
                >
                  🔎 Find contact ↗
                </a>
              )}
            </dd>
          </div>
        </dl>
      </header>

      {o.notes && (
        <div className="mt-4 rounded-xl border-l-4 border-saffron bg-saffron-soft p-4 text-sm">
          <strong>Notes: </strong>
          {o.notes}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <section className="space-y-6 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">What it&apos;s made of</h2>
          {o.angle && (
            <div>
              <h3 className="label">Why they&apos;d fund MSB</h3>
              <p className="text-sm">{o.angle}</p>
            </div>
          )}
          <List title="Eligibility" items={o.eligibility} tone="bg-indigo" />
          <List title="What they fund" items={o.funds} tone="bg-leaf" />
          <List title="Won't fund" items={o.excludes} tone="bg-phulkari" />
          <List title="Documents to prepare" items={o.requiredDocs} tone="bg-saffron" />
          {o.sources?.length > 0 && (
            <div>
              <h3 className="label">Sources</h3>
              <ul className="space-y-1 text-xs">
                {o.sources.map((s) => (
                  <li key={s}>
                    <a href={s} target="_blank" rel="noreferrer" className="break-all text-indigo underline">{s}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-muted">Last checked {o.lastChecked}</p>
        </section>

        <div className="space-y-6">
          {o.questions?.length > 0 && <QuestionDrafts slug={o.slug} questions={o.questions} />}
          {(!isGrant || o.email) && <Composer o={o} />}
        </div>
      </div>
    </article>
  );
}
