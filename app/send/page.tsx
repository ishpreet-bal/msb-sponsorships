export const metadata = { title: "Send in bulk · MSB Sponsorships" };

const steps: { title: string; body: React.ReactNode }[] = [
  {
    title: "Get the send file",
    body: (
      <>
        Ask the sponsorship lead (or Claude) for the latest <strong>MSB_Outreach.xlsx</strong>. It has one personalized email per
        sponsor. Open it, read the emails in the <em>Body</em> column, and type <strong>Yes</strong> in the yellow <em>Send</em> column
        for every one you approve. Rows marked &quot;Double-check before sending&quot; need the contact confirmed first.
      </>
    ),
  },
  {
    title: "Put it in your McMaster OneDrive",
    body: (
      <>
        Upload the file to OneDrive using your McMaster account, for example into a folder called <code>MSB</code>. Don&apos;t rename
        the table (<code>Outreach</code>) or any column headers, because the flow finds them by name.
      </>
    ),
  },
  {
    title: "Create the flow",
    body: (
      <>
        Go to <a className="underline" href="https://make.powerautomate.com" target="_blank" rel="noreferrer">make.powerautomate.com</a> and sign
        in with your McMaster account. Choose <em>Create</em> → <em>Instant cloud flow</em> → <em>Manually trigger a flow</em>, and name it
        &quot;MSB sponsor outreach&quot;.
      </>
    ),
  },
  {
    title: "Read the rows",
    body: (
      <>
        Add the action <strong>Excel Online (Business) → List rows present in a table</strong>. Location: <em>OneDrive for Business</em>,
        Document Library: <em>OneDrive</em>, File: <code>/MSB/MSB_Outreach.xlsx</code>, Table: <code>Outreach</code>.
      </>
    ),
  },
  {
    title: "Loop through them and check each row",
    body: (
      <>
        Add <strong>Apply to each</strong> and pick <em>value</em> from the previous step. Inside it, add a <strong>Condition</strong>:
        <em> Send</em> is equal to <code>Yes</code>, <strong>and</strong> <em>Status</em> is equal to (leave the right side empty). This
        skips anything not approved or already sent, so it&apos;s safe to run the flow again later.
      </>
    ),
  },
  {
    title: "Send the email (in the 'True' branch)",
    body: (
      <>
        Add <strong>Office 365 Outlook → Send an email (V2)</strong>. To: <em>To</em>. Subject: <em>Subject</em>. For Body, click the{" "}
        <code>&lt;/&gt;</code> code view button first, then insert <em>BodyHTML</em> so the paragraphs keep their spacing. To send from the
        club inbox instead of your own, use <strong>Send an email from a shared mailbox (V2)</strong> with Original Mailbox Address{" "}
        <code>msb@mcmaster.ca</code> (this only works if your account has Send As access to it). Attach the sponsorship package PDF under
        Attachments if you have it in OneDrive.
      </>
    ),
  },
  {
    title: "Mark it as sent, then pause",
    body: (
      <>
        Still in the True branch, add <strong>Excel Online (Business) → Update a row</strong> with the same file and table. Key Column:{" "}
        <code>Slug</code>, Key Value: <em>Slug</em>, and set Status to <code>Sent</code>. Then add <strong>Delay</strong> of 1 minute so the
        emails go out spaced apart. Sending dozens at once from a university account can get them flagged as spam.
      </>
    ),
  },
  {
    title: "Test with one row, then run it",
    body: (
      <>
        Change one row&apos;s <em>To</em> to your own email, set Send to Yes on only that row, save and click <em>Test</em> → <em>Manually</em>.
        Check how it looks in your inbox. Once it looks right, put the real address back, mark the rows you approve, and run it again. At 1
        minute apart, 80 emails take a little over an hour, and you can close the tab while it runs.
      </>
    ),
  },
  {
    title: "Update the tracker",
    body: (
      <>
        When the flow finishes, the Status column shows which emails went out. Mark them as <em>Emailed</em> on each opportunity page, or send
        the finished file to Claude and it will update the tracker for everyone. Replies come straight to whichever inbox sent them.
      </>
    ),
  },
];

export default function SendGuide() {
  return (
    <div className="max-w-3xl py-10">
      <h1 className="font-display text-3xl font-extrabold">Send outreach in bulk</h1>
      <p className="mt-2 text-muted">
        McMaster email doesn&apos;t allow outside apps to send on your behalf, but Power Automate is Microsoft&apos;s own tool and works with
        your McMaster account. You set this up once, and after that each round of outreach is one click.
      </p>
      <ol className="mt-6 space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-xl border border-line bg-card p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-saffron font-bold text-white">{i + 1}</span>
            <div>
              <h2 className="font-semibold">{s.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-8 rounded-xl border-l-4 border-saffron bg-saffron-soft p-4 text-sm">
        If Power Automate says it needs admin approval, McMaster has blocked it for your account. Use the <em>Open in Outlook</em> button on
        each opportunity page instead, which opens the same email ready to send.
      </p>
    </div>
  );
}
