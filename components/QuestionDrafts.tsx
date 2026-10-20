"use client";
import { useEffect, useState } from "react";
import { useTeam } from "@/lib/team";

function Answer({ slug, q }: { slug: string; q: string }) {
  const t = useTeam();
  const saved = t.answer(slug, q);
  const [val, setVal] = useState(saved);
  const [state, setState] = useState<"" | "saving" | "saved">("");
  useEffect(() => setVal(saved), [saved]);

  const save = async () => {
    if (val === saved) return;
    setState("saving");
    try {
      await t.saveAnswer(slug, q, val);
      setState("saved");
      setTimeout(() => setState(""), 1500);
    } catch {
      setState("");
    }
  };

  return (
    <div className="px-3 pb-3">
      <textarea className="input min-h-[120px]" placeholder="Draft the club's answer…" value={val} onChange={(e) => setVal(e.target.value)} onBlur={save} />
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>Saves for the whole team when you click away.</span>
        <span>{state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : ""}</span>
      </div>
    </div>
  );
}

export default function QuestionDrafts({ slug, questions }: { slug: string; questions: string[] }) {
  const t = useTeam();
  const [open, setOpen] = useState<number | null>(null);
  const answered = questions.filter((q) => t.answer(slug, q).trim()).length;

  return (
    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">What they ask</h2>
        <span className="chip bg-indigo-soft text-indigo">{answered}/{questions.length} drafted</span>
      </div>
      <ol className="space-y-2">
        {questions.map((q, i) => {
          const done = !!t.answer(slug, q).trim();
          return (
            <li key={q} className="rounded-lg border border-line">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-start gap-3 p-3 text-left text-sm">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-leaf text-white" : "bg-paper text-muted"}`}>
                  {done ? "✓" : i + 1}
                </span>
                <span className="font-medium">{q}</span>
              </button>
              {open === i && <Answer slug={slug} q={q} />}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
