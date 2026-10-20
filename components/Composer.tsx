"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { useTeam } from "@/lib/team";
import { VARIANT_LABEL, buildEmail, gmailLink, mailtoLink, outlookLink, type Variant } from "@/lib/email";

export default function Composer({ o }: { o: Opportunity }) {
  const t = useTeam();
  const isGrant = ["university", "government", "foundation"].includes(o.type);
  const status = t.statusOf(o.slug);
  const lastSend = t.logFor(o.slug).find((l) => l.action === "sent");

  const variants: Variant[] = isGrant ? ["question", "cash", "follow-up"] : ["cash", "in-kind", "follow-up"];
  const defaultVariant: Variant = status === "contacted" || status === "follow-up" ? "follow-up" : variants[0];
  const [variant, setVariant] = useState<Variant>(defaultVariant);
  useEffect(() => setVariant(defaultVariant), [defaultVariant]);

  const sender = t.currentSender;
  const generated = useMemo(
    () => buildEmail({ o, club: t.profile, sender, variant, lastSent: lastSend?.created_at }),
    [o, t.profile, sender, variant, lastSend?.created_at],
  );

  const [to, setTo] = useState(o.email);
  const [subject, setSubject] = useState(generated.subject);
  const [body, setBody] = useState(generated.body);
  const [edited, setEdited] = useState(false);
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  // Regenerate when the sender, variant or club details change, unless the user has hand-edited the draft.
  useEffect(() => {
    if (edited) return;
    setSubject(generated.subject);
    setBody(generated.body);
  }, [generated, edited]);

  const resetDraft = () => {
    setEdited(false);
    setSubject(generated.subject);
    setBody(generated.body);
  };

  const via = sender?.send_via ?? "outlook";
  const links = {
    outlook: { label: "Open in Outlook", href: outlookLink(to, subject, body) },
    gmail: { label: "Open in Gmail", href: gmailLink(to, subject, body, sender?.email || undefined) },
    mail: { label: "Open in mail app", href: mailtoLink(to, subject, body) },
  } as const;
  const order = [via, ...(["outlook", "gmail", "mail"] as const).filter((v) => v !== via)];

  const onOpen = async () => {
    setOpened(true);
    if (status === "not-started") {
      try {
        await t.setStatus(o.slug, "drafted");
      } catch {}
    }
  };

  const confirmSent = async () => {
    setBusy(true);
    try {
      await t.logSend(o.slug, to, subject);
      setOpened(false);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const missingClub = !t.profile.attendance && !t.profile.followers && !t.profile.members;

  return (
    <section className="rounded-2xl border-2 border-ink bg-card p-5 shadow-[6px_6px_0_#e8891c] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Personalized email</h2>
        <div className="flex flex-wrap rounded-lg border border-line p-0.5 text-xs font-semibold">
          {variants.map((v) => (
            <button
              key={v}
              onClick={() => {
                setVariant(v);
                setEdited(false);
              }}
              className={`rounded-md px-2.5 py-1 ${variant === v ? "bg-ink text-paper" : "hover:bg-paper"}`}
            >
              {VARIANT_LABEL[v]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">From</label>
          {t.senders.length ? (
            <select className="input font-semibold" value={sender?.id ?? ""} onChange={(e) => t.setCurrentSenderId(e.target.value)}>
              {t.senders.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.email ? ` (${s.email})` : ""}
                </option>
              ))}
            </select>
          ) : (
            <Link href="/profile#senders" className="input block text-phulkari">Add a sender first →</Link>
          )}
        </div>
        <div>
          <label className="label">To</label>
          <input className="input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Paste their contact email" />
        </div>
      </div>

      {missingClub && (
        <p className="mb-4 rounded-lg bg-phulkari-soft p-3 text-sm text-phulkari">
          Add the club&apos;s numbers (showcase attendance, members, followers) on the{" "}
          <Link href="/profile" className="font-semibold underline">Club page</Link> so every email includes them.
        </p>
      )}

      <label className="label">Subject</label>
      <input
        className="input mb-3"
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value);
          setEdited(true);
        }}
      />
      <div className="flex items-end justify-between">
        <label className="label">Message</label>
        {edited && (
          <button onClick={resetDraft} className="mb-1 text-xs font-semibold text-indigo underline">
            Reset to generated draft
          </button>
        )}
      </div>
      <textarea
        className="input min-h-[420px] text-[14px] leading-relaxed"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setEdited(true);
        }}
      />
      <p className="mt-1 text-xs text-muted">
        Check anything in [brackets] before sending, and attach the sponsorship package PDF.
        {via === "outlook" && sender?.email ? ` Make sure you're signed in to Outlook as ${sender.email}.` : ""}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {order.map((k, i) => (
          <a
            key={k}
            className={i === 0 ? "btn-primary" : "btn-ghost"}
            href={links[k].href}
            target={k === "mail" ? undefined : "_blank"}
            rel="noreferrer"
            onClick={onOpen}
          >
            {links[k].label}
          </a>
        ))}
        <button className="btn-ghost" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>
      </div>

      {opened && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-saffron bg-saffron-soft p-3 text-sm">
          <span className="font-semibold">Did you send it?</span>
          <button className="btn-primary !py-1.5" disabled={busy} onClick={confirmSent}>
            Yes, mark as emailed
          </button>
          <button className="btn-ghost !py-1.5" onClick={() => setOpened(false)}>Not yet</button>
        </div>
      )}
    </section>
  );
}
