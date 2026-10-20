"use client";
import { useEffect, useRef, useState } from "react";
import { useTeam } from "@/lib/team";
import type { ClubProfile, Sender } from "@/lib/types";

const CLUB_FIELDS: { key: keyof ClubProfile; label: string; placeholder?: string; long?: boolean }[] = [
  { key: "eventName", label: "Main event", placeholder: "e.g. MSB Annual Showcase 2027" },
  { key: "eventDate", label: "Event date", placeholder: "e.g. March 21, 2027" },
  { key: "attendance", label: "Showcase attendance last year", placeholder: "e.g. 400" },
  { key: "members", label: "Active members", placeholder: "e.g. 60" },
  { key: "instagram", label: "Instagram handle", placeholder: "@mcmasterbhangra" },
  { key: "followers", label: "Instagram followers", placeholder: "e.g. 3,500" },
  { key: "askAmount", label: "Default cash ask", placeholder: "e.g. $500 to $2,000" },
  { key: "packageLink", label: "Sponsorship package link (optional)", placeholder: "Google Drive or Canva link" },
  { key: "aboutClub", label: "About the club (goes in every email)", long: true },
  {
    key: "highlights",
    label: "Recent highlights (optional, goes after the reach numbers)",
    placeholder: "e.g. Last year our team placed second at Bhangra Blowout and performed at the Hamilton Vaisakhi celebration.",
    long: true,
  },
];

function ClubForm() {
  const t = useTeam();
  const [draft, setDraft] = useState<ClubProfile>(t.profile);
  const [state, setState] = useState<"" | "saving" | "saved" | "error">("");
  const loaded = useRef(false);

  // Copy the saved profile into the form once. Re-copying on every render was the old bug
  // that wiped out whatever you typed.
  useEffect(() => {
    if (!loaded.current) {
      setDraft(t.profile);
      loaded.current = true;
    }
  }, [t.profile]);

  return (
    <form
      className="grid gap-4 rounded-2xl border border-line bg-card p-5 sm:grid-cols-2 sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("saving");
        try {
          await t.saveProfile(draft);
          setState("saved");
          setTimeout(() => setState(""), 2000);
        } catch {
          setState("error");
        }
      }}
    >
      {CLUB_FIELDS.map((f) => (
        <div key={f.key} className={f.long ? "sm:col-span-2" : ""}>
          <label className="label" htmlFor={`club-${f.key}`}>{f.label}</label>
          {f.long ? (
            <textarea
              id={`club-${f.key}`}
              className="input min-h-[90px]"
              placeholder={f.placeholder}
              value={draft[f.key] ?? ""}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          ) : (
            <input
              id={`club-${f.key}`}
              className="input"
              placeholder={f.placeholder}
              value={draft[f.key] ?? ""}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button className="btn-primary" disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : "Save club details"}
        </button>
        {state === "error" && <span className="text-sm text-phulkari">Couldn&apos;t save. Try again.</span>}
      </div>
    </form>
  );
}

const EMPTY: Omit<Sender, "id"> = { name: "", role: "", email: "", phone: "", intro: "", send_via: "outlook" };

function SenderForm({ initial, onDone }: { initial?: Sender; onDone: () => void }) {
  const t = useTeam();
  const [s, setS] = useState<Omit<Sender, "id"> & { id?: string }>(initial ?? EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof Sender, v: string) => setS({ ...s, [k]: v });

  return (
    <form
      className="grid gap-3 rounded-xl border border-saffron bg-saffron-soft/40 p-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!s.name.trim()) return setErr("Name is required.");
        setBusy(true);
        setErr("");
        try {
          const id = await t.saveSender({ ...s, name: s.name.trim() });
          if (!initial) t.setCurrentSenderId(id);
          onDone();
        } catch {
          setErr("Couldn't save. Try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <label className="label">Name</label>
        <input className="input" placeholder="e.g. Ishpreet Bal" value={s.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div>
        <label className="label">Role</label>
        <input className="input" placeholder="e.g. VP Finance" value={s.role} onChange={(e) => set("role", e.target.value)} />
      </div>
      <div>
        <label className="label">Email they send from</label>
        <input className="input" placeholder="msb@mcmaster.ca" value={s.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div>
        <label className="label">Phone (optional)</label>
        <input className="input" value={s.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Personal line (optional)</label>
        <input
          className="input"
          placeholder="e.g. I'm a third-year Health Sciences student and have danced with MSB for two years."
          value={s.intro}
          onChange={(e) => set("intro", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted">Added right after their introduction so emails from different execs read differently.</p>
      </div>
      <div>
        <label className="label">Opens drafts in</label>
        <select className="input" value={s.send_via} onChange={(e) => set("send_via", e.target.value)}>
          <option value="outlook">Outlook (McMaster email)</option>
          <option value="gmail">Gmail</option>
          <option value="mail">Default mail app</option>
        </select>
      </div>
      <div className="flex items-end gap-2">
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Add sender"}</button>
        <button type="button" className="btn-ghost" onClick={onDone}>Cancel</button>
      </div>
      {err && <p className="text-sm text-phulkari sm:col-span-2">{err}</p>}
    </form>
  );
}

function Senders() {
  const t = useTeam();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  return (
    <section id="senders" className="mt-10">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">Senders</h2>
          <p className="text-sm text-muted">Everyone who sends outreach. Pick who you are from the &quot;Sending as&quot; menu at the top, and emails are written from that person.</p>
        </div>
        {editing !== "new" && (
          <button className="btn-primary" onClick={() => setEditing("new")}>+ Add sender</button>
        )}
      </div>

      {editing === "new" && (
        <div className="mb-4">
          <SenderForm onDone={() => setEditing(null)} />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {t.senders.map((s) =>
          editing === s.id ? (
            <div key={s.id} className="md:col-span-2">
              <SenderForm initial={s} onDone={() => setEditing(null)} />
            </div>
          ) : (
            <div key={s.id} className={`rounded-xl border bg-card p-4 ${t.currentSender?.id === s.id ? "border-ink" : "border-line"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-sm text-muted">{[s.role, s.email].filter(Boolean).join(" · ") || "No role or email yet"}</div>
                  {s.intro && <p className="mt-1 text-sm italic text-muted">&quot;{s.intro}&quot;</p>}
                </div>
                {t.currentSender?.id === s.id && <span className="chip bg-ink text-paper">You</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {t.currentSender?.id !== s.id && (
                  <button className="btn-ghost !py-1" onClick={() => t.setCurrentSenderId(s.id)}>Send as</button>
                )}
                <button className="btn-ghost !py-1" onClick={() => setEditing(s.id)}>Edit</button>
                {confirm === s.id ? (
                  <>
                    <button
                      className="btn !py-1 bg-phulkari text-white"
                      onClick={async () => {
                        await t.removeSender(s.id);
                        setConfirm(null);
                      }}
                    >
                      Confirm remove
                    </button>
                    <button className="btn-ghost !py-1" onClick={() => setConfirm(null)}>Keep</button>
                  </>
                ) : (
                  <button className="btn-ghost !py-1 text-phulkari" onClick={() => setConfirm(s.id)}>Remove</button>
                )}
              </div>
            </div>
          ),
        )}
      </div>
      {!t.senders.length && editing !== "new" && (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">No senders yet. Add yourself first.</p>
      )}
    </section>
  );
}

export default function ProfilePage() {
  const t = useTeam();
  return (
    <div className="py-10">
      <h1 className="font-display text-3xl font-extrabold">Club and senders</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Club details are shared by the whole team and go into every email. Each sender adds their own name, role and email.
      </p>
      <div className="mt-6">
        <ClubForm />
      </div>
      <Senders />
      <div className="mt-12 border-t border-line pt-6 text-sm text-muted">
        <button className="underline" onClick={t.lock}>Lock this device</button> (removes the passcode from this browser)
      </div>
    </div>
  );
}
