# Core Integrity & EA Governance — research repository

The analysis pipeline, the archived results and the assessment tool behind two working papers on
architectural discipline, enterprise-architecture governance and firm outcomes.

**Author:** Felix D. Langer · Independent Researcher · Doctoral Candidate (DBA), GlobalNxt University ·
ORCID 0009-0000-3205-8088
**Live tool:** https://felixdlanger.github.io/eagi-research/ (TRVA Navigator v0.8.1)
**Evidence base:** archived run of 2026-08-12 · notebook v13.0 · panel hash 736040245229 · seed 42 ·
950 firm-years · 167 large US filers · 2019–2025

## The papers

| | CIAOF | EAGI |
|---|---|---|
| Title | *Core Integrity as a Firm Characteristic: Allocation, Level, and the Limits of Public-Data Inference on Architectural Discipline* | *What Public Disclosure Cannot Measure: Enterprise-Architecture Governance, the Failure of a Voluntary-Text Instrument, and a Mandatory-Disclosure Alternative* |
| Question | Does adherence to core integrity pay, and where? | Can EA governance be measured from public disclosure? |
| Deliverable | CIAOF decision matrix | EAGI framework: the Governance Observability Ladder |
| Status | Working paper, SSRN — [abstract 7445559](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7445559), revised October 2026 | Working paper, SSRN, October 2026 |

## What the evidence supports, and what it does not

| Claim | Status |
|---|---|
| Adherence is a firm characteristic (94% between-firm variance) | Supported — variance decomposition |
| The composite is effectively two-dimensional (88% in two dimensions) | Supported — Shapley decomposition |
| No inverted-U; no floor, ceiling or prerequisite dimension | Supported as a rejection and as nulls |
| Adherence level predicts performance, in either direction | **Not supported** — p = 0.099; sign unstable across 36 specifications |
| EA governance is measurable from voluntary 10-K text | **Rejected** — α = −0.062; reliable or valid, never both |
| The failure reflects poor text analysis | **Rejected** — positive control on AI vocabulary, α = 0.511 |
| Governance vocabulary tracks practice | **Rejected** — it tracks the 2023 disclosure mandate |
| IT-related material-weakness disclosures precede lower ROA | **Withdrawn** — reading the flagged filings found that only 4 of 8 resolvable flags mark an IT weakness of the flagged year (`05_results/itgc_handcheck.md`) |
| A disciplined core predicts later AI-adoption disclosure | **Exploratory** — p = 0.008, placebo clean; governance measures do not predict it; between-firm; the AI × core-integrity payoff fails randomization inference |
| The matrix's quadrant logic | **Not validated** — predicted sign, p = 0.107 |

## Contents

| Path | What it is |
|---|---|
| `02_pipeline/EAGI_pipeline.ipynb` | The complete analysis pipeline, v13.0 (MD5 50d93513aae5d6e3d8d0ab5c591f491c). It produced every number in both papers and is not modified; any change ships as a new version. |
| `05_results/run_summary_archived.txt` | The full output of the archived run, published unedited. Every reported number is reconciled against it. |
| `05_results/findings_register.md` | Every hypothesis, its test, its result and its verdict, for both papers. |
| `05_results/itgc_handcheck.md` | The reading of the 21 filings flagged by the IT-related material-weakness indicator, with sources. |
| `04_protocol/research_protocol.md` | The standing research protocol (v5). |
| `04_protocol/validation/` | Validation of the pipeline's own estimators and classifier on synthetic data (script and archived output), and a script that prints, from the cached filings, every passage that set the material-weakness flag. |
| `06_figures/` | The two framework figures and the scripts that draw them. |
| `03_tool/` | Source of the TRVA Navigator, the assessment tool that applies the CIAOF matrix and states both papers' evidence base. |
| `03_tool/signals/` | The weekly refresh of the tool's outside-view screen: a standard-library script and the watchlist it reads. |
| `docs/` | The built tool, published to GitHub Pages. |
| `.github/workflows/site.yml` | Publishes the site on every change and, once switched on, refreshes the outside-view screen every Monday. |

## Reproducing the papers

1. Open `02_pipeline/EAGI_pipeline.ipynb` in Google Colab. The first cell installs anything missing; no
   estimator package is required.
2. Place the source panel on Drive, or adjust `DRIVE_ROOT` in the parameters cell.
3. Set an SEC contact identity as the Colab secret `SEC_EMAIL` or `SEC_CONTACT_EMAIL`, as SEC fair-access
   policy requires. It is read from the secret and cached only in your own Drive folder
   (`.eagi_ua.txt`, excluded by `.gitignore`).
4. Runtime → Run all. **Compare the printed panel hash with 736040245229 before comparing any
   coefficient**; if it differs, the panels differ.

Without any research data, `python 04_protocol/validation/validate_estimators.py` (`--quick` for a short
run) re-checks the two-way fixed-effects and Callaway–Sant'Anna estimators and the material-weakness
classifier against synthetic data with known answers; its archived output is
`04_protocol/validation/validation_output.txt`. With the filing cache from a run,
`python 04_protocol/validation/print_itgc_contexts.py --cache <eagi_cache folder>` prints every passage
that set the material-weakness flag. Both scripts use the notebook's own code rather than a copy: the
validation script executes it, and the printing script verifies its copy of the rule against it.

## Data

The repository contains no research data beyond the archived run output. **SimFin standardized
fundamentals** are licensed and not redistributable: obtain them directly; the pipeline resolves them by
column content. **Raw filing text** is public on SEC EDGAR, runs to several gigabytes and is cached by the
pipeline on its first run. **The frozen analysis panel** contains licensed fundamentals and is not
committed; its hash lets a replication confirm identical data. Sources: SEC EDGAR filings, SEC XBRL
company facts, SEC submissions metadata, SimFin standardized fundamentals. No proprietary, internal or
client data of any kind.

## The tool

The TRVA Navigator runs entirely in the browser: every decision, score, chart and narrative is computed by
deterministic rules, with no model call, key or data service, and nothing a user enters leaves the page.
Its evidence base is frozen to the archived run and the October 2026 validation. To rebuild the site after
editing the source (and bumping its version):

```bash
cd 03_tool
npm install        # react 19.2.8, react-dom 19.2.8, esbuild 0.28.2 — exact versions
npm run build      # writes ../docs/assets/app.js
```

## Publishing and the weekly refresh

`.github/workflows/site.yml` publishes `docs/` to GitHub Pages on every push that changes the site. It
also keeps the tool's **outside-view screen** (ladder rung 4) current: every Monday it reads SEC EDGAR filing
metadata for the 166 research-panel firms in `03_tool/signals/watchlist.csv` and flags a lengthening
close-to-filing interval, late-filing notices, amended annual reports and Form 8-K items 4.01, 4.02 and
1.05. The screen flags; it does not score. The papers' evidence base is frozen and does not change.

Setup, once:

1. Settings → Pages → Source: **GitHub Actions**. The workflow deploys the site itself, because commits
   pushed by a workflow with the `GITHUB_TOKEN` do not trigger a branch-based Pages build.
2. Settings → Secrets and variables → Actions: secret `SEC_USER_AGENT` = your name and a contact email
   (SEC fair-access policy); variable `SEC_REFRESH_ENABLED` = `true`.
3. Actions → *Publish site* → **Run workflow**. This produces the first refresh at once; from then on it
   runs every Monday and commits the refreshed `docs/data/signals.json`.

GitHub pauses scheduled workflows in public repositories after 60 days without repository activity. The
weekly commit normally keeps the schedule active; if GitHub ever reports that it paused it, re-enable the
workflow in the Actions tab.

## Licence and citation

Code and documentation: AGPL-3.0-or-later. A commercial licence for the code and the tool is available on
request through the author's ORCID record or an issue titled *Commercial licensing enquiry*; the papers
and their findings remain freely citable. Cite the working papers as listed in `CITATION.cff`.

## Disclosure

The author is employed by SAP. The research was conducted independently, and the views expressed are the
author's own. It uses exclusively public data and no proprietary information, internal tooling or client
data. The frameworks and the tool are vendor-agnostic by construction; *core integrity* is used throughout
in preference to any vendor's vocabulary.
