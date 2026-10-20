"use client";
import { useState } from "react";
import { useTeam } from "@/lib/team";

export default function Gate({ children }: { children: React.ReactNode }) {
  const t = useTeam();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  if (!t.ready) {
    return <div className="py-24 text-center text-muted">Loading…</div>;
  }
  if (!t.unlocked) {
    return (
      <div className="mx-auto max-w-sm py-20">
        <h1 className="font-display text-2xl font-extrabold">MSB Sponsorships</h1>
        <p className="mt-2 text-sm text-muted">Enter the club passcode. Ask the VP Finance or sponsorship lead if you don&apos;t have it.</p>
        <form
          className="mt-5 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            await t.unlock(code);
            setBusy(false);
          }}
        >
          <input
            className="input"
            type="password"
            autoFocus
            placeholder="Club passcode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {t.error && <p className="text-sm text-phulkari">{t.error}</p>}
          <button className="btn-primary w-full" disabled={busy || !code}>
            {busy ? "Checking…" : "Open"}
          </button>
        </form>
      </div>
    );
  }
  return <>{children}</>;
}

export function SenderSwitcher() {
  const t = useTeam();
  if (!t.unlocked) return null;
  if (!t.senders.length) {
    return (
      <a href="/profile#senders" className="chip bg-phulkari-soft text-phulkari">
        Add a sender
      </a>
    );
  }
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="hidden text-muted sm:inline">Sending as</span>
      <select
        className="rounded-md border border-line bg-card px-2 py-1 text-sm font-semibold"
        value={t.currentSender?.id ?? ""}
        onChange={(e) => t.setCurrentSenderId(e.target.value)}
      >
        {t.senders.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
