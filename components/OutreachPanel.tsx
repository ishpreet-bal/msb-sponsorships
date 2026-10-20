"use client";
import { useState } from "react";
import { useTeam } from "@/lib/team";
import { STATUS_LABEL, STATUS_ORDER, type Status } from "@/lib/types";
import { StatusBadge, daysSince, shortDate } from "./Badges";

export default function OutreachPanel({ slug }: { slug: string }) {
  const t = useTeam();
  const status = t.statusOf(slug);
  const row = t.outreachOf(slug);
  const log = t.logFor(slug);
  const lastSend = log.find((l) => l.action === "sent");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const set = async (s: Status) => {
    setBusy(true);
    try {
      await t.setStatus(slug, s);
    } finally {
      setBusy(false);
    }
  };

  const headline =
    status === "not-started"
      ? "Nobody has reached out yet."
      : lastSend
        ? `Emailed by ${lastSend.actor ?? "someone"} on ${shortDate(lastSend.created_at)}${lastSend.to_email ? ` to ${lastSend.to_email}` : ""}.`
        : row
          ? `Marked "${STATUS_LABEL[status]}" by ${row.updated_by ?? "someone"} on ${shortDate(row.updated_at)}.`
          : "";

  return (
    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="label !mb-2">Where this stands</h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge s={status} big />
            <span className="text-sm">{headline}</span>
          </div>
          {status === "contacted" && lastSend && daysSince(lastSend.created_at) >= 7 && (
            <p className="mt-2 text-sm font-semibold text-phulkari">
              It has been {daysSince(lastSend.created_at)} days. Send the follow-up email below.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            disabled={busy || s === status}
            onClick={() => set(s)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              s === status ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <details className="mt-5" open={log.length > 0 && log.length <= 6}>
        <summary className="cursor-pointer text-sm font-semibold">History ({log.length})</summary>
        <ol className="mt-3 space-y-2 border-l-2 border-line pl-4 text-sm">
          {log.map((l) => (
            <li key={l.id}>
              <span className="text-xs text-muted">{new Date(l.created_at).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              <div>
                <strong>{l.actor ?? "Someone"}</strong>{" "}
                {l.action === "sent" && <>sent an email{l.to_email ? ` to ${l.to_email}` : ""}{l.sender_email ? ` from ${l.sender_email}` : ""}{l.subject ? `: "${l.subject}"` : ""}</>}
                {l.action === "status" && <>set status to <em>{STATUS_LABEL[(l.status ?? "not-started") as Status]}</em></>}
                {l.action === "note" && <>added a note</>}
                {l.note && <p className="mt-0.5 whitespace-pre-wrap text-muted">{l.note}</p>}
              </div>
            </li>
          ))}
          {!log.length && <li className="text-muted">No activity yet.</li>}
        </ol>
        <form
          className="mt-3 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!note.trim()) return;
            setBusy(true);
            try {
              await t.addNote(slug, note.trim());
              setNote("");
            } finally {
              setBusy(false);
            }
          }}
        >
          <input className="input" placeholder="Add a note, e.g. 'They replied, call on Friday'" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-ghost shrink-0" disabled={busy || !note.trim()}>Add</button>
        </form>
      </details>
    </section>
  );
}
