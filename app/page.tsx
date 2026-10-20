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
      <section className="py-8 sm:py-10">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Sponsorships and funding</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Find who to reach out to, send a personalized email, and keep track of where every sponsor and application stands.
        </p>
        <Stats items={items} />
      </section>

      {upcoming.length > 0 && (
        <section className="mb-8 rounded-2xl bg-ink p-5 text-paper sm:p-6">
          <h2 className="mb-3 font-display text-xl font-semibold">Deadlines in the next 60 days</h2>
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
