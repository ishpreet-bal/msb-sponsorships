/*
 * Builds one personalized email per sponsor with an email address and writes them to
 * outreach.json, which scripts/make_send_sheet.py turns into the Excel file used by Power Automate.
 * Run: npx tsx scripts/export-outreach.ts <out.json> <sender-email>
 */
import { writeFileSync } from "fs";
import raw from "../data/opportunities.json";
import { buildEmail, suggestedAsk, type Variant } from "../lib/email";
import { DEFAULT_PROFILE, type Opportunity, type Sender } from "../lib/types";

const out = process.argv[2] ?? "outreach.json";
const from = process.argv[3] ?? "bali@mcmaster.ca";

const club = { ...DEFAULT_PROFILE, attendance: "over 100", members: "20", followers: "almost 2,000" };
const sender: Sender = {
  id: "ishpreet", name: "Ishpreet Bal", role: "Director of Finance and Scholarships",
  email: from, phone: "416-697-6581", intro: "", send_via: "outlook",
};

const ops = (raw as { opportunities: Opportunity[] }).opportunities.filter((o) => o.email);
const rows = ops.map((o) => {
  const isGrant = ["university", "government", "foundation"].includes(o.type);
  const variant: Variant = isGrant ? "question" : "cash";
  const { subject, body } = buildEmail({ o, club, sender, variant });
  return {
    slug: o.slug,
    sponsor: o.name,
    type: o.type,
    to: o.email.trim(),
    contact: o.contact?.name ?? "",
    confidence: o.contact?.confidence ?? (o.verified ? "high" : "unverified"),
    ask: isGrant ? "Grant question" : suggestedAsk(o),
    variant,
    subject,
    body,
    notes: o.contact?.route ?? "",
    priority: o.priority,
  };
});
writeFileSync(out, JSON.stringify(rows, null, 2));
console.log(`${rows.length} emails written to ${out}`);
