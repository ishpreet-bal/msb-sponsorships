import raw from "@/data/monitor.json";

export interface PageWatch {
  url: string;
  status: "ok" | "changed" | "broken" | "blocked" | "unreachable";
  httpStatus?: number;
  deadlineHints?: string[];
  lastChanged?: string | null;
  lastChecked?: string;
}

export interface Lead {
  title: string;
  link: string;
  source: string;
  published: string | null;
  found: string;
  via: string;
}

export interface MonitorData {
  updated: string | null;
  summary: { pagesChecked: number; pagesChanged: number; pagesBroken: number; newLeads: number };
  feeds: { name: string; ok: boolean; items?: number; httpStatus?: number }[];
  pages: Record<string, PageWatch>;
  leads: Lead[];
}

export const MONITOR = raw as unknown as MonitorData;

export function pageWatch(slug: string): PageWatch | undefined {
  return MONITOR.pages[slug];
}
