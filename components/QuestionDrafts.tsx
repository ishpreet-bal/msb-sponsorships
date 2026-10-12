"use client";
import { useState } from "react";
import { useNotes } from "@/lib/store";

export default function QuestionDrafts({ slug, questions }: { slug: string; questions: string[] }) {
  const [notes, setNotes] = useNotes(slug);
  const [open, setOpen] = useState<number | null>(null);
  const answered = questions.filter((q) => notes[q]?.trim()).length;

  return (
    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">📝 What they ask</h2>
        <span className="chip bg-indigo-soft text-indigo">{answered}/{questions.length} drafted</span>
      </div>
      <p className="mb-4 text-sm text-muted">Click a question to draft your answer. Drafts save in this browser.</p>
      <ol className="space-y-2">
        {questions.map((q, i) => (
          <li key={q} className="rounded-lg border border-line">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-start gap-3 p-3 text-left text-sm">
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${notes[q]?.trim() ? "bg-leaf text-white" : "bg-paper text-muted"}`}>
                {notes[q]?.trim() ? "✓" : i + 1}
              </span>
              <span className="font-medium">{q}</span>
            </button>
            {open === i && (
              <div className="px-3 pb-3">
                <textarea
                  className="input min-h-[120px]"
                  placeholder="Draft your answer…"
                  value={notes[q] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [q]: e.target.value })}
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
