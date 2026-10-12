export type OppType = "university" | "government" | "foundation" | "corporate" | "business";

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
}

export interface ClubProfile {
  clubName: string;
  senderName: string;
  senderRole: string;
  senderEmail: string;
  phone: string;
  eventName: string;
  eventDate: string;
  attendance: string;
  members: string;
  instagram: string;
  followers: string;
  askAmount: string;
  packageLink: string;
  aboutClub: string;
}

export const DEFAULT_PROFILE: ClubProfile = {
  clubName: "McMaster School of Bhangra (MSB)",
  senderName: "",
  senderRole: "Sponsorship Coordinator",
  senderEmail: "msb@mcmaster.ca",
  phone: "",
  eventName: "our annual showcase",
  eventDate: "",
  attendance: "",
  members: "",
  instagram: "",
  followers: "",
  askAmount: "",
  packageLink: "",
  aboutClub:
    "MSB is a student-run cultural dance club at McMaster University that teaches, performs and celebrates bhangra, the traditional folk dance of Punjab. We welcome students of every background and represent McMaster at performances and competitions.",
};

export type Status = "not-started" | "drafted" | "contacted" | "follow-up" | "applied" | "won" | "declined";

export const STATUS_LABEL: Record<Status, string> = {
  "not-started": "Not started",
  drafted: "Drafted",
  contacted: "Contacted",
  "follow-up": "Follow up",
  applied: "Applied",
  won: "Won 🎉",
  declined: "Declined",
};

export const TYPE_LABEL: Record<OppType, string> = {
  university: "McMaster fund",
  government: "Government grant",
  foundation: "Arts grant",
  corporate: "Corporate",
  business: "Local business",
};
