"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { rpc, PasscodeError } from "./supabase";
import {
  DEFAULT_PROFILE,
  type ClubProfile,
  type LogRow,
  type OutreachRow,
  type Sender,
  type Status,
} from "./types";

interface Loaded {
  profile: Partial<ClubProfile>;
  senders: Sender[];
  outreach: Record<string, OutreachRow>;
  log: LogRow[];
  answers: { slug: string; question: string; answer: string }[];
}

interface TeamCtx {
  ready: boolean;
  unlocked: boolean;
  error: string;
  profile: ClubProfile;
  senders: Sender[];
  currentSender: Sender | null;
  setCurrentSenderId: (id: string) => void;
  statusOf: (slug: string) => Status;
  outreachOf: (slug: string) => OutreachRow | undefined;
  logFor: (slug: string) => LogRow[];
  log: LogRow[];
  answer: (slug: string, q: string) => string;
  unlock: (passcode: string) => Promise<boolean>;
  lock: () => void;
  refresh: () => Promise<void>;
  saveProfile: (p: ClubProfile) => Promise<void>;
  saveSender: (s: Partial<Sender> & { name: string }) => Promise<string>;
  removeSender: (id: string) => Promise<void>;
  setStatus: (slug: string, st: Status, note?: string) => Promise<void>;
  logSend: (slug: string, toEmail: string, subject: string) => Promise<void>;
  addNote: (slug: string, note: string) => Promise<void>;
  saveAnswer: (slug: string, q: string, a: string) => Promise<void>;
}

const Ctx = createContext<TeamCtx | null>(null);

const PASS_KEY = "msb-passcode";
const SENDER_KEY = "msb-current-sender";

function ls(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
function lsSet(key: string, v: string) {
  try {
    if (v) localStorage.setItem(key, v);
    else localStorage.removeItem(key);
  } catch {}
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [pass, setPass] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Loaded | null>(null);
  const [senderId, setSenderId] = useState("");

  const load = useCallback(async (p: string) => {
    const d = await rpc<Loaded>("msb_load", { p });
    setData(d);
    return d;
  }, []);

  useEffect(() => {
    const saved = ls(PASS_KEY);
    setSenderId(ls(SENDER_KEY));
    if (!saved) {
      setReady(true);
      return;
    }
    load(saved)
      .then(() => setPass(saved))
      .catch((e) => {
        if (e instanceof PasscodeError) lsSet(PASS_KEY, "");
        else setError("Couldn't reach the club database. Check your connection and refresh.");
      })
      .finally(() => setReady(true));
  }, [load]);

  const unlock = useCallback(
    async (p: string) => {
      setError("");
      try {
        await load(p.trim());
        setPass(p.trim());
        lsSet(PASS_KEY, p.trim());
        return true;
      } catch (e) {
        setError(e instanceof PasscodeError ? "That passcode didn't work." : "Couldn't reach the club database.");
        return false;
      }
    },
    [load],
  );

  const lock = useCallback(() => {
    lsSet(PASS_KEY, "");
    setPass("");
    setData(null);
  }, []);

  const refresh = useCallback(async () => {
    if (pass) await load(pass);
  }, [pass, load]);

  const senders = data?.senders ?? [];
  const currentSender = senders.find((s) => s.id === senderId) ?? senders[0] ?? null;
  const actor = currentSender?.name ?? "Unknown";

  const call = useCallback(
    async (fn: string, args: Record<string, unknown>) => {
      const out = await rpc(fn, { p: pass, ...args });
      await load(pass);
      return out;
    },
    [pass, load],
  );

  const value = useMemo<TeamCtx>(
    () => ({
      ready,
      unlocked: !!pass && !!data,
      error,
      profile: { ...DEFAULT_PROFILE, ...(data?.profile ?? {}) },
      senders,
      currentSender,
      setCurrentSenderId: (id) => {
        setSenderId(id);
        lsSet(SENDER_KEY, id);
      },
      statusOf: (slug) => (data?.outreach[slug]?.status as Status) ?? "not-started",
      outreachOf: (slug) => data?.outreach[slug],
      logFor: (slug) => (data?.log ?? []).filter((l) => l.slug === slug),
      log: data?.log ?? [],
      answer: (slug, q) => data?.answers.find((a) => a.slug === slug && a.question === q)?.answer ?? "",
      unlock,
      lock,
      refresh,
      saveProfile: async (p) => {
        await call("msb_save_profile", { d: p });
      },
      saveSender: async (s) => {
        const id = (await call("msb_upsert_sender", { s })) as string;
        return id;
      },
      removeSender: async (id) => {
        await call("msb_remove_sender", { sid: id });
      },
      setStatus: async (slug, st, note) => {
        await call("msb_set_status", { s: slug, st, actor, note: note ?? null });
      },
      logSend: async (slug, toEmail, subject) => {
        await call("msb_log_send", { s: slug, actor, sender_email: currentSender?.email ?? "", to_email: toEmail, subject });
      },
      addNote: async (slug, note) => {
        await call("msb_add_note", { s: slug, actor, note });
      },
      saveAnswer: async (slug, q, a) => {
        await rpc("msb_save_answer", { p: pass, s: slug, q, a });
        setData((d) => {
          if (!d) return d;
          const rest = d.answers.filter((x) => !(x.slug === slug && x.question === q));
          return { ...d, answers: [...rest, { slug, question: q, answer: a }] };
        });
      },
    }),
    [ready, pass, data, error, senders, currentSender, unlock, lock, refresh, call, actor],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTeam() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTeam outside TeamProvider");
  return c;
}
