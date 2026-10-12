export const revalidate = 3600;

import Explorer from "@/components/Explorer";
import Stats from "@/components/Stats";
import { allOpportunities, daysUntil } from "@/lib/data";
import Link from "next/link";

export default function Home() {
  const items = allOpportunities();
  const upcoming = items
    .filter((o) => {
      const d = daysUntil(o.deadlineDate);
      return d !== null && d >= 0 && d <= 60;
    })
    .sort((a, b) => Date.parse(a.deadlineDate!) - Date.parse(b.deadlineDate!));

  return (
    <>
      <section className="py-10 sm:py-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-phulkari">McMaster School of Bhangra</p>
        <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
          Every dollar that keeps the <span className="text-saffron">dhol</span> going — in one place.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Grants, sponsors and application details for MSB, with ready-to-send personalized outreach emails.
          New opportunities are found and added automatically every week.
        </p>
        <Stats items={items} />
      </section>

      {upcoming.length > 0 && (
        <section className="mb-10 rounded-2xl bg-ink p-5 text-paper sm:p-6">
          <h2 className="mb-3 font-display text-xl font-semibold">⏳ Deadlines in the next 60 days</h2>
          <ul className="divide-y divide-white/10">
            {upcoming.map((o) => {
              const d = daysUntil(o.deadlineDate)!;
              return (
                <li key={o.slug}>
                  <Link href={`/o/${o.slug}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-saffron">
                    <span className="font-medium">{o.name}</span>
                    <span className={`chip shrink-0 ${d <= 21 ? "bg-phulkari text-white" : "bg-white/10"}`}>
                      {new Date(o.deadlineDate! + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" })} · {d}d
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Explorer items={items} />
    </>
  );
}
