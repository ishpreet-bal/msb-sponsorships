import type { ClubProfile, Opportunity } from "./types";

const v = (s: string, fallback: string) => (s && s.trim() ? s.trim() : fallback);

function stats(p: ClubProfile) {
  const bits: string[] = [];
  if (p.members) bits.push(`${p.members} active members`);
  if (p.attendance) bits.push(`${p.attendance}+ attendees at ${v(p.eventName, "our showcase")}`);
  if (p.followers) bits.push(`${p.followers} followers on Instagram${p.instagram ? ` (${p.instagram})` : ""}`);
  return bits;
}

function signature(p: ClubProfile) {
  return [
    "Warm regards,",
    v(p.senderName, "[Your name]"),
    `${v(p.senderRole, "Sponsorship Coordinator")}, ${p.clubName}`,
    p.senderEmail || "[club email]",
    p.phone,
    p.instagram,
  ]
    .filter(Boolean)
    .join("\n");
}

export type Variant = "intro" | "follow-up" | "in-kind";

export function buildEmail(o: Opportunity, p: ClubProfile, variant: Variant = "intro") {
  const event = v(p.eventName, "our annual showcase");
  const when = p.eventDate ? ` on ${p.eventDate}` : "";
  const reach = stats(p);
  const reachLine = reach.length
    ? `Last year we reached ${reach.join(", ")}.`
    : "[Add a line on your reach: members, showcase attendance, Instagram followers.]";
  const ask = p.askAmount ? `a sponsorship of ${p.askAmount}` : "a sponsorship (cash or in-kind)";
  const pkg = p.packageLink
    ? `Our sponsorship package with tiers and benefits is here: ${p.packageLink}`
    : "I've attached our sponsorship package outlining tiers and benefits.";

  if (variant === "follow-up") {
    return {
      subject: `Following up: ${o.name} x ${shortName(p)} sponsorship`,
      body: [
        `Hi ${greetingName(o)},`,
        "",
        `I wanted to follow up on my note about partnering with ${p.clubName} for ${event}${when}. I know inboxes get busy, so I'll keep it short.`,
        "",
        o.angle ? o.angle : "",
        "",
        `Would you be open to a quick 10-minute call this week or next? Even a small contribution or an in-kind donation would make a real difference for our students.`,
        "",
        signature(p),
      ]
        .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
        .join("\n"),
    };
  }

  if (variant === "in-kind") {
    return {
      subject: `In-kind partnership with ${shortName(p)}? (McMaster cultural club)`,
      body: [
        `Hi ${greetingName(o)},`,
        "",
        `My name is ${v(p.senderName, "[Your name]")} and I'm with ${p.clubName}. ${p.aboutClub}`,
        "",
        `We're preparing for ${event}${when} and would love to feature ${o.name}. Rather than a cash ask, we're wondering if you'd consider an in-kind contribution — product, gift cards, food for performers, or prizes for our raffle.`,
        "",
        `In return, we'd thank ${o.name} on stage, tag you on our Instagram, and include your logo on event materials. ${reachLine}`,
        "",
        "Would that be something you'd consider? Happy to work around whatever is easiest for you.",
        "",
        signature(p),
      ].join("\n"),
    };
  }

  return {
    subject: `Sponsorship opportunity: ${o.name} x ${shortName(p)}`,
    body: [
      `Hi ${greetingName(o)},`,
      "",
      `My name is ${v(p.senderName, "[Your name]")}, ${v(p.senderRole, "Sponsorship Coordinator")} at ${p.clubName}. ${p.aboutClub}`,
      "",
      `We're reaching out because we think ${o.name} would be a great partner for ${event}${when}. ${o.angle}`,
      "",
      reachLine,
      "",
      `We'd love to discuss ${ask}. In return, partners receive logo placement on our showcase materials and performance videos, on-stage recognition, and dedicated social media features. ${pkg}`,
      "",
      `Would you be open to a short call, or could you point me to the right person on your team? Thank you for considering supporting Punjabi culture and student life at McMaster.`,
      "",
      signature(p),
    ].join("\n"),
  };
}

function shortName(p: ClubProfile) {
  const m = p.clubName.match(/\(([^)]+)\)/);
  return m ? m[1] : p.clubName;
}

function greetingName(o: Opportunity) {
  const local = o.email.split("@")[0] || "";
  const generic = /^(info|sales|support|contact|pr|cafe|events?|partnerships|culture|queen|donations|charitypot|ginfo|shop|hello|admin|marketing)$/i;
  if (local && !generic.test(local) && /^[a-z]+$/i.test(local) && local.length > 2 && !/\d/.test(local)) {
    return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
  }
  return `${o.name} team`;
}

export function gmailLink(to: string, subject: string, body: string, from?: string) {
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  if (from) params.set("authuser", from);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function mailtoLink(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function outlookLink(to: string, subject: string, body: string) {
  const params = new URLSearchParams({ to, subject, body });
  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}
