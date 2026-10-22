"""
Refresh the TRVA Navigator's outside-view screen (Governance Observability Ladder, rung 4).

Reads a watchlist, pulls each firm's SEC EDGAR submissions metadata, and writes a static JSON file
that the GitHub Pages site reads. Standard library only — no packages to install.

Definitions mirror the research pipeline (EAGI_pipeline.ipynb v13.0, cells 5e and 5f):
  filing lag      filingDate − reportDate of each 10-K, kept between 0 and 400 days
  late filing     any form beginning "NT 10-K"
  amendment       form "10-K/A"
  Form 8-K items  4.02 non-reliance on prior financials · 4.01 change of certifying accountant ·
                  1.05 material cybersecurity incident · 2.06 material impairment (counted, not flagged)

The screen flags; it does not score, and no flag is a forecast for an individual firm. The text-based
IT-control material-weakness indicator is deliberately NOT computed here: reading the filings it flagged
showed that it does not measure a control failure (EAGI working paper, Section 4.6).

Runs weekly in GitHub Actions (.github/workflows/site.yml) once the repository variable
SEC_REFRESH_ENABLED is "true" and the secret SEC_USER_AGENT is set.

Usage
  SEC_USER_AGENT="Your Name your@email" python refresh_signals.py \
      --watchlist watchlist.csv --out ../../docs/data/signals.json
  python refresh_signals.py --watchlist w.csv --out s.json --fixtures DIR --today 2026-10-21   (offline test)

SEC fair-access policy: identify yourself in the User-Agent and stay under 10 requests per second.
"""
import argparse
import csv
import datetime as dt
import json
import os
import statistics
import sys
import time
import urllib.request

SEC_SUB = "https://data.sec.gov/submissions/{name}"
SEC_TICKERS = "https://www.sec.gov/files/company_tickers.json"
PAUSE = 0.15                      # seconds between requests: under 10 per second
LAG_JUMP_DAYS = 10                # flag when the latest close is this much slower than the firm's own median


def fetch_json(url, ua, fixtures=None):
    if fixtures:                  # offline mode: the file name is the last path segment
        path = os.path.join(fixtures, url.rsplit("/", 1)[-1])
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept-Encoding": "identity"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read().decode("utf-8"))
            time.sleep(PAUSE)
            return data
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))


def filings(sub, start, ua, fixtures):
    """All filings on or after `start`, paging into older submission files only when needed."""
    blocks = [sub.get("filings", {}).get("recent", {})]
    for f in sub.get("filings", {}).get("files", []) or []:
        if str(f.get("filingTo", "")) >= start.isoformat():
            blocks.append(fetch_json(SEC_SUB.format(name=f["name"]), ua, fixtures))
    rows = []
    for b in blocks:
        forms = b.get("form", [])
        fdate = b.get("filingDate", [])
        rdate = b.get("reportDate", [""] * len(forms))
        items = b.get("items", [""] * len(forms))
        for f_, d_, r_, it in zip(forms, fdate, rdate, items):
            if d_ and d_ >= start.isoformat():
                rows.append({"form": f_, "filingDate": d_, "reportDate": r_ or "", "items": it or ""})
    return rows


def summarize(sub, rows):
    ann = []
    for r in rows:
        if r["form"] != "10-K" or not r["reportDate"]:
            continue
        lag = (dt.date.fromisoformat(r["filingDate"]) - dt.date.fromisoformat(r["reportDate"])).days
        if 0 <= lag <= 400:
            ann.append({"reportDate": r["reportDate"], "filingDate": r["filingDate"], "lag_days": lag})
    ann.sort(key=lambda a: a["reportDate"])
    latest = ann[-1]["lag_days"] if ann else None
    prior = [a["lag_days"] for a in ann[:-1]]
    med = int(statistics.median(prior)) if prior else None
    nt = sum(r["form"].startswith("NT 10-K") for r in rows)
    amd = sum(r["form"] == "10-K/A" for r in rows)
    codes = {"4.02": 0, "4.01": 0, "1.05": 0, "2.06": 0}
    for r in rows:
        if r["form"] != "8-K":
            continue
        its = [x.strip() for x in str(r["items"]).split(",") if x.strip()]
        for c in codes:
            codes[c] += any(i.startswith(c) for i in its)
    flags = []
    if nt: flags.append(f"late-filing notice ×{nt}")
    if amd: flags.append(f"annual report amended ×{amd}")
    if codes["4.02"]: flags.append(f"8-K 4.02 non-reliance ×{codes['4.02']}")
    if codes["4.01"]: flags.append(f"8-K 4.01 auditor change ×{codes['4.01']}")
    if codes["1.05"]: flags.append(f"8-K 1.05 cyber incident ×{codes['1.05']}")
    if latest is not None and med is not None and latest - med >= LAG_JUMP_DAYS:
        flags.append(f"close {latest - med} days slower than own median")
    return {
        "cik": str(sub.get("cik", "")).zfill(10),
        "name": sub.get("name", ""),
        "tickers": sub.get("tickers", []) or [],
        "sic": str(sub.get("sic", "") or ""),
        "sicDescription": sub.get("sicDescription", "") or "",
        "category": sub.get("category", "") or "",
        "fiscalYearEnd": sub.get("fiscalYearEnd", "") or "",
        "annual_reports": ann[-5:],
        "latest_lag_days": latest,
        "median_lag_days_prior": med,
        "nt_10k": nt,
        "amendments_10k": amd,
        "items_8k": codes,
        "flags": flags,
    }


def read_watchlist(path):
    with open(path, encoding="utf-8") as fh:
        rows = [r for r in csv.DictReader(fh) if any((v or "").strip() for v in r.values())]
    return [{"ticker": (r.get("ticker") or "").strip().upper(), "cik": (r.get("cik") or "").strip()} for r in rows]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("--watchlist", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--lookback-years", type=int, default=3)
    ap.add_argument("--fixtures", default=None, help="offline: directory of submissions JSON files")
    ap.add_argument("--today", default=None, help="fix the reference date (YYYY-MM-DD) for reproducible tests")
    a = ap.parse_args()

    ua = os.environ.get("SEC_USER_AGENT", "").strip()
    if not a.fixtures and "@" not in ua:
        sys.exit("SEC_USER_AGENT must name you and give a contact email (SEC fair-access policy).")
    today = dt.date.fromisoformat(a.today) if a.today else dt.datetime.now(dt.timezone.utc).date()
    start = today.replace(year=today.year - a.lookback_years)

    wl = read_watchlist(a.watchlist)
    if not wl:
        sys.exit("watchlist is empty — add ticker (and optionally cik) rows first.")
    need = [w for w in wl if not w["cik"]]
    if need:
        tick = fetch_json(SEC_TICKERS, ua, a.fixtures)
        by_t = {str(v["ticker"]).upper(): str(v["cik_str"]) for v in tick.values()}
        for w in need:
            w["cik"] = by_t.get(w["ticker"], "")

    firms, skipped = [], []
    for w in wl:
        if not w["cik"]:
            skipped.append({"ticker": w["ticker"], "reason": "ticker not found in SEC ticker file"})
            continue
        try:
            sub = fetch_json(SEC_SUB.format(name=f"CIK{int(w['cik']):010d}.json"), ua, a.fixtures)
            firms.append(summarize(sub, filings(sub, start, ua, a.fixtures)))
        except Exception as e:
            skipped.append({"ticker": w["ticker"], "cik": w["cik"], "reason": type(e).__name__})
    firms.sort(key=lambda f: f["name"])

    out = {
        "generated": (dt.datetime.combine(today, dt.time()) if a.today else dt.datetime.now(dt.timezone.utc)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "SEC EDGAR submissions API (data.sec.gov)",
        "lookback_years": a.lookback_years,
        "lookback_start": start.isoformat(),
        "definitions": "Mirror EAGI_pipeline v13.0 cells 5e–5f; see refresh_signals.py",
        "note": "Descriptive screen of compelled, mechanical disclosures (ladder rung 4). Flags are not "
                "scores and not forecasts; the IT-control material-weakness indicator is excluded because it failed validation.",
        "firms": firms,
        "skipped": skipped,
    }
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)
    print(f"wrote {a.out}: {len(firms)} firms, {len(skipped)} skipped, lookback from {start}")


if __name__ == "__main__":
    main()
