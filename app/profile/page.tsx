"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/store";
import type { ClubProfile } from "@/lib/types";

const FIELDS: { key: keyof ClubProfile; label: string; placeholder?: string; long?: boolean }[] = [
  { key: "clubName", label: "Club name" },
  { key: "senderName", label: "Your name", placeholder: "e.g. Ishpreet Bal" },
  { key: "senderRole", label: "Your role", placeholder: "e.g. VP Sponsorship" },
  { key: "senderEmail", label: "Club email (sending from)", placeholder: "msb@mcmaster.ca" },
  { key: "phone", label: "Phone (optional)" },
  { key: "eventName", label: "Main event", placeholder: "e.g. MSB Annual Showcase 2027" },
  { key: "eventDate", label: "Event date", placeholder: "e.g. March 21, 2027" },
  { key: "members", label: "Active members", placeholder: "e.g. 60" },
  { key: "attendance", label: "Showcase attendance", placeholder: "e.g. 400" },
  { key: "instagram", label: "Instagram handle", placeholder: "@mcmasterbhangra" },
  { key: "followers", label: "Instagram followers", placeholder: "e.g. 3,500" },
  { key: "askAmount", label: "Default ask", placeholder: "e.g. $500–$2,000" },
  { key: "packageLink", label: "Sponsorship package link", placeholder: "Google Drive / Canva link" },
  { key: "aboutClub", label: "About the club (1–2 sentences)", long: true },
];

export default function ProfilePage() {
  const [profile, setProfile] = useProfile();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(profile), [profile]);

  return (
    <div className="py-10">
      <h1 className="font-display text-3xl font-extrabold">Club profile</h1>
      <p className="mt-2 max-w-2xl text-muted">
        These details fill in every outreach email automatically. They&apos;re saved in your browser only — each
        exec fills in their own name and email.
      </p>
      <form
        className="mt-6 grid gap-4 rounded-2xl border border-line bg-card p-5 sm:grid-cols-2 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setProfile(draft);
          setSaved(true);
          setTimeout(() => setSaved(false), 1800);
        }}
      >
        {FIELDS.map((f) => (
          <div key={f.key} className={f.long ? "sm:col-span-2" : ""}>
            <label className="label">{f.label}</label>
            {f.long ? (
              <textarea className="input min-h-[100px]" value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
            ) : (
              <input className="input" placeholder={f.placeholder} value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
            )}
          </div>
        ))}
        <div className="sm:col-span-2">
          <button className="btn-primary">{saved ? "Saved ✓" : "Save profile"}</button>
        </div>
      </form>
    </div>
  );
}
