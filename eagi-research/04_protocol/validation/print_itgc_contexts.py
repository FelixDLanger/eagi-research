"""
Print every passage that sets the IT-related material-weakness flag, so the flagged filings can be
read and classified by hand (EAGI working paper, Section 4.6 and Appendix C.23).

The rule below is copied verbatim from EAGI_pipeline.ipynb v13.0, cell "5e · MANDATORY-DISCLOSURE
INSTRUMENTS". When the notebook is found next to this repository, every pattern is checked against
the notebook source before anything runs, so the script cannot drift from the rule it explains.
It reads only the cached filings; it fetches nothing and modifies nothing.

Run (Colab, after mounting Drive):
    python print_itgc_contexts.py --cache "/content/drive/MyDrive/<...>/interim/eagi_cache" \
        --out itgc_contexts.md
Options:
    --signals PATH   mandatory_signals.csv to take the flagged firm-years from
                     (default: <cache>/mandatory_signals.csv)
    --all            print negated and ambiguous IT-related occurrences as well
    --window N       characters of context on each side (default 300)
"""
import argparse
import csv
import json
import os
import re
import sys

# ---- rule, verbatim from the notebook (v13.0) ----------------------------------------------------
IT_CUES = ["information technology", "it general control", "itgc", "user access", "access control",
           "change management", "segregation of duties", "logical access", "system access",
           "program change", "erp", "information system"]
MW = re.compile(r"material weakness")
NEG_PAT = re.compile(r"(no|not|never|without|nor)\s+(?:\w+\s+){0,4}$|did not identify\s*(?:\w+\s+){0,3}$|"
                     r"were not aware of\s*(?:\w+\s+){0,3}$|absence of\s*(?:\w+\s+){0,2}$|"
                     r"free (?:from|of)\s*(?:\w+\s+){0,3}$")
NEG_RIGHT = re.compile(r"^(?:es)?\s*(?:were|was|has|have)\s+not\s+(?:been\s+)?identified|"
                       r"^(?:es)?\s+(?:did not|do not|does not)")
AFF_PAT = re.compile(r"(identified|disclosed|reported|concluded that (?:a|the)|remediat\w+|"
                     r"following|previously reported|existence of|resulted in)\s*(?:\w+\s+){0,4}$")
AFF_RIGHT = re.compile(r"^(?:es)?\s+(?:in|relating to|related to|with respect to|described|"
                       r"associated with|that|existed|remains|was identified|were identified)\b")
YEAR_MIN, YEAR_MAX = 2019, 2025
# --------------------------------------------------------------------------------------------------


def check_against_notebook(nb_path=None):
    """Confirm the rule above is the notebook's: the notebook's own assignments are parsed and
    evaluated (nothing else in the notebook runs), and every pattern string must match exactly."""
    import ast
    here = os.path.dirname(os.path.abspath(__file__))
    nb_path = nb_path or os.path.normpath(os.path.join(here, "..", "..", "02_pipeline", "EAGI_pipeline.ipynb"))
    if not os.path.exists(nb_path):
        print(f"(notebook not found at {nb_path}; pattern check skipped)")
        return
    names = {"IT_CUES", "MW", "NEG_PAT", "NEG_RIGHT", "AFF_PAT", "AFF_RIGHT"}
    found = {}
    for cell in json.load(open(nb_path, encoding="utf-8"))["cells"]:
        if cell.get("cell_type") != "code":
            continue
        src = "".join(cell.get("source", []))
        if "AFF_RIGHT" not in src:
            continue
        for node in ast.walk(ast.parse(src)):
            if isinstance(node, ast.Assign) and len(node.targets) == 1 \
                    and isinstance(node.targets[0], ast.Name) and node.targets[0].id in names:
                found[node.targets[0].id] = eval(compile(ast.Expression(node.value), "<nb>", "eval"),
                                                 {"re": re})
    mine = {"IT_CUES": IT_CUES, "MW": MW, "NEG_PAT": NEG_PAT, "NEG_RIGHT": NEG_RIGHT,
            "AFF_PAT": AFF_PAT, "AFF_RIGHT": AFF_RIGHT}
    assert set(found) == names, f"rule not found in the notebook: missing {sorted(names - set(found))}"
    for k, v in mine.items():
        nb_v = found[k]
        same = (v == nb_v) if k == "IT_CUES" else (v.pattern == nb_v.pattern and v.flags == nb_v.flags)
        assert same, f"{k} differs from the notebook — do not use this script with this notebook version"
    print(f"rule verified against {os.path.basename(nb_path)}")


def tenk_accessions(cache, cik):
    """(fiscal year, accession) for every original 10-K, as the pipeline's filings_of() derives them."""
    p = os.path.join(cache, f"sub_{cik}.json")
    if not os.path.exists(p):
        return []
    rec = json.load(open(p))["filings"]["recent"]
    out = []
    for form_i, acc, fdate, rdate in zip(rec["form"], rec["accessionNumber"], rec["filingDate"],
                                         rec.get("reportDate", rec["filingDate"])):
        if form_i != "10-K":
            continue
        out.append((int((rdate or fdate)[:4]), acc.replace("-", "")))
    return out


def occurrences(t):
    """Every IT-related occurrence with its cues and its classification under the rule."""
    for m in MW.finditer(t):
        w = t[max(0, m.start() - 600): m.end() + 600]
        cues = [c for c in IT_CUES if c in w]
        if not cues:
            continue
        left = t[max(0, m.start() - 220): m.start()]
        right = t[m.end(): m.end() + 220]
        neg = bool(NEG_PAT.search(left)) or bool(NEG_RIGHT.search(right))
        aff = bool(AFF_PAT.search(left)) or bool(AFF_RIGHT.search(right))
        cls = "affirmed" if (aff and not neg) else ("ambiguous" if (not aff and not neg) else "negated")
        yield m.start(), m.end(), cues, cls


def cue_words(t, start, end, cues):
    """Show each cue with the word it sits in, so substring matches ('erp' in 'enterprise') are visible."""
    w0 = max(0, start - 600)
    w = t[w0: end + 600]
    shown = []
    for c in cues:
        i = w.find(c)
        a = i
        while a > 0 and w[a - 1].isalnum():
            a -= 1
        b = i + len(c)
        while b < len(w) and w[b].isalnum():
            b += 1
        shown.append(f"{c} → '{w[a:b]}'")
    return "; ".join(shown)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", required=True)
    ap.add_argument("--signals")
    ap.add_argument("--out", default="itgc_contexts.md")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--window", type=int, default=300)
    a = ap.parse_args()
    check_against_notebook()

    sig = a.signals or os.path.join(a.cache, "mandatory_signals.csv")
    flagged = []
    with open(sig, newline="") as fh:
        for row in csv.DictReader(fh):
            if str(row.get("mw_it_aff", "0")).strip() in ("1", "1.0", "True"):
                flagged.append((int(float(row["cik"])), int(float(row["year"]))))
    flagged.sort()
    print(f"{len(flagged)} flagged firm-years in {os.path.basename(sig)}")

    L = ["# Passages that set the IT-related material-weakness flag", "",
         f"Flagged firm-years: {len(flagged)}. Rule: EAGI_pipeline.ipynb v13.0, cell 5e.", "",
         "For each passage decide: weakness existing at the fiscal year-end · remediated during the "
         "year · remediated in an earlier year · hypothetical language · not IT-related.", ""]
    n_mismatch = 0
    for cik, fy in flagged:
        accs = [acc for y, acc in tenk_accessions(a.cache, cik) if y == fy and YEAR_MIN <= y <= YEAR_MAX]
        L.append(f"## CIK {cik} · fiscal year {fy}")
        if not accs:
            L += ["", "*No cached submissions entry for this firm-year.*", ""]
            continue
        any_aff = False
        for acc in accs:
            fp = os.path.join(a.cache, f"txt_{cik}_{acc}.txt")
            if not os.path.exists(fp):
                L += ["", f"*Accession {acc}: text not cached.*", ""]
                continue
            t = open(fp, encoding="utf-8", errors="ignore").read()
            L += ["", f"Accession {acc} · https://www.sec.gov/Archives/edgar/data/{cik}/{acc}/", ""]
            k = 0
            for s, e, cues, cls in occurrences(t):
                any_aff |= cls == "affirmed"
                if cls != "affirmed" and not a.all:
                    continue
                k += 1
                ctx = t[max(0, s - a.window): e + a.window].replace("\n", " ")
                L += [f"**{k}. {cls}** — cues: {cue_words(t, s, e, cues)}", "",
                      "> …" + ctx + "…", ""]
            if k == 0:
                L += ["*No affirmed IT-related occurrence in this document.*", ""]
        if not any_aff:
            n_mismatch += 1
            L += ["**Note: the rule does not reproduce this flag from the cached text.**", ""]
    with open(a.out, "w", encoding="utf-8") as fh:
        fh.write("\n".join(L))
    print(f"wrote {a.out}" + (f" · {n_mismatch} flag(s) not reproduced" if n_mismatch else " · every flag reproduced"))


if __name__ == "__main__":
    sys.exit(main())
