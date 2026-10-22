# CIAOF & EAGI — Findings and Hypothesis Register

*Archived run of 2026-08-12 · notebook v13.0 · panel hash 736040245229 · seed 42 · 950 firm-years ·
167 US large accelerated filers · 2019–2025. Every entry is reconciled against
`run_summary_archived.txt`, except the hand-check of the flagged filings (October 2026), which is
documented with its sources in `itgc_handcheck.md`.*

---

## Paper 1 — CIAOF: headline findings

1. **Adherence is a firm characteristic, not a decision margin.** 94% of core-integrity variance is
   between firms (SD 0.074) against within-firm SD 0.019. Firm fixed effects discard almost all of it.
2. **No robustly signed association with performance.** The primary estimate is negative
   (β = −0.188, p = 0.099; −1.39 pp ROA per between-firm SD) but not significant, does not survive the
   alternative composite (p = 0.196), and the specification curve is sign-unstable (56% positive).
3. **No reliable monotone gradient.** The lowest-adherence quintile has the highest adjusted ROA and
   Q5 is −0.039 (p = 0.013), but with four contrasts the Bonferroni threshold is p < 0.0125 and none
   survives. Reported as "no reliable gradient", not as "high adherence destroys value".
4. **The composite is effectively two dimensions.** Shapley: data harmonization 56.3% and API
   integration 31.3% carry 88% of explained variance; standardization 0.6%.
5. **No floor, no ceiling, no prerequisite.** Single-regressor min, max and mean are each
   non-significant (floor p = 0.529); necessity lifts ≈ 0.

## Paper 2 — EAGI: headline findings

1. **The voluntary-text instrument fails across five construction families.** α = −0.062; four
   firm-year variants with Spearman–Brown −0.061 to +0.008; four firm-level variants −0.142 to −0.055;
   15 of 20 terms used by at most one firm in seven years.
2. **The failure is construct-specific.** Positive control: the identical method on an AI lexicon in
   the same filings reaches α = 0.511 (Spearman–Brown 0.551).
3. **Reliable or valid, never both.** Roots reach 100% of filings and α = 0.580 only through
   accounting boilerplate (*consolidat-*, *integrat-*, *governan-*); tightened by proximity to
   architectural meaning, α falls to 0.220.
4. **Governance vocabulary tracks mandates, not practice.** Compliance terms rise after 2023
   (+0.089, p = 0.010); architecture terms do not (p = 0.097).
5. **Observability rises with compulsion and attestation** — the Governance Observability Ladder, the
   deliverable of the EAGI framework. Mandated narrative tracks the mandate; filing metadata covers
   every firm without signal; structural disclosure is too thin; the attested source makes a control
   failure observable to a reader, but not to a keyword rule (item 6).
6. **IT-related material-weakness indicator — association withdrawn after validation.** The
   pre-validation estimate was β = −0.0507 (about 5.1 pp), p = 0.001, n = 769, on ten treated
   firm-years. Reading the 21 flagged firm-years (October 2026): 8 resolvable, of which 4 disclose an
   IT-related weakness of the flagged year (2 at the flagged year-end, 2 remediated in the year) and 4 do not (2
   weaknesses remediated in earlier years, 1 hypothetical risk factor, 1 non-IT weakness); 13
   unresolved within the readable text. The indicator does not measure a prior-year IT control failure.
7. **A disciplined core predicts later AI adoption — exploratory, the framework's forward-looking
   component.** Core integrity → AI index β = +1.268, p = 0.008, n = 783; placebo outcome p = 0.481;
   neither governance measure predicts adoption (p = 0.747; 0.831). Between-firm, both measures read
   from disclosure, tested on the composite. The AI × core-integrity payoff fails permutation (p = 0.248).

---

## Hypothesis register

### Paper 1 — CIAOF

| ID | Hypothesis | Test | Result | Verdict |
|---|---|---|---|---|
| **P1-H1** | Higher core-integrity adherence → better performance, valuation, lower SG&A | Mundlak, industry × year FE **(primary)** | between β = −0.188, p = 0.099; within β = −0.147, p = 0.163 | **Not supported** |
| P1-H1r | …robust to the alternative composite | PCA composite | between p = 0.196; within p = 0.352 | Not robust |
| P1-H1s | …stable across defensible specifications | 36-specification curve | median +0.670; 44% significant; 56% positive | **Sign unstable** |
| **P1-H2** | Inverted-U with an interior optimum | Quadratic, vertex-interiority rule | b₂ = +0.264 (convex), p = 0.364 | **Rejected** |
| **P1-H3** | Selective allocation beats uniform at a given level | Dispersion residualized on level and level² | β = −0.028, p = 0.131, wrong sign | **Not supported** |
| P1-H3i | Selectivity pays more where differentiation potential is higher | Dispersion × R&D intensity | β = +0.109, p = 0.318 | Right sign, not significant |
| **P1-H3b** | Deviation is legitimate on process, debt on technical hygiene | Hygiene vs process standardization | β_hyg = −0.015; β_proc = +0.004; both n.s. | **Not supported — both signs inverted** |
| **P1-H3c** | More adherence is monotonically better | Adjusted ROA by quintile | Q1 highest; Q5 −0.039 (p = 0.013); 0 of 4 survive Bonferroni | **Rejected as a gradient** |
| **P1-H3d** | Performance peaks at the firm's own expected level | Gap quadratic; \|gap\|; atypicality placebo | b₂ = +0.007; \|gap\| p = 0.859; placebo p = 0.260 | **Not supported** |
| P1-S1 | The weakest dimension binds (floor) | Min, single regressor | p = 0.529 | **No floor** |
| P1-S2 | Dimensions are complements | 10 pairwise interactions | 6 positive, 0 significant | Separable |
| P1-S3 | Dimensions contribute unequally | Shapley, R² = 0.304 | 56.3% / 31.3% / 8.6% / 3.2% / 0.6% | **Supported — two dimensions** |
| P1-S4 | Some dimension is a prerequisite | 5th percentile, all vs high-ROA | all lifts ≈ 0 | **No prerequisite** |
| P1-X1 | Standardization pays less where differentiation is high | CI × high-R&D | β = −0.544, p = 0.107 | Right sign, inconclusive |
| P1-X2 | Higher adherence contains downside (side result of the Paper 2 variance battery) | Firm-level risk measures on CI, controls + industry FE; placebo; 2019→2020 shock | max drawdown β = +0.366, p = 0.018 (placebo clean); volatility β = −0.135, p = 0.065; recovery p = 0.914; shock test β = −0.245, p = 0.141 (opposite sign) | **Exploratory, mixed — fails the four-measure threshold (p < 0.0125)** |

### Paper 2 — EAGI

| ID | Hypothesis | Test | Result | Verdict |
|---|---|---|---|---|
| **P2-M** | A frequency index over EA-governance vocabulary reliably measures the construct **(primary — measurement)** | α, inter-item r, split-half, 8 constructions, proximity layer | α = −0.062; SB ≤ 0.008; proximity SB 0.318 | **Rejected** |
| P2-M1 | The failure is method-specific | Positive control, AI lexicon | AI α = 0.511 vs EA −0.062 | **Rejected — construct-specific** |
| P2-M2 | A better keyword list exists | Deterministic root ceiling | roots 100% but boilerplate; tightened α 0.220 | **Rejected — reliable or valid, never both** |
| **P2-H1** | More EA-governance language → better outcomes | Within-firm FE, 3 outcomes (p < 0.0167) | ROA 0.217 · Q 0.183 · SG&A 0.441 | **Null** (on a failed instrument) |
| P2-H1b | …between firms | Industry × year FE; Mundlak | between −0.056 (0.058); Mundlak between −0.071 (0.035) | Not interpretable — instrument fails |
| **P2-H2** | Core integrity pays more with higher governance capacity | CI × text index; CI × structural index | text 0.358 / 0.097 / 0.353; structural 0.967 / 0.389 | **Null on both** |
| **P2-H3** | Governance shows in outcome variance | Volatility, semi-deviation, drawdown, recovery; placebo; permutation | drawdown +0.097 (0.007), placebo clean; others fail | **One statistical survivor, uninterpretable** |
| P2-D1 | IT-control failure precedes weaker performance | IT-related material-weakness indicator (t−1); hand-check of all 21 flagged firm-years | pre-validation β = −0.0507, p = 0.001, ten treated firm-years; 4 of 8 resolvable flags mark an IT weakness of the flagged year | **Withdrawn — indicator failed validation** |
| P2-D2 | Governance vocabulary tracks practice | Regime break, 2023 mandate | compliance +0.089 (0.010); architecture −0.011 (0.097) | **Rejected — tracks the mandate** |
| P2-D3 | The cybersecurity-governance mandate changed outcomes | Staggered DiD, 103 vs 63 firms; timing map 3.7% → 98.9% | ROA 0.978; Q 0.276 | **Design valid, effect null** |
| P2-D4 | A board technology committee predicts performance | Extreme-coding bounds | [−0.015, +0.002]; ambiguous 42.9% | **Null at both extremes** |
| P2-D5 | A slower close signals weaker capability | Filing lag (t−1) → ROA | β = −0.00067, p = 0.187 | Not supported |
| P2-D6 | Customization volume is measurable from public data | XBRL capitalized software | coverage 13% → 18% | **Insufficient — limitation** |

### Paper 2 — AI: the framework's forward-looking component *(exploratory tier; not hypotheses)*

| ID | Statement | Result | Verdict |
|---|---|---|---|
| AI-1 | A stronger architectural baseline predicts later AI adoption (disclosed) | CI → AI β = +1.268, p = 0.008 (n = 783); placebo outcome p = 0.481; reverse p = 0.154; between-firm | **Passes falsification — re-test on new data, at dimension level and against a non-disclosure AI measure** |
| AI-2 | AI adoption pays more on a stronger baseline | AI × CI β = +0.191, p = 0.014; permutation p = 0.248; non-tech −0.491; corr(AI, CI) +0.512 | **Fails falsification — not a finding** |
| AI-3 | …via structural governance or the text index | baseline → AI: governance p = 0.747, EAGI p = 0.831; interactions p = 0.184, 0.767 | Null |

---

## Validation (archived in `04_protocol/validation/`)

Fixed effects match dummy-variable estimation to 7 × 10⁻¹⁵; clustered 95% coverage 96.0%;
Callaway–Sant'Anna unbiased (planted +0.0150 → +0.0151) but **anti-conservative under the null (9.6%
rejection)** — no reported result depends on it; the ITGC classifier behaves as specified on 11 of 11
constructed sentences, **including its permissive cases** — and the October 2026 hand-check found those
permissive cases in real filings (`itgc_handcheck.md`).

## Decisions carried forward

- **Primary specification for Paper 1:** the Mundlak / industry × year estimate. The spec-curve grid
  points (CI β = −3.1716; EAGI β = −0.9638) are distribution points, not primary results.
- **Restatement (Form 8-K Item 4.02):** one treated firm-year; suppressed, together with any
  correlation computed against it.
- **The text index is closed.** Five families exhausted; semantic scoring is the one open measurement
  question, constrained by the ceiling.
- **The ITGC association is withdrawn.** The flagged filings were read (October 2026); the indicator
  admits historical, hypothetical and non-IT language. Next, as a new pipeline version: classify the
  Item 9A conclusion and the auditor's opinion (including "did not maintain effective" and "has not
  maintained effective"), separate current, remediated and historical weaknesses, match cues as whole
  words, read 10-K/A filings, resolve the 13 open firm-years with
  `04_protocol/validation/print_itgc_contexts.py`, and re-estimate on the genuine events with a wild
  bootstrap for few treated clusters.
- **The AI association is the one forward-looking result carried forward.** Re-test on new data: by
  dimension (does data harmonization carry it?), within firms over a longer window, and against an AI
  measure not drawn from the same filings.
- **Paper 3 is folded into Paper 2** as an exploratory demonstration.
