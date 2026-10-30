// State filing fees change — verify against each Secretary of State before going live.
export const STATES = {
  WY: { name: "Wyoming", formationFeeCents: 10200, annualReportFeeCents: 6000 },
  DE: { name: "Delaware", formationFeeCents: 11000, annualReportFeeCents: 30000 },
  NV: { name: "Nevada", formationFeeCents: 42500, annualReportFeeCents: 35000 },
  FL: { name: "Florida", formationFeeCents: 12500, annualReportFeeCents: 13875 },
  TX: { name: "Texas", formationFeeCents: 30000, annualReportFeeCents: 0 },
} as const;

export type StateCode = keyof typeof STATES;

export const PACKAGES = [
  {
    code: "basic",
    name: "Basic",
    priceCents: 4900,
    monthlyCents: 0,
    features: ["State filing of Articles", "Registered agent (first year)", "Digital document access"],
  },
  {
    code: "standard",
    name: "Standard",
    priceCents: 14900,
    monthlyCents: 0,
    features: [
      "Everything in Basic",
      "EIN from the IRS",
      "Operating agreement / bylaws",
      "Annual report reminders",
    ],
  },
  {
    code: "virtual-office",
    name: "Virtual Office + Bundle",
    priceCents: 17900,
    monthlyCents: 4999,
    features: [
      "Everything in Standard",
      "Business street address",
      "Unlimited mail scanning",
      "Virtual phone number with forwarding",
    ],
  },
] as const;

export type PackageCode = (typeof PACKAGES)[number]["code"];

export function getPackage(code: string) {
  return PACKAGES.find((p) => p.code === code);
}

export const SERVICES = [
  { code: "address-change", name: "Address Change", category: null, priceCents: 10000 },
  { code: "apostille", name: "Apostille", category: null, priceCents: 25000 },
  { code: "article-amendment", name: "Article Amendment", category: null, priceCents: 13500 },
  { code: "good-standing", name: "Certificate of Good Standing", category: null, priceCents: 3500 },
  { code: "incumbency", name: "Certificate of Incumbency", category: "Certificates", priceCents: 9500 },
  { code: "certified-copies", name: "Certified Copies of Articles", category: null, priceCents: 5000 },
  { code: "convert-entity", name: "Convert LLC to Corporation", category: "Convert Entity", priceCents: 29900 },
  { code: "binder-seal", name: "Corporate Binder and Seal", category: null, priceCents: 20000 },
  { code: "ownership-change", name: "Add or Remove Members / Officers", category: "Company Documents", priceCents: 9900 },
  { code: "meeting-minutes", name: "Custom Annual Meeting Minutes", category: null, priceCents: 5000 },
  { code: "dba", name: "DBA / Trade Name Filing", category: "DBA / Trade Name", priceCents: 9900 },
  { code: "ein", name: "Employer Identification Number (EIN)", category: null, priceCents: 7500 },
  { code: "s-corp-election", name: "S-Corp Election (Form 2553)", category: "IRS Services", priceCents: 9900 },
  { code: "name-change", name: "Name Change", category: null, priceCents: 13500 },
  { code: "board-minutes", name: "Special Meeting Minutes of the Board", category: null, priceCents: 2000 },
  { code: "shareholder-minutes", name: "Special Meeting of Shareholders", category: null, priceCents: 2000 },
];

export const MEMBER_ROLES = {
  LLC: ["Member", "Manager", "Organizer"],
  CORPORATION: ["Shareholder", "Director", "President", "Secretary", "Treasurer"],
} as const;
