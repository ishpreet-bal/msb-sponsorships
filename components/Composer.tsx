"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { useProfile, useStatuses } from "@/lib/store";
import { buildEmail, gmailLink, mailtoLink, outlookLink, type Variant } from "@/lib/email";

export default function Composer({ o }: { o: Opportunity }) {
  const [profile] = useProfile();
  const [statuses, setStatuses] = useStatuses();
  const [variant, setVariant] = useState<Variant>("intro");
  const generated = useMemo(() => buildEmail(o, profile, variant), [o, profile, variant]);
  const [to, setTo] = useState(o.email);
  const [subject, setSubject] = useState(generated.subject);
  const [body, setBody] = useState(generated.body);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSubject(generated.subject);
    setBody(generated.body);
  }, [generated]);

  const profileIncomplete = !profile.senderName || !profile.senderEmail;

  const markDrafted = () => {
    if (!statuses[o.slug] || statuses[o.slug] === "not-started") setStatuses({ ...statuses, [o.slug]: "contacted" });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <section className="rounded-2xl border-2 border-ink bg-card p-5 shadow-[6px_6px_0_#e8891c] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">✉ Personalized outreach</h2>
        <div className="flex rounded-lg border border-line p-0.5 text-xs font-semibold">
          {(["intro", "in-kind", "follow-up"] as Variant[]).map((v) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              className={`rounded-md px-2.5 py-1 ${variant === v ? "bg-ink text-paper" : "hover:bg-paper"}`}
            >
              {v === "intro" ? "Cash ask" : v === "in-kind" ? "In-kind ask" : "Follow-up"}
            </button>
          ))}
        </div>
      </div>

      {profileIncomplete && (
        <p className="mb-4 rounded-lg bg-phulkari-soft p-3 text-sm text-phulkari">
          Fill in your <Link href="/profile" className="font-semibold underline">club profile</Link> (your name, email, stats) — every email updates automatically.
        </p>
      )}

      <label className="label">To</label>
      <input className="input mb-3" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Find and paste their contact email" />
      <label className="label">Subject</label>
      <input className="input mb-3" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <label className="label">Message</label>
      <textarea className="input min-h-[360px] font-mono text-[13px] leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />
      <p className="mt-1 text-xs text-muted">Edit anything in [brackets] before sending. Attach your sponsorship package PDF.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(() => {
          const outlookFirst = !profile.senderEmail || !/gmail\.com$/i.test(profile.senderEmail);
          const ol = (
            <a key="ol" className={outlookFirst ? "btn-primary" : "btn-ghost"} href={outlookLink(to, subject, body)} target="_blank" rel="noreferrer" onClick={markDrafted}>
              Open in Outlook (McMaster)
            </a>
          );
          const gm = (
            <a key="gm" className={outlookFirst ? "btn-ghost" : "btn-primary"} href={gmailLink(to, subject, body, profile.senderEmail || undefined)} target="_blank" rel="noreferrer" onClick={markDrafted}>
              Open in Gmail
            </a>
          );
          return outlookFirst ? [ol, gm] : [gm, ol];
        })()}
        <a className="btn-ghost" href={mailtoLink(to, subject, body)} onClick={markDrafted}>
          Open in mail app
        </a>
        <button className="btn-ghost" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>
      </div>
    </section>
  );
}
