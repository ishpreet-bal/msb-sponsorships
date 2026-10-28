export const metadata = { title: "Guide · MSB Sponsorships" };

const steps = [
  ["Pick who you are", "Use the \"Sending as\" menu at the top. If you aren't listed, add yourself on the Club & senders page with your role, the email you send from, and a short personal line."],
  ["Keep the club details current", "Showcase date, attendance, member count and Instagram numbers live on the Club & senders page. Everyone shares them, and every email pulls them in."],
  ["Start with deadlines", "The dark box on the home page lists deadlines in the next 60 days. McMaster funds like USIF and SLEF are the most reliable money, so apply every term."],
  ["Send the email", "Open an opportunity, check the research, pick the type of email, read it over and click Open in Outlook. Once you've sent it, click \"Yes, mark as emailed\" so the team knows."],
  ["Follow up", "Anything emailed more than 7 days ago without an update shows up under Follow-ups due on the Tracker page. The Follow-up email is written for you."],
  ["Get MSU sign-off", "Before accepting money, loop in the MSU Clubs Administrator. Execs can't sign sponsorship contracts themselves."],
];

export default function Guide() {
  return (
    <div className="max-w-3xl py-10">
      <h1 className="font-display text-3xl font-extrabold">How to use this site</h1>
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
        A free check runs on GitHub every Monday and Thursday morning (no AI, no cost). It re-reads every opportunity&apos;s
        page and flags the ones that changed, which usually means a new deadline or funding cycle, and it scans news searches
        and McMaster and Hamilton feeds for new grants and sponsors. Everything it finds shows on the Updates page. To add a
        feed or a search phrase, edit <code className="rounded bg-line px-1">data/feeds.json</code> in the repo.
      </p>

      <h2 className="mt-10 font-display text-2xl font-semibold">Adding or fixing an entry by hand</h2>
      <p className="mt-2 text-sm leading-relaxed">
        Edit <code className="rounded bg-line px-1">data/opportunities.json</code> in the GitHub repo, copy an existing
        entry, change the fields and commit. The site updates in about a minute.
      </p>

      <h2 className="mt-10 font-display text-2xl font-semibold">What gets a yes</h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
        <li>Lead with what the sponsor gets: the audience, logo placement, performance videos and a shoutout on stage.</li>
        <li>Local businesses say yes to in-kind far more often than cash, so use the In-kind ask for small shops and restaurants.</li>
        <li>Big companies tend to fund through their employees. Look for McMaster alumni there on LinkedIn and ask them to pass it along.</li>
        <li>Send Tuesday to Thursday mornings, and follow up once after a week.</li>
        <li>Send every sponsor a thank-you and a recap with photos after the show. That is how sponsors come back the next year.</li>
      </ul>
    </div>
  );
}
