// Free funding monitor. Runs on GitHub Actions twice a week, no AI involved.
//  1. Re-checks every opportunity's page and flags ones that changed (new deadline, new cycle)
//     or broke (moved or removed).
//  2. Pulls fresh leads from news searches and McMaster / Hamilton arts feeds.
// Results go to data/monitor.json, which the site shows on the Updates page.
// Run locally: node scripts/monitor.mjs
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const ROOT = new URL("../", import.meta.url);
const OPP_FILE = new URL("data/opportunities.json", ROOT);
const FEEDS_FILE = new URL("data/feeds.json", ROOT);
const OUT_FILE = new URL("data/monitor.json", ROOT);

const UA = "Mozilla/5.0 (compatible; MSB-Funding-Monitor/1.0; +https://msb-sponsorships.vercel.app)";
const TODAY = new Date().toISOString().slice(0, 10);

async function fetchText(url, ms = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" }, redirect: "follow", signal: ctrl.signal });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body, finalUrl: res.url };
  } catch (e) {
    return { ok: false, status: 0, body: "", error: String(e?.name === "AbortError" ? "timeout" : e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

/** Visible text of an HTML page, normalized so cosmetic changes (scripts, whitespace, tracking ids) don't count. */
export function pageText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\b\d{1,2}:\d{2}(:\d{2})?\s?(am|pm)?\b/gi, " ") // clocks
    .replace(/\s+/g, " ")
    .trim();
}

const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";
const DATE_RE = new RegExp(`\\b(?:${MONTHS})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+20\\d{2}\\b|\\b20\\d{2}-\\d{2}-\\d{2}\\b`, "g");

/** Dates mentioned near words like deadline / apply / intake. */
export function deadlineHints(text) {
  const hints = new Set();
  const re = /(deadline|apply|application|intake|closes|due|submission)/gi;
  let m;
  while ((m = re.exec(text)) && hints.size < 6) {
    const window = text.slice(Math.max(0, m.index - 120), m.index + 200);
    for (const d of window.match(DATE_RE) ?? []) hints.add(d.replace(/\s+/g, " "));
  }
  return [...hints];
}

const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

// ---------- RSS ----------
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

export function parseRss(xml) {
  const items = [];
  for (const m of xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)) {
    const b = m[0];
    const link = tag(b, "link") || (b.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? "");
    items.push({
      title: tag(b, "title"),
      link,
      date: tag(b, "pubDate") || tag(b, "published") || tag(b, "updated"),
      summary: (tag(b, "description") || tag(b, "summary")).slice(0, 300),
      source: tag(b, "source"),
    });
  }
  return items;
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/\s+-\s+[^-]+$/, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

async function main() {
  const db = JSON.parse(await readFile(OPP_FILE, "utf8"));
  const feeds = JSON.parse(await readFile(FEEDS_FILE, "utf8"));
  let prev = { pages: {}, leads: [] };
  try {
    prev = JSON.parse(await readFile(OUT_FILE, "utf8"));
  } catch {}

  // 1. Page watch
  const targets = db.opportunities
    .map((o) => ({ slug: o.slug, url: o.applyUrl || o.website || (o.sources ?? [])[0] || "" }))
    .filter((t) => /^https?:\/\//.test(t.url));

  const pages = {};
  let changed = 0,
    broken = 0;
  await pool(targets, 6, async ({ slug, url }) => {
    const before = prev.pages?.[slug];
    const r = await fetchText(url);
    if (!r.ok) {
      const status = r.status === 403 || r.status === 429 ? "blocked" : r.status === 0 ? "unreachable" : "broken";
      if (status === "broken") broken++;
      pages[slug] = { ...(before ?? {}), url, status, httpStatus: r.status, error: r.error ?? "", lastChecked: TODAY };
      return;
    }
    const isPdf = /\.pdf($|\?)/i.test(url) || r.body.startsWith("%PDF");
    const text = isPdf ? r.body : pageText(r.body);
    const h = hash(text);
    const hints = isPdf ? [] : deadlineHints(text);
    const isChange = before?.hash && before.hash !== h && before.url === url;
    if (isChange) changed++;
    pages[slug] = {
      url,
      status: isChange ? "changed" : before?.status === "changed" && before.hash === h ? "changed" : "ok",
      httpStatus: r.status,
      hash: h,
      deadlineHints: hints,
      firstSeen: before?.firstSeen ?? TODAY,
      lastChanged: isChange ? TODAY : before?.lastChanged ?? null,
      lastChecked: TODAY,
    };
  });

  // 2. Leads from news searches and feeds
  const known = new Set([
    ...db.opportunities.map((o) => normalizeTitle(o.name)),
    ...(prev.leads ?? []).map((l) => normalizeTitle(l.title)),
  ]);
  const keep = new RegExp(feeds.keepIfMatches, "i");
  const drop = new RegExp(feeds.dropIfMatches, "i");
  const fresh = [];
  const feedList = [
    ...feeds.feeds,
    ...feeds.newsSearches.map((q) => ({
      name: `News: ${q}`,
      url: `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:30d")}&hl=en-CA&gl=CA&ceid=CA:en`,
      filter: false,
    })),
  ];
  const feedStatus = [];
  await pool(feedList, 4, async (f) => {
    const r = await fetchText(f.url);
    if (!r.ok) {
      feedStatus.push({ name: f.name, ok: false, httpStatus: r.status });
      return;
    }
    const items = parseRss(r.body);
    feedStatus.push({ name: f.name, ok: true, items: items.length });
    for (const it of items.slice(0, 25)) {
      if (!it.title || !it.link) continue;
      const text = `${it.title} ${it.summary}`;
      if (f.filter !== false && !keep.test(text)) continue;
      if (drop.test(text)) continue;
      const key = normalizeTitle(it.title);
      if (known.has(key)) continue;
      known.add(key);
      fresh.push({
        title: it.title,
        link: it.link,
        source: it.source || f.name,
        published: it.date ? new Date(it.date).toISOString().slice(0, 10) : null,
        found: TODAY,
        via: f.name,
      });
    }
  });

  const cutoff = new Date(Date.now() - 120 * 86400000).toISOString().slice(0, 10);
  const leads = [...fresh, ...(prev.leads ?? [])].filter((l) => (l.found ?? TODAY) >= cutoff).slice(0, 200);

  const out = {
    updated: TODAY,
    summary: { pagesChecked: targets.length, pagesChanged: changed, pagesBroken: broken, newLeads: fresh.length },
    feeds: feedStatus.sort((a, b) => a.name.localeCompare(b.name)),
    pages,
    leads,
  };
  await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + "\n");
  console.log(`Checked ${targets.length} pages: ${changed} changed, ${broken} broken. ${fresh.length} new leads.`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
