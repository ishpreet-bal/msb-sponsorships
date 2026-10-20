export type OppType = "university" | "government" | "foundation" | "corporate" | "business";

/** Sponsor-specific research used to personalize outreach. All facts must come from a cited source. */
export interface Research {
  /** How the organisation reads in a sentence, e.g. "RBC" or "Prima Lighting". */
  orgName?: string;
  /** Name of the grant/program as it reads in a sentence, e.g. "the Multiculturalism and Anti-Racism Program". */
  programName?: string;
  /** One or two sentences on who they are and what they do (internal, shown on the page). */
  about: string;
  /** Sentence that finishes "I'm reaching out on behalf of our club because ...". Specific to this sponsor. */
  hook: string;
  /** Paragraph explaining why MSB is a fit for them specifically. Written in the club's "we" voice. */
  connection: string;
  /** What to ask this sponsor for, e.g. "a $500 to $1,000 cash sponsorship" or "an in-kind donation of lighting equipment for our showcase". */
  ask: string;
  /** Past sponsorships, community programs or giving history found online. */
  givingHistory: string[];
  /** Named person or team to address, if publicly listed (e.g. "Community Relations team"). */
  contactName: string;
  /** How best to reach the right person (form, email, LinkedIn, walk-in). */
  contactRoute: string;
  /** Rough odds and why, for internal prioritizing. */
  fit: "high" | "medium" | "low";
  fitReason: string;
  sources: string[];
  researchedOn: string;
}

export interface Opportunity {
  slug: string;
  name: string;
  type: OppType;
  industry: string;
  region: string;
  source: "club-list" | "research" | "auto-search";
  priority: 1 | 2 | 3;
  amount: string;
  deadline: string;
  deadlineDate: string | null;
  applyMethod: "email" | "form" | "portal" | "find-contact";
  applyUrl: string;
  email: string;
  website: string;
  summary: string;
  angle: string;
  eligibility: string[];
  funds: string[];
  excludes: string[];
  questions: string[];
  requiredDocs: string[];
  notes: string;
  sources: string[];
  verified: boolean;
  lastChecked: string;
  addedOn?: string;
  research?: Research;
}

/** Shared club details, same for every sender. */
export interface ClubProfile {
  clubName: string;
  eventName: string;
  eventDate: string;
  attendance: string;
  members: string;
  instagram: string;
  followers: string;
  askAmount: string;
  packageLink: string;
  aboutClub: string;
  highlights: string;
}

export const DEFAULT_PROFILE: ClubProfile = {
  clubName: "McMaster School of Bhangra (MSB)",
  eventName: "our annual showcase",
  eventDate: "",
  attendance: "",
  members: "",
  instagram: "",
  followers: "",
  askAmount: "",
  packageLink: "",
  aboutClub:
    "MSB is a student-run club that teaches and performs bhangra, the traditional folk dance of Punjab. We are open to students of every background, and our teams perform at campus events, community celebrations and competitions across Ontario.",
  highlights: "",
};

export interface Sender {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  /** Optional personal line added after the introduction, e.g. "I'm a third-year Health Sciences student and have danced with MSB for two years." */
  intro: string;
  send_via: "outlook" | "gmail" | "mail";
}

export type Status = "not-started" | "drafted" | "contacted" | "follow-up" | "applied" | "won" | "declined";

export const STATUS_ORDER: Status[] = ["not-started", "drafted", "contacted", "follow-up", "applied", "won", "declined"];

export const STATUS_LABEL: Record<Status, string> = {
  "not-started": "Not contacted",
  drafted: "Draft opened",
  contacted: "Emailed",
  "follow-up": "Needs follow-up",
  applied: "Applied",
  won: "Won",
  declined: "Declined",
};

export interface OutreachRow {
  slug: string;
  status: Status;
  updated_by: string | null;
  updated_at: string;
}

export interface LogRow {
  id: number;
  slug: string;
  action: "sent" | "status" | "note";
  status: Status | null;
  actor: string | null;
  sender_email: string | null;
  to_email: string | null;
  subject: string | null;
  note: string | null;
  created_at: string;
}

export const TYPE_LABEL: Record<OppType, string> = {
  university: "McMaster fund",
  government: "Government grant",
  foundation: "Arts grant",
  corporate: "Corporate",
  business: "Local business",
};
