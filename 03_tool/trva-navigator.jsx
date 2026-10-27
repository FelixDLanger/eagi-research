import React, { useState, useMemo, useEffect } from "react";

/* ============================================================
   TRVA NAVIGATOR — v0.8.1 (research prototype)
   Tokenization Readiness & Value Assessment · Core Integrity family

   Vendor-neutral by design. Static build: every decision, score, chart and
   narrative is computed in the browser by deterministic rules — no model
   call, API key, data service or chart library (web fonts aside). The
   evidence base is frozen to the archived research run (EVIDENCE_STAMP)
   and changes only with a new version of the tool. v0.8 adds the
   October 2026 validation of the attested-failure indicator; v0.8.1
   drops the outside-view card's reference to an optional refresh workflow.
   ============================================================ */


/* ---------------- CONTENT LIBRARY ---------------- */

const E2E = [
  "Lead-to-Cash", "Source-to-Pay", "Plan-to-Fulfill", "Design-to-Operate",
  "Record-to-Report", "Recruit-to-Retire", "Acquire-to-Decommission", "Idea-to-Market",
];

const INDUSTRIES = [
  {
    id: "fsi", n: "Financial Services (Banking)", depth: "deep seed", vol: false,
    e2e: ["Lead-to-Cash", "Record-to-Report", "Source-to-Pay", "Recruit-to-Retire"],
    domains: [
      { id: "fsi1", n: "Customer & Distribution", areas: [
        { id: "fsi1a", n: "Client Lifecycle", caps: [
          { id: "c01", n: "Onboarding & KYC", cls: "com", reg: 1 },
          { id: "c02", n: "Client Master & Consent", cls: "com" },
          { id: "c03", n: "Advisory & Suitability", cls: "diff", reg: 1 },
        ]},
        { id: "fsi1b", n: "Channels & Experience", caps: [
          { id: "c04", n: "Digital Banking Experience", cls: "diff" },
          { id: "c05", n: "Contact Center Operations", cls: "com" },
        ]},
      ]},
      { id: "fsi2", n: "Products & Transactions", areas: [
        { id: "fsi2a", n: "Lending", caps: [
          { id: "c06", n: "Credit Origination", cls: "diff" },
          { id: "c07", n: "Loan Servicing", cls: "com" },
          { id: "c08", n: "Collections", cls: "com" },
        ]},
        { id: "fsi2b", n: "Payments & Treasury", caps: [
          { id: "c09", n: "Domestic Payments Operations", cls: "com", reg: 1 },
          { id: "c10", n: "Cross-Border Payments", cls: "diff", reg: 1, chain: 1 },
          { id: "c11", n: "Treasury & Liquidity Management", cls: "diff", chain: 1 },
        ]},
        { id: "fsi2c", n: "Markets & Custody", caps: [
          { id: "c12", n: "Trade Capture & Settlement", cls: "com", reg: 1 },
          { id: "c13", n: "Asset Servicing", cls: "com" },
          { id: "c14", n: "Digital Asset Custody & Tokenization", cls: "diff", reg: 1, chain: 1 },
        ]},
      ]},
      { id: "fsi3", n: "Finance, Risk & Compliance", areas: [
        { id: "fsi3a", n: "Finance", caps: [
          { id: "c15", n: "Record-to-Report", cls: "com", reg: 1 },
          { id: "c16", n: "Regulatory & Statutory Reporting", cls: "com", reg: 1 },
          { id: "c17", n: "Planning & FP&A", cls: "com" },
        ]},
        { id: "fsi3b", n: "Risk & Compliance", caps: [
          { id: "c18", n: "AML & Transaction Monitoring", cls: "com", reg: 1 },
          { id: "c19", n: "Credit Risk Analytics", cls: "diff" },
          { id: "c20", n: "Operational Risk", cls: "com" },
        ]},
      ]},
      { id: "fsi4", n: "Enterprise Services", areas: [
        { id: "fsi4a", n: "People & Procurement", caps: [
          { id: "c21", n: "Core HR & Payroll", cls: "com" },
          { id: "c22", n: "Source-to-Pay Operations", cls: "com" },
        ]},
        { id: "fsi4b", n: "Technology & Governance", caps: [
          { id: "c23", n: "Integration & API Platform Operations", cls: "com" },
          { id: "c24", n: "EA Governance & Portfolio", cls: "com" },
        ]},
      ]},
    ],
  },
  {
    id: "mfg", n: "Discrete Manufacturing (incl. Automotive)", depth: "deep seed", vol: true,
    e2e: ["Idea-to-Market", "Plan-to-Fulfill", "Lead-to-Cash", "Source-to-Pay", "Record-to-Report", "Acquire-to-Decommission"],
    domains: [
      { id: "mfg1", n: "Product & Innovation", areas: [
        { id: "mfg1a", n: "Idea-to-Market", caps: [
          { id: "m01", n: "Product Development", cls: "diff" },
          { id: "m02", n: "Engineering / PLM Master Data", cls: "com" },
          { id: "m03", n: "Configuration & Variant Management", cls: "diff" },
          { id: "m23", n: "R&D Portfolio & Technology Management", cls: "diff" },
        ]},
      ]},
      { id: "mfg2", n: "Supply Chain & Operations", areas: [
        { id: "mfg2a", n: "Plan", caps: [
          { id: "m04", n: "Demand Planning", cls: "diff" },
          { id: "m05", n: "Supply Planning & S&OP", cls: "diff" },
        ]},
        { id: "mfg2b", n: "Make", caps: [
          { id: "m06", n: "Production Execution / MES Integration", cls: "diff" },
          { id: "m07", n: "Quality Management", cls: "com", reg: 1 },
        ]},
        { id: "mfg2c", n: "Deliver & Source", caps: [
          { id: "m08", n: "Warehouse & Logistics", cls: "com" },
          { id: "m09", n: "Direct Procurement", cls: "com" },
          { id: "m20", n: "Transportation Management", cls: "com" },
          { id: "m21", n: "Indirect Procurement & Supplier Management", cls: "com" },
        ]},
        { id: "mfg2d", n: "Traceability & Sustainability", caps: [
          { id: "m10", n: "Batch / Serial Traceability & Provenance", cls: "diff", chain: 1 },
          { id: "m11", n: "ESG & Carbon Reporting", cls: "com", reg: 1 },
        ]},
      ]},
      { id: "mfg3", n: "Customer & Aftermarket", areas: [
        { id: "mfg3a", n: "Lead-to-Cash", caps: [
          { id: "m12", n: "Sales Order Management", cls: "com" },
          { id: "m13", n: "Pricing & Rebates", cls: "diff" },
          { id: "m14", n: "Aftermarket Service & Parts", cls: "diff", chain: 1 },
        ]},
      ]},
      { id: "mfg4", n: "Corporate", areas: [
        { id: "mfg4a", n: "Finance", caps: [
          { id: "m15", n: "Record-to-Report", cls: "com", reg: 1 },
          { id: "m16", n: "FP&A", cls: "com" },
          { id: "m17", n: "Intercompany & Netting", cls: "com", chain: 1 },
        ]},
        { id: "mfg4b", n: "People & Assets", caps: [
          { id: "m18", n: "Core HR", cls: "com" },
          { id: "m19", n: "Enterprise Asset Maintenance", cls: "diff" },
          { id: "m22", n: "Talent & Workforce Planning", cls: "com" },
          { id: "m24", n: "IT & Integration Platform Operations", cls: "com" },
        ]},
      ]},
    ],
  },
  {
    id: "cpr", n: "Consumer Products & Retail", depth: "starter seed", vol: true,
    e2e: ["Lead-to-Cash", "Plan-to-Fulfill", "Source-to-Pay", "Record-to-Report"],
    domains: [
      { id: "cpr1", n: "Demand & Commerce", areas: [
        { id: "cpr1a", n: "Omnichannel", caps: [
          { id: "r01", n: "Commerce & Order Orchestration", cls: "diff" },
          { id: "r02", n: "Loyalty & Promotions", cls: "diff" },
        ]},
        { id: "cpr1b", n: "Merchandising & Supply", caps: [
          { id: "r03", n: "Assortment & Replenishment", cls: "diff" },
          { id: "r04", n: "Supplier Traceability", cls: "com", chain: 1 },
        ]},
      ]},
      { id: "cpr2", n: "Corporate", areas: [
        { id: "cpr2a", n: "Finance & Operations", caps: [
          { id: "r05", n: "Record-to-Report", cls: "com", reg: 1 },
          { id: "r06", n: "Source-to-Pay", cls: "com" },
          { id: "r07", n: "Core HR", cls: "com" },
        ]},
      ]},
    ],
  },
  {
    id: "utl", n: "Utilities & Energy", depth: "starter seed", vol: false,
    e2e: ["Lead-to-Cash", "Acquire-to-Decommission", "Record-to-Report", "Source-to-Pay"],
    domains: [
      { id: "utl1", n: "Grid & Customer", areas: [
        { id: "utl1a", n: "Meter-to-Cash", caps: [
          { id: "u01", n: "Metering & Billing", cls: "com", reg: 1 },
          { id: "u02", n: "Customer Service", cls: "com" },
        ]},
        { id: "utl1b", n: "Assets & Field", caps: [
          { id: "u03", n: "Asset Maintenance & Field Ops", cls: "diff" },
          { id: "u04", n: "Outage & Reliability Management", cls: "diff" },
        ]},
      ]},
      { id: "utl2", n: "Energy Markets & Corporate", areas: [
        { id: "utl2a", n: "Trading & Settlement", caps: [
          { id: "u05", n: "Energy Trading & Scheduling", cls: "diff", chain: 1 },
          { id: "u06", n: "Certificates / REC Registry", cls: "com", chain: 1 },
        ]},
        { id: "utl2b", n: "Corporate", caps: [
          { id: "u07", n: "Record-to-Report", cls: "com", reg: 1 },
          { id: "u08", n: "FP&A", cls: "com" },
        ]},
      ]},
    ],
  },
];

const REGIONS = [
  { id: "sg", n: "Singapore", reg: "MAS PSA / FSMA; Project Guardian ecosystem", ai: "Model AI Governance Framework · AI Verify",
    cash: ["XSGD (regulated stablecoin)", "USDC", "Tokenized deposits (pilot)", "Wholesale CBDC (Ubin+ lineage, pilot)"] },
  { id: "sea", n: "SEA ex-SG (TH / MY / ID / VN / PH)", reg: "Fragmented: Thai SEC digital-asset regime; BNM / OJK / SBV variance", ai: "National AI guidelines (fragmented); ETDA guidance in TH",
    cash: ["USD stablecoins via licensed intermediaries", "Tokenized deposits (limited pilots)"] },
  { id: "eu", n: "European Union", reg: "MiCA (EMT / ART); DORA operational resilience", ai: "EU AI Act (obligations phasing in) · GDPR",
    cash: ["MiCA-regulated e-money tokens", "Tokenized deposits", "ECB wholesale CBDC trials"] },
  { id: "us", n: "United States", reg: "GENIUS Act stablecoin regime; CLARITY market structure (advancing)", ai: "NIST AI RMF · sectoral guidance",
    cash: ["Regulated payment stablecoins (USDC et al.)", "Tokenized deposits"] },
  { id: "global", n: "Global / Multi-region", reg: "Mixed — apply strictest common denominator", ai: "Strictest-common-denominator AI governance",
    cash: ["Corridor-dependent; regulated stablecoin + tokenized-deposit mix"] },
];

const CHAINS = [
  { id: "eth", n: "Ethereum", fin: 6, thr: 4, comp: 9, cash: 10, eco: 10,
    note: "Finality in minutes on L1 (faster on L2s). Deepest institutional tooling and native regulated stablecoins.",
    std: { rwa: "ERC-3643 + on-chain identity (permissioned RWA)", xborder: "ERC-20 stablecoin rails, typically on L2", trace: "ERC-1155 / attestations, typically on L2", intercompany: "ERC-20 tokenized-deposit representation", agentic: "L2 stablecoin rails + account abstraction / session keys" } },
  { id: "sol", n: "Solana", fin: 9, thr: 10, comp: 7, cash: 8, eco: 8,
    note: "Sub-second confirmation, finality in seconds; roadmap targets further cuts. Token-2022 adds transfer hooks and issuer controls.",
    std: { rwa: "Token-2022 (transfer hooks, delegate controls)", xborder: "Token-2022 stablecoin transfers", trace: "Compressed accounts / Token-2022", intercompany: "Token-2022 with allowlist hooks", agentic: "Token-2022 stablecoin + agent-payment intents (x402 / AP2-class)" } },
  { id: "xrpl", n: "XRP Ledger", fin: 8, thr: 7, comp: 8, cash: 7, eco: 6,
    note: "Deterministic finality in seconds; native issuer controls (authorized trust lines, clawback), built-in DEX; RLUSD cash leg, XSGD emerging.",
    std: { rwa: "Native issued assets / MPT with authorized trust lines", xborder: "Native payments + trust-line assets", trace: "Issued assets + memos (limited)", intercompany: "Issued assets with issuer controls", agentic: "Native payments + escrow for streaming settlement" } },
];

const USECASES = [
  { id: "rwa", n: "Asset tokenization (funds, bonds, deposits)", w: { comp: 0.35, cash: 0.25, eco: 0.20, fin: 0.10, thr: 0.10 } },
  { id: "xborder", n: "Cross-border payments & treasury", w: { fin: 0.30, cash: 0.25, thr: 0.15, comp: 0.20, eco: 0.10 } },
  { id: "trace", n: "Supply-chain traceability & provenance", w: { thr: 0.30, fin: 0.20, eco: 0.20, comp: 0.15, cash: 0.15 } },
  { id: "intercompany", n: "Intercompany netting & settlement", w: { comp: 0.30, cash: 0.30, fin: 0.25, thr: 0.10, eco: 0.05 } },
  { id: "agentic", n: "Agentic commerce / M2M payments", w: { fin: 0.30, thr: 0.25, cash: 0.25, comp: 0.15, eco: 0.05 } },
];

const CIAOF = [
  { d: "Extensions", p: "No core modifications; released interfaces only", g: "Differentiation routes to key-user or side-by-side — never into the core" },
  { d: "Integrations", p: "Standard APIs and events; no direct database access", g: "API-led through the governed catalog; point-to-point is debt by definition" },
  { d: "Data", p: "Master data governed at source; no redundant persistence", g: "MDM before replication; golden records precede any registry sync" },
  { d: "Processes", p: "Adopt standard processes where commodity", g: "Fit-to-standard by default; deviations pass through architecture governance" },
  { d: "Operations", p: "Lifecycle-clean operations; release cadence adherence", g: "Automated regression, near-zero-downtime maintenance, upgrade-stable ops" },
];

const PROC_MATRIX = [
  { p: "High-ROI, competitively differentiating", t: "Extend side-by-side (platform)", r: "Warrants investment — differentiation via extension, never core modification" },
  { p: "High-ROI but industry-standard practice", t: "Fit-to-standard + configuration", r: "ROI captured through adoption speed, not custom code" },
  { p: "Low revenue impact / commodity", t: "Standard — zero deviation", r: "Deviation requests denied by default; cost of ownership dominates" },
  { p: "Regulated (any ROI)", t: "Standard + certified add-on", r: "Compliance through maintained standard, not bespoke logic" },
  { p: "Experimental / volatile", t: "Side-by-side sandbox with sunset criteria", r: "Contain blast radius; promote or retire on evidence" },
  { p: "Legacy-differentiated, no longer differentiating", t: "Retire to standard (TIME: migrate / eliminate)", r: "Yesterday's edge is today's debt" },
];

// ---------------------------------------------------------------------------
// Executive 2x2 — ADDITIVE to PROC_MATRIX, which remains the gating logic.
// THE X AXIS IS NAMED EXPLICITLY: "standard-fit" = how completely the standard
// product already covers the process as delivered. It is NOT the firm's current
// level of standardisation. Without that label the top-right quadrant inverts and
// the tool would advise building where adoption is the correct answer.
// No target share is asserted anywhere: any percentage is a judgement call.
// ---------------------------------------------------------------------------
// Diagnostic KPI set. Most EA dashboards report LEVELS, which describe a state but
// cannot tell you whether governance is working. Architecture is an option on future
// change: its return appears as reduced dispersion, contained blast radius and faster
// recovery. Each entry pairs the level metric people already collect with the
// diagnostic that actually moves when governance is effective.
// ---------------------------------------------------------------------------
// EVIDENCE BASE. What the two working papers support, and what they do not. This block
// exists so the tool never asserts more than the research establishes.
// ---------------------------------------------------------------------------
// OPERATING FRAME. Five rules derived from the empirical results, each carrying the
// evidence that warrants it. These sit alongside the quadrant classification: the
// matrix says WHAT to do with a capability, the frame says HOW to run the assessment.
const OP_FRAME = [
  { n: "1", rule: "Assess data harmonisation and API integration first",
    why: "88% of explained variance sits in two of the five dimensions. That is where an assessment discriminates between firms; the remaining three add least information under time pressure.",
    warrant: "Shapley decomposition · descriptive", tone: "teal" },
  { n: "2", rule: "Impose no uniform minimum across dimensions",
    why: "No floor effect (p = 0.53) and no dimension acts as a necessary condition. Requiring every dimension to clear the same bar imposes a structure the evidence does not support.",
    warrant: "Weakest-link and necessity tests · null", tone: "muted" },
  { n: "3", rule: "Treat the score as a position, not a dial",
    why: "94% of variance is between firms; within-firm SD is 0.019. Revisit on transformation cycles, not reporting cycles — quarterly re-scoring measures noise.",
    warrant: "Variance decomposition · descriptive", tone: "teal" },
  { n: "4", rule: "Anchor the business case on downside, not upside",
    why: "No upside association survives, and no public-data estimate prices the downside: the one candidate — IT-related material-weakness disclosures followed by lower ROA — did not survive a reading of the flagged filings and is withdrawn. Frame investment as containment, argued from the matrix's logic, never as a forecast loss.",
    warrant: "No validated estimate · EAGI working paper, hand-check October 2026", tone: "red" },
  { n: "5", rule: "Record every judgement",
    why: "Axis assessments, regulatory flag, treatment chosen, accountable owner, review trigger. Because no rule is available, the judgement must be reviewable — this is the substitute for a threshold.",
    warrant: "Follows from the absence of any identifiable rule", tone: "gold" },
];

const EVIDENCE = [
  {
    claim: "No universal target percentage",
    finding: "Across 167 large US filers (950 firm-years), adherence level does not reliably predict performance: the primary association is not significant (p = 0.099), the inverted-U is rejected, and the highest-adherence quintile is not the best-performing group. No contrast survives multiplicity adjustment.",
    use: "The grid sets guardrails. Any share of standardised processes is a judgement call, not a benchmark.",
    tone: "gold",
  },
  {
    claim: "Adherence is a firm characteristic",
    finding: "About 94% of the variance in core integrity sits between firms; the within-firm standard deviation over seven years is 0.019.",
    use: "Treat the assessment as a description of where this firm is, not a dial to be turned quarter by quarter.",
    tone: "teal",
  },
  {
    claim: "The composite is not one thing",
    finding: "A Shapley decomposition attributes about 88% of explained variance to two dimensions — data harmonisation (56%) and API integration (31%). The dimensions do not co-move.",
    use: "Read the dimensions. A single blended percentage conceals which dimension is driving the picture.",
    tone: "teal",
  },
  {
    claim: "No floor, no ceiling, no prerequisite",
    finding: "Minimum, maximum and mean dimension scores are each non-significant in single-regressor specifications (floor p = 0.53; ceiling p = 0.056), and no dimension acts as a necessary condition.",
    use: "Do not enforce a uniform minimum across dimensions on evidential grounds. Prioritise by business context.",
    tone: "muted",
  },
  {
    claim: "Governance is not visible in what firms say",
    finding: "A twenty-term EA-governance lexicon fails every reliability test in annual reports (α = −0.062) while the same method works on AI vocabulary (α = 0.511). Governance language tracks disclosure mandates, not practice.",
    use: "Assess governance inside the firm. From outside, use compelled and attested signals — see the observability ladder below.",
    tone: "muted",
  },
  {
    claim: "Losing control is visible — but not priced",
    finding: "IT-control material weaknesses are disclosed and auditor-attested, and each genuine one is plain to a reader. A keyword indicator of them was followed by lower ROA, but when the flagged filings were read, only half of those that could be resolved disclosed an IT weakness of the flagged year. The association is withdrawn.",
    use: "Read Item 9A; do not keyword-match it. Frame the business case as downside containment, never as an expected loss.",
    tone: "red",
  },
  {
    claim: "Variance is where to look — not yet where value was found",
    finding: "The variance battery returned one statistical survivor (maximum drawdown), on a governance index that fails reliability, so no variance result can be attributed to governance.",
    use: "Instrument dispersion, blast radius and recovery inside the firm. Public data cannot supply them — see the diagnostic KPIs.",
    tone: "gold",
  },
  {
    claim: "A disciplined core predicts later AI adoption — exploratory",
    finding: "Firms with higher core integrity disclose more AI adoption the following year (p = 0.008, placebo outcome clean). Neither governance measure predicts adoption (p = 0.747; p = 0.831), and whether AI pays more on a stronger core fails randomization inference (p = 0.248). Between firms, and tested on the composite, not its dimensions.",
    use: "Assess the architectural baseline as a whole before the AI case — which dimension matters is untested: a candidate precondition, not a promised AI payoff.",
    tone: "teal",
  },
];

// The evidence base is frozen to one archived research run. It changes only with a new version
// of this tool, never at runtime, so every claim above can be traced to a reported number.
const EVIDENCE_STAMP = {
  run: "2026-08-12",
  notebook: "v13.0",
  panelHash: "736040245229",
  seed: 42,
  sample: "950 firm-years · 167 large US filers · 2019–2025",
  papers: [
    "CIAOF — Core Integrity as a Firm Characteristic (working paper, 2026)",
    "EAGI — What Public Disclosure Cannot Measure (working paper, 2026)",
  ],
  validation: "hand-check of the attested-failure indicator, October 2026 (EAGI working paper, Appendix C.23)",
};

// GOVERNANCE OBSERVABILITY LADDER (EAGI working paper). Public disclosure sources ordered by
// regulatory compulsion and attestation, top rung first. The ladder ranks SOURCES, not firms.
const EAGI_LADDER = [
  { n: "5", tone: "teal", tag: "COMPELLED · AUDITOR-ATTESTED", head: "Attested control failure",
    body: "IT-related material weakness in the internal-control report (Form 10-K Item 9A). A keyword indicator first returned lower next-year ROA; read against the filings, only half of the resolvable flags disclosed an IT weakness of the flagged year, so the association is withdrawn.",
    screen: "Item 9A of the annual report — read the conclusion: any material weakness touching IT general controls, current or remediated. A keyword match is not a weakness.",
    verdict: "Observable to a reader — keyword association withdrawn" },
  { n: "4", tone: "muted", tag: "COMPELLED · MECHANICAL", head: "Filing metadata",
    body: "Close-to-filing lag (median 47 days), late-filing notices, amendments, Form 8-K non-reliance and auditor-change items — every firm, every year. Lag alone is not associated with next-year ROA (p = 0.187).",
    screen: "A lengthening close, an NT 10-K, a 10-K/A, a Form 8-K Item 4.02 or 4.01.",
    verdict: "Universal coverage — no signal in the panel" },
  { n: "3", tone: "gold", tag: "COMPELLED TOPIC · DISCRETIONARY WORDING", head: "Mandated narrative",
    body: "Cybersecurity governance (Reg. S-K Item 106, Form 10-K Item 1C): in 3.7% of filings before the mandate and 98.9% after; outcomes null. Compliance vocabulary jumps at the mandate; architecture vocabulary does not.",
    screen: "Item 1C — who oversees technology risk, how often, with what expertise. Read the content, not the presence.",
    verdict: "Tracks the mandate, not the practice" },
  { n: "2", tone: "teall", tag: "COMPELLED FORM · DISCRETIONARY SUBSTANCE", head: "Structural disclosure",
    body: "Board technology committee; named CIO, CTO, CDO or chief architect in the proxy statement. Thin (mean 0.34); coding bounds are null at both extremes.",
    screen: "Whether technology has a board home and a named executive owner.",
    verdict: "Observable, too thin to test" },
  { n: "1", tone: "red", tag: "VOLUNTARY · DISCRETIONARY WORDING", head: "Voluntary narrative",
    body: "Twenty-term EA lexicon: α = −0.062; fifteen terms used by at most one firm in seven years. Roots are reliable only through accounting boilerplate; proximity phrases are not reliable.",
    screen: "Nothing. Do not score governance from what a firm says about architecture.",
    verdict: "Reliable or valid — never both" },
];

const PLACEMENT_TESTS = [
  { n: "1", tone: "muted", rule: "Test reliability before any hypothesis", why: "A null from an unreliable index is decided by the instrument. EA lexicon dispersion (0.137) sits below the 1/√20 = 0.224 independence benchmark." },
  { n: "2", tone: "teal", rule: "Run a positive control", why: "Same filings, same pipeline, neighbouring construct: AI lexicon α = 0.511 against −0.062. The failure is construct-specific." },
  { n: "3", tone: "gold", rule: "Bound deterministically before modelling", why: "Root prevalence caps any phrase lexicon. The roots reach every filing — in accounting senses." },
  { n: "4", tone: "teall", rule: "Bound ambiguity; read what the rule calls certain", why: "Code ambiguous cases both ways — but a bound covers only what the rule calls ambiguous. The ITGC bounds coincided, yet half of the readable flags marked no IT weakness of the flagged year." },
  { n: "5", tone: "red", rule: "Prefer what regulation compels and auditors attest — then validate the extraction", why: "Failure is reported because regulation compels it, and a reader can see it. A keyword rule could not tell a reported weakness from a hypothetical one." },
];

const DIAG_KPI = [
  { g: "Recovery", l: "Unplanned downtime (% of operating hours)",
    d: "Time-to-restore, P50 and P90", w: "Downtime totals hide whether you recover in an hour or a week. Restore time is the adaptability measure." },
  { g: "Cost stability", l: "Application run cost (% of IT spend)",
    d: "Run-cost variance and forecast error", w: "A stable high cost is manageable; a volatile cost is ungovernable and destroys planning." },
  { g: "Delivery", l: "Projects on time, budget, scope (%)",
    d: "Dispersion of delivery duration (P90/P50)", w: "Averages hide the tail. Predictability, not speed, is what architecture buys." },
  { g: "Decision quality", l: "Number of architecture review decisions",
    d: "Exception aging and reversal rate", w: "Counting decisions measures activity. Aging open exceptions and reversed decisions measure whether governance holds." },
  { g: "Risk concentration", l: "Custom code volume (% of objects)",
    d: "Criticality-weighted deviation exposure", w: "A dormant custom object is not a dormant risk register entry. Weight by process criticality and transaction volume." },
  { g: "Coupling", l: "Number of interfaces",
    d: "Blast radius: downstream systems affected per change", w: "Interface counts grow with scale. Dependency depth tells you what one change can break." },
  { g: "Debt trajectory", l: "Technical debt (% non-compliant)",
    d: "Median age of open non-compliance", w: "A stable percentage can hide debt that is quietly getting older and harder to retire." },
];

const IMPACT_GRID = [
  {
    q: "Differentiating - low standard-fit",
    impact: "High business impact",
    fit: "Standard product covers it poorly",
    move: "Side-by-side extension",
    detail: "Tailored logic, bespoke process, custom code - on the platform, never in the core. This is where build effort earns a return.",
    tone: "gold",
  },
  {
    q: "Differentiating - high standard-fit",
    impact: "High business impact",
    fit: "Standard product covers it well",
    move: "Adopt standard, extend only at the edge",
    detail: "Impact is captured through adoption speed. Rebuilding what the standard already delivers converts advantage into maintenance.",
    tone: "teal",
  },
  {
    q: "Supporting - low standard-fit",
    impact: "Low business impact",
    fit: "Standard product covers it poorly",
    move: "Simplify the process, then standardise",
    detail: "Change the process before changing the software. A gap in a supporting function rarely justifies build cost.",
    tone: "teal",
  },
  {
    q: "Supporting - high standard-fit",
    impact: "Low business impact",
    fit: "Standard product covers it well",
    move: "Standard - zero deviation",
    detail: "Enabling and supporting functions. Deviation requests denied by default; total cost of ownership dominates.",
    tone: "muted",
  },
];

const REG_FLAG = {
  label: "Regulatory constraint overrides the quadrant",
  detail: "Where a statutory or audit obligation applies, the treatment is standard plus a certified, maintained add-on regardless of impact or standard-fit. Compliance achieved through bespoke logic becomes an audit liability at the next upgrade.",
};

const AI_LADDER = [
  { id: "none", n: "None" },
  { id: "copilot", n: "Embedded copilots" },
  { id: "rag", n: "RAG on governed data" },
  { id: "domain", n: "Domain model services" },
  { id: "agentic", n: "Agentic automation" },
  { id: "economy", n: "Agent-economy participant" },
];

const PATHS = {
  std:  { l: "Fit-to-standard",              cls: "hm-std" },
  comp: { l: "Standard + compliance add-on", cls: "hm-comp" },
  ku:   { l: "Key-user (in-app)",                        cls: "hm-ku" },
  sbs:  { l: "Side-by-side (platform)",                       cls: "hm-sbs" },
  def:  { l: "Deferred to Advanced",          cls: "hm-def" },
};

const KPI_KEYS = [
  "Tech-debt reduction", "Upgrade stability", "Governance & compliance",
  "Agility & innovation", "Efficiency & synergy", "Integration simplification",
  "Data & AI readiness",
];

const STEPS = ["Context", "Business", "Data", "Apps", "Integration", "Tech & Sec", "Org", "AI", "Emerging", "Output"];

const TASK_BANDS = { "1k": 1000, "10k": 10000, "100k": 100000, "1m": 1000000 };
const TOK_BANDS = { "2k": 2000, "10k": 10000, "50k": 50000 };
const ROUTING = [
  { n: "Frontier-only", f: 1.0, s: 0.0 },
  { n: "Balanced (40 / 60)", f: 0.4, s: 0.6 },
  { n: "Small-first (10 / 90)", f: 0.1, s: 0.9 },
];

const DEFAULT_SEL = {
  industry: null, region: "sg", size: "ent", core: "ecc",
  opModel: "coordination", ma: "none",
  caps: {}, clsOverride: {}, e2e: {},
  mdm: "med", lake: "frag", residency: false, semantic: "partial",
  satellites: "mixed", time: "balanced",
  transition: "selective", instance: "regional", timeline: "24",
  middleware: "legacy", iface: "100–300", apiMaturity: "partial", events: false, b2b: false,
  cloud: "public", iam: "sso", grc: "manual", resilience: "std", dr: "standard", custody: "undecided",
  eaMaturity: "managed", skills: "small",
  mode: "tco", risk: "balanced",
  ai: "copilot", aiTasks: "10k", aiTok: "10k", priceF: "10", priceS: "0.5", valueTask: "",
  bcEnabled: true, usecase: "rwa",
  evoGreen: false, evoUx: false, evoNet: false,
};

const ARCHETYPES = [
  { id: "sgdigi", n: "SG digital bank — greenfield, agility + RWA", ind: "fsi",
    o: { region: "sg", size: "large", core: "none", opModel: "unification", transition: "green", instance: "single", mode: "agility", risk: "bold", ai: "agentic", aiTasks: "100k", bcEnabled: true, usecase: "rwa", custody: "qualified", mdm: "high", semantic: "governed", lake: "lakehouse", apiMaturity: "full", events: true, iam: "iga", grc: "tooled", resilience: "reg", dr: "ha", skills: "established", eaMaturity: "governed", middleware: "is", iface: "<100", satellites: "lean", time: "aggressive" } },
  { id: "searb", n: "SEA regional bank — brownfield, compliance-first", ind: "fsi",
    o: { region: "sea", core: "ecc", opModel: "coordination", transition: "brown", instance: "regional", timeline: "36+", mode: "compliance", risk: "conservative", ai: "copilot", bcEnabled: true, usecase: "xborder", custody: "qualified", mdm: "med", semantic: "partial", apiMaturity: "partial", middleware: "legacy", iface: "300–800", iam: "sso", resilience: "reg", dr: "drmulti", skills: "small", eaMaturity: "managed" } },
  { id: "dach", n: "DACH Mittelstand manufacturer — selective, TCO", ind: "mfg",
    o: { region: "eu", size: "large", core: "s4op", opModel: "replication", transition: "selective", instance: "regional", mode: "tco", ai: "rag", bcEnabled: true, usecase: "trace", custody: "waas", mdm: "med", semantic: "partial", residency: true, cloud: "private", middleware: "3p", skills: "small", eaMaturity: "managed" } },
  { id: "acq", n: "Acquisitive industrial — serial M&A, speed", ind: "mfg",
    o: { region: "us", ma: "serial", transition: "selective", instance: "regional", mode: "speed", ai: "rag", bcEnabled: true, usecase: "intercompany", custody: "hsm", middleware: "p2p", iface: ">800", mdm: "med", semantic: "partial", apiMaturity: "partial", satellites: "sprawl", time: "aggressive" } },
  { id: "omni", n: "Retail group — omnichannel, AI-first", ind: "cpr",
    o: { region: "global", opModel: "unification", transition: "selective", instance: "regional", mode: "agility", ai: "agentic", aiTasks: "1m", aiTok: "2k", bcEnabled: false, mdm: "high", semantic: "governed", lake: "lakehouse", apiMaturity: "full", events: true, dr: "ha", skills: "established", eaMaturity: "governed", middleware: "is", satellites: "sprawl", time: "aggressive" } },
  { id: "rec", n: "EU utility — certificate tokenization, sovereign", ind: "utl",
    o: { region: "eu", transition: "brown", instance: "regional", mode: "compliance", ai: "copilot", bcEnabled: true, usecase: "rwa", custody: "qualified", residency: true, cloud: "sovereign", resilience: "reg", dr: "drmulti", middleware: "legacy", mdm: "med" } },
  { id: "agent", n: "Global bank — agent-economy participant", ind: "fsi",
    o: { region: "global", opModel: "unification", instance: "single", mode: "agility", risk: "bold", ai: "economy", aiTasks: "1m", bcEnabled: true, usecase: "agentic", custody: "qualified", mdm: "high", semantic: "governed", lake: "lakehouse", apiMaturity: "full", events: true, b2b: true, iam: "iga", grc: "tooled", dr: "ha", skills: "established", eaMaturity: "governed", middleware: "is" } },
  { id: "gated", n: "Mid-market manufacturer — ambition > readiness (gates demo)", ind: "mfg",
    o: { region: "sea", size: "sme", transition: "brown", instance: "multi", mode: "speed", ai: "agentic", bcEnabled: true, usecase: "trace", custody: "undecided", mdm: "low", semantic: "none", lake: "none", apiMaturity: "none", skills: "none", eaMaturity: "initial", middleware: "p2p" } },
];


/* ---------------- HELPERS ---------------- */

const clamp = (v) => Math.max(5, Math.min(98, Math.round(v)));
const findInd = (id) => INDUSTRIES.find((i) => i.id === id);
const findReg = (id) => REGIONS.find((r) => r.id === id);
const aiRank = (id) => AI_LADDER.findIndex((a) => a.id === id);

function allCaps(ind) {
  if (!ind) return [];
  const out = [];
  ind.domains.forEach((d) => d.areas.forEach((a) => a.caps.forEach((c) =>
    out.push({ ...c, domain: d.n, area: a.n })
  )));
  return out;
}

const INSTANCE_REC = { unification: "single", coordination: "regional", replication: "regional", diversification: "multi" };

/* ---------------- ENGINE (deterministic — scores are final) ---------------- */

function computeGates(sel) {
  const g = [];
  if (aiRank(sel.ai) >= 4 && (sel.apiMaturity === "none" || sel.mdm === "low" || sel.semantic === "none"))
    g.push({ id: "g1", t: "Agentic AI gated — requires an API program, MDM at managed level or above, and a semantic layer. Ambition exceeds readiness." });
  if (sel.bcEnabled && sel.custody === "undecided")
    g.push({ id: "g2", t: "Tokenization gated — custody model undecided. Choose qualified custodian, self-managed HSM, or wallet-as-a-service before any rail decision." });
  if (sel.bcEnabled && sel.mdm === "low")
    g.push({ id: "g3", t: "Registry ↔ ledger sync at risk — MDM is low. Golden records are a precondition; tokenization on dirty master data fails silently." });
  if (sel.residency && sel.cloud === "public")
    g.push({ id: "g5", t: "Residency conflict — strict data residency declared against a public-cloud-only stance. Align deployment before target design." });
  return g;
}

function assignPath(cap, cls, sel, tier) {
  if (cap.reg) return { path: "comp", deferred: false };
  if (cls === "com") return { path: "std", deferred: false };
  let base;
  if (sel.mode === "agility") base = "sbs";
  else if (sel.mode === "speed") base = sel.apiMaturity !== "none" ? "sbs" : "ku";
  else base = "ku";
  if (sel.risk === "bold" && base === "ku" && cap.chain) base = "sbs";
  if (sel.risk === "conservative" && base === "sbs" && !cap.chain) base = "ku";
  let skillGap = false;
  if (base === "sbs" && sel.skills === "none") { base = "ku"; skillGap = true; }
  if (base === "sbs" && sel.eaMaturity === "initial" && !cap.chain) { base = "ku"; skillGap = true; }
  if (tier === "basic" && base === "sbs") return { path: "ku", deferred: true, skillGap };
  return { path: base, deferred: false, skillGap };
}

function computeAssignments(sel, tier) {
  const ind = findInd(sel.industry);
  return allCaps(ind).filter((c) => sel.caps[c.id]).map((c) => {
    const cls = sel.clsOverride[c.id] || c.cls;
    return { ...c, cls, ...assignPath(c, cls, sel, tier) };
  });
}

function computeKpis(sel, tier, asg, gates) {
  const N = Math.max(1, asg.length);
  const share = (p) => asg.filter((a) => a.path === p).length / N;
  const adv = tier === "adv";
  const D = {}; KPI_KEYS.forEach((k) => (D[k] = []));
  const add = (k, label, v) => D[k].push({ label, v });

  add("Tech-debt reduction", "Baseline", 45);
  if (sel.transition === "green") add("Tech-debt reduction", "Greenfield reset", 22);
  if (sel.transition === "selective") add("Tech-debt reduction", "Selective transition", 12);
  if (sel.transition === "brown") add("Tech-debt reduction", "Brownfield carry-over", 4);
  if (sel.middleware === "legacy") add("Tech-debt reduction", "Legacy middleware decommission path", 8);
  if (sel.middleware === "p2p") add("Tech-debt reduction", "Point-to-point elimination", 10);
  if (sel.instance === "single") add("Tech-debt reduction", "Single-instance consolidation", 8);
  if (sel.instance === "regional") add("Tech-debt reduction", "Regional-hub consolidation", 4);
  if (sel.satellites === "sprawl") add("Tech-debt reduction", "Satellite sprawl carried (As-Is)", -6);
  if (sel.satellites === "mixed") add("Tech-debt reduction", "Mixed satellite estate", -2);
  if (sel.time === "aggressive") add("Tech-debt reduction", "Aggressive rationalization (Gartner TIME)", 8);
  if (sel.time === "balanced") add("Tech-debt reduction", "Balanced rationalization (Gartner TIME)", 4);
  if (sel.ma === "serial") add("Tech-debt reduction", "Serial-M&A integration debt inflow", -4);
  add("Tech-debt reduction", "Zero-modification policy", 6);
  if (adv) add("Tech-debt reduction", "EA repository visibility", 6);

  add("Upgrade stability", "Baseline", 45);
  add("Upgrade stability", "Fit-to-standard share", Math.round((share("std") + share("comp")) * 30));
  add("Upgrade stability", "Key-user share (upgrade-safe)", Math.round(share("ku") * 15));
  if (adv) add("Upgrade stability", "Side-by-side share (decoupled)", Math.round(share("sbs") * 18));
  if (sel.transition === "brown") add("Upgrade stability", "Legacy remediation debt", -6);
  if (sel.eaMaturity === "governed") add("Upgrade stability", "Governed deviation gates", 4);
  if (sel.mode === "compliance") add("Upgrade stability", "Compliance-first gates", 4);
  if (sel.dr !== "standard") add("Upgrade stability", "Near-zero-downtime maintenance approach", 3);
  if (adv) add("Upgrade stability", "Fit-to-standard analytics", 4);

  add("Governance & compliance", "Baseline", 45);
  if (adv) add("Governance & compliance", "EA + process governance stack", 12);
  if (sel.mode === "compliance") add("Governance & compliance", "Compliance-first weighting", 8);
  if (sel.instance === "single") add("Governance & compliance", "Single-template control", 6);
  if (sel.instance === "regional") add("Governance & compliance", "Regional-template control", 3);
  if (asg.some((a) => a.reg)) add("Governance & compliance", "Regulated capabilities on standard + add-on", 6);
  if (sel.iam === "iga") add("Governance & compliance", "Mature identity governance (IGA)", 6);
  if (sel.iam === "sso") add("Governance & compliance", "Federated SSO", 3);
  if (sel.grc === "tooled") add("Governance & compliance", "Tooled SoD / GRC", 4);
  if (sel.resilience === "reg") add("Governance & compliance", "Regulated-grade resilience (DORA-class)", 3);
  if (sel.dr === "drmulti") add("Governance & compliance", "Multi-region DR with tested RTO / RPO", 4);
  if (sel.dr === "ha") add("Governance & compliance", "High-availability pair, near-zero-downtime", 2);
  if (sel.eaMaturity === "governed") add("Governance & compliance", "Governed EA practice", 6);
  if (sel.eaMaturity === "initial") add("Governance & compliance", "EA practice at initial maturity", -4);
  if (sel.bcEnabled && sel.custody !== "undecided") add("Governance & compliance", "Custody model decided", 4);
  if (adv && sel.bcEnabled) add("Governance & compliance", "On-chain identity / allowlist layer", 3);
  if (adv && aiRank(sel.ai) >= 1) add("Governance & compliance", "AI governance overlay (" + findReg(sel.region).ai.split("·")[0].trim() + ")", 3);
  gates.forEach(() => add("Governance & compliance", "Open readiness gate", -3));

  add("Agility & innovation", "Baseline", 45);
  if (adv && share("sbs") > 0) add("Agility & innovation", "Side-by-side extension capacity", 12);
  if (sel.apiMaturity === "full") add("Agility & innovation", "API-first landscape", 10);
  if (sel.apiMaturity === "partial") add("Agility & innovation", "Partial API coverage", 5);
  if (sel.events) add("Agility & innovation", "Event-driven patterns", 6);
  if (sel.transition === "green") add("Agility & innovation", "Cloud-native core", 8);
  else add("Agility & innovation", "Private / hybrid cloud core", 5);
  if (sel.skills === "established") add("Agility & innovation", "Established platform engineering", 6);
  if (sel.skills === "small") add("Agility & innovation", "Small platform team", 3);
  if (sel.skills === "none") add("Agility & innovation", "Platform skills gap", -4);
  if (aiRank(sel.ai) >= 2) add("Agility & innovation", "AI at RAG level or above", 4);
  if (aiRank(sel.ai) >= 4 && !gates.some((g) => g.id === "g1")) add("Agility & innovation", "Agentic automation (ungated)", 6);
  if (adv && sel.bcEnabled) add("Agility & innovation", "Tokenization optionality", 6);
  if (sel.mode === "agility") add("Agility & innovation", "Agility-first weighting", 4);

  add("Efficiency & synergy", "Baseline", 45);
  if (sel.instance === "single") add("Efficiency & synergy", "Instance consolidation", 12);
  if (sel.instance === "regional") add("Efficiency & synergy", "Regional hubs", 7);
  const nE2E = Object.values(sel.e2e).filter(Boolean).length;
  add("Efficiency & synergy", "E2E process coverage", Math.min(9, Math.round(nE2E * 1.5)));
  if (adv) add("Efficiency & synergy", "Process-mining feedback loop", 6);
  if (sel.middleware === "legacy" || sel.middleware === "p2p") add("Efficiency & synergy", "Middleware consolidation gain", 8);
  if (sel.ma === "serial" && sel.instance !== "multi") add("Efficiency & synergy", "Carve-out-ready template (M&A)", 4);
  if (adv && sel.b2b) add("Efficiency & synergy", "B2B / EDI automation", 3);
  if (sel.size === "ent") add("Efficiency & synergy", "Shared-services leverage", 3);

  add("Integration simplification", "Baseline", 45);
  add("Integration simplification", "Single integration-platform target", 12);
  if (sel.middleware === "legacy") add("Integration simplification", "Legacy middleware retirement (sunset horizon)", 8);
  if (sel.middleware === "p2p") add("Integration simplification", "Point-to-point elimination", 12);
  if (sel.events) add("Integration simplification", "Event-driven decoupling", 5);
  add("Integration simplification", "API management & governed catalog", 6);
  if (adv && sel.bcEnabled) add("Integration simplification", "New external surface (custody / RPC)", -4);
  if (adv && aiRank(sel.ai) >= 4) add("Integration simplification", "Agent tool-registry reuse of API catalog ⟡", 3);

  add("Data & AI readiness", "Baseline", 45);
  if (sel.mdm === "high") add("Data & AI readiness", "MDM high — golden records", 14);
  if (sel.mdm === "med") add("Data & AI readiness", "MDM managed", 7);
  if (sel.mdm === "low") add("Data & AI readiness", "MDM low", -6);
  if (sel.semantic === "governed") add("Data & AI readiness", "Governed semantic layer", 12);
  if (sel.semantic === "partial") add("Data & AI readiness", "Partial data catalog", 6);
  if (sel.semantic === "none") add("Data & AI readiness", "No semantic layer", -4);
  if (sel.lake === "lakehouse") add("Data & AI readiness", "Governed lakehouse — unified analytics / AI feed", 8);
  if (sel.lake === "frag") add("Data & AI readiness", "Fragmented warehouse / lake estate", 3);
  if (sel.lake === "none") add("Data & AI readiness", "No analytical platform", -3);
  if (sel.residency && sel.cloud !== "public") add("Data & AI readiness", "Residency handled by deployment", 4);
  if (gates.some((g) => g.id === "g5")) add("Data & AI readiness", "Residency / cloud conflict", -8);
  if (sel.apiMaturity === "full") add("Data & AI readiness", "APIs expose governed data", 6);
  if (sel.apiMaturity === "partial") add("Data & AI readiness", "Partial API exposure", 3);
  const r = aiRank(sel.ai);
  if (r === 1) add("Data & AI readiness", "Copilot adoption", 4);
  if (r === 2) add("Data & AI readiness", sel.semantic !== "none" ? "RAG on governed data" : "RAG without semantic base", sel.semantic !== "none" ? 8 : 2);
  if (r === 3) add("Data & AI readiness", "Domain model services", 6);
  if (r >= 4) add("Data & AI readiness", gates.some((g) => g.id === "g1") ? "Ambition exceeds readiness (gated)" : "Agentic readiness achieved", gates.some((g) => g.id === "g1") ? -10 : 12);
  if (adv) add("Data & AI readiness", "Data fabric & planning layer", 6);

  const out = {};
  KPI_KEYS.forEach((k) => (out[k] = clamp(D[k].reduce((s, d) => s + d.v, 0))));
  return { scores: out, drivers: D };
}

function chainResult(sel) {
  const uc = USECASES.find((u) => u.id === sel.usecase);
  const rows = CHAINS.map((c) => ({
    ...c,
    score: +(uc.w.fin * c.fin + uc.w.thr * c.thr + uc.w.comp * c.comp + uc.w.cash * c.cash + uc.w.eco * c.eco).toFixed(2),
  })).sort((a, b) => b.score - a.score);
  const permissioned = sel.usecase === "intercompany" || (sel.mode === "compliance" && sel.usecase === "rwa");
  return { uc, rows, top: rows[0], permissioned };
}

function tokenEconomics(sel) {
  const tasks = TASK_BANDS[sel.aiTasks];
  const tok = TOK_BANDS[sel.aiTok];
  const pF = parseFloat(sel.priceF) || 0;
  const pS = parseFloat(sel.priceS) || 0;
  const vt = parseFloat(sel.valueTask);
  return ROUTING.map((rt) => {
    const cpt = (tok * (rt.f * pF + rt.s * pS)) / 1e6;
    return { n: rt.n, cpt, monthly: cpt * tasks, margin: isNaN(vt) ? null : vt - cpt, marginM: isNaN(vt) ? null : (vt - cpt) * tasks };
  });
}

function envTracks(sel, ind) {
  const volumeCritical = !!(ind && ind.vol);
  const tracks = sel.instance === "single" ? ["Global template"] :
    sel.instance === "regional" ? ["Hub APJ", "Hub EMEA", "Hub AMER"] :
    ["Country A", "Country B", "Country C", "Country D", "+n"];
  const envs = ["DEV", "TEST / QA", ...(volumeCritical ? ["PERF"] : []), "PROD"];
  const sizeOf = (e) => e === "PROD" ? (volumeCritical ? (sel.size === "ent" ? "XL" : "L") : "M")
    : e === "PERF" ? "L" : e === "TEST / QA" ? "M" : "S";
  const nplus1 = sel.core !== "none";
  return { tracks, envs, sizeOf, volumeCritical, nplus1 };
}

function buildLandscape(sel, tier, gates, cr) {
  const adv = tier === "adv";
  const conv = " ⟡";
  const L = [];
  L.push({ n: "Experience & Channels", items: [
    { n: "Web & mobile experience" },
    ...(sel.b2b ? [{ n: "Partner / B2B portal" }] : []),
    ...(sel.evoUx ? [{ n: "UX modernization program" }] : []),
  ]});
  if (sel.ai !== "none") {
    const r = aiRank(sel.ai);
    const gated = gates.some((g) => g.id === "g1");
    L.push({ n: "AI & Agents", items: [
      { n: "Embedded copilots (suite-native)" },
      ...(r >= 2 ? [{ n: "RAG on governed data", lic: adv }] : []),
      ...(r >= 3 ? [{ n: "Domain model services", lic: 1 }] : []),
      ...(r >= 4 && !gated ? [
        { n: "Agent orchestration gateway", lic: 1 },
        { n: "Tool registry = API catalog" + conv, lic: 1 },
        { n: "Non-human identity & spend controls" + conv, lic: 1 },
        { n: "API quota & throttling for non-human consumers" + conv, lic: 1 },
        { n: "Eval & observability", lic: 1 },
      ] : []),
      ...(r >= 5 && !gated ? [{ n: "M2M payment readiness" + conv }] : []),
      ...(r >= 4 && gated ? [{ n: "Agentic layer — gated (see readiness)", gate: 1 }] : []),
    ]});
  }
  const coreN = sel.cloud === "sovereign" ? "Sovereign-region cloud ERP core" : sel.transition === "green" && sel.cloud === "public" ? "Tier-1 public-cloud ERP core" : "Tier-1 private-cloud ERP core";
  L.push({ n: "Business Applications", items: [
    { n: coreN + " (system of record)" },
    { n: sel.satellites === "lean" ? "Integrated suite modules" : sel.satellites === "mixed" ? "Best-of-breed satellites — keep (CRM / HCM)" : "Satellite estate — rationalize (Gartner TIME)" },
    ...(adv ? [{ n: "Industry cloud add-ons where fit-gap demands", lic: 1 }] : []),
  ]});
  L.push({ n: "Data & Semantics", items: [
    { n: "Embedded analytics" },
    ...(sel.semantic === "governed" ? [{ n: "Semantic layer — grounds AI" + conv }] : []),
    ...(sel.mdm === "low" ? [{ n: "MDM program (wave 0–1)", gate: 1 }] : [{ n: "Master-data governance" }]),
    ...(sel.lake === "lakehouse" ? [{ n: "Governed lakehouse (analytics + AI feed)" }] : sel.lake === "frag" ? [{ n: "Warehouse / lake — consolidate" }] : []),
    ...(adv ? [{ n: "Enterprise data fabric", lic: 1 }, { n: "Planning & simulation", lic: 1 }] : []),
  ]});
  L.push({ n: "Integration & APIs", items: [
    { n: "Integration platform — API-led" },
    { n: "Governed API catalog" + conv },
    ...(adv && sel.events ? [{ n: "Event backbone", lic: 1 }] : []),
    ...(adv && sel.b2b ? [{ n: "B2B / EDI trading-partner mgmt", lic: 1 }] : []),
  ]});
  if (adv && sel.bcEnabled) {
    L.push({ n: "Tokenization Rail", items: [
      { n: "Settlement: " + cr.top.n + (cr.permissioned ? " (public leg only — primary rail permissioned)" : ""), lic: 1 },
      { n: cr.top.std[sel.usecase], lic: 1 },
      { n: "Identity & allowlist — shared with IAM" + conv, lic: 1 },
      { n: "Cash leg: " + findReg(sel.region).cash[0], lic: 1 },
      { n: "DvP + M2M settlement orchestration" + conv, lic: 1 },
      ...(sel.custody === "undecided" ? [{ n: "Custody undecided — gated", gate: 1 }] : [{ n: "Custody: " + ({ qualified: "qualified custodian", hsm: "self-managed HSM", waas: "wallet-as-a-service" }[sel.custody]) }]),
    ]});
  }
  return L;
}

function roadmapWaves(sel, gates, asgAdv) {
  const w0 = [];
  gates.forEach((g) => {
    if (g.id === "g1") w0.push("Charter the API program; start MDM uplift and semantic-layer design");
    if (g.id === "g2") w0.push("Decide the custody model (qualified / HSM / WaaS) — board-level");
    if (g.id === "g3") w0.push("MDM remediation for tokenization-relevant objects");
    if (g.id === "g5") w0.push("Resolve residency vs cloud stance; confirm sovereign / private options");
  });
  if (sel.eaMaturity === "initial") w0.push("Stand up EA governance charter and decision matrix");
  if (w0.length === 0) w0.push("Architecture baseline, KPI instrumentation, decision-matrix sign-off");
  const w1 = [
    (sel.transition === "green" ? "Greenfield core implementation" : sel.transition === "selective" ? "Selective transition program" : "Brownfield conversion + remediation backlog"),
    ...(sel.middleware !== "is" ? ["Middleware migration to " + "the integration platform" + " (sunset horizon)"] : []),
    (sel.instance === "single" ? "Global template build & first rollout" : sel.instance === "regional" ? "Regional template & hub rollout" : "Country template governance"),
    ...(sel.mdm !== "high" ? ["MDM uplift to managed / high"] : []),
    "Data migration & cutover rehearsals (mock go-lives)",
    ...(sel.lake !== "lakehouse" && aiRank(sel.ai) >= 2 ? ["Analytical-platform consolidation toward a governed lakehouse"] : []),
    ...(aiRank(sel.ai) >= 2 && sel.semantic !== "governed" ? ["Semantic layer build-out"] : []),
    ...(sel.dr !== "standard" ? ["DR runbook, failover test, near-zero-downtime maintenance setup"] : []),
  ];
  const w2 = [
    ...(asgAdv.some((a) => a.path === "sbs") ? ["Side-by-side platform build-out for differentiating capabilities"] : []),
    ...(sel.events ? ["Event-driven adoption for order / status flows"] : ["Selective event-driven pilots"]),
    ...(sel.b2b ? ["B2B / EDI automation"] : []),
    "EA repository" + " + " + "process mining" + " feedback loop",
    ...(aiRank(sel.ai) >= 1 ? ["Copilot rollout" + (aiRank(sel.ai) >= 2 ? " → RAG on governed data" : "")] : []),
    ...(aiRank(sel.ai) >= 3 ? ["Domain model services"] : []),
    ...(sel.region === "eu" && aiRank(sel.ai) >= 3 ? ["EU AI Act conformity-assessment preparation"] : []),
  ];
  const gatedAI = gates.some((g) => g.id === "g1");
  const w3 = [
    ...(sel.bcEnabled ? ["Tokenization rollout — " + USECASES.find((u) => u.id === sel.usecase).n] : []),
    ...(aiRank(sel.ai) >= 4 ? [gatedAI ? "Agentic automation — after gate closure" : "Agentic automation to production"] : []),
    ...(aiRank(sel.ai) >= 5 ? ["Agent-economy participation (M2M settlement)"] : []),
    ...(sel.evoGreen ? ["Green-IT & sustainability program (incl. carbon / net-zero data readiness)"] : []),
    ...(sel.evoNet ? ["Zero-trust / SASE network evolution"] : []),
    ...(sel.evoUx ? ["UX modernization wave"] : []),
  ];
  if (w3.length === 0) w3.push("Emerging-tech option reviews (annual)");
  const T = { "12": 12, "24": 24, "36+": 36 }[sel.timeline];
  const spans = { "12": [[0, 2], [2, 6], [6, 10], [10, 12]], "24": [[0, 3], [3, 10], [10, 18], [18, 24]], "36+": [[0, 4], [4, 14], [14, 26], [26, 36]] }[sel.timeline];
  const names = ["Wave 0 — Foundations & Gates", "Wave 1 — Core & Data", "Wave 2 — Platform & AI", "Wave 3 — Emerging Value"];
  return { T, waves: [w0, w1, w2, w3].map((items, i) => ({ n: names[i], s: spans[i][0], e: spans[i][1], items })) };
}

function composite(scores) {
  return +(KPI_KEYS.reduce((s, k) => s + scores[k], 0) / KPI_KEYS.length).toFixed(1);
}

/* ---------------- NARRATIVE (deterministic — composed from engine outputs) ---------------- */
// Replaces the former model call. Every sentence is selected by a rule over the engine's outputs,
// so the same inputs always produce the same text, and each red-team point names the field of the
// export JSON it rests on. Nothing leaves the browser.

const MODE_L = { tco: "total cost of ownership", agility: "agility", compliance: "compliance and risk", speed: "speed to value" };
const TRANS_L = { green: "greenfield implementation", selective: "selective transition", brown: "brownfield conversion" };
const INST_L = { single: "a single global instance", regional: "regional hub instances", multi: "country-level instances" };
const CUSTODY_L = { qualified: "a qualified custodian", hsm: "a self-managed HSM", waas: "wallet-as-a-service", undecided: "an undecided custody model" };
const numbered = (arr) => arr.map((t, i) => (i + 1) + ". " + t).join("\n");

function narrativeContext(sel, asgAdv, kpiAdv, gates, cr, tokEco, env, rm, sensitivity) {
  const count = (p) => asgAdv.filter((a) => a.path === p).length;
  const ranked = KPI_KEYS.map((k) => ({ k, v: kpiAdv.scores[k] })).sort((a, b) => a.v - b.v);
  const worstDriver = (k) => (kpiAdv.drivers[k] || []).filter((d) => d.v < 0).sort((a, b) => a.v - b.v)[0];
  return {
    sel, gates, cr, tokEco, env, rm, sensitivity, count, ranked, worstDriver,
    n: asgAdv.length, reg: findReg(sel.region), ind: findInd(sel.industry),
    regCount: asgAdv.filter((a) => a.reg).length,
    skillGaps: asgAdv.filter((a) => a.skillGap).length,
    comp: composite(kpiAdv.scores), kpi: kpiAdv.scores,
  };
}

function memoText(c) {
  const s = c.sel;
  const out = [];
  out.push("To the Executive Committee — " + (c.ind ? c.ind.n : "selected industry") + " · " + c.reg.n + ". " +
    "The proposed architecture optimizes for " + MODE_L[s.mode] + " through a " + TRANS_L[s.transition] + " on " +
    INST_L[s.instance] + " over " + s.timeline + " months. Of " + c.n + " capabilities in scope, " +
    (c.count("std") + c.count("comp")) + " run on the standard (" + c.regCount + " regulated, on certified add-ons), " +
    c.count("ku") + " in key-user extensions and " + c.count("sbs") + " side-by-side. None modifies the core.");

  const T = [];
  if (c.regCount) T.push("Regulated capabilities stay on the standard plus certified add-ons, even where teams ask for flexibility: release stability is the cheaper control.");
  if (c.count("sbs")) T.push("Differentiation is isolated on the side-by-side platform (" + c.count("sbs") + " capabilities): build effort goes only where impact warrants it, and the platform team becomes a standing cost.");
  else if (c.count("ku")) T.push("Differentiating capabilities are handled in key-user extensions under the " + MODE_L[s.mode] + " weighting: upgrade-safe, at the price of extension depth.");
  if (c.skillGaps) T.push(c.skillGaps + " capabilities were demoted from side-by-side to key-user because platform skills or EA maturity cannot yet carry them.");
  if (c.gates.some((g) => g.id === "g1")) T.push("Agentic AI is staged behind the API programme, master data and a semantic layer: readiness before reach.");
  else if (aiRank(s.ai) >= 2) T.push("AI is grounded on governed data before it is given agency.");
  if (s.bcEnabled) T.push(c.cr.permissioned
    ? "Settlement runs on a permissioned tokenized-deposit rail; " + c.cr.top.n + " is scored for the asset leg only."
    : c.cr.top.n + " leads for " + c.cr.uc.n.toLowerCase() + " (score " + c.cr.top.score.toFixed(2) + "), with the cash leg on " + c.reg.cash[0] + ".");
  if (s.middleware === "legacy" || s.middleware === "p2p") T.push("Legacy integration is retired on a fixed sunset horizon rather than case by case.");
  if (INSTANCE_REC[s.opModel] !== s.instance) T.push("The instance strategy departs from the " + s.opModel + " operating-model default (" + INSTANCE_REC[s.opModel] + "); the deviation needs a named owner.");
  if (T.length < 3) T.push("Every extension request is held to the decision matrix: impact and standard-fit first, regulation as an override.");
  out.push("Trade-offs taken deliberately:\n" + numbered(T.slice(0, 3)));

  const R = [];
  c.gates.forEach((g) => R.push(g.t.split(" — ")[0] + " — open."));
  const low = c.ranked[0];
  const wd = c.worstDriver(low.k);
  R.push("Weakest axis: " + low.k + " at " + low.v + (wd ? " — largest drag: " + wd.label.toLowerCase() : "") + ".");
  if (c.sensitivity[0]) R.push("The composite is most sensitive to “" + c.sensitivity[0].label.toLowerCase() + "” (" + (c.sensitivity[0].d >= 0 ? "+" : "") + c.sensitivity[0].d + " points); the result rests on that input.");
  if (s.ma === "serial") R.push("Serial acquisitions keep importing integration debt.");
  if (c.env.volumeCritical) R.push("Volume-critical sizing: performance regression needs its own tenant.");
  out.push("Residual risks:\n" + numbered(R.slice(0, 3)));

  const A = [];
  const GATE_ASK = { g1: "Charter the API programme and fund the master-data and semantic-layer uplift.", g2: "Decide the custody model at board level.", g3: "Fund master-data remediation for tokenization-relevant objects.", g5: "Resolve the residency and cloud stance before target design." };
  c.gates.forEach((g) => GATE_ASK[g.id] && A.push(GATE_ASK[g.id]));
  A.push("Approve Wave 0 — " + c.rm.waves[0].items.slice(0, 2).join("; ") + ".");
  A.push("Appoint an accountable owner for every deviation from standard, and record each judgement: axis assessments, regulatory flag, treatment, owner, review trigger.");
  out.push("Decisions requested:\n" + numbered(A.slice(0, 3)));

  out.push("Evidence stance: the research base (" + EVIDENCE_STAMP.sample + ") supports no universal adherence target, and no upside association survives. The case for discipline is containment of downside, not margin.");
  return out.join("\n\n");
}

function redTeamText(persona, c) {
  const s = c.sel;
  const L = [];
  const f = (field, t) => L.push("• [" + field + "] " + t);
  if (persona === "TCO hawk") {
    if (c.count("sbs")) f("paths", c.count("sbs") + " side-by-side builds are each a permanent run-cost line. Test every one against impact × standard-fit before funding.");
    f("environmentTracks", c.env.tracks.length + " track(s) × " + c.env.envs.length + " environments = " + c.env.tracks.length * c.env.envs.length + " tenants to license and operate.");
    if (s.middleware !== "is") f("inputs.middleware", "Dual running lasts until the integration sunset. Is the date in the roadmap, or only the intent?");
    if (s.satellites !== "lean") f("inputs.satellites", "A '" + s.satellites + "' satellite estate carries licences the rationalization wave has not yet retired.");
    if (aiRank(s.ai) >= 1) {
      const fr = c.tokEco[0], sm = c.tokEco[c.tokEco.length - 1];
      f("tokenEconomics", "Frontier-only routing costs $" + Math.round(fr.monthly).toLocaleString("en-US") + " a month against $" + Math.round(sm.monthly).toLocaleString("en-US") + " small-first. Who owns the routing policy?");
      if (sm.margin === null) f("inputs.valueTask", "No value per task is declared, so the margin condition is untested.");
    }
    if (s.bcEnabled) f("chain", "Tokenization adds custody, rail and attestation cost, and no value case is declared in the inputs.");
    if (s.timeline === "12" && s.transition !== "green") f("inputs.timeline", "Twelve months for a " + TRANS_L[s.transition] + " is a compressed plan; price the overrun.");
    f("kpis.advanced", "Efficiency & synergy scores " + c.kpi["Efficiency & synergy"] + ". A saving counts only once it has a named budget line.");
  } else if (persona === "CISO") {
    if (s.iam !== "iga") f("inputs.iam", "'" + s.iam + "' identity does not govern non-human identities; agents and integrations need identity governance, not single sign-on.");
    if (s.grc !== "tooled") f("inputs.grc", "Manual segregation-of-duties control over " + c.regCount + " regulated capabilities will not scale.");
    if (aiRank(s.ai) >= 4) f("inputs.ai", "If the API catalogue is the agent tool registry, every API is an agent attack surface: quotas, spend limits and evaluation before go-live.");
    if (s.bcEnabled) f("chain.custody", s.custody === "undecided" ? "Custody is undecided — key management is the control that matters most, and it has no owner." : "Custody via " + CUSTODY_L[s.custody] + ": key ceremonies, recovery and insider risk need a tested runbook.");
    if (s.dr === "standard") f("inputs.dr", "Standard disaster recovery without tested RTO and RPO is a gap for any regulated workload.");
    if (s.b2b) f("inputs.b2b", "The partner channel widens the external surface; third-party access reviews belong in Wave 1.");
    if (s.residency && s.cloud === "public") f("gates", "Residency is declared against a public-cloud-only stance and is unresolved.");
    f("roadmapWaves", "Is a review of IT general controls — access, change, segregation of duties — in Wave 0? An attested control failure is the one governance signal regulation makes public.");
    f("environmentTracks", c.env.envs.length + " environments per track: production data copied into non-production tenants must be masked, and access to them reviewed like production.");
    f("inputs.cloud", "'" + s.cloud + "' cloud: confirm who holds the encryption keys and where the audit logs live.");
    f("kpis.advanced", "Governance & compliance scores " + c.kpi["Governance & compliance"] + ". Ask which drivers are controls that exist today and which are planned.");
  } else if (persona === "Regulator") {
    f("inputs.region", c.reg.n + ": " + c.reg.reg + "; AI overlay " + c.reg.ai + ". Map each regulated capability to the overlay explicitly.");
    if (c.regCount) f("paths", c.regCount + " regulated capabilities rest on certified add-ons. Show the certification-maintenance evidence per release.");
    if (s.bcEnabled) f("chain", "The cash leg (" + c.reg.cash[0] + ") and " + CUSTODY_L[s.custody] + " each need a licensing position, not only an architecture position.");
    if (s.region === "eu" && aiRank(s.ai) >= 3) f("inputs.ai", "Domain models and agents in the EU need an AI Act risk classification before deployment.");
    if (s.residency) f("inputs.residency", "Residency must be evidenced per data flow, including AI context retrieval.");
    f("paths", "Every deviation from standard needs a recorded owner and review trigger; an unrecorded judgement cannot be audited.");
    f("evidence", "Disclosure mandates change vocabulary faster than practice. Assess the control, not the narrative about it.");
    f("kpis.advanced", "Governance & compliance scores " + c.kpi["Governance & compliance"] + "; a score is not evidence of a control.");
  } else {
    f("gates", c.gates.length ? c.gates.length + " readiness gate(s) open: target design is premature until they close." : "No gates are open — check that the inputs were not chosen to clear them.");
    f("kpis.compositeAdvanced", "The composite (" + c.comp + ") averages seven axes built on author-prior weights pending calibration. Read the axes, not the blend.");
    if (c.sensitivity[0]) f("sensitivity", "“" + c.sensitivity[0].label + "” moves the composite by " + c.sensitivity[0].d + " points: one input carries the result.");
    f("evidence", "No empirical support exists for any adherence target; the research is null in both directions. A threshold in this output would be a judgement, not a finding.");
    f("evidence", "No public estimate prices an IT-control failure: the one association found did not survive a reading of the filings it flagged. Do not quote a figure.");
    if (s.ma === "serial") f("inputs.ma", "Serial acquisitions will re-import the debt this roadmap retires.");
  }
  return L.slice(0, 7).join("\n");
}

// Per-viewer persistence for saved scenarios. Browser storage can be absent or throw (private
// windows, blocked site data), so every access is guarded and the tool works without it.
const STORE_KEY = "trva:scenarios";
const store = {
  get() {
    try { const v = JSON.parse(window.localStorage.getItem(STORE_KEY) || "[]"); return Array.isArray(v) ? v : []; }
    catch (e) { return null; }
  },
  set(v) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  },
};

/* ---------------- RADAR (owned SVG — a chart library is not worth the dependency) ---------------- */
function splitLabel(t) {
  const w = String(t).split(" ");
  if (t.length <= 14 || w.length < 2) return [t];
  const mid = Math.ceil(w.length / 2);
  return [w.slice(0, mid).join(" "), w.slice(mid).join(" ")];
}

function RadarSVG({ data, series }) {
  const W = 560, H = 330, cx = W / 2, cy = 168, R = 112, n = data.length;
  const ang = (i) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i, v) => [cx + R * (Math.max(0, Math.min(100, v)) / 100) * Math.cos(ang(i)),
                        cy + R * (Math.max(0, Math.min(100, v)) / 100) * Math.sin(ang(i))];
  const poly = (vals) => vals.map((v, i) => pt(i, v).map((z) => z.toFixed(1)).join(",")).join(" ");
  const lw = 150;
  return (
    <svg viewBox={"0 0 " + W + " " + (H + 30)} width="100%" role="img"
      aria-label={"Radar chart of seven KPI axes: " + series.map((s) => s.key).join(", ")}>
      {[20, 40, 60, 80, 100].map((r) => (
        <polygon key={r} points={poly(data.map(() => r))} fill="none" stroke="rgba(38,28,21,0.13)" />
      ))}
      {data.map((_, i) => { const [x, y] = pt(i, 100); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(38,28,21,0.10)" />; })}
      {[20, 60, 100].map((r) => <text key={r} x={cx + 3} y={cy - R * r / 100 + 3} fontSize="8" fill="#6b6457">{r}</text>)}
      {series.map((s) => (
        <g key={s.key}>
          <polygon points={poly(data.map((d) => d[s.key] || 0))} fill={s.color} fillOpacity={s.fill} stroke={s.color} strokeWidth="1.6" />
          {data.map((d, i) => { const [x, y] = pt(i, d[s.key] || 0); return (
            <circle key={i} cx={x} cy={y} r="2.6" fill={s.color}><title>{s.key + " · " + d.kpi + ": " + d[s.key]}</title></circle>
          ); })}
        </g>
      ))}
      {data.map((d, i) => {
        const [x, y] = pt(i, 122);
        const anchor = Math.abs(x - cx) < 10 ? "middle" : x > cx ? "start" : "end";
        const lines = splitLabel(d.kpi);
        return (
          <text key={i} x={x} y={y - (lines.length - 1) * 6} fontSize="10.5" fill="#261C15" textAnchor={anchor}>
            {lines.map((ln, j) => <tspan key={j} x={x} dy={j ? 12 : 0}>{ln}</tspan>)}
          </text>
        );
      })}
      {series.map((s, k) => (
        <g key={s.key} transform={"translate(" + (cx - (series.length * lw) / 2 + k * lw) + "," + (H + 14) + ")"}>
          <rect width="11" height="11" y="-9" fill={s.color} fillOpacity={Math.max(0.35, s.fill)} stroke={s.color} />
          <text x="16" fontSize="10.5" fill="#261C15">{s.key.length > 22 ? s.key.slice(0, 21) + "…" : s.key}</text>
        </g>
      ))}
    </svg>
  );
}

/* ---------------- UI ATOMS ---------------- */

const Eyebrow = ({ children }) => <div className="fmono eyebrow">{children}</div>;
const Card = ({ children, className = "" }) => <div className={"card " + className}>{children}</div>;
const Pick = ({ active, onClick, children, small }) => (
  <button onClick={onClick} className={"pick " + (active ? "pick-on " : "") + (small ? "pick-sm" : "")}>{children}</button>
);
const Lic = () => <span className="fmono lic">⊕ lic</span>;

const SBox = ({ x, y, w, h, t, s, fill, stroke, dash, tfill }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="5" fill={fill || "#fff"} stroke={stroke || "#3E2E20"} strokeWidth="1.2" strokeDasharray={dash || "0"} />
    <text x={x + w / 2} y={y + (s ? h / 2 - 3 : h / 2 + 3.5)} textAnchor="middle" fontSize="10" fontFamily="Syne, sans-serif" fontWeight="700" fill={tfill || "#261C15"}>{t}</text>
    {s && <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fontSize="8" fontFamily="DM Mono, monospace" fill={tfill ? "rgba(245,242,235,0.75)" : "#6b6457"}>{s}</text>}
  </g>
);

const Edge = ({ d, label, lx, ly, gold, dash }) => (
  <g>
    <path d={d} fill="none" stroke={gold ? "#c8a84b" : "#1a6b72"} strokeWidth="1.3" strokeDasharray={dash || "0"} markerEnd={gold ? "url(#ag)" : "url(#at)"} />
    {label && <text x={lx} y={ly} fontSize="7.5" fontFamily="DM Mono, monospace" fill={gold ? "#a08434" : "#1a6b72"}>{label}</text>}
  </g>
);

/* ---------------- MAIN ---------------- */

export default function TRVANavigator() {
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("adv");
  const [expanded, setExpanded] = useState({});
  const [showDrivers, setShowDrivers] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [view, setView] = useState("wizard");
  const [copied, setCopied] = useState(false);
  const [arch, setArch] = useState(null);
  const [sel, setSel] = useState(DEFAULT_SEL);
  const [narr, setNarr] = useState(null);
  const [persona, setPersona] = useState("TCO hawk");
  const [storageOk, setStorageOk] = useState(false);
  const [signals, setSignals] = useState(null);   // null: loading · false: none published · object: loaded
  const [sigQuery, setSigQuery] = useState("");

  useEffect(() => {
    const saved = store.get();
    if (saved && saved.length) setScenarios(saved);
    setStorageOk(saved !== null && store.set(saved || []));
  }, []);

  // Outside-view screen: reads a same-origin static file (data/signals.json) if a deployment
  // publishes one. The repository ships an empty placeholder; the tool is complete without it.
  useEffect(() => {
    let alive = true;
    fetch("data/signals.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive) setSignals(j && Array.isArray(j.firms) && j.firms.length ? j : false); })
      .catch(() => { if (alive) setSignals(false); });
    return () => { alive = false; };
  }, []);

  const set = (k, v) => setSel((s) => ({ ...s, [k]: v }));

  const pickIndustry = (id, overrides) => {
    const ind = findInd(id);
    const caps = {}; allCaps(ind).forEach((c) => (caps[c.id] = true));
    const e2e = {}; ind.e2e.forEach((p) => (e2e[p] = true));
    setSel((s) => ({ ...DEFAULT_SEL, ...s, industry: id, caps, e2e, clsOverride: {}, ...(overrides || {}) }));
  };
  const loadArchetype = (a) => { pickIndustry(a.ind, a.o); setArch(a.id); setStep(0); };

  const nSel = Object.values(sel.caps).filter(Boolean).length;
  const ind = findInd(sel.industry);
  const reg = findReg(sel.region);

  const gates = useMemo(() => computeGates(sel), [sel]);
  const asgAdv = useMemo(() => computeAssignments(sel, "adv"), [sel]);
  const asgBasic = useMemo(() => computeAssignments(sel, "basic"), [sel]);
  const kpiAdv = useMemo(() => computeKpis(sel, "adv", asgAdv, gates), [sel, asgAdv, gates]);
  const kpiBasic = useMemo(() => computeKpis(sel, "basic", asgBasic, gates), [sel, asgBasic, gates]);
  const cr = useMemo(() => chainResult(sel), [sel]);
  const tokEco = useMemo(() => tokenEconomics(sel), [sel]);
  const landscape = useMemo(() => buildLandscape(sel, tier, gates, cr), [sel, tier, gates, cr]);
  const rm = useMemo(() => roadmapWaves(sel, gates, asgAdv), [sel, gates, asgAdv]);
  const env = useMemo(() => envTracks(sel, ind), [sel, ind]);
  const sigRows = useMemo(() => {
    if (!signals) return [];
    const q = sigQuery.trim().toLowerCase();
    return signals.firms.filter((f) => !q || String(f.name || "").toLowerCase().includes(q) ||
      (f.tickers || []).some((t) => String(t).toLowerCase() === q)).slice(0, 25);
  }, [signals, sigQuery]);

  const radarData = KPI_KEYS.map((k) => ({ kpi: k.replace(" & ", " / "), Basic: kpiBasic.scores[k], Advanced: kpiAdv.scores[k] }));

  const sensitivity = useMemo(() => {
    if (!ind) return [];
    const base = composite(kpiAdv.scores);
    const probes = [];
    const tryV = (label, patch) => {
      const s2 = { ...sel, ...patch };
      const g2 = computeGates(s2);
      const a2 = computeAssignments(s2, "adv");
      const k2 = computeKpis(s2, "adv", a2, g2);
      probes.push({ label, d: +(composite(k2.scores) - base).toFixed(1) });
    };
    if (sel.transition !== "green") tryV("Transition → greenfield", { transition: "green" });
    if (sel.mode !== "agility") tryV("Optimize → agility", { mode: "agility" });
    if (sel.instance !== "single") tryV("Instance → single global", { instance: "single" });
    if (sel.mdm !== "high") tryV("MDM → high", { mdm: "high" });
    if (!sel.events) tryV("Events → on", { events: true });
    const r = aiRank(sel.ai);
    if (r < 4) tryV("AI → agentic", { ai: "agentic" });
    else tryV("AI → RAG only", { ai: "rag" });
    return probes.sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 5);
  }, [sel, kpiAdv, ind]);

  const canNext = step === 0 ? !!sel.industry : step === 1 ? nSel > 0 : true;

  const saveScenario = () => {
    const name = "S" + (scenarios.length + 1) + " · " + (ind ? ind.n.split(" ")[0] : "") + " · " + sel.mode + (sel.bcEnabled ? " · chain" : "") + (aiRank(sel.ai) >= 4 ? " · agentic" : "");
    const next = [...scenarios.slice(-2), { name, scores: { ...kpiAdv.scores }, meta: { industry: ind && ind.n, region: reg.n, mode: sel.mode, usecase: sel.usecase, transition: sel.transition, ai: sel.ai } }];
    setScenarios(next);
    store.set(next);
  };
  const clearScenarios = () => { setScenarios([]); store.set([]); };

  const exportObj = () => JSON.stringify({
    tool: "TRVA Navigator v0.8.1 — Tokenization Readiness & Value Assessment (Core Integrity family)",
    generated: new Date().toISOString().slice(0, 10),
    inputs: sel,
    gates: gates.map((g) => g.t),
    kpis: { basic: kpiBasic.scores, advanced: kpiAdv.scores, compositeAdvanced: composite(kpiAdv.scores) },
    paths: asgAdv.map((a) => ({ capability: a.n, class: a.cls, path: PATHS[a.path].l, skillGap: !!a.skillGap })),
    chain: sel.bcEnabled ? { usecase: cr.uc.n, recommended: cr.top.n, score: cr.top.score, permissionedPrimary: cr.permissioned, custody: sel.custody } : null,
    tokenEconomics: tokEco.map((t) => ({ routing: t.n, costPerTask: +t.cpt.toFixed(4), monthly: +t.monthly.toFixed(0), marginPerTask: t.margin === null ? null : +t.margin.toFixed(4) })),
    environmentTracks: { tracks: env.tracks, envs: env.envs, volumeCritical: env.volumeCritical },
    roadmapWaves: rm.waves.map((w) => ({ wave: w.n, months: [w.s, w.e], items: w.items })),
    sensitivity,
    evidence: EVIDENCE_STAMP,
  }, null, 2);

  const copyJson = () => { try { navigator.clipboard.writeText(exportObj()).then(() => setCopied(true)); } catch (e) { setCopied(false); } };

  const runNarrative = (kind, who) => {
    const c = narrativeContext(sel, asgAdv, kpiAdv, gates, cr, tokEco, env, rm, sensitivity);
    const p = who || persona;
    setNarr(kind === "memo"
      ? { kind, label: "CIO memo — composed from the engine's outputs", text: memoText(c) }
      : { kind, label: "Red-team — " + p + " — each point names the field it challenges", text: redTeamText(p, c) });
  };

  const scenColors = ["#1a6b72", "#c8a84b", "#c0392b"];

  /* ---------- STEPS ---------- */

  const S_Context = (
    <div className="stack">
      <Card>
        <Eyebrow>Start — custom scenario or archetype</Eyebrow>
        <div className="grid2 mt2">
          <button onClick={() => { setSel({ ...DEFAULT_SEL }); setArch(null); setStep(0); }} className="arch archc">⊕ Custom scenario — configure from scratch</button>
          {ARCHETYPES.map((a) => (
            <button key={a.id} onClick={() => loadArchetype(a)} className={"arch " + (arch === a.id ? "on" : "")}>{a.n}</button>
          ))}
        </div>
      </Card>
      <Card>
        <Eyebrow>01 · Industry</Eyebrow>
        <div className="stack1 mt2">
          {INDUSTRIES.map((i) => (
            <Pick key={i.id} active={sel.industry === i.id} onClick={() => { setArch(null); pickIndustry(i.id); }}>
              <div className="pt">{i.n}</div><div className="fmono ps">{i.depth}{i.vol ? " · volume-critical sizing" : ""}</div>
            </Pick>
          ))}
        </div>
        <p className="fine mt2">v0.8.1 seed depth: FSI and Manufacturing deep; CPR and Utilities starters. The library is JSON — breadth is editing, not engineering.</p>
      </Card>
      <Card>
        <Eyebrow>Region — regulatory & AI-governance overlay</Eyebrow>
        <div className="stack1 mt2">
          {REGIONS.map((r) => (
            <Pick key={r.id} active={sel.region === r.id} onClick={() => set("region", r.id)}>
              <div className="pt">{r.n}</div><div className="ps">{r.reg}</div>
            </Pick>
          ))}
        </div>
        <p className="fine mt2">Regulatory and chain attributes as of Aug 2026 — verify before relying.</p>
      </Card>
      <Card>
        <Eyebrow>Size · current core · operating model · M&A posture</Eyebrow>
        <div className="row mt2">
          {[["sme", "Mid-market"], ["large", "Large"], ["ent", "Enterprise"]].map(([v, l]) => <Pick key={v} small active={sel.size === v} onClick={() => set("size", v)}>{l}</Pick>)}
        </div>
        <div className="row mt1">
          {[["ecc", "Legacy ERP"], ["s4op", "Modern on-prem"], ["s4c", "Cloud ERP"], ["none", "No ERP core"]].map(([v, l]) => <Pick key={v} small active={sel.core === v} onClick={() => set("core", v)}>{l}</Pick>)}
        </div>
        <div className="stack1 mt2">
          {[["unification", "Unification — standardized & integrated"], ["coordination", "Coordination — integrated, locally tailored"], ["replication", "Replication — standardized, locally run"], ["diversification", "Diversification — autonomous units"]].map(([v, l]) => (
            <Pick key={v} active={sel.opModel === v} onClick={() => set("opModel", v)}><div className="pt">{l}</div></Pick>
          ))}
        </div>
        <div className="row mt2">
          {[["none", "No M&A"], ["occasional", "Occasional"], ["serial", "Serial acquirer"], ["divest", "Divestiture-active"]].map(([v, l]) => <Pick key={v} small active={sel.ma === v} onClick={() => set("ma", v)}>{l}</Pick>)}
        </div>
      </Card>
    </div>
  );

  const S_Business = ind && (
    <div className="stack">
      <Card>
        <Eyebrow>02 · Business architecture — capabilities L1 → L3 & value streams</Eyebrow>
        <p className="fine mt1">All seeded capabilities pre-selected. Deselect out-of-scope; tap DIFF / COM to reclassify. {nSel} selected.</p>
      </Card>
      {ind.domains.map((d) => (
        <Card key={d.id} className="p0">
          <button onClick={() => setExpanded((e) => ({ ...e, [d.id]: !e[d.id] }))} className="domhead">
            <span className="fdisp">{d.n}</span><span className="fmono">{expanded[d.id] ? "−" : "+"}</span>
          </button>
          {expanded[d.id] !== false && d.areas.map((a) => (
            <div key={a.id} className="areabox">
              <div className="fmono areahd">{a.n}</div>
              {a.caps.map((c) => {
                const on = !!sel.caps[c.id];
                const cls = sel.clsOverride[c.id] || c.cls;
                return (
                  <div key={c.id} className="caprow">
                    <button onClick={() => setSel((s) => ({ ...s, caps: { ...s.caps, [c.id]: !on } }))} className={"chk " + (on ? "chk-on" : "")}>{on ? "✓" : ""}</button>
                    <span className={"capn " + (on ? "" : "capoff")}>{c.n}</span>
                    <button onClick={() => setSel((s) => ({ ...s, clsOverride: { ...s.clsOverride, [c.id]: cls === "diff" ? "com" : "diff" } }))}
                      className={"fmono clsbtn " + (cls === "diff" ? "cls-d" : "cls-c")}>{cls === "diff" ? "DIFF" : "COM"}</button>
                    {c.reg ? <span className="fmono tag-reg">REG</span> : null}
                    {c.chain ? <span className="fmono tag-ch">⛓</span> : null}
                  </div>
                );
              })}
            </div>
          ))}
        </Card>
      ))}
      <Card>
        <Eyebrow>End-to-end value streams in scope</Eyebrow>
        <div className="row mt2">
          {E2E.map((p) => <Pick key={p} small active={!!sel.e2e[p]} onClick={() => setSel((s) => ({ ...s, e2e: { ...s.e2e, [p]: !s.e2e[p] } }))}>{p}</Pick>)}
        </div>
      </Card>
    </div>
  );

  const S_Data = (
    <div className="stack">
      <Card>
        <Eyebrow>03 · Data architecture</Eyebrow>
        <div className="lbl mt2">Master-data management maturity</div>
        <div className="row mt1">{[["low", "Low"], ["med", "Managed"], ["high", "High — golden records"]].map(([v, l]) => <Pick key={v} small active={sel.mdm === v} onClick={() => set("mdm", v)}>{l}</Pick>)}</div>
        <div className="lbl mt2">Analytical data platform</div>
        <div className="row mt1">{[["none", "None"], ["frag", "Warehouse / lake — fragmented"], ["lakehouse", "Governed lakehouse (unified)"]].map(([v, l]) => <Pick key={v} small active={sel.lake === v} onClick={() => set("lake", v)}>{l}</Pick>)}</div>
        <div className="lbl mt2">Semantic / AI-readiness layer</div>
        <div className="row mt1">{[["none", "None"], ["partial", "Partial catalog"], ["governed", "Governed semantic layer"]].map(([v, l]) => <Pick key={v} small active={sel.semantic === v} onClick={() => set("semantic", v)}>{l}</Pick>)}</div>
        <div className="lbl mt2">Data residency</div>
        <div className="row mt1">
          <Pick small active={!sel.residency} onClick={() => set("residency", false)}>No strict constraint</Pick>
          <Pick small active={sel.residency} onClick={() => set("residency", true)}>Strict residency required</Pick>
        </div>
        <p className="fine mt2">Golden records are a precondition for registry ↔ ledger sync; the semantic layer is what grounds AI. On-chain data is globally replicated — residency shapes both cloud and rail choices. Reference stack: master-data governance (golden records) → governed lakehouse → semantic layer → AI. Data-domain granularity (customer / product / finance) is collapsed to one maturity at configurator level.</p>
      </Card>
    </div>
  );

  const S_Apps = (
    <div className="stack">
      <Card>
        <Eyebrow>04 · Application & solution architecture — As-Is baseline</Eyebrow>
        <div className="lbl mt2">Satellite estate today</div>
        <div className="row mt1">{[["lean", "Lean suite"], ["mixed", "Mixed"], ["sprawl", "Sprawling best-of-breed"]].map(([v, l]) => <Pick key={v} small active={sel.satellites === v} onClick={() => set("satellites", v)}>{l}</Pick>)}</div>
        <div className="lbl mt2">Rationalization appetite (Gartner TIME)</div>
        <div className="row mt1">{[["aggressive", "Aggressive eliminate"], ["balanced", "Balanced"], ["tolerate", "Tolerate"]].map(([v, l]) => <Pick key={v} small active={sel.time === v} onClick={() => set("time", v)}>{l}</Pick>)}</div>
      </Card>
      <Card>
        <Eyebrow>Transition · instance · timeline</Eyebrow>
        <div className="stack1 mt2">
          {[["green", "Greenfield", "Reimplement clean; maximum debt reset."], ["selective", "Selective (bluefield-class)", "Carry selected data & config; balanced."], ["brown", "Brownfield conversion", "Fastest path; legacy debt carried & remediated."]].map(([v, l, d]) => (
            <Pick key={v} active={sel.transition === v} onClick={() => set("transition", v)}><div className="pt">{l}</div><div className="ps">{d}</div></Pick>
          ))}
        </div>
        <div className="lbl mt2">Instance strategy <span className="fmono rec">derived from operating model: {INSTANCE_REC[sel.opModel]}</span></div>
        <div className="row mt1">{[["single", "Single global"], ["regional", "Regional hubs"], ["multi", "Country multi"]].map(([v, l]) => <Pick key={v} small active={sel.instance === v} onClick={() => set("instance", v)}>{l}</Pick>)}</div>
        <div className="row mt2">{["12", "24", "36+"].map((t) => <Pick key={t} small active={sel.timeline === t} onClick={() => set("timeline", t)}>{t} mo</Pick>)}</div>
      </Card>
    </div>
  );

  const S_Integration = (
    <div className="stack">
      <Card>
        <Eyebrow>05 · Integration architecture — baseline</Eyebrow>
        <div className="stack1 mt2">
          {[["legacy", "Legacy ERP middleware", "Vendor sunset announced — migrate to the integration platform."], ["is", "Modern integration platform", "Consolidation target in place."], ["3p", "Third-party middleware", "Rationalize; define exit criteria."], ["p2p", "Mostly point-to-point", "Highest hidden debt; eliminate."]].map(([v, l, d]) => (
            <Pick key={v} active={sel.middleware === v} onClick={() => set("middleware", v)}><div className="pt">{l}</div><div className="ps">{d}</div></Pick>
          ))}
        </div>
        <div className="row mt2">{["<100", "100–300", "300–800", ">800"].map((b) => <Pick key={b} small active={sel.iface === b} onClick={() => set("iface", b)}>{b}</Pick>)}</div>
        <div className="row mt1">{[["none", "No API program"], ["partial", "Partial APIs"], ["full", "API-first"]].map(([v, l]) => <Pick key={v} small active={sel.apiMaturity === v} onClick={() => set("apiMaturity", v)}>{l}</Pick>)}</div>
        <div className="row mt1">
          <Pick small active={sel.events} onClick={() => set("events", !sel.events)}>Event-driven in scope</Pick>
          <Pick small active={sel.b2b} onClick={() => set("b2b", !sel.b2b)}>High B2B / EDI intensity</Pick>
        </div>
      </Card>
    </div>
  );

  const S_Tech = (
    <div className="stack">
      <Card>
        <Eyebrow>06 · Technology, security & operations</Eyebrow>
        <div className="lbl mt2">Cloud stance — vendor-agnostic</div>
        <div className="row mt1">{[["public", "Public cloud OK"], ["private", "Private cloud required"], ["sovereign", "Sovereign region required"]].map(([v, l]) => <Pick key={v} small active={sel.cloud === v} onClick={() => set("cloud", v)}>{l}</Pick>)}</div>
        <div className="lbl mt2">Resilience & disaster recovery</div>
        <div className="row mt1">
          {[["std", "Standard resilience"], ["reg", "Regulated-grade (DORA-class)"]].map(([v, l]) => <Pick key={v} small active={sel.resilience === v} onClick={() => set("resilience", v)}>{l}</Pick>)}
        </div>
        <div className="row mt1">
          {[["standard", "Standard backup / restore"], ["ha", "HA pair + near-zero-downtime maintenance"], ["drmulti", "Multi-region DR (tested RTO / RPO)"]].map(([v, l]) => <Pick key={v} small active={sel.dr === v} onClick={() => set("dr", v)}>{l}</Pick>)}
        </div>
        <div className="lbl mt2">Identity & access · SoD / GRC</div>
        <div className="row mt1">
          {[["basic", "Basic"], ["sso", "Federated SSO"], ["iga", "Mature IGA"]].map(([v, l]) => <Pick key={v} small active={sel.iam === v} onClick={() => set("iam", v)}>{l}</Pick>)}
          {[["manual", "Manual controls"], ["tooled", "Tooled GRC"]].map(([v, l]) => <Pick key={v} small active={sel.grc === v} onClick={() => set("grc", v)}>{l}</Pick>)}
        </div>
        <div className="lbl mt2">Digital-asset custody stance <span className="fmono rec">the institutional decision</span></div>
        <div className="row mt1">{[["undecided", "Undecided"], ["qualified", "Qualified custodian"], ["hsm", "Self-managed HSM"], ["waas", "Wallet-as-a-service"]].map(([v, l]) => <Pick key={v} small active={sel.custody === v} onClick={() => set("custody", v)}>{l}</Pick>)}</div>
      </Card>
    </div>
  );

  const S_Org = (
    <div className="stack">
      <Card>
        <Eyebrow>07 · Organization & optimization</Eyebrow>
        <div className="lbl mt2">EA practice maturity</div>
        <div className="row mt1">{[["initial", "Initial"], ["managed", "Managed"], ["governed", "Governed"]].map(([v, l]) => <Pick key={v} small active={sel.eaMaturity === v} onClick={() => set("eaMaturity", v)}>{l}</Pick>)}</div>
        <div className="lbl mt2">Platform engineering skills</div>
        <div className="row mt1">{[["none", "None"], ["small", "Small team"], ["established", "Established"]].map(([v, l]) => <Pick key={v} small active={sel.skills === v} onClick={() => set("skills", v)}>{l}</Pick>)}</div>
        <div className="lbl mt2">Optimize for · risk posture</div>
        <div className="stack1 mt1">
          {[["tco", "Total cost of ownership"], ["agility", "Agility & innovation"], ["compliance", "Compliance & risk"], ["speed", "Speed to value"]].map(([v, l]) => (
            <Pick key={v} active={sel.mode === v} onClick={() => set("mode", v)}><div className="pt">{l}</div></Pick>
          ))}
        </div>
        <div className="row mt1">{[["conservative", "Conservative"], ["balanced", "Balanced"], ["bold", "Bold"]].map(([v, l]) => <Pick key={v} small active={sel.risk === v} onClick={() => set("risk", v)}>{l}</Pick>)}</div>
      </Card>
      <Card className="evbanner">
        <Eyebrow>Evidence stance · Core Integrity</Eyebrow>
        <p className="body mt1">
          The Core Integrity Adherence–Outcome Framework study (167 large US filers, 950 firm-years, 2019–2025) finds that adherence is a firm characteristic — 94% of its variance lies between firms — with no robustly signed association with performance in either direction, no inverted-U, and no floor, ceiling or prerequisite dimension. Read: the appropriate level is firm-specific and cannot be benchmarked from pooled public data. The matrix below turns the five adherence dimensions into decision guidelines; the architect makes the call.
        </p>
        <table className="ctable mt2">
          <thead><tr className="fmono"><th>Dimension</th><th>Adherence principle</th><th>Decision guideline</th></tr></thead>
          <tbody>
            {CIAOF.map((r) => (
              <tr key={r.d}><td className="fdisp cia-d">{r.d}</td><td className="fine">{r.p}</td><td className="fine">{r.g}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="fmono eyebrow mt2">Evidence base — what the research supports</div>
        <p className="fine mt1">
          Each row states a finding and what it licenses. Where the evidence is null, the tool says so
          rather than implying a benchmark.
        </p>
        <div className="grid2 mt1">
          {EVIDENCE.map((e) => (
            <div key={e.claim} className={"qcard q-" + e.tone}>
              <div className="fdisp qmove">{e.claim}</div>
              <p className="fine mt1">{e.finding}</p>
              <p className="fine mt1"><b>Use:</b> {e.use}</p>
            </div>
          ))}
        </div>
        <p className="fine mt1">
          Source: two working papers on a panel of 167 large US-listed firms, 2019–2025. Associational,
          not causal. Findings describe large listed firms and are not established for mid-market or
          non-US contexts.
        </p>
        <div className="fmono eyebrow mt2">EA governance from the outside — Governance Observability Ladder (EAGI)</div>
        <p className="fine mt1">
          What public disclosure can and cannot show about how a firm governs its system estate. Rungs
          are ordered by regulatory compulsion and attestation, and each reports what it carried in the
          research panel. The ladder ranks disclosure sources, not firms, and no result on it is causal.
        </p>
        <div className="mt1">
          {EAGI_LADDER.map((r) => (
            <React.Fragment key={r.n}>
              <div className={"rung r-" + r.tone}>
                <div className={"rungn fdisp tx-" + r.tone}>{r.n}</div>
                <div className="opbody">
                  <div className={"fmono rungtag tx-" + r.tone}>{r.tag}</div>
                  <div className="fdisp oprule">{r.head}</div>
                  <p className="fine mt1">{r.body}</p>
                  <p className="fine mt1"><b>Look for:</b> {r.screen}</p>
                  <div className={"fmono rungverdict tx-" + r.tone}>{r.verdict}</div>
                </div>
              </div>
              {r.n === "5" && <div className="rline rline-att fmono">attestation line — above it, an independent auditor signs the disclosure</div>}
              {r.n === "2" && <div className="rline rline-comp fmono">compulsion line — below it, firms choose whether to say anything at all</div>}
            </React.Fragment>
          ))}
        </div>
        <div className="fmono eyebrow mt2">Placement tests — how a source earns its rung</div>
        <div className="grid2 mt1">
          {PLACEMENT_TESTS.map((t) => (
            <div key={t.n} className={"qcard q-" + t.tone}>
              <div className="fdisp qmove">{t.n}. {t.rule}</div>
              <p className="fine mt1">{t.why}</p>
            </div>
          ))}
        </div>
        <p className="fine mt1">
          Measure what regulation compels, not what management volunteers. Failure is more observable
          than success, because regulation compels the reporting of failure — to a reader. Read what an
          extraction rule flags before trusting its coefficient.
        </p>
        <p className="fine mt1">
          <b>Forward-looking component (exploratory).</b> Firms with a more disciplined architectural core
          disclose more AI adoption the following year; governance disclosures do not predict it. Re-test
          before relying on it, and do not read it as evidence that AI pays.
        </p>
        <div className="idxnote mt1">
          <span className="fmono eyebrow">Read this as an index, not a score</span>
          <p className="fine mt1">
            The five dimensions are <b>formative</b>: they constitute core integrity rather than
            reflecting one underlying trait. A firm can be strong on integrations and weak on data
            and still be coherent. Internal-consistency statistics therefore do not apply, and a
            single blended percentage is not a measurement — it is an index, in the sense that GDP
            is an index. Report the dimensions; never present the blend on its own. In the research
            panel two dimensions carried roughly 88% of the explained variance, so a blend can move
            for reasons that have nothing to do with the dimension a client is working on.
          </p>
        </div>
        <div className="fmono eyebrow mt2">Diagnostic KPIs - what actually moves when governance works</div>
        <p className="fine mt1">
          Levels describe a state. Diagnostics reveal whether architecture is buying anything:
          dispersion, blast radius and recovery.
        </p>
        <table className="ctable mt1">
          <thead><tr className="fmono"><th>Area</th><th>Level metric (common)</th><th>Diagnostic (add)</th></tr></thead>
          <tbody>
            {DIAG_KPI.map((k) => (
              <tr key={k.g}>
                <td className="fdisp cia-d">{k.g}</td>
                <td className="fine">{k.l}</td>
                <td className="fine"><b>{k.d}</b><br /><span className="fine">{k.w}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="fmono eyebrow mt2">Operating frame - how to run the assessment</div>
        <p className="fine mt1">
          The matrix says what to do with a capability. These five rules, each derived from the
          research, say how to run the assessment itself.
        </p>
        <div className="mt1">
          {OP_FRAME.map((o) => (
            <div key={o.n} className={"opcard op-" + o.tone}>
              <div className="opnum fdisp">{o.n}</div>
              <div className="opbody">
                <div className="fdisp oprule">{o.rule}</div>
                <p className="fine mt1">{o.why}</p>
                <div className="fine opwar">{o.warrant}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="fine mt1">
          The matrix organises a judgement; it does not replace one. Its own testable implication -
          that standardisation pays less where differentiation intensity is higher - carries the
          predicted sign but does not reach significance. No claim is made that following it improves
          performance.
        </p>
        <div className="fmono eyebrow mt2">Impact x standard-fit - executive view</div>
        <p className="fine mt1">
          The horizontal axis is <b>standard-fit</b>: how completely the standard product covers
          the process as delivered - not how standardised the process happens to be today.
        </p>
        <div className="grid2 mt1">
          {IMPACT_GRID.map((g) => (
            <div key={g.q} className={"qcard q-" + g.tone}>
              <div className="fmono eyebrow">{g.q}</div>
              <div className="fdisp qmove">{g.move}</div>
              <div className="fine">{g.impact} · {g.fit}</div>
              <p className="fine mt1">{g.detail}</p>
            </div>
          ))}
        </div>
        <div className="regflag mt1">
          <span className="fmono eyebrow">{REG_FLAG.label}</span>
          <p className="fine mt1">{REG_FLAG.detail}</p>
        </div>
        <p className="fine mt1">
          The grid sets guardrails, not a quota. Any target share of standardised processes is
          illustrative - the architect makes the call per capability, per context.
        </p>
        <div className="fmono eyebrow mt2">Process-level decision matrix</div>
        <table className="ctable mt1">
          <thead><tr className="fmono"><th>Process profile</th><th>Treatment</th><th>Rationale</th></tr></thead>
          <tbody>
            {PROC_MATRIX.map((r) => (
              <tr key={r.p}><td className="fine">{r.p}</td><td className="fdisp cia-d">{r.t}</td><td className="fine">{r.r}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="fine mt1">Impact × differentiation × regulation → treatment. "Warrants extension" never means core modification.</p>
        <p className="fine mt1">CIAOF decision matrix · vendor-neutral dimensions.</p>
      </Card>
    </div>
  );

  const S_AI = (
    <div className="stack">
      <Card>
        <Eyebrow>08 · AI architecture — ambition ladder</Eyebrow>
        <div className="stack1 mt2">
          {AI_LADDER.map((a) => (
            <Pick key={a.id} active={sel.ai === a.id} onClick={() => set("ai", a.id)}><div className="pt">{a.n}</div></Pick>
          ))}
        </div>
        <p className="fine mt2">Agents consume APIs and governed data. Rungs four and five are hard-gated on API program + MDM + semantic layer — the tool that says "not ready" is the one that survives scrutiny.</p>
        <p className="fine mt1">AI governance overlay ({reg.n}): {reg.ai}.</p>
      </Card>
      <Card>
        <Eyebrow>Token economics — the margin condition</Eyebrow>
        <div className="lbl mt2">Automated tasks / month · avg tokens / task</div>
        <div className="row mt1">{Object.keys(TASK_BANDS).map((b) => <Pick key={b} small active={sel.aiTasks === b} onClick={() => set("aiTasks", b)}>{b}</Pick>)}</div>
        <div className="row mt1">{Object.keys(TOK_BANDS).map((b) => <Pick key={b} small active={sel.aiTok === b} onClick={() => set("aiTok", b)}>{b}</Pick>)}</div>
        <div className="lbl mt2">Price assumptions (USD per 1M tokens, blended) · optional value per task</div>
        <div className="row mt1">
          <label className="fmono inlbl">Frontier <input className="numin" inputMode="decimal" value={sel.priceF} onChange={(e) => set("priceF", e.target.value)} /></label>
          <label className="fmono inlbl">Small <input className="numin" inputMode="decimal" value={sel.priceS} onChange={(e) => set("priceS", e.target.value)} /></label>
          <label className="fmono inlbl">Value / task $ <input className="numin" inputMode="decimal" value={sel.valueTask} onChange={(e) => set("valueTask", e.target.value)} placeholder="—" /></label>
        </div>
        <p className="fine mt2">Deterministic: cost per task = tokens × blended price. Excludes caching and batch discounts; steady-state averages — no peak-load queueing model. Set value per task to see margin under each routing.</p>
      </Card>
    </div>
  );

  const S_Emerging = (
    <div className="stack">
      <Card>
        <Eyebrow>09 · Tokenization dimension</Eyebrow>
        <div className="row mt2">
          <Pick small active={sel.bcEnabled} onClick={() => set("bcEnabled", true)}>In scope</Pick>
          <Pick small active={!sel.bcEnabled} onClick={() => set("bcEnabled", false)}>Out of scope</Pick>
        </div>
        {sel.bcEnabled && (
          <div className="stack1 mt2">
            {USECASES.map((u) => <Pick key={u.id} active={sel.usecase === u.id} onClick={() => set("usecase", u.id)}><div className="pt">{u.n}</div></Pick>)}
          </div>
        )}
        {sel.bcEnabled && sel.custody === "undecided" && <p className="gatep mt2">Custody undecided (step 06) — this gates the rail decision.</p>}
        <p className="fine mt2">Rails scored on legal-finality proxies, throughput, compliance tooling, institutional cash-leg availability, ecosystem depth — weights per use case, disclosed in the output and the Rulebook. Attributes as of Aug 2026. Architecture guidance only; not legal or investment advice.</p>
      </Card>
      <Card>
        <Eyebrow>Architecture evolution — optional programs</Eyebrow>
        <div className="row mt2">
          <Pick small active={sel.evoGreen} onClick={() => set("evoGreen", !sel.evoGreen)}>Green IT & sustainability (incl. net-zero data readiness)</Pick>
          <Pick small active={sel.evoUx} onClick={() => set("evoUx", !sel.evoUx)}>UX modernization</Pick>
          <Pick small active={sel.evoNet} onClick={() => set("evoNet", !sel.evoNet)}>Zero-trust / SASE network</Pick>
        </div>
      </Card>
    </div>
  );

  /* ---------- OUTPUT ---------- */

  const asg = tier === "adv" ? asgAdv : asgBasic;
  const kpi = tier === "adv" ? kpiAdv : kpiBasic;
  const pct = (m) => (m / rm.T) * 100;

  const hasAI = sel.ai !== "none";
  const aiR = aiRank(sel.ai);
  const g1open = gates.some((g) => g.id === "g1");
  const hasSbs = asgAdv.some((a) => a.path === "sbs") && tier === "adv";
  const bcOn = sel.bcEnabled && tier === "adv";
  const econOn = aiR >= 5 && !g1open;
  const dgH = bcOn ? 566 : 476;

  const ArchDiagram = (
    <svg viewBox={"0 0 720 " + dgH} width="100%" style={{ display: "block" }}>
      <defs>
        <marker id="at" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#1a6b72" /></marker>
        <marker id="ag" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#c8a84b" /></marker>
      </defs>
      <SBox x={40} y={16} w={180} h={42} t="Channels" s="web · mobile" />
      {sel.b2b && <SBox x={244} y={16} w={150} h={42} t="Partner / B2B" s="EDI · portals" />}
      <SBox x={584} y={150} w={112} h={64} t="Identity ⟡" s="human · system · agent" stroke="#c8a84b" dash="4 3" />
      {hasAI && <SBox x={40} y={92} w={300} h={60} t={aiR >= 4 && g1open ? "AI & Agents — gated" : "AI & Agents"} s={aiR >= 4 && !g1open ? "agentic · tool registry ⟡ · quotas" : aiR >= 2 ? "copilots · RAG" : "copilots"} stroke={aiR >= 4 && g1open ? "#c0392b" : "#3E2E20"} />}
      <SBox x={40} y={204} w={520} h={46} t="Integration platform — governed API catalog ⟡" fill="#fbf6e9" stroke="#c8a84b" />
      <SBox x={40} y={296} w={220} h={66} t="Core ERP" s={sel.cloud === "sovereign" ? "sovereign region" : sel.cloud === "private" ? "private cloud" : "public cloud"} fill="#3E2E20" tfill="#f5f2eb" />
      <SBox x={280} y={296} w={150} h={66} t="Satellites" s={sel.satellites === "lean" ? "suite modules" : sel.satellites === "mixed" ? "CRM · HCM — keep" : "rationalize (TIME)"} />
      {hasSbs && <SBox x={450} y={296} w={110} h={66} t="Side-by-side" s="extensions" />}
      <SBox x={40} y={400} w={390} h={48} t="Data & semantics ⟡" s={(sel.mdm === "low" ? "MDM uplift → " : "MDM " + sel.mdm + " · ") + "semantic " + sel.semantic} />
      {bcOn && <SBox x={40} y={492} w={310} h={50} t={"Rail — " + cr.top.n} s={sel.custody === "undecided" ? "custody gated" : { qualified: "qualified custodian", hsm: "HSM", waas: "WaaS" }[sel.custody]} />}
      {bcOn && <SBox x={370} y={492} w={160} h={50} t="Cash leg" s={reg.cash[0].split(" (")[0]} />}
      {hasAI ? <Edge d="M130 58 V92" label="prompts" lx={136} ly={80} /> : <Edge d="M130 58 V204" label="APIs" lx={136} ly={140} />}
      {hasAI && <Edge d="M190 152 V204" label="tool calls ⟡" lx={196} ly={186} />}
      {sel.b2b && <Edge d="M319 58 V74 H352 V204" label="EDI" lx={356} ly={140} />}
      {hasAI && aiR >= 2 && <Edge d="M40 424 H22 V122 H40" label="context" lx={2} ly={300} />}
      <Edge d="M150 250 V296" label="APIs · events" lx={156} ly={278} />
      <Edge d="M355 250 V296" />
      {hasSbs && <Edge d="M505 250 V296" />}
      <Edge d="M150 362 V400" label="data" lx={156} ly={388} />
      {bcOn && <Edge d="M110 448 V492" gold label="registry sync (attested)" lx={118} ly={474} />}
      {bcOn && <Edge d="M350 510 H370" gold label="DvP" lx={352} ly={505} />}
      {bcOn && <Edge d="M370 526 H350" gold />}
      {bcOn && econOn && <Edge d="M340 122 H572 V517 H530" gold dash="3 3" label="M2M pay" lx={545} ly={470} />}
      <path d="M584 182 H560" stroke="#c8a84b" strokeDasharray="3 3" opacity="0.55" fill="none" />
      <path d="M600 214 V329 H260" stroke="#c8a84b" strokeDasharray="3 3" opacity="0.55" fill="none" />
      {bcOn && <path d="M640 214 V517 H350" stroke="#c8a84b" strokeDasharray="3 3" opacity="0.55" fill="none" />}
    </svg>
  );

  const Output = (
    <div className="stack">
      <div className="titleblock">
        <div className="tb-cell tb-br tb-bb"><div className="fmono tb-l">PROJECT</div><div className="fdisp tb-v">{ind ? ind.n : "—"} · {reg.n}</div></div>
        <div className="tb-cell tb-bb"><div className="fmono tb-l">SHEET · REV</div><div className="fdisp tb-v">EA-01 · v0.8.1 · {new Date().toISOString().slice(0, 10)}</div></div>
        <div className="tb-cell tb-br"><div className="fmono tb-l">ENGINE</div><div className="tb-v2">Deterministic · {nSel} capabilities · composite {composite(kpiAdv.scores)}</div></div>
        <div className="tb-cell"><div className="fmono tb-l">STATUS</div><div className="tb-v2">Draft — defensible starting architecture, not a bespoke design</div></div>
      </div>

      {gates.length > 0 && (
        <Card className="gatecard">
          <Eyebrow>Readiness gates — resolve before target design</Eyebrow>
          {gates.map((g) => <p key={g.id} className="gatep mt1">▲ {g.t}</p>)}
        </Card>
      )}

      <div className="row">
        <Pick small active={tier === "basic"} onClick={() => setTier("basic")}>Basic tier</Pick>
        <Pick small active={tier === "adv"} onClick={() => setTier("adv")}>Advanced tier <span className="fmono">⊕</span></Pick>
      </div>

      <Card>
        <Eyebrow>To-Be architecture diagram · {tier === "adv" ? "Advanced" : "Basic"}</Eyebrow>
        <div className="mt2">{ArchDiagram}</div>
        <p className="fine mt1">Teal arrows: API / data flows. Gold: settlement & convergence flows (registry sync · DvP · M2M pay). Dashed gold: one identity layer spanning humans, systems, agents, allowlists.</p>
        <div className="fmono eyebrow mt2">Layer detail</div>
        <div className="lgrid mt2">
          <div className="stack1">
            {landscape.map((L, li) => (
              <div key={L.n}>
                <div className="layer">
                  <div className="fmono layern">{L.n}</div>
                  <div className="layerbody">
                    {L.items.map((it, i) => (
                      <span key={i} className={"lchip " + (it.gate ? "lchip-gate" : "")}>{it.n}{it.lic ? <Lic /> : null}</span>
                    ))}
                  </div>
                </div>
                {li < landscape.length - 1 && <div className="flowarr">▼</div>}
              </div>
            ))}
          </div>
          <div className="vrail vrail-g"><span>SECURITY & IDENTITY — IAM · SoD/GRC · custody · non-human identity ⟡</span></div>
          <div className="vrail vrail-t"><span>GOVERNANCE & OPS — {"ALM & health monitoring"} · {"EA repository"} ⊕ · {"process mining"} ⊕ · DR ({sel.dr}) · AI governance</span></div>
        </div>
        <p className="fine mt2">⟡ shared substrate — see Convergence. ⊕ additional license. Vertical rails are cross-cutting across every layer.</p>
      </Card>

      <Card>
        <Eyebrow>Instance topology & environment tracks</Eyebrow>
        <p className="fine mt1">{sel.instance === "single" ? "Single global instance" : sel.instance === "regional" ? "Regional hub instances" : "Country-level instances"} · sizing {env.volumeCritical ? "volume-critical (retail / automotive-class throughput)" : "standard"} · change management flows DEV → TEST/QA {env.volumeCritical ? "→ PERF " : ""}→ PROD per track.</p>
        <div className="stack1 mt2">
          {env.tracks.map((t) => (
            <div key={t} className="track">
              <div className="fmono trackn">{t}</div>
              <div className="trackenvs">
                {env.envs.map((e, i) => (
                  <React.Fragment key={e}>
                    <span className={"envchip " + (e === "PROD" ? "envprod" : "")}>{e}<span className="fmono envsz">{env.sizeOf(e)}</span></span>
                    {i < env.envs.length - 1 && <span className="envarr">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        {env.nplus1 && <p className="fine mt2">During the transformation an N+1 project track runs in parallel to the productive N landscape; retire N per the roadmap's cutover wave. TEST/QA carries an integration twin of critical interfaces. Sizing shown as T-shirt classes (S–XL); volume-critical industries carry a dedicated PERF tenant for regression under load.</p>}
      </Card>

      <Card>
        <Eyebrow>Roadmap — {sel.timeline} months, four waves</Eyebrow>
        <div className="gantt mt2">
          <div className="gaxis">
            {[0, 0.25, 0.5, 0.75, 1].map((f) => <span key={f} className="fmono gtick" style={{ left: f * 100 + "%" }}>{Math.round(f * rm.T)}</span>)}
          </div>
          {rm.waves.map((w, i) => (
            <div key={w.n} className="grow">
              <div className="gbar" style={{ left: pct(w.s) + "%", width: Math.max(8, pct(w.e) - pct(w.s)) + "%" }}>
                <span className="fmono gbarl">{"W" + i}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="stack1 mt2">
          {rm.waves.map((w) => (
            <div key={w.n} className="wave">
              <div className="wavehd"><span className="fdisp waven">{w.n}</span><span className="fmono wavet">{w.s}–{w.e} mo</span></div>
              {w.items.map((it, i) => <div key={i} className="waveitem">▸ {it}</div>)}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Eyebrow>KPI profile — seven axes, Basic vs Advanced</Eyebrow>
        <div className="mt2">
          <RadarSVG data={radarData} series={[{ key: "Basic", color: "#6b6457", fill: 0.15 }, { key: "Advanced", color: "#1a6b72", fill: 0.3 }]} />
        </div>
        <button onClick={() => setShowDrivers((v) => !v)} className="linkbtn fmono noprint">{showDrivers ? "Hide score drivers" : "Show score drivers (audit trail)"}</button>
        {showDrivers && KPI_KEYS.map((k) => (
          <div key={k} className="drvblock">
            <div className="drvhd"><span className="fdisp">{k}</span><span className="fmono tx-teal">{kpi.scores[k]}</span></div>
            {kpi.drivers[k].map((d, i) => (
              <div key={i} className="drvrow fmono"><span>{d.label}</span><span className={d.v >= 0 ? "tx-green" : "tx-red"}>{d.v >= 0 ? "+" + d.v : d.v}</span></div>
            ))}
          </div>
        ))}
        <p className="fine mt1">Every driver maps to a declared, verifiable input — no discretionary scoring. Driver weights are author priors pending AHP calibration (Study 2).</p>
      </Card>

      <Card>
        <Eyebrow>Sensitivity — which inputs move the composite most</Eyebrow>
        <div className="stack1 mt2">
          {sensitivity.map((p) => (
            <div key={p.label} className="senrow">
              <span className="senl">{p.label}</span>
              <span className={"fmono " + (p.d >= 0 ? "tx-green" : "tx-red")}>{p.d >= 0 ? "+" + p.d : p.d}</span>
              <div className="senbar"><div className={p.d >= 0 ? "senfill-g" : "senfill-r"} style={{ width: Math.min(100, Math.abs(p.d) * 10) + "%" }} /></div>
            </div>
          ))}
        </div>
        <p className="fine mt2">Single-input probes; interaction effects not explored here.</p>
      </Card>

      <Card>
        <Eyebrow>Capability heat map · Core Integrity paths</Eyebrow>
        <div className="row mt2">{Object.entries(PATHS).map(([k, p]) => <span key={k} className={"fmono hm-tag " + p.cls}>{p.l}</span>)}</div>
        <div className="grid2 mt2">
          {asg.map((a) => (
            <div key={a.id} className={"hmtile " + (a.deferred ? PATHS.def.cls : PATHS[a.path].cls)}>
              <div className="hmn">{a.n}</div>
              <div className="fmono hms">{a.cls === "diff" ? "DIFF" : "COM"}{a.reg ? " · REG" : ""}{a.chain ? " · ⛓" : ""}{a.skillGap ? " · skills↓" : ""}</div>
            </div>
          ))}
        </div>
        <p className="fine mt2">Rules: regulated → standard + certified add-on; commodity → fit-to-standard; differentiating → key-user or side-by-side per mode, risk, skills and EA maturity. Modifications are never generated. Full rules in the Rulebook.</p>
      </Card>

      <Card className={sel.bcEnabled && tier === "adv" ? "" : "dim"}>
        <Eyebrow>Tokenization architecture</Eyebrow>
        {!sel.bcEnabled ? <p className="body mt1">Out of scope — enable in step 09.</p> :
         tier !== "adv" ? <p className="body mt1">Requires side-by-side platform capacity — Advanced tier.</p> : (
          <div className="stack1 mt2">
            <div className="body">Use case: <b>{cr.uc.n}</b> · Overlay: {reg.reg}</div>
            {cr.permissioned && (
              <div className="permbox">
                <span className="fmono eyebrow">Primary rail</span>
                <p className="body mt1">Tokenized-deposit / permissioned shared ledger — bank-money settlement with legal finality and privacy. Public-rail scores below apply to the asset leg or external-reach scenarios.</p>
              </div>
            )}
            <table className="ctable">
              <thead><tr className="fmono"><th>Rail</th><th>Score</th><th>Standard for this use case</th></tr></thead>
              <tbody>
                {cr.rows.map((c, i) => (
                  <tr key={c.id} className={i === 0 ? "ctop" : ""}>
                    <td>{c.n}{i === 0 ? " ◂" : ""}</td>
                    <td className="fmono tx-teal">{c.score.toFixed(2)}</td>
                    <td className="fine">{c.std[sel.usecase]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="fmono fine">Weights: finality {cr.uc.w.fin} · throughput {cr.uc.w.thr} · compliance {cr.uc.w.comp} · cash leg {cr.uc.w.cash} · ecosystem {cr.uc.w.eco}</div>
            {sel.usecase === "agentic" && <p className="fine">Standards layer: agent-payment protocols (x402 / AP2 / ACP-class) — evolving; treat as watchlist, not lock-in.</p>}
            <div className="body"><b>Cash leg ({reg.n}):</b> {reg.cash.join(" · ")}</div>
            <div className="body"><b>Custody:</b> {sel.custody === "undecided" ? "undecided — gated" : { qualified: "qualified custodian", hsm: "self-managed HSM", waas: "wallet-as-a-service" }[sel.custody]}</div>
            <div className="body"><b>ERP integration (L5):</b> core stays system of record; token registry syncs side-by-side via the integration platform and event backbone; ISO 20022 mapping on the payment leg; DvP orchestration where a regulated cash leg exists; attestation job reconciles registry against ledger. Zero core modification.</div>
            <p className="fine">{cr.top.note}</p>
            <p className="fine">L2 / rollup profiles and confidential-transfer options are not separately scored in v0.x; custody adequacy varies by license class — validate with counsel.</p>
          </div>
        )}
      </Card>

      <Card className={sel.ai === "none" ? "dim" : ""}>
        <Eyebrow>AI architecture & token economics</Eyebrow>
        {sel.ai === "none" ? <p className="body mt1">AI out of scope — set the ladder in step 08.</p> : (
          <div className="stack1 mt2">
            <div className="body">Ambition: <b>{AI_LADDER[aiRank(sel.ai)].n}</b> · Governance overlay: {reg.ai}</div>
            {gates.some((g) => g.id === "g1") && <p className="gatep">Agentic rungs gated — prerequisites in Wave 0.</p>}
            <table className="ctable">
              <thead><tr className="fmono"><th>Routing</th><th>Cost / task</th><th>Monthly</th>{tokEco[0].margin !== null && <th>Margin / task</th>}</tr></thead>
              <tbody>
                {tokEco.map((t) => (
                  <tr key={t.n}><td>{t.n}</td><td className="fmono">${t.cpt.toFixed(4)}</td><td className="fmono">${Math.round(t.monthly).toLocaleString()}</td>{t.margin !== null && <td className={"fmono " + (t.margin >= 0 ? "tx-green" : "tx-red")}>${t.margin.toFixed(4)}</td>}</tr>
                ))}
              </tbody>
            </table>
            <p className="fine">Margin condition: value created per task must exceed cost per task under the chosen routing. {TASK_BANDS[sel.aiTasks].toLocaleString()} tasks/mo × {TOK_BANDS[sel.aiTok].toLocaleString()} tokens · frontier ${sel.priceF} / small ${sel.priceS} per 1M — editable; excludes caching and batch discounts; verify current pricing.</p>
          </div>
        )}
      </Card>

      <Card className="convcard">
        <Eyebrow>Convergence — one substrate, three programs</Eyebrow>
        <div className="stack1 mt2 body">
          <div>⟡ The governed <b>API catalog</b> is the agent <b>tool registry</b> — integration architecture is agent architecture.</div>
          <div>⟡ One <b>identity layer</b> spans humans, systems, agents, and on-chain allowlists.</div>
          <div>⟡ One <b>cash leg</b> serves DvP settlement and machine-to-machine payments.</div>
        </div>
        <p className="fine mt2">Every layer of the stack commoditizes except the enterprise's own data and process capital. Agents can only consume what is governed, API-exposed, and semantically consistent — EA maturity is the precondition for agent-economy participation.</p>
      </Card>

      <Card>
        <Eyebrow>Outside view — public-signal screen (Governance Observability Ladder, rung 4)</Eyebrow>
        <p className="fine mt1">
          From outside a firm, governance is visible only where regulation compels disclosure. This
          screen reads compelled, mechanical signals from SEC filing metadata. It flags; it does not
          score, and no signal here is a forecast for an individual firm.
        </p>
        {signals === null && <p className="fine mt1">Loading published signals…</p>}
        {signals === false && (
          <p className="fine mt1">
            No signal file is published with this deployment. Apply the ladder in step 07 by hand: read
            the firm's own filings for an Item 9A material weakness, a lengthening close-to-filing interval,
            late-filing notices, amendments and Form 8-K items 4.01, 4.02 and 1.05.
          </p>
        )}
        {signals && (
          <div className="mt1">
            <input className="sigin fmono" placeholder="Ticker or company name" value={sigQuery}
              onChange={(e) => setSigQuery(e.target.value)} aria-label="Search the screen by ticker or name" />
            <div className="fine mt1">
              {signals.firms.length} firms · refreshed {String(signals.generated || "").slice(0, 10)} · lookback {signals.lookback_years} years · source: SEC EDGAR submissions
            </div>
            <table className="ctable mt1">
              <thead><tr className="fmono"><th>Firm</th><th>Latest close-to-filing</th><th>Flags in lookback</th></tr></thead>
              <tbody>
                {sigRows.map((f) => (
                  <tr key={f.cik}>
                    <td className="fine"><b>{f.name}</b><br /><span className="fmono">{(f.tickers || []).join(" · ")}</span></td>
                    <td className="fmono">{f.latest_lag_days == null ? "—" : f.latest_lag_days + " d"}{f.median_lag_days_prior == null ? "" : " · own median " + f.median_lag_days_prior + " d"}</td>
                    <td className="fine">{f.flags && f.flags.length ? f.flags.join(" · ") : "none"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sigRows.length === 0 && <p className="fine mt1">No firm in the published watchlist matches.</p>}
            <p className="fine mt1">{signals.note || ""}</p>
          </div>
        )}
      </Card>

      <Card>
        <Eyebrow>Narrative layer — composed from the engine's outputs</Eyebrow>
        <div className="row mt2 noprint">
          <button onClick={() => runNarrative("memo")} className="btnp">Generate CIO memo</button>
          <button onClick={() => runNarrative("red")} className="btns">Red-team review</button>
        </div>
        <div className="row mt1 noprint">
          {["TCO hawk", "CISO", "Regulator", "Risk skeptic"].map((p) => <Pick key={p} small active={persona === p} onClick={() => { setPersona(p); if (narr && narr.kind === "red") runNarrative("red", p); }}>{p}</Pick>)}
        </div>
        {narr && (
          <div className="aibox mt2">
            <div className="fmono eyebrow">{narr.label}</div>
            <p className="body mt1" style={{ whiteSpace: "pre-wrap" }}>{narr.text}</p>
          </div>
        )}
        <p className="fine mt2">Every sentence is selected by a rule over the engine's outputs, so the same inputs always produce the same text, and nothing is sent anywhere. The narrative cannot re-score; it reports what the engine decided.</p>
      </Card>

      <div className="grid2 noprint">
        <button onClick={saveScenario} className="btnp">Save scenario{storageOk ? " (persists)" : ""}</button>
        <button onClick={() => setView("compare")} disabled={scenarios.length < 2} className={scenarios.length < 2 ? "btnd" : "btns"}>Compare ({scenarios.length})</button>
        <button onClick={() => { setCopied(false); setView("export"); }} className="btns">Export JSON</button>
        <button onClick={() => setView("rulebook")} className="btns">Rulebook</button>
        <button onClick={() => window.print()} className="btns">Print / PDF — full findings</button>
      </div>

      <p className="fine">Research prototype · vendor-neutral by design; taxonomy is author-generalized. The author is employed by an enterprise-software vendor; this work was produced independently and all views are the author's own. Architecture guidance only — not legal, tax, or investment advice.</p>
      <p className="fine">Evidence base frozen to the archived research run of {EVIDENCE_STAMP.run} (notebook {EVIDENCE_STAMP.notebook}, panel hash {EVIDENCE_STAMP.panelHash}, {EVIDENCE_STAMP.sample}) · {EVIDENCE_STAMP.papers.join(" · ")} · validation: {EVIDENCE_STAMP.validation}.</p>
    </div>
  );

  /* ---------- COMPARE / EXPORT / RULEBOOK ---------- */

  const compareData = KPI_KEYS.map((k) => {
    const row = { kpi: k.replace(" & ", " / ") };
    scenarios.forEach((s) => (row[s.name] = s.scores[k]));
    return row;
  });

  const Compare = (
    <div className="stack">
      <Card>
        <Eyebrow>Scenario comparison — Advanced-tier KPIs</Eyebrow>
        <div className="mt2">
          <RadarSVG data={compareData} series={scenarios.map((s, i) => ({ key: s.name, color: scenColors[i], fill: 0.15 }))} />
        </div>
      </Card>
      <Card>
        <Eyebrow>Deltas vs {scenarios[0] ? scenarios[0].name : ""}</Eyebrow>
        <div className="stack1 mt2">
          {KPI_KEYS.map((k) => (
            <div key={k} className="drvrow"><span>{k}</span>
              <span className="fmono">
                {scenarios.map((s, i) => {
                  const d = s.scores[k] - scenarios[0].scores[k];
                  return <span key={s.name} className={"ml2 " + (i === 0 ? "tx-muted" : d >= 0 ? "tx-green" : "tx-red")}>{i === 0 ? s.scores[k] : d >= 0 ? "+" + d : d}</span>;
                })}
              </span>
            </div>
          ))}
        </div>
        <div className="fmono fine mt2">{scenarios.map((s) => <div key={s.name}>{s.name}: {s.meta.transition} · {s.meta.usecase} · AI {s.meta.ai}</div>)}</div>
      </Card>
      <div className="row">
        <button onClick={() => setView("wizard")} className="btnp">Back to output</button>
        <button onClick={clearScenarios} className="btns">Clear saved</button>
      </div>
    </div>
  );

  const Export = (
    <div className="stack">
      <Card>
        <Eyebrow>Export — configuration + results</Eyebrow>
        <textarea readOnly value={exportObj()} className="fmono exp" />
        <div className="row mt2">
          <button onClick={copyJson} className="btnp">{copied ? "Copied ✓" : "Copy JSON"}</button>
          <button onClick={() => setView("wizard")} className="btns">Back</button>
        </div>
      </Card>
    </div>
  );

  const Rulebook = (
    <div className="stack">
      <Card>
        <Eyebrow>Rulebook — the rules are the design knowledge</Eyebrow>
        <div className="stack1 mt2 body">
          <div><b className="fdisp">Extensibility assignment.</b> Regulated → standard + certified add-on. Commodity → fit-to-standard. Differentiating → key-user under TCO/compliance modes; side-by-side under agility (and speed, if any API program exists). Bold risk promotes chain-relevant capabilities to side-by-side; conservative demotes non-chain side-by-side to key-user. No platform team, or initial EA maturity (non-chain), demotes side-by-side to key-user with a flagged skills gap. Modifications are never generated.</div>
          <div><b className="fdisp">Readiness gates.</b> Agentic AI requires API program + MDM ≥ managed + semantic layer. Tokenization requires a decided custody model; MDM low flags registry-sync risk. Strict residency conflicts with a public-cloud-only stance. Open gates populate Wave 0 and penalize Governance and Data & AI readiness.</div>
          <div><b className="fdisp">KPI scoring.</b> Seven axes, base 45, clamped 5–98. Every driver maps to a declared input; the full ledger is visible in the audit trail. Weights are author priors pending AHP calibration. The narrative layer is composed from engine outputs and cannot alter scores.</div>
          <div><b className="fdisp">Environment tracks.</b> Instance strategy sets track count (single = 1, regional = 3, multi = n). Volume-critical industries (retail, automotive-class manufacturing) add a dedicated PERF tenant and upsize PROD; an N+1 project track runs during transformation.</div>
          <div><b className="fdisp">Rail scoring.</b> Score = Σ weight × attribute over finality, throughput, compliance tooling, cash leg, ecosystem (0–10 each, as of Aug 2026). Weights per use case:</div>
          <table className="ctable">
            <thead><tr className="fmono"><th>Use case</th><th>fin</th><th>thr</th><th>comp</th><th>cash</th><th>eco</th></tr></thead>
            <tbody>{USECASES.map((u) => <tr key={u.id}><td className="fine">{u.n}</td><td className="fmono">{u.w.fin}</td><td className="fmono">{u.w.thr}</td><td className="fmono">{u.w.comp}</td><td className="fmono">{u.w.cash}</td><td className="fmono">{u.w.eco}</td></tr>)}</tbody>
          </table>
          <div><b className="fdisp">Permissioned override.</b> Intercompany settlement, or compliance mode on asset tokenization, surfaces a tokenized-deposit / permissioned rail as primary.</div>
          <div><b className="fdisp">Token economics.</b> Cost per task = tokens × blended price / 1M under three routing splits (100/0, 40/60, 10/90). Margin appears when value per task is declared. Prices are editable assumptions.</div>
          <div><b className="fdisp">Operating-model derivation.</b> Unification → single instance; coordination and replication → regional hubs; diversification → country multi (after Ross, Weill & Robertson). Modularity anchoring after Baldwin & Clark. Rationalization after Gartner TIME. Shown as recommendations, never forced.</div>
        </div>
      </Card>
      <button onClick={() => setView("wizard")} className="btnp">Back</button>
    </div>
  );

  /* ---------- SHELL ---------- */

  const bodyByStep = [S_Context, S_Business, S_Data, S_Apps, S_Integration, S_Tech, S_Org, S_AI, S_Emerging, Output][step];

  return (
    <div className="root">
      <style>{`
        @import url('fonts/fonts.css');
        :root { --ink:#261C15; --esp:#3E2E20; --paper:#f5f2eb; --paper2:#ede9df; --gold:#c8a84b; --goldl:#e8d08a; --teal:#1a6b72; --teall:#2a9fa8; --red:#c0392b; --green:#1a7a4a; --muted:#6b6457; --bd:rgba(38,28,21,0.14); }
        .idxnote { border-left:3px solid var(--gold); background:var(--paper2); border-radius:8px; padding:10px 12px; }
        .opcard { display:flex; gap:10px; border:1px solid var(--bd); border-left:3px solid var(--muted); border-radius:10px; padding:10px 12px; background:var(--paper2); margin-bottom:8px; }
        .opcard.op-teal { border-left-color:var(--teal); }
        .opcard.op-red { border-left-color:var(--red); }
        .opcard.op-gold { border-left-color:var(--gold); }
        .opcard.op-muted { border-left-color:var(--muted); }
        .opnum { font-size:20px; color:var(--muted); min-width:22px; line-height:1; }
        .opbody { flex:1; }
        .rung { display:flex; gap:10px; border:1px solid var(--bd); border-left:4px solid var(--muted); border-radius:10px; padding:10px 12px; background:var(--paper2); margin-bottom:8px; }
        .rung.r-teal { border-left-color:var(--teal); } .rung.r-teall { border-left-color:var(--teall); }
        .rung.r-gold { border-left-color:var(--gold); } .rung.r-red { border-left-color:var(--red); } .rung.r-muted { border-left-color:var(--muted); }
        .rungn { font-size:22px; min-width:22px; line-height:1; }
        .rungtag { font-size:9px; letter-spacing:1.4px; }
        .rungverdict { font-size:9.5px; letter-spacing:1px; text-transform:uppercase; margin-top:6px; font-weight:500; }
        .rline { font-size:9px; letter-spacing:.5px; text-align:right; padding:2px 0 6px; margin:0 0 8px; border-bottom:1.5px dashed; }
        .rline-att { color:var(--teal); border-color:var(--teal); } .rline-comp { color:var(--red); border-color:var(--red); }
        .tx-gold { color:#9a7b25; } .tx-teall { color:var(--teall); }
        .qcard.q-red { border-color:var(--red); box-shadow:inset 3px 0 0 var(--red); }
        .qcard.q-teall { border-color:var(--teall); box-shadow:inset 3px 0 0 var(--teall); }
        .sigin { width:100%; box-sizing:border-box; padding:9px 11px; border:1px solid var(--bd); border-radius:4px; background:var(--paper); color:var(--ink); font-size:12px; }
        .oprule { font-size:14px; color:var(--ink); }
        .opwar { margin-top:6px; font-style:italic; color:var(--muted); }
        .grid2 { display:grid; grid-template-columns:repeat(auto-fit,minmax(228px,1fr)); gap:10px; }
        .qcard { border:1px solid var(--bd); border-radius:10px; padding:12px; background:var(--paper2); }
        .qcard.q-gold { border-color:var(--gold); box-shadow:inset 3px 0 0 var(--gold); }
        .qcard.q-teal { border-color:var(--teall); box-shadow:inset 3px 0 0 var(--teal); }
        .qcard.q-muted { box-shadow:inset 3px 0 0 var(--muted); }
        .qmove { font-size:15px; margin:4px 0 2px; color:var(--teal); }
        .regflag { border:1px dashed var(--red); border-radius:10px; padding:10px 12px; background:var(--paper); }
        .root { min-height:100vh; background:var(--paper); color:var(--ink); font-family:'DM Mono',ui-monospace,monospace; font-size:13px; }
        .fdisp { font-family:'Syne',sans-serif; font-weight:700; }
        .fmono { font-family:'DM Mono',monospace; }
        .wrap { max-width:760px; margin:0 auto; padding:0 14px; }
        .mast { background:var(--esp); color:var(--paper); padding:18px 0 14px; border-bottom:2px solid var(--gold); }
        .logo { font-family:'Syne',sans-serif; font-weight:800; font-size:24px; letter-spacing:-0.5px; }
        .logo span { color:var(--gold); }
        .tag { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:rgba(245,242,235,0.55); margin-top:3px; }
        .sub { font-size:11px; color:rgba(245,242,235,0.75); margin-top:6px; line-height:1.5; }
        .rail { background:var(--paper2); border-bottom:1px solid var(--bd); position:sticky; top:0; z-index:20; }
        .railin { display:flex; gap:6px; overflow-x:auto; padding:8px 14px; max-width:760px; margin:0 auto; }
        .railbtn { font-family:'DM Mono',monospace; font-size:10px; padding:5px 9px; border:1px solid var(--bd); background:var(--paper); color:var(--muted); border-radius:3px; white-space:nowrap; }
        .railbtn.on { background:var(--esp); color:var(--paper); border-color:var(--gold); }
        .railbtn.done { background:var(--goldl); color:var(--ink); }
        .card { background:#fff; border:1px solid var(--bd); border-radius:6px; padding:14px; box-shadow:0 2px 14px rgba(38,28,21,0.06); }
        .card.p0 { padding:0; overflow:hidden; }
        .stack > * + * { margin-top:12px; } .stack1 > * + * { margin-top:6px; }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .row { display:flex; flex-wrap:wrap; gap:6px; }
        .mt1 { margin-top:6px; } .mt2 { margin-top:10px; } .ml2 { margin-left:10px; }
        .eyebrow { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--teal); }
        .lbl { font-size:11px; color:var(--muted); }
        .fine { font-size:10.5px; color:var(--muted); line-height:1.55; }
        .body { font-size:12.5px; line-height:1.6; }
        .pick { display:block; width:100%; text-align:left; background:var(--paper); border:1px solid var(--bd); border-radius:4px; padding:9px 11px; color:var(--ink); font-family:inherit; font-size:12px; }
        .pick-on { background:var(--esp); color:var(--paper); border-color:var(--gold); }
        .pick-sm { display:inline-block; width:auto; padding:6px 10px; }
        .pt { font-weight:500; } .ps { font-size:10px; opacity:0.65; margin-top:2px; }
        .pick-on .ps { opacity:0.7; }
        .arch { text-align:left; background:var(--paper2); border:1px dashed var(--gold); border-radius:4px; padding:8px 10px; font-family:inherit; font-size:10.5px; color:var(--ink); line-height:1.4; }
        .domhead { width:100%; display:flex; justify-content:space-between; align-items:center; padding:11px 14px; background:var(--paper2); border:none; border-bottom:1px solid var(--bd); font-size:13px; color:var(--ink); }
        .areabox { padding:8px 14px; border-bottom:1px solid rgba(38,28,21,0.06); }
        .areahd { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
        .caprow { display:flex; align-items:center; gap:8px; padding:4px 0; }
        .chk { width:18px; height:18px; border:1px solid var(--bd); background:#fff; border-radius:3px; color:var(--paper); font-size:11px; flex-shrink:0; }
        .chk-on { background:var(--teal); border-color:var(--teal); }
        .capn { flex:1; font-size:12px; } .capoff { color:var(--muted); text-decoration:line-through; }
        .clsbtn { font-size:9px; padding:2px 5px; border-radius:3px; border:1px solid; }
        .cls-d { background:#fff; color:var(--teal); border-color:var(--teal); }
        .cls-c { background:var(--paper2); color:var(--muted); border-color:var(--bd); }
        .tag-reg { font-size:9px; color:var(--teall); } .tag-ch { font-size:10px; color:var(--gold); }
        .rec { font-size:9px; color:var(--gold); margin-left:6px; }
        .inlbl { display:flex; align-items:center; gap:6px; font-size:10px; color:var(--muted); }
        .numin { width:64px; border:1px solid var(--bd); border-radius:3px; padding:5px 7px; font-family:'DM Mono',monospace; font-size:12px; background:#fff; color:var(--ink); }
        .titleblock { background:var(--esp); color:var(--paper); border-radius:6px; border:1px solid var(--gold); display:grid; grid-template-columns:1fr 1fr; overflow:hidden; }
        .tb-cell { padding:10px 12px; } .tb-br { border-right:1px solid rgba(245,242,235,0.18); } .tb-bb { border-bottom:1px solid rgba(245,242,235,0.18); }
        .tb-l { font-size:8px; letter-spacing:2px; color:rgba(245,242,235,0.5); }
        .tb-v { font-size:12.5px; margin-top:2px; } .tb-v2 { font-size:11px; margin-top:2px; color:rgba(245,242,235,0.85); }
        .gatecard { border-color:var(--red); background:#fdf6f4; }
        .gatep { font-size:11.5px; color:var(--red); line-height:1.5; }
        .evbanner { background:var(--paper2); border-color:var(--gold); }
        .cia-d { font-size:11px; }
        .lgrid { display:grid; grid-template-columns:1fr; gap:8px; }
        .layer { border:1px solid var(--bd); border-radius:5px; overflow:hidden; background:#fff; }
        .layern { font-size:8.5px; letter-spacing:1.8px; text-transform:uppercase; color:var(--muted); background:var(--paper2); padding:5px 9px; }
        .layerbody { padding:7px 9px; display:flex; flex-wrap:wrap; gap:5px; }
        .lchip { background:var(--paper); border:1px solid var(--bd); border-radius:3px; padding:4px 7px; font-size:10.5px; line-height:1.35; }
        .lchip-gate { border-color:var(--red); color:var(--red); }
        .lic { background:var(--gold); color:var(--ink); font-size:8px; padding:1px 4px; border-radius:2px; margin-left:5px; font-weight:500; }
        .flowarr { text-align:center; color:var(--gold); font-size:9px; line-height:1; padding:1px 0; }
        .vrail { border-radius:5px; padding:8px 5px; display:flex; align-items:center; justify-content:center; }
        .vrail span { font-family:'DM Mono',monospace; font-size:8.5px; letter-spacing:1.2px; text-transform:uppercase; }
        .vrail-g { border-left:3px solid var(--gold); background:var(--paper2); }
        .vrail-t { border-left:3px solid var(--teal); background:var(--paper2); }
        @media (min-width:640px){
          .lgrid { grid-template-columns:1fr 30px 30px; }
          .vrail { padding:8px 3px; }
          .vrail span { writing-mode:vertical-rl; }
        }
        .track { border:1px solid var(--bd); border-radius:5px; padding:7px 9px; background:#fff; }
        .trackn { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
        .trackenvs { display:flex; flex-wrap:wrap; align-items:center; gap:4px; }
        .envchip { background:var(--paper); border:1px solid var(--bd); border-radius:3px; padding:4px 7px; font-size:10px; display:inline-flex; gap:5px; align-items:baseline; }
        .envprod { background:var(--esp); color:var(--paper); border-color:var(--gold); }
        .envsz { font-size:8px; color:var(--gold); }
        .envarr { color:var(--muted); font-size:10px; }
        .gantt { position:relative; padding-top:16px; }
        .gaxis { position:relative; height:12px; border-bottom:1px solid var(--bd); margin-bottom:6px; }
        .gtick { position:absolute; top:0; transform:translateX(-50%); font-size:8px; color:var(--muted); }
        .grow { position:relative; height:18px; margin-bottom:4px; }
        .gbar { position:absolute; top:2px; height:14px; background:linear-gradient(90deg,var(--teal),var(--teall)); border-radius:3px; display:flex; align-items:center; padding-left:6px; }
        .gbar .gbarl { font-size:8px; color:var(--paper); letter-spacing:1px; }
        .grow:first-of-type .gbar { background:linear-gradient(90deg,var(--red),#d4604f); }
        .grow:nth-of-type(4) .gbar, .grow:nth-of-type(5) .gbar { background:linear-gradient(90deg,var(--gold),var(--goldl)); }
        .wave { border:1px solid var(--bd); border-radius:5px; padding:9px 11px; background:var(--paper); }
        .wavehd { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:5px; }
        .waven { font-size:12px; } .wavet { font-size:9px; background:var(--gold); color:var(--ink); padding:2px 6px; border-radius:2px; }
        .waveitem { font-size:11px; line-height:1.5; color:var(--ink); padding:1.5px 0; }
        .linkbtn { background:none; border:none; color:var(--teal); text-decoration:underline; font-size:10.5px; padding:6px 0 0; }
        .drvblock { border-top:1px solid rgba(38,28,21,0.07); padding-top:7px; margin-top:8px; }
        .drvhd { display:flex; justify-content:space-between; font-size:12.5px; }
        .drvrow { display:flex; justify-content:space-between; font-size:10.5px; color:var(--muted); padding:1.5px 0; }
        .tx-teal { color:var(--teal); } .tx-green { color:var(--green); } .tx-red { color:var(--red); } .tx-muted { color:var(--muted); }
        .senrow { display:grid; grid-template-columns:1fr auto; gap:4px 10px; align-items:center; }
        .senl { font-size:11px; } .senbar { grid-column:1 / -1; height:4px; background:var(--paper2); border-radius:2px; overflow:hidden; }
        .senfill-g { height:100%; background:var(--teal); } .senfill-r { height:100%; background:var(--red); }
        .hm-tag { font-size:8.5px; padding:3px 6px; border-radius:3px; border:1px solid; }
        .hm-std { background:#eaf3ec; color:var(--green); border-color:var(--green); }
        .hm-comp { background:#e9f2f3; color:var(--teal); border-color:var(--teal); }
        .hm-ku { background:var(--goldl); color:var(--ink); border-color:var(--gold); }
        .hm-sbs { background:var(--esp); color:var(--paper); border-color:var(--esp); }
        .hm-def { background:var(--paper2); color:var(--muted); border-color:var(--muted); border-style:dashed; }
        .hmtile { border:1px solid; border-radius:4px; padding:7px 8px; }
        .hmn { font-size:10.5px; line-height:1.35; font-weight:500; }
        .hms { font-size:8.5px; margin-top:3px; opacity:0.8; }
        .dim { opacity:0.65; }
        .permbox { border:1px solid var(--teal); background:#e9f2f3; border-radius:5px; padding:9px 11px; }
        .ctable { width:100%; border-collapse:collapse; font-size:11px; }
        .ctable th { text-align:left; font-size:8.5px; letter-spacing:1px; text-transform:uppercase; color:var(--muted); padding:4px 6px 4px 0; }
        .ctable td { border-top:1px solid rgba(38,28,21,0.07); padding:6px 6px 6px 0; vertical-align:top; }
        .ctop { background:#e9f2f3; }
        .convcard { border-color:var(--gold); background:linear-gradient(180deg,#fff, var(--paper)); }
        .aibox { border:1px solid var(--bd); border-left:3px solid var(--gold); background:var(--paper); border-radius:0 5px 5px 0; padding:10px 12px; }
        .btnp { background:var(--teal); color:var(--paper); border:none; border-radius:4px; padding:10px 14px; font-family:inherit; font-size:12px; font-weight:500; }
        .btns { background:#fff; color:var(--ink); border:1px solid var(--bd); border-radius:4px; padding:10px 14px; font-family:inherit; font-size:12px; }
        .btnd { background:var(--paper2); color:var(--muted); border:1px solid var(--bd); border-radius:4px; padding:10px 14px; font-family:inherit; font-size:12px; }
        .exp { width:100%; height:260px; font-size:10px; border:1px solid var(--bd); border-radius:4px; background:var(--paper); color:var(--ink); padding:8px; margin-top:8px; }
        .ctrl { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:2px solid var(--gold); padding:10px 14px; z-index:30; }
        .ctrlin { max-width:760px; margin:0 auto; display:flex; gap:8px; }
        .err { max-width:760px; margin:4px auto 0; font-size:10px; color:var(--red); }
        .pb { padding-bottom:96px; padding-top:12px; }
        @media (min-width:640px){ .grid2{grid-template-columns:1fr 1fr;} }
        .archc { border-style:solid; border-color:var(--teal); color:var(--teal); font-weight:500; }
        .arch.on { background:var(--esp); color:var(--paper); border-style:solid; border-color:var(--gold); }
        @media print {
          .noprint { display:none !important; }
          .root { background:#fff; }
          .card { box-shadow:none; border-color:#c9c2b4; break-inside:avoid; page-break-inside:avoid; }
          .mast { background:#fff; color:var(--ink); border-bottom:2px solid var(--gold); }
          .logo, .logo span { color:var(--ink); }
          .mast .tag, .mast .sub { color:var(--muted); }
          .titleblock { background:#fff; color:var(--ink); border:1.5px solid var(--gold); }
          .tb-l { color:var(--muted); } .tb-v2 { color:var(--ink); }
          .tb-br { border-right-color:var(--bd); } .tb-bb { border-bottom-color:var(--bd); }
          .pb { padding-bottom:0; }
        }
      `}</style>

      <div className="mast">
        <div className="wrap">
          <div className="logo"><span>TRVA</span> Navigator</div>
          <div className="tag">Tokenization Readiness &amp; Value Assessment</div>
          <div className="sub">Core Integrity framework family · CVM · TAVE — vendor-neutral enterprise-architecture configurator. Deterministic engine and narrative · static build, no model calls or keys · research prototype v0.8.1 · evidence frozen to run 2026-08-12 (v13.0), validated October 2026.</div>
        </div>
      </div>

      <div className="rail noprint">
        <div className="railin">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => view === "wizard" && setStep(i)}
              className={"railbtn " + (view === "wizard" && step === i ? "on" : i < step ? "done" : "")}>
              {String(i + 1).padStart(2, "0")} {s}
            </button>
          ))}
        </div>
      </div>

      <div className="wrap pb">
        {view === "wizard" ? bodyByStep : view === "compare" ? Compare : view === "export" ? Export : Rulebook}
      </div>

      {view === "wizard" && step < 9 && (
        <div className="ctrl noprint">
          <div className="ctrlin">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className={step === 0 ? "btnd" : "btns"}>Back</button>
            <button onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext} className={canNext ? "btnp" : "btnd"} style={{ flex: 1 }}>
              {step === 8 ? "Generate architecture" : "Next"}
            </button>
          </div>
          {!canNext && <div className="err">{step === 0 ? "Select an industry (or load an archetype) to continue." : "Select at least one capability."}</div>}
        </div>
      )}
    </div>
  );
}
