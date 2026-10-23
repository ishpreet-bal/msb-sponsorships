/*
 * Generates every outreach email for every opportunity and checks it against the club writing guide.
 * Run: npm run lint:emails   (exits 1 if anything breaks the rules)
 */
import raw from "../data/opportunities.json";
import { buildEmail, type Variant } from "../lib/email";
import { DEFAULT_PROFILE, type Opportunity, type Sender } from "../lib/types";

const BANNED = [
  "can", "may", "just", "very", "really", "literally", "actually", "certainly", "probably", "basically", "could",
  "maybe", "delve", "embark", "enlightening", "esteemed", "shed light", "craft", "crafting", "imagine", "realm",
  "game-changer", "unlock", "discover", "skyrocket", "abyss", "not alone", "in a world where", "revolutionize",
  "disruptive", "utilize", "utilizing", "dive deep", "tapestry", "illuminate", "unveil", "pivotal", "intricate",
  "elucidate", "hence", "harness", "exciting", "groundbreaking", "cutting-edge", "remarkable", "it remains to be seen",
  "glimpse into", "navigating the landscape", "stark", "testament", "in summary", "in conclusion", "moreover", "boost",
  "skyrocketing", "opened up", "powerful", "inquiries", "ever-evolving", "passionate", "thrilled", "excited",
];
const re = new RegExp(`\\b(${BANNED.map((w) => w.replace(/[-\s]/g, "[-\\s]")).join("|")})\\b`, "gi");

const club = {
  ...DEFAULT_PROFILE,
  attendance: "over 100",
  members: "20",
  followers: "almost 2,000",
};
const sender: Sender = {
  id: "x", name: "Test Sender", role: "VP Finance", email: "msb@mcmaster.ca", phone: "416-697-6581", send_via: "outlook",
  intro: "I'm a third-year student and have danced with MSB for two years.",
};

const ops = (raw as { opportunities: Opportunity[] }).opportunities;
const variants: Variant[] = ["cash", "in-kind", "follow-up", "question"];
let problems = 0;

for (const o of ops) {
  for (const v of variants) {
    const { subject, body } = buildEmail({ o, club, sender, variant: v, lastSent: "2026-10-20T12:00:00Z" });
    const text = `${subject}\n${body}`.replace(/https?:\/\/\S+/g, "").replace(/\S+@\S+/g, "");
    const issues: string[] = [];
    if (/[—–]/.test(text)) issues.push("dash");
    if (/;/.test(text)) issues.push("semicolon");
    const hits = Array.from(new Set((text.match(re) ?? []).map((w) => w.toLowerCase())));
    // Organisation names are allowed to contain these words.
    const nameLower = o.name.toLowerCase();
    const real = hits.filter((h) => !nameLower.includes(h));
    if (real.length) issues.push(`words: ${real.join(", ")}`);
    if (issues.length) {
      problems++;
      console.log(`✗ ${o.slug} [${v}] ${issues.join(" | ")}`);
    }
  }
}
console.log(problems ? `\n${problems} email(s) break the writing rules.` : `All ${ops.length * variants.length} emails pass.`);
process.exit(problems ? 1 : 0);
