export const metadata = { title: "Guide · MSB Funding Hub" };

const steps = [
  ["Fill in the club profile", "Add your name, the club email and last year's numbers (members, attendance, followers). Every email uses them."],
  ["Hit the deadlines first", "The dark box on the home page lists deadlines in the next 60 days. McMaster funds (USIF, SLEF) are the easiest money — apply every term."],
  ["Send personalized emails", "Open a sponsor, pick Cash ask or In-kind ask, edit the [brackets], attach the sponsorship package and click Open in Outlook — it opens a ready-to-send draft in the msb@mcmaster.ca inbox (sign in to Outlook with the club account first)."],
  ["Track status", "Set each opportunity's status (Contacted, Follow up, Won…). Follow up after 7–10 days with the Follow-up template."],
  ["Get MSU sign-off", "Before accepting money, loop in the MSU Clubs Administrator. Execs can't sign sponsorship contracts themselves."],
];

export default function Guide() {
  return (
    <div className="max-w-3xl py-10">
      <h1 className="font-display text-3xl font-extrabold">How to use the Funding Hub</h1>
      <ol className="mt-6 space-y-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-4 rounded-xl border border-line bg-card p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-saffron font-bold text-white">{i + 1}</span>
            <div>
              <h2 className="font-semibold">{t}</h2>
              <p className="text-sm text-muted">{d}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 font-display text-2xl font-semibold">How new opportunities get added</h2>
      <p className="mt-2 text-sm leading-relaxed">
        A scheduled research job runs every week. It searches the web for new grants, cultural-event sponsorships and
        South Asian community sponsors in Ontario and Canada, checks deadlines on existing entries, and adds anything new
        to <code className="rounded bg-line px-1">data/opportunities.json</code> in the GitHub repo. Vercel redeploys
        automatically, and new entries show a <span className="chip bg-saffron text-white">New</span> badge (filter with
        &quot;Auto-found&quot;).
      </p>

      <h2 className="mt-10 font-display text-2xl font-semibold">Adding or fixing an entry by hand</h2>
      <p className="mt-2 text-sm leading-relaxed">
        Edit <code className="rounded bg-line px-1">data/opportunities.json</code> on GitHub (pencil icon), copy an
        existing entry, change the fields and commit. The site updates in about a minute.
      </p>

      <h2 className="mt-10 font-display text-2xl font-semibold">Outreach tips that work</h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
        <li>Lead with what the sponsor gets: audience, logo placement, reels, on-stage shoutouts.</li>
        <li>Local businesses say yes to in-kind far more often than cash — ask for both.</li>
        <li>Big companies (Microsoft, Deloitte, banks) fund through employees: find McMaster alumni there on LinkedIn.</li>
        <li>Send Tuesday–Thursday mornings. Follow up once after a week.</li>
        <li>Always send a thank-you and a post-event recap with photos — that&apos;s how sponsors renew.</li>
      </ul>
    </div>
  );
}
