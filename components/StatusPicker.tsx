"use client";
import { useStatuses } from "@/lib/store";
import { STATUS_LABEL, type Status } from "@/lib/types";

export default function StatusPicker({ slug }: { slug: string }) {
  const [statuses, setStatuses] = useStatuses();
  const value = statuses[slug] ?? "not-started";
  return (
    <div className="shrink-0">
      <label className="label">Status</label>
      <select
        className="input !w-44 font-semibold"
        value={value}
        onChange={(e) => setStatuses({ ...statuses, [slug]: e.target.value as Status })}
      >
        {Object.entries(STATUS_LABEL).map(([k, l]) => (
          <option key={k} value={k}>{l}</option>
        ))}
      </select>
    </div>
  );
}
