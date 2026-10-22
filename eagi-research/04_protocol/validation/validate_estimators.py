"""
Estimator and classifier validation for EAGI_pipeline.ipynb (v13.0).

Every check executes the notebook's OWN source code, extracted from the .ipynb with the `ast`
module and never modified, on synthetic data whose true answer is known. Nothing here reads
the research panel, so it runs anywhere in about two minutes.

  1. fe_ols (cell 1 · SETUP) against least-squares dummy variables on an unbalanced panel
  2. fe_ols firm-clustered confidence-interval coverage under simulation (nominal 95%)
  3. hand-rolled Callaway–Sant'Anna (cell 8c): size under a simulated null, recovery of a planted effect
  4. negation-aware ITGC classifier (cell 5e): behaviour on constructed sentences, including the
     cases where the rule is known to be permissive

Usage:  python validate_estimators.py [path/to/EAGI_pipeline.ipynb] [--quick]
"""
import ast
import hashlib
import json
import os
import re
import sys
import tempfile
import textwrap
import types

import numpy as np
import pandas as pd

NB_PATH = next((a for a in sys.argv[1:] if a.endswith(".ipynb")),
               os.path.join(os.path.dirname(__file__), "..", "..", "02_pipeline", "EAGI_pipeline.ipynb"))
QUICK = "--quick" in sys.argv
nb = json.load(open(NB_PATH, encoding="utf-8"))
CELLS = ["".join(c["source"]) for c in nb["cells"]]


def cell_with(header):
    for s in CELLS:
        if header in s.splitlines()[0] if s.strip() else False:
            return s
    raise SystemExit(f"cell not found: {header}")


ver = re.search(r'NB_VERSION\s*=\s*"([^"]+)"', cell_with("0 · PARAMETERS")).group(1)
md5 = hashlib.md5(open(NB_PATH, "rb").read()).hexdigest()
print(f"notebook {os.path.basename(NB_PATH)} · {ver} · md5 {md5}")
print("=" * 78)

# ------------------------------------------------------------------ 1 + 2: fe_ols
setup = cell_with("1 · SETUP")
tree = ast.parse(setup)
wanted = {"FEResult", "_demean2", "fe_ols"}
defs = [ast.get_source_segment(setup, n) for n in tree.body
        if isinstance(n, (ast.FunctionDef, ast.ClassDef)) and n.name in wanted]
assert len(defs) == 3, "fe_ols block not found intact"
NS = {"np": np, "pd": pd, "types": types}
exec("\n\n".join(defs), NS)
fe_ols = NS["fe_ols"]


def panel(rng, n_firms=80, years=range(2019, 2026), drop=0.2, beta=(0.5, -0.3), rho=0.6):
    rows = []
    for f in range(n_firms):
        a = rng.normal(); ux = rng.normal(size=2); e_prev = rng.normal()
        for t in years:
            if rng.random() < drop: continue
            x1 = 0.7 * a + ux[0] + rng.normal()          # regressors correlated with the firm effect
            x2 = -0.4 * a + ux[1] + rng.normal()
            e_prev = rho * e_prev + rng.normal() * np.sqrt(1 - rho ** 2)   # serial correlation
            y = beta[0] * x1 + beta[1] * x2 + 2 * a + 0.3 * (t - 2019) + e_prev
            rows.append((f, t, x1, x2, y))
    return pd.DataFrame(rows, columns=["firm", "year", "x1", "x2", "y"]).set_index(["firm", "year"])


rng = np.random.default_rng(42)
P = panel(rng)
r = fe_ols("y", ["x1", "x2"], P)
D = P.reset_index()
X = pd.concat([D[["x1", "x2"]], pd.get_dummies(D["firm"], prefix="f", dtype=float),
               pd.get_dummies(D["year"], prefix="t", drop_first=True, dtype=float)], axis=1)
b_lsdv = np.linalg.lstsq(X.to_numpy(float), D["y"].to_numpy(float), rcond=None)[0][:2]
dmax = float(np.max(np.abs(r.params.to_numpy() - b_lsdv)))
print(f"[1] fe_ols vs LSDV (unbalanced, {len(P)} rows, {P.index.get_level_values(0).nunique()} firms): "
      f"max |Δβ| = {dmax:.2e}")

n_sim = 60 if QUICK else 200
hit = 0
for s in range(n_sim):
    Ps = panel(np.random.default_rng(1000 + s))
    rs_ = fe_ols("y", ["x1"], Ps)
    lo = rs_.params["x1"] - 1.96 * rs_.std_errors["x1"]; hi = rs_.params["x1"] + 1.96 * rs_.std_errors["x1"]
    hit += lo <= 0.5 <= hi
print(f"[2] firm-clustered 95% CI coverage, AR(1) errors ρ = 0.6: {hit}/{n_sim} = {hit / n_sim:.1%}")

# ------------------------------------------------------------------ 3: Callaway–Sant'Anna (cell 8c)
cs_src = cell_with("8c · CALLAWAY")


def cs_run(df_):
    tmp = tempfile.mkdtemp()
    ns = {"np": np, "pd": pd, "os": os, "json": json, "df": df_, "SEED": 42, "USE_EXTERNAL_CS": False,
          "OUT_DIR": tmp, "CACHE_DIR": tmp, "print": lambda *a, **k: None}
    ns["G"] = lambda k: ns.get(k)
    exec(cs_src, ns)
    return ns.get("CS_TBL")


def cs_panel(rng, effect=0.0, n_firms=220):
    rows = []
    cohorts = [2021, 2022, 2023, 2024]
    for f in range(n_firms):
        a = rng.normal(0, 0.05)
        g = cohorts[f % 4] if f % 2 == 0 else None            # half the firms adopt, staggered
        for t in range(2019, 2026):
            d = int(g is not None and t >= g)
            roa = 0.06 + a + 0.004 * (t - 2019) + effect * d + rng.normal(0, 0.02)
            rows.append(dict(cik=f, year=t, techcom=d, techcom_strict=d, roa=roa))
    return pd.DataFrame(rows)


n_cs = 12 if QUICK else 40
null_att, null_rej, pre_null, by_e = [], [], [], {}
for s in range(n_cs):
    T = cs_run(cs_panel(np.random.default_rng(5000 + s)))
    post = T[T.event_time >= 0]; pre = T[T.event_time < -1]
    null_att.append(float(post.att.mean())); pre_null.append(float(pre.att.mean()))
    null_rej.append(float((T.p.dropna() < 0.05).mean()))
    for _, row in T.dropna(subset=["p"]).iterrows():
        by_e.setdefault(int(row.event_time), []).append(float(row.p) < 0.05)
print(f"[3a] Callaway–Sant'Anna under the null ({n_cs} panels, 300-draw multiplier bootstrap each): "
      f"mean post ATT {np.mean(null_att):+.4f} [{np.min(null_att):+.4f}, {np.max(null_att):+.4f}] · "
      f"rejection at 5% = {np.mean(null_rej):.1%} of event-time cells")
print("     rejection by event time (nominal 5%): " +
      " · ".join(f"e={e:+d} {np.mean(v):.0%}" for e, v in sorted(by_e.items())))
planted = []
for s in range(n_cs):
    T = cs_run(cs_panel(np.random.default_rng(7000 + s), effect=0.015))
    planted.append((float(T[T.event_time >= 0].att.mean()), float(T[T.event_time < -1].att.mean())))
pa = np.array(planted)
print(f"[3b] planted effect +0.0150: mean post ATT {pa[:, 0].mean():+.4f} "
      f"[{pa[:, 0].min():+.4f}, {pa[:, 0].max():+.4f}] · mean pre ATT {pa[:, 1].mean():+.4f}")

# ------------------------------------------------------------------ 4: ITGC classifier (cell 5e)
mand = cell_with("5e · MANDATORY")
mt = ast.parse(mand)
assigns, loop = [], None
for n in ast.walk(mt):
    if isinstance(n, ast.Assign) and isinstance(n.targets[0], ast.Name) and \
            n.targets[0].id in {"IT_CUES", "MW", "NEG_PAT", "NEG_RIGHT", "AFF_PAT", "AFF_RIGHT", "NOTEFF"}:
        assigns.append(ast.get_source_segment(mand, n))
    if isinstance(n, ast.For) and isinstance(n.target, ast.Name) and n.target.id == "m":
        loop = n
assert loop is not None and len(assigns) == 7, "classifier block not found intact"
body = textwrap.dedent(ast.get_source_segment(mand, loop))
fn = ("def classify(t):\n    mw_any, mw_it, mw_it_aff, mw_it_amb = 0, 0, 0, 0\n"
      + textwrap.indent(body, "    ")
      + "\n    return dict(mw_any=mw_any, mw_it=mw_it, aff=mw_it_aff, amb=mw_it_amb)\n")
CNS = {"re": re}
exec("\n".join(assigns) + "\n" + fn, CNS)
classify = CNS["classify"]

pad = " the company files its annual report on form 10-k. " * 3
CASES = [   # (sentence, expected label, note)
    ("based on this assessment, no material weakness was identified in our information technology general controls.",
     "excluded", "negation on the left"),
    ("we identified a material weakness in internal control related to ineffective information technology "
     "general controls (itgcs) over user access.", "affirmed", "affirmation on the left"),
    ("management concluded that a material weakness existed in it general controls over program change.",
     "affirmed", "concluded that a ..."),
    ("material weaknesses were not identified in our logical access controls.", "excluded", "negation on the right"),
    ("we did not identify any material weakness in our erp system controls.", "excluded", "did not identify"),
    ("there were no material weaknesses relating to segregation of duties.", "excluded",
     "negation precedes an affirmation cue"),
    ("we identified a material weakness in revenue recognition." + pad, "not IT",
     "no IT cue within 600 characters"),
    ("during the year we remediated the previously reported material weakness relating to change management.",
     "affirmed", "BY DESIGN: remediation language counts as affirmed"),
    ("a material weakness in our information technology systems could adversely affect our results.",
     "affirmed", "PERMISSIVE: conditional risk-factor language counts as affirmed ('in' on the right)"),
    ("we identified a material weakness in the accounting for enterprise-wide leases." + pad, "affirmed",
     "PERMISSIVE: cue 'erp' matches inside 'enterprise'"),
    ("the absence of any material weakness in access control was confirmed.", "excluded", "absence of"),
]


def label(d):
    if not d["mw_it"]: return "not IT"
    if d["aff"]: return "affirmed"
    if d["amb"]: return "ambiguous"
    return "excluded"


ok = 0
print(f"[4] ITGC classifier (cell 5e) on {len(CASES)} constructed sentences:")
for sent, exp, note in CASES:
    got = label(classify(sent))
    ok += got == exp
    print(f"    {'✓' if got == exp else '✗'} expected {exp:9s} got {got:9s} · {note}")
print(f"    {ok}/{len(CASES)} behave as documented. Cases marked PERMISSIVE are reproduced on purpose:")
print("    they show what the v13.0 affirmed indicator can admit, and why its flagged firm-years should")
print("    be read by hand before the ITGC estimate is relied upon.")
print("=" * 78)
