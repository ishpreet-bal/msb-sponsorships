import type { ClubProfile, Opportunity, Sender } from "./types";

/*
 * Outreach emails follow the club writing guide:
 * professional but conversational, written as the club ("we"), medium-length paragraphs,
 * no em dashes, no semicolons, and none of the filler words on the avoid list
 * (can, could, may, just, really, very, etc.). scripts/lint-emails.mjs checks every
 * generated email against these rules before each deploy.
 */

export type Variant = "cash" | "in-kind" | "follow-up" | "question";

export const VARIANT_LABEL: Record<Variant, string> = {
  cash: "Sponsorship ask",
  "in-kind": "In-kind ask",
  "follow-up": "Follow-up",
  question: "Eligibility question",
};

/** Removes em/en dashes and tidies whitespace so nothing slips through from the data. */
export function clean(s: string): string {
  return s
    .replace(/(\$\d[\d,]*)\s*[–—-]\s*(\$?\d)/g, "$1 to $2")
    .replace(/(\d)\s*[–—]\s*(\$?\d)/g, "$1 to $2")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s+,/g, ",")
    .replace(/[ \t]+/g, " ")
    .replace(/ +\n/g, "\n")
    .trim();
}

const has = (s?: string) => !!s && !!s.trim();

/** Organisation name as it reads in a sentence, e.g. "RBC Sponsorships (rbc.sponsor.com)" -> "RBC". */
export function orgName(o: Opportunity): string {
  if (has(o.research?.orgName)) return o.research!.orgName!.trim();
  return o.name
    .replace(/\s*\(.*?\)\s*/g, " ")
    .split(/\s[–—-]\s/)[0]
    .replace(/\s+(Sponsorships?|Corporate Donations.*|Community Sponsorship.*)$/i, "")
    .trim();
}

function programName(o: Opportunity) {
  if (has(o.research?.programName)) return o.research!.programName!.trim();
  return clean(o.name.replace(/\s*\(.*?\)\s*/g, " ")).trim();
}

function eventLabel(c: ClubProfile) {
  return has(c.eventName) ? c.eventName.trim() : "our annual showcase";
}
function eventWithDate(c: ClubProfile) {
  return `${eventLabel(c)}${has(c.eventDate) ? ` on ${c.eventDate.trim()}` : ""}`;
}
function subjectEvent(c: ClubProfile) {
  const e = eventLabel(c);
  return /^our /i.test(e) ? "Annual Showcase" : e;
}

function personName(raw?: string) {
  if (!raw) return "";
  const n = raw.split(",")[0].trim();
  if (/team|department|office|committee|relations|council|foundation|affairs|inbox|centre|center/i.test(n)) return "";
  return /^[A-Z][a-z'-]+(\s[A-Z][a-z'-]+)+$/.test(n) ? n : "";
}

function greeting(o: Opportunity) {
  const person = personName(o.contact?.name) || personName(o.research?.contactName);
  if (person) return `Hi ${person.split(/\s+/)[0]},`;
  const cn = o.research?.contactName?.trim();
  if (cn) {
    if (/team|department|office|committee|relations/i.test(cn)) return `Hi ${cn},`;
    return `Hi ${cn.split(/\s+/)[0]},`;
  }
  const local = (o.email.split("@")[0] || "").toLowerCase();
  const generic =
    /^(info|sales|support|contact|pr|cafe|events?|partnerships?|culture|queen|donations|charitypot|ginfo|shop|hello|admin|marketing|sponsorships?|community|yorkdale\.shop|aesop\.yorkdale|vaughan\.events|scarborough|etobicoke|gtd\.sponsorshipdonations|info-ca)$/;
  if (local && !generic.test(local) && /^[a-z]{3,}$/.test(local)) {
    return `Hi ${local.charAt(0).toUpperCase()}${local.slice(1)},`;
  }
  return `Hi ${orgName(o)} team,`;
}

function intro(o: Opportunity, s: Sender | null) {
  const name = s?.name?.trim() || "[Your name]";
  const role = s?.role?.trim() || "Sponsorship Coordinator";
  const personal = has(s?.intro) ? ` ${s!.intro.trim()}` : "";
  return `My name is ${name}, and I'm the ${role} for the McMaster School of Bhangra (MSB) at McMaster University.${personal}`;
}

function reach(c: ClubProfile) {
  const parts: string[] = [];
  if (has(c.attendance)) parts.push(`${c.attendance.trim()} people came out to our showcase last year`);
  if (has(c.members)) parts.push(`we have ${c.members.trim()} active members`);
  if (has(c.followers))
    parts.push(`our Instagram${has(c.instagram) ? ` (${c.instagram.trim()})` : ""} has ${c.followers.trim()} followers`);
  if (!parts.length) return "[Add our reach here: showcase attendance, member count and Instagram followers. Fill these in once on the Club page.]";
  const joined = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
  return `To give you a sense of our reach, ${joined}.`;
}

const INDUSTRY_CONNECTION: Record<string, (org: string) => string> = {
  food: (org) =>
    `Our showcase and practices bring together hundreds of students and their families, and food is a big part of how we celebrate. As such, ${org} would be a natural fit as a food partner, whether that is catering for our performers, a booth at the show, or a sponsorship tier with logo placement.`,
  lighting: (org) =>
    `Bhangra is a stage art, and the look of our showcase depends heavily on good lighting. As such, ${org} would be a natural fit as our lighting partner, with recognition on stage and in the performance videos we share after the show.`,
  kitchen: (org) =>
    `Our members come from families across the GTA and Hamilton, many of whom are homeowners and long-time members of the South Asian community. A partnership with MSB puts ${org} in front of that community in a way that feels personal rather than like an ad.`,
  realty: (org) =>
    `Our members and their families are a close South Asian community across the GTA and Hamilton, and many of them are first-time buyers or growing families. A partnership with MSB puts ${org} in front of that community at an event they care about.`,
  bank: (org) =>
    `A large part of our club is made up of students who are opening their first accounts, international students from India, and families who are newer to Canada. A partnership with MSB gives ${org} direct visibility with that audience at an event that matters to them.`,
  retail: (org) =>
    `Our members are university students who are active on social media and shop with brands that show up for their community. A partnership with MSB gives ${org} visibility at our events and in the performance and behind-the-scenes content we post throughout the year.`,
  beauty: (org) =>
    `Every performance involves full hair, makeup and costume, and our members spend hours getting ready before they go on stage. As such, ${org} would be a natural fit as our beauty partner, with product features in our behind-the-scenes content and recognition at the show.`,
  cpg: (org) =>
    `${org} has a strong presence with Canadian families and students, and our events bring both together in one place. A partnership with MSB gives you sampling opportunities, logo placement and social content in front of a large and engaged student audience.`,
  telecom: (org) =>
    `Students are one of the most important groups for any telecom brand, and our events reach hundreds of McMaster students and their families. A partnership with MSB gives ${org} visibility with that audience at the show and across our social media.`,
  fitness: (org) =>
    `Bhangra is one of the most high-energy forms of dance, and our members train for months before each performance. As such, ${org} would be a natural fit, whether that is co-hosting a bhangra workout, a sponsorship tier, or being featured in our training content.`,
  media: (org) =>
    `${org} has a long history of supporting arts and culture, and our club exists to keep Punjabi folk dance alive on a university stage. We think that story fits well with the work you already support.`,
  professional: (org) =>
    `${org} puts real value on community involvement and on connecting with driven students. Our executive team and members are McMaster students across every faculty, and a partnership with MSB connects your team with them and with the wider South Asian community.`,
  local: (org) =>
    `${org} is part of the same community that our members and their families belong to. A partnership with MSB puts your business in front of McMaster students and their families through our showcase, our practices and our social media.`,
  other: (org) =>
    `${org} supports community and culture in Ontario, and our club brings both together. A partnership with MSB puts your brand in front of McMaster students and the wider South Asian community through our showcase and social media.`,
};

function defaultHook(o: Opportunity, c: ClubProfile) {
  return `we are putting together our list of partners for ${eventLabel(c)}, and ${orgName(o)} stood out to us as a good fit for what we do.`;
}

function connection(o: Opportunity) {
  const org = orgName(o);
  if (has(o.research?.connection)) return o.research!.connection.trim();
  const f = INDUSTRY_CONNECTION[o.industry] ?? INDUSTRY_CONNECTION.other;
  return f(org);
}

function cashAsk(o: Opportunity, c: ClubProfile) {
  if (has(o.research?.ask)) return o.research!.ask.trim();
  if (has(c.askAmount)) return `a sponsorship of ${c.askAmount.trim()}`;
  return "a cash or in-kind sponsorship";
}

function packageLine(c: ClubProfile) {
  return has(c.packageLink)
    ? `Our sponsorship package goes over each tier and what partners receive, and you can find it here: ${c.packageLink.trim()}`
    : "I've attached our sponsorship package, which goes over each tier and what partners receive.";
}

function replyLine(s: Sender | null) {
  return has(s?.phone)
    ? `Feel free to reply directly to this email, or call or text me at ${s!.phone.trim()} if that is easier.`
    : "Feel free to reply directly to this email.";
}

function signature(s: Sender | null, c: ClubProfile, closing = "Thank you for your time and consideration,") {
  return [
    closing,
    "",
    s?.name?.trim() || "[Your name]",
    `${s?.role?.trim() || "Sponsorship Coordinator"}, McMaster School of Bhangra`,
    s?.email?.trim() || "msb@mcmaster.ca",
    s?.phone?.trim() || "",
    has(c.instagram) ? `Instagram: ${c.instagram.trim()}` : "",
  ]
    .filter((l, i) => i < 2 || l)
    .join("\n");
}

/** Lowercases the first word only when it is an ordinary word, so names like "RBC" or "Prima" stay intact. */
function lower(s: string) {
  return /^(We|Your|Our|Over|Last|Since|In|After|The|This|Earlier|Back|For|As|With|Every|Each|When|Through)\b/.test(s)
    ? s.charAt(0).toLowerCase() + s.slice(1)
    : s;
}

export interface BuildArgs {
  o: Opportunity;
  club: ClubProfile;
  sender: Sender | null;
  variant: Variant;
  lastSent?: string | null;
}

export function buildEmail({ o, club: c, sender: s, variant, lastSent }: BuildArgs) {
  const org = orgName(o);
  const hook = has(o.research?.hook) ? lower(o.research!.hook.trim().replace(/\.$/, "")) + "." : defaultHook(o, c);
  let subject = "";
  let paras: string[] = [];

  if (variant === "question") {
    subject = `Eligibility question from the McMaster School of Bhangra`;
    paras = [
      greeting(o),
      `${intro(o, s)} I'm reaching out because our club is planning to apply to ${programName(o)} for ${eventWithDate(c)}, and we wanted to confirm a few details before we submit.`,
      c.aboutClub.trim(),
      o.type === "university"
        ? `With that said, we wanted to check the timeline for this cycle, and whether there is anything you would recommend we include to make our application as strong as possible.`
        : `With that said, we are a ratified student club through the McMaster Students Union rather than an incorporated non-profit. As such, we wanted to check whether student clubs are eligible to apply, and whether there is anything you would recommend we include to make our application as strong as possible.`,
      `${replyLine(s)} We look forward to hearing from you.`,
    ];
  } else if (variant === "follow-up") {
    const when = lastSent
      ? ` on ${new Date(lastSent).toLocaleDateString("en-CA", { month: "long", day: "numeric" })}`
      : "";
    subject = `Following up: ${org} x McMaster School of Bhangra`;
    paras = [
      greeting(o),
      `I wanted to follow up on the email I sent${when} about partnering with the McMaster School of Bhangra for ${eventWithDate(c)}. I know inboxes get busy this time of year, so I wanted to bring it back to the top.`,
      `To give a quick summary, we reached out because ${hook} We are hoping to secure ${cashAsk(o, c)}, and we are flexible on the format, whether that is a cash sponsorship, an in-kind donation or a smaller contribution to start.`,
      `If you have a few minutes this week or next, I would be glad to set up a short call. ${replyLine(s)} If someone else on your team handles sponsorships, I would appreciate it if you pointed me in their direction.`,
    ];
  } else {
    const inKind = variant === "in-kind";
    subject = inKind
      ? `In-kind partnership with the McMaster School of Bhangra`
      : `${org} x McMaster School of Bhangra: ${subjectEvent(c)} sponsorship`;
    const ask = inKind
      ? has(o.research?.ask) && /in-kind|donat|product|gift|food|cater|equipment|pass/i.test(o.research!.ask)
        ? o.research!.ask.trim()
        : "an in-kind contribution, such as products, gift cards, food for our performers or prizes for our raffle"
      : cashAsk(o, c);
    paras = [
      greeting(o),
      `${intro(o, s)} I'm reaching out on behalf of our club because ${hook}`,
      `${c.aboutClub.trim()} Our biggest event of the year is ${eventWithDate(c)}, where our teams perform for students, families and members of the community. ${reach(c)}${has(c.highlights) ? ` ${c.highlights.trim()}` : ""}`,
      `With this in mind, we think ${org} would be a strong partner for us. ${connection(o)}`,
      `For this year, we are hoping to secure ${ask}. In return, we would recognize ${org} on stage at ${eventLabel(c)}, include your logo on our posters and performance videos, and feature you on our Instagram. ${packageLine(c)}`,
      `If this sounds like something ${org} would be open to, I would be glad to set up a quick call or send over any other details you need. ${replyLine(s)} If someone else on your team handles sponsorships, I would appreciate it if you pointed me in their direction.`,
    ];
  }

  const body = [...paras, signature(s, c)].map(clean).join("\n\n");
  return { subject: clean(subject), body };
}

export function gmailLink(to: string, subject: string, body: string, from?: string) {
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  if (from) params.set("authuser", from);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function outlookLink(to: string, subject: string, body: string) {
  const params = new URLSearchParams({ to, subject, body });
  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}

export function mailtoLink(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
