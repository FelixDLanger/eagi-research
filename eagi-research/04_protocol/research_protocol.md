# Instrument Before Hypothesis — A Standing Protocol

*v5 (21 October 2026; v4 plus one rule from the hand-check of the attested-failure indicator). Derived from the CIAOF and EA-governance studies. Applies to every empirical project: past, present, future.*

---

## Step 0 — Inventory what you already hold

**Before designing any new collection, enumerate every field in the data already on disk.** In the
EAGI project the highest-value instruments — filing lag, restatement events, auditor-attested control
weaknesses, 4-digit industry codes, authoritative fiscal year ends, filer status — were all sitting
inside files downloaded months earlier and never opened. The scarce resource was not data access. It
was noticing.

Practical form: print the full field list of every cached artefact once, and read it.

## Step 1 — Prefer mandatory disclosure to voluntary disclosure

**Measure what regulation forces the subject to disclose, not what you wish they would.** Voluntary
narrative is sparse, strategically drafted, and absent exactly where it would be most informative.
Mandatory disclosure exists for every unit, every period, and parts of it are independently attested.

| | voluntary narrative | mandatory disclosure |
|---|---|---|
| coverage | only when management chooses | every unit, every period |
| verification | none | often auditor-attested |
| observed prevalence (EAGI) | 0.7% | several percent, with real variation |

Corollary that repeatedly proved useful: **failure is more observable than success**, because
regulation compels the reporting of failure. Where "does this unit have capability X" is invisible,
"did this unit suffer an audited failure of X" is often mandatory, dated, and machine-readable.

## Step 2 — Triage: which failed, the instrument or the question?

The two failure modes look identical from outside — a null — and demand opposite responses.

| Diagnostic | Threshold | Reading |
|---|---|---|
| Item prevalence | any item in <5% of units | that item adds variance, not signal |
| Cronbach alpha *(reflective only)* | < 0.5 | items share no latent factor |
| Mean inter-item correlation | < 0.15 | the composite averages idiosyncratic noise |
| Split-half / Spearman-Brown | < 0.5 | halves do not measure the same thing |
| Split-half IV first-stage F | < 10 | no common latent construct to instrument |
| sd of a k-item mean | below 1/sqrt(k) | items less correlated than independence implies |

**Reflective vs formative first.** A reflective construct's latent trait *causes* its indicators, so
they must correlate and alpha applies. A formative construct's indicators *constitute* it, so
correlation is neither required nor expected and **alpha is the wrong statistic**. CIAOF's 0.299 was a
non-problem (formative). EAGI's -0.062 was fatal (reflective).

- **Instrument failure** -> no question-sharpening helps. A gap, ratio or interaction built from noise
  is still noise. Change the measurement.
- **Question failure** -> the measure works; you are asking it the wrong thing. Go to Step 4.

## Step 3 — Bound the instrument deterministically before reaching for probabilistic methods

**Exhaustive within a family is not exhaustive across families** — and when the family is large it is
easy to mistake one for the other. Eight index builds and three units of analysis felt exhaustive;
every one of them still counted keywords.

Before adopting an expensive or non-reproducible method, ask whether a **deterministic bound** settles
the question:

> Any multi-word term containing a root can only appear in a subset of the documents containing that
> root. Root prevalence is therefore a strict upper bound on any phrase-based lexicon.

If the ceiling is low, "a better keyword list exists" is excluded **by construction**, and no semantic
reader can help either. Deterministic, reproducible, no API, no model drift — strictly better than an
LLM for that specific question. Reach for the probabilistic method only when the bound is high.

## Step 4 — Sharpen the question (only if the instrument holds)

Five axes. Each is a different question, not a robustness check.

1. **Level vs allocation.** Does the amount matter, or where it is applied? Test dispersion across
   dimensions, residualised on the level so it is not a repackaged level effect.
2. **Within vs between.** A sticky characteristic has almost no within-unit variation; entity fixed
   effects then discard the signal. Report the Mundlak decomposition.
3. **Mean vs variance.** Capabilities that act as insurance or optionality appear in dispersion,
   drawdown depth and recovery time. Test the moment the theory predicts.
4. **Absolute vs unit-relative.** If units face different feasible maxima, pooling flattens any curve
   that exists. Model expected level from unit characteristics and test the **gap**.
5. **Monotonic vs interior optimum.** Answer with **bins**, not a quadratic — a vertex is an algebraic
   artefact as often as an optimum — and state the observed range, since nothing licenses a claim
   beyond it.

## Step 5 — Falsification battery (mandatory before belief)

| Test | Question it answers |
|---|---|
| Placebo measure | does a meaningless measure produce the same result? |
| **Atypicality placebo** | for any residual or gap measure: a gap is large when observables predict poorly, and unusual units differ for unrelated reasons. Does a meaningless measure's gap also predict? |
| Positive control | does the same method work on a neighbouring construct in the same data? If yes, the null is construct-specific, not method-specific |
| Extreme-coding bounds | code every ambiguous case both ways; if the conclusion holds at both extremes, the ambiguity is irrelevant and no adjudication is needed |
| Size / verbosity correlation | is the measure a proxy for scale or document length? |
| Randomisation inference | is the estimate extreme against a permuted null? |
| Specification curve | with the **outcome standardised** so coefficients are comparable across dependent variables |

## Step 6 — Declare the hierarchy before estimating

Multiplicity is the largest threat to any programme running more than a handful of tests. Every result
is defensible alone; the *set* looks like a fishing expedition. The remedy is structure, not restraint.

- **Primary** — one test per paper, stated in advance. 5% threshold, no adjustment.
- **Secondary** — pre-specified, Bonferroni within family.
- **Exploratory** — report **effect sizes, not significance verdicts**.

**Survivors in the exploratory tier are re-tested on new data. They are never promoted within the
dataset that generated them.**

## Step 7 — Report what the design could have detected

State the minimum detectable effect at 80% power and the attenuation-corrected version
(beta_observed ~= reliability x beta_true). If the smallest detectable *true* effect is implausibly
large, the null was determined by the instrument before any data was collected. Say so.

---

## Design rules learned the hard way

**Gate designs on feasibility; never estimate on zero variation.** A design cell should report the
composition of its treatment and control groups and **refuse to run** when there is nothing to
compare, stating exactly what would make it estimable. Silent estimation on empty cells is worse than
no estimate.

**Validate the timing map before interpreting a DiD.** If a mandate is supposed to bind from period
*t*, check that the mandated disclosure actually appears then. A flat line means the map is wrong and
every coefficient built on it is meaningless.

**Match the estimator to the number of cohorts.** Two cohorts and a short post-period: a transparent
2x2 difference-in-differences is more interpretable than heterogeneity-robust machinery. Many cohorts
with heterogeneous effects: use Callaway-Sant'Anna, because two-way fixed effects lets already-treated
units act as controls.

**Watch the identification gradient.** If a result is strong in weak designs and absent in stronger
ones, that is the signature of confounding, not of effect.

**If a dependency does elementary work, owning the code beats owning the risk.** A package that
supplies a within transformation, a clustered sandwich or a kernel HAC is supplying sixty lines of
numpy. When it will not install, the disciplined move is to write those lines, not to patch the
installer - and the replication package gets stronger, because a reviewer in five years needs
nothing that can be abandoned or version-broken. Reserve external estimators for work that is
genuinely hard to reimplement correctly.

**Fix the cause, not the symptom - and stop after one failed attempt at an unverified hypothesis.**
Patching around an unproven diagnosis compounds: each patch adds a new failure mode while the real
cause stays untouched. If the second attempt does not work, the diagnosis is wrong.

**Never modify a proven artefact without a version bump.** Once a pipeline version has produced
results that are reported anywhere, that version is evidence. Any later change — however small, however
obviously an improvement — makes the file something other than what produced those numbers. Bump the
version in the same commit as the change, or do not make the change. A file whose version no longer
identifies its behaviour cannot support a replication claim, and the failure is silent: nothing
errors, the numbers simply stop tracing to the artefact that generated them.

**Pipelines self-heal; they never issue instructions.** If a cache is stale or a field is missing, the
code detects it and repairs it. Any step that asks a human to delete a file or re-run a cell is a
design defect, not documentation.

**A bound covers only what the rule calls ambiguous.** Extreme-coding bounds replace an assumption with
an interval for the cases a classifier labels ambiguous. They say nothing about cases it labels with
confidence. When the bounds coincide, ask why the ambiguous set is empty before taking comfort: a rule
that admits too much leaves nothing ambiguous. Validate confident classifications separately — read a
sample of the flagged documents — and keep a *specification test* (does the rule do what it says?)
distinct from an *accuracy test* (is what it says true?).

**Count the treated units, not only the share.** A treated share of 1.3% on 769 observations is ten
firm-years. Report the count and the number of clusters it comes from; with few treated clusters,
cluster-robust inference over-rejects, so add a wild bootstrap designed for few treated clusters
before believing a small p-value.

**An instrument added after a failure is exploratory by declaration.** If a measure was introduced
because the declared one failed, it was not in the hierarchy when the hierarchy was fixed. Say so,
place it in the exploratory tier, and re-test it on new data before it carries an argument.

**Validate your own code on synthetic data, and publish the validation.** Every estimator and
classifier ships with a script that runs the pipeline's own source, unmodified, against data with a
known answer — and the script's output is archived beside the results it supports. An estimator that
recovers a planted effect but over-rejects under the null is reported as exactly that.

**Classify the conclusion, not the vocabulary — and report the validation that overturns you.** In
the EAGI hand-check, half of the flagged filings that could be resolved did not disclose an IT control
failure of the flagged year: one was hypothetical risk-factor language about a system implementation, two repeated a
weakness remediated years earlier, one was a non-IT weakness sitting near an unrelated IT word.
Mandatory text is still text: risk factors discuss failures that have not happened, and remediated
failures stay in the risk factors for years. Extract the regulated conclusion (management's Item 9A
conclusion, the auditor's opinion) with all its standard phrasings, read amendments as well as
originals, and when the validation step overturns a result, publish the result, the validation and
the withdrawal together.

## Reproducibility floor

- Freeze the analysis panel; publish its hash.
- Deterministic classifiers are primary. LLM labels are **cached to disk and shipped as data**, never
  regenerated at runtime — model versions drift and deprecate. Pin dated model IDs, not aliases.
- Pin dependency versions in the replication package.
- Report construct provenance: every derived field's formula and every source's row contribution.

## Standing limits on interpretation

- Transparency and robustness are **not** identification. A perfectly calibrated instrument is still
  not an experiment. Rank honestly: RCT -> natural experiment -> panel FE -> cross-section.
- A residual measured against peer-typical behaviour shows conformity, not correctness. It cannot say
  what a unit *should* do.
- Claims are limited to the observed range.
- Correlation with a placebo, or with size, invalidates a unit-level result regardless of its p-value.

---

### The four-line version

> Inventory what you hold before collecting more.
> Prefer what regulation compels over what management volunteers.
> Diagnose the instrument before sharpening the question — the diagnostic is reliability.
> Test many things, believe few, and declare which is which before you look.
