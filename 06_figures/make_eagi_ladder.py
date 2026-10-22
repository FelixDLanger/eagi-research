"""
EAGI framework — Governance Observability Ladder (framework figure).

Reproduces Figure 1 of the EAGI working paper. Every number on the figure is taken from the
archived run of 2026-08-12 (notebook v13.0, panel hash 736040245229, seed 42), except the hand-check
counts on rung 5 and in Panel B, which come from the reading of the flagged filings reported in
Appendix C.23 of the paper and in 05_results/itgc_handcheck.md.

Version 2 (21 October 2026): rung 5 and placement tests 4-5 updated after the hand-check; Panel C
(the forward-looking component: architecture before AI) added. Version 1 is in the repository history.

Run:  python make_eagi_ladder.py [output.png]
Requires only matplotlib. Layout is computed from measured text, so no label can overrun its card
and the figure height follows from the content rather than being guessed.
"""
import re
import sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle, FancyArrowPatch

plt.rcParams["font.family"] = "DejaVu Sans"   # pinned: identical output on Colab, Linux, macOS

# ---- house palette (shared with the CIAOF figure and the TRVA Navigator) ----
INK, PAPER, PAPER2 = "#261C15", "#f5f2eb", "#ede9df"
GOLD, TEAL, TEALL = "#c8a84b", "#1a6b72", "#2a9fa8"
RED, MUTED, LINE = "#c0392b", "#6b6457", "#c9c2b6"

W = 13.6                                  # figure width, inches; all coordinates are inches
fig = plt.figure(figsize=(W, 10), dpi=100)
ax = fig.add_axes([0, 0, 1, 1]); ax.axis("off")
R = fig.canvas.get_renderer()


def _w(s, fs, weight="normal", style="normal"):
    """Rendered width of a string in inches (independent of figure height)."""
    t = ax.text(0, 0, s, fontsize=fs, fontweight=weight, fontstyle=style)
    w = t.get_window_extent(renderer=R).width / fig.dpi
    t.remove()
    return w


def wrap(s, fs, width, weight="normal", style="normal"):
    """Greedy word wrap against measured width (inches), with a 3% safety margin."""
    out, cur = [], ""
    for word in re.split(r" +", s.strip()):         # break on ordinary spaces only; NBSP binds
        cand = (cur + " " + word).strip()
        if _w(cand, fs, weight, style) <= width * 0.97 or not cur:
            cur = cand
        else:
            out.append(cur); cur = word
    if cur: out.append(cur)
    for ln in out:                                  # a single unbreakable word must still fit
        assert _w(ln, fs, weight, style) <= width * 1.0, f"cannot fit: {ln!r}"
    return out


def step(fs, lh): return fs / 72 * lh


def block_h(s, fs, width, lh, **kw): return len(wrap(s, fs, width, **kw)) * step(fs, lh)


def text_block(x, y, s, fs, width, color=INK, weight="normal", style="normal", lh=1.32):
    """Draw wrapped text with its top-left at (x, y); return the y below the block."""
    lines = wrap(s, fs, width, weight, style)
    for i, ln in enumerate(lines):
        ax.text(x, y - i * step(fs, lh), ln, fontsize=fs, color=color, fontweight=weight,
                fontstyle=style, va="top", ha="left")
    return y - len(lines) * step(fs, lh)


def fits(s, fs, width, weight="normal", style="normal"):
    return _w(s, fs, weight, style) <= width


# ================================================================ content
TITLE = "EAGI — Governance Observability Ladder"
SUB = ("Measure what regulation compels, not what management volunteers — and read what an extraction "
       "rule flags before reading its coefficient.")
A_HEAD = "A.  The ladder — where governance becomes observable"
A_SUB = ("Five public disclosure sources, ordered by regulatory compulsion and attestation. "
         "Each rung reports what it carried across 950 firm-years.")
B_HEAD = "B.  Placement tests — how a source earns its rung"
B_SUB = "Applied before any outcome is read. Each test carries its evidence."
C_HEAD = "C.  Architecture before AI — the forward-looking component (exploratory)"
C_SUB = ("The one interpretable association in the study that survived its falsification tests. It is between-firm, "
         "both measures are read from disclosure, and it was tested on the composite: re-test on new data.")

RUNGS = [   # top to bottom
    dict(n="5", accent=TEAL, tag="COMPELLED  ·  AUDITOR-ATTESTED", head="Attested control failure",
         body="IT-related material weakness (SOX 404; Form 10-K Item 9A). A keyword indicator first "
              "returned lower next-year ROA. Read against the filings, only 4 of the 8 resolvable flags "
              "disclosed an IT weakness of the flagged year (2 existing at year-end); the rest were "
              "historical, hypothetical or non-IT language.",
         verdict="OBSERVABLE TO A READER  —  KEYWORD ASSOCIATION WITHDRAWN"),
    dict(n="4", accent=MUTED, tag="COMPELLED  ·  MECHANICAL", head="Filing metadata",
         body="Close-to-filing lag (median 47 days), late-filing notices, amendments: every firm, every "
              "year, no wording to interpret. Lag is not associated with next-year ROA (p = 0.187).",
         verdict="UNIVERSAL COVERAGE  —  NO SIGNAL IN THIS PANEL"),
    dict(n="3", accent=GOLD, tag="COMPELLED TOPIC  ·  DISCRETIONARY WORDING", head="Mandated narrative",
         body="Cybersecurity governance (Reg. S-K Item 106): in 3.7% of filings before the mandate, 98.9% "
              "after; outcome effects null. Compliance vocabulary jumps at the mandate (p = 0.010); "
              "architecture vocabulary does not.",
         verdict="TRACKS THE MANDATE, NOT THE PRACTICE"),
    dict(n="2", accent=TEALL, tag="COMPELLED FORM  ·  DISCRETIONARY SUBSTANCE", head="Structural disclosure",
         body="Board technology committee; named CIO, CTO, CDO or chief architect (proxy statements). "
              "Thin (mean 0.34, SD 0.57); coding bounds are null at both extremes.",
         verdict="OBSERVABLE, TOO THIN TO TEST"),
    dict(n="1", accent=RED, tag="VOLUNTARY  ·  DISCRETIONARY WORDING", head="Voluntary narrative",
         body="Twenty-term EA lexicon: α = −0.062; 15 of the 20 terms were used by at most one firm in "
              "seven years. Roots reach α = 0.580 only through accounting boilerplate; proximity phrases "
              "fall to α = 0.220.",
         verdict="RELIABLE OR VALID  —  NEVER BOTH"),
]
RULES = [
    dict(n="1", col=MUTED, rule="Test reliability before any hypothesis",
         why="A null from an unreliable index is decided by the instrument. EA lexicon dispersion "
             "(0.137) sits below the 1/√20 = 0.224 independence benchmark.",
         warrant="Reliability battery · the primary, measurement claim"),
    dict(n="2", col=TEAL, rule="Run a positive control",
         why="Same filings, same pipeline, neighbouring construct: AI lexicon α = 0.511 against −0.062. "
             "The failure is construct-specific, not method-specific.",
         warrant="Positive control · descriptive contrast"),
    dict(n="3", col=GOLD, rule="Bound deterministically before modelling",
         why="Root prevalence caps any phrase lexicon. The roots reach every filing, in senses such as "
             "consolidated statements, the COSO Integrated Framework, corporate governance.",
         warrant="Lexicon ceiling · deterministic, no model"),
    dict(n="4", col=TEALL, rule="Bound ambiguity; read what the rule calls certain",
         why="Code every ambiguous case both ways: technology-committee bounds are null at both "
             "extremes. A bound covers only the ambiguous residue — the ITGC bounds coincided, yet half "
             "of the readable flags marked no IT weakness of the flagged year.",
         warrant="Extreme-coding bounds · hand-check of the flagged filings"),
    dict(n="5", col=RED, rule="Prefer what regulation compels and auditors attest — then validate the extraction",
         why="Failure is reported because regulation compels it, and a reader can see it. A keyword rule "
             "could not tell a reported weakness from a hypothetical one.",
         warrant="Mandatory-disclosure instruments · hand-check, October 2026"),
]
FOOT = ("A source that passes all five tests can carry a measure; it does not thereby carry a cause. "
        "No result on this figure is causal.")
NOTES_A = ["Ordering criteria: is disclosure compelled; is its wording discretionary or mechanical; "
           "is it independently attested.",
           "The ladder ranks disclosure sources, not firms. Rung 3 also carries the staggered-mandate design: "
           "timing map validated, outcome null."]
TILES = [
    dict(accent=TEAL, tag="PREDICTS  ·  PASSES ITS FALSIFICATION TESTS",
         head="Disciplined core → later AI adoption",
         body="Core integrity — a standard core, harmonized data, governed APIs, modular extensions, "
              "automated operations — predicts AI-adoption disclosure the following year: β = +1.27, "
              "p = 0.008, n = 783. Placebo outcome p = 0.481; the AI index is not a size or length proxy.",
         verdict="CARRY FORWARD  —  RE-TEST ON NEW DATA"),
    dict(accent=MUTED, tag="NO ASSOCIATION",
         head="Governance → later AI adoption",
         body="Neither the structural governance index (p = 0.747) nor the EA-governance text index "
              "(p = 0.831) predicts AI adoption: governance disclosure does not predict later AI adoption.",
         verdict="NOTHING TO CARRY FORWARD"),
    dict(accent=RED, tag="FAILS FALSIFICATION",
         head="Does AI pay more on a disciplined core?",
         body="AI × core integrity → ROA is nominally significant (p = 0.014), but permutation p = 0.248, "
              "the sign reverses outside technology firms, and the two regressors correlate at r = +0.512.",
         verdict="NOT A FINDING  —  THE PAYOFF IS NOT SHOWN"),
]
C_FOOT = ("Limits stated with the result: about 94% of core-integrity variance lies between firms, so this "
          "says disciplined firms disclose more AI later, not that becoming disciplined leads to AI; whether "
          "harmonized data carries the association is untested.")

# keep statistics on one line: "p = 0.248", "α = 0.511", "n = 769" never split across a line break
_NB = lambda t: re.sub(r"\b(p|α|β|n|r|F|SD) = ", lambda m: m.group(1) + " = ", t)
for _r in RUNGS: _r["body"] = _NB(_r["body"])
for _r in RULES: _r["why"] = _NB(_r["why"])
for _r in TILES: _r["body"] = _NB(_r["body"])
FOOT = _NB(FOOT); C_FOOT = _NB(C_FOOT)

# ================================================================ geometry (measured, top-down)
AX0, AX1 = 0.25, 7.55          # panel A
CX = 1.05; CW = AX1 - CX       # rung cards (room on the left for the axis)
RTX = 0.62; RTW = CW - RTX - 0.20
BX0, BX1 = 8.05, W - 0.25      # panel B
RW = BX1 - BX0; BTX = 0.58; BTW = RW - BTX - 0.14
FS_BODY, LH_BODY = 8.3, 1.30
FS_WHY, LH_WHY = 8.1, 1.28
FS_TAG = 7.4

# every single-line label must fit its card: verdicts, tags, heads, warrants
for r in RUNGS:
    assert fits(r["verdict"], FS_TAG, RTW, "bold"), f"rung {r['n']} verdict too long"
    assert fits("RUNG " + r["n"] + "  ·  " + r["tag"], FS_TAG, RTW, "bold"), f"rung {r['n']} tag too long"
    assert fits(r["head"], 11.8, RTW, "bold"), f"rung {r['n']} head too long"
for r in RULES:
    assert fits(r["warrant"], 7.1, BTW, style="italic"), f"rule {r['n']} warrant too long"

# rung card: tag row + head row + body + verdict row, with fixed paddings
R_PAD_TOP, R_HEAD_GAP, R_BODY_TOP, R_VERDICT = 0.14, 0.19, 0.60, 0.34
rung_need = [R_BODY_TOP + block_h(r["body"], FS_BODY, RTW, LH_BODY) + R_VERDICT for r in RUNGS]
GAPS = [0.36, 0.12, 0.12, 0.36]                   # wide gaps carry the attestation / compulsion lines
# rule card: head (may wrap) + body + warrant
rule_need = [0.13 + block_h(r["rule"], 10.6, BTW, 1.18, weight="bold") + 0.07
             + block_h(r["why"], FS_WHY, BTW, LH_WHY) + 0.34 for r in RULES]
RGAP = 0.13

TOP_HEADER = 2.15                                  # title, subtitle, panel heads
ladder_h = sum(rung_need) + sum(GAPS)
rules_h = sum(rule_need) + RGAP * (len(RULES) - 1)
foot_h = 0.12 + block_h(FOOT, 7.6, RW, 1.30, style="italic")
notes_h = 0.20 + sum(block_h(n, 7.6, AX1 - CX, 1.28, style="italic") + 0.06 for n in NOTES_A)
body_h = max(ladder_h + notes_h, rules_h + foot_h)
# distribute any slack evenly so both columns end level
slack_a = body_h - (ladder_h + notes_h)
slack_b = body_h - (rules_h + foot_h)
rung_h = [h + slack_a / len(RUNGS) for h in rung_need]
rule_h = [h + slack_b / len(RULES) for h in rule_need]

# panel C: header, three tiles side by side, footnote
CX0, CX1 = 0.25, W - 0.25
TGAP = 0.18
TW = (CX1 - CX0 - 2 * TGAP) / 3
TTX = 0.30; TTW = TW - TTX - 0.18                 # text inset inside a tile
for t in TILES:
    assert fits(t["tag"], FS_TAG, TTW, "bold"), f"tile tag too long: {t['tag']}"
    assert fits(t["verdict"], FS_TAG, TTW, "bold"), f"tile verdict too long: {t['verdict']}"
T_PAD_TOP, T_HEAD_GAP = 0.15, 0.20
tile_need = [T_PAD_TOP + T_HEAD_GAP + block_h(t["head"], 11.0, TTW, 1.18, weight="bold") + 0.10
             + block_h(t["body"], FS_BODY, TTW, LH_BODY) + 0.36 for t in TILES]
tile_h = max(tile_need)
C_GAP = 0.40                                       # space between the two-column body and panel C
c_head_h = 0.36 + block_h(C_SUB, 8.6, CX1 - CX0, 1.25, style="italic") + 0.16
c_foot_h = 0.12 + block_h(C_FOOT, 7.6, CX1 - CX0, 1.30, style="italic")
c_h = c_head_h + tile_h + c_foot_h

H = TOP_HEADER + body_h + C_GAP + c_h + 0.30
fig.set_size_inches(W, H)
ax.set_xlim(0, W); ax.set_ylim(0, H)

# ================================================================ draw: header
ax.text(0.25, H - 0.30, TITLE, fontsize=17, fontweight="bold", color=INK, va="top")
text_block(0.25, H - 0.74, SUB, 9.6, W - 0.5, color=MUTED, style="italic", lh=1.25)
ax.text(AX0, H - 1.22, A_HEAD, fontsize=13.5, fontweight="bold", color=INK, va="top")
text_block(AX0, H - 1.62, A_SUB, 8.6, AX1 - AX0, color=MUTED, style="italic", lh=1.25)
ax.text(BX0, H - 1.22, B_HEAD, fontsize=13.5, fontweight="bold", color=INK, va="top")
text_block(BX0, H - 1.62, B_SUB, 8.6, RW, color=MUTED, style="italic", lh=1.25)
assert fits(TITLE, 17, W - 0.5, "bold") and fits(A_HEAD, 13.5, BX0 - AX0 - 0.3, "bold") \
    and fits(B_HEAD, 13.5, W - 0.1 - BX0, "bold") and fits(C_HEAD, 13.5, CX1 - CX0, "bold"), \
    "a heading is too long"
assert len(wrap(SUB, 9.6, W - 0.5, style="italic")) == 1, "subtitle must stay on one line"
assert len(wrap(A_SUB, 8.6, AX1 - AX0, style="italic")) <= 2 and len(wrap(B_SUB, 8.6, RW, style="italic")) <= 2

# ================================================================ draw: panel A
LADDER_TOP = H - TOP_HEADER
rung_y = {}
y = LADDER_TOP
for i, r in enumerate(RUNGS):
    h = rung_h[i]; y0 = y - h
    rung_y[r["n"]] = (y0, y)
    ax.add_patch(FancyBboxPatch((CX, y0), CW, h, boxstyle="round,pad=0,rounding_size=0.10",
                                fc=PAPER2, ec=r["accent"], lw=1.6, zorder=1))
    ax.add_patch(Rectangle((CX, y0), 0.085, h, fc=r["accent"], ec="none", zorder=2))
    ax.text(CX + 0.22, y - 0.13, r["n"], fontsize=20, fontweight="bold", color=r["accent"], va="top")
    tx = CX + RTX
    ax.text(tx, y - R_PAD_TOP, "RUNG " + r["n"] + "  ·  " + r["tag"], fontsize=FS_TAG, fontweight="bold",
            color=r["accent"], va="top")
    ax.text(tx, y - R_PAD_TOP - R_HEAD_GAP, r["head"], fontsize=11.8, fontweight="bold", color=INK, va="top")
    yb = text_block(tx, y - R_BODY_TOP, r["body"], FS_BODY, RTW, lh=LH_BODY)
    ax.text(tx, y0 + 0.11, r["verdict"], fontsize=FS_TAG, fontweight="bold", color=r["accent"], va="bottom")
    assert yb > y0 + 0.24, f"rung {r['n']} body overruns its verdict line"
    y = y0 - (GAPS[i] if i < len(GAPS) else 0)
LADDER_BOT = rung_y["1"][0]

ax.add_patch(FancyArrowPatch((0.62, LADDER_BOT), (0.62, LADDER_TOP + 0.05), arrowstyle="-|>",
                             mutation_scale=14, lw=1.8, color=INK))
ax.text(0.36, (LADDER_TOP + LADDER_BOT) / 2, "OBSERVABILITY", rotation=90, fontsize=10.5,
        fontweight="bold", color=INK, va="center", ha="center")

for lower, upper, col, lab in [
        ("1", "2", RED, "compulsion line — below it, firms choose whether to say anything at all"),
        ("4", "5", TEAL, "attestation line — above it, an independent auditor signs the disclosure")]:
    g0, g1 = rung_y[lower][1], rung_y[upper][0]
    yy = g0 + 0.10
    ax.plot([CX - 0.25, AX1], [yy, yy], ls=(0, (5, 3)), lw=1.3, color=col, zorder=3)
    ax.text(AX1, yy + 0.04, lab, fontsize=7.2, fontstyle="italic", color=col, ha="right", va="bottom", zorder=4)
    assert fits(lab, 7.2, AX1 - CX, style="italic"), "boundary label too long"
    assert yy + 0.04 + 7.2 / 72 * 1.2 < g1, "boundary label touches the card above"

yn = LADDER_BOT - 0.20
for note in NOTES_A:
    yn = text_block(CX, yn, note, 7.6, AX1 - CX, color=MUTED, style="italic", lh=1.28) - 0.06

# ================================================================ draw: panel B
y = LADDER_TOP
for i, r in enumerate(RULES):
    h = rule_h[i]; y0 = y - h
    ax.add_patch(FancyBboxPatch((BX0, y0), RW, h, boxstyle="round,pad=0,rounding_size=0.08",
                                fc=PAPER, ec=LINE, lw=1.2, zorder=1))
    ax.add_patch(Rectangle((BX0, y0), 0.07, h, fc=r["col"], ec="none", zorder=2))
    ax.text(BX0 + 0.20, y - 0.12, r["n"], fontsize=17, fontweight="bold", color=r["col"], va="top")
    tx = BX0 + BTX
    hy = text_block(tx, y - 0.13, r["rule"], 10.6, BTW, weight="bold", lh=1.18)
    yb = text_block(tx, hy - 0.07, r["why"], FS_WHY, BTW, lh=LH_WHY)
    ax.text(tx, y0 + 0.09, r["warrant"], fontsize=7.1, fontstyle="italic", color=MUTED, va="bottom")
    assert yb > y0 + 0.22, f"rule {r['n']} overruns its warrant line"
    y = y0 - RGAP
yf = text_block(BX0, y + RGAP - 0.12, FOOT, 7.6, RW, color=MUTED, style="italic", lh=1.30)
BODY_BOT = H - TOP_HEADER - body_h
assert yf >= BODY_BOT - 1e-6 and yn >= BODY_BOT - 0.07, "panel A or B runs into panel C"

# ================================================================ draw: panel C
C_TOP = BODY_BOT - C_GAP
ax.plot([CX0, CX1], [C_TOP + C_GAP / 2, C_TOP + C_GAP / 2], lw=0.8, color=LINE)
ax.text(CX0, C_TOP, C_HEAD, fontsize=13.5, fontweight="bold", color=INK, va="top")
text_block(CX0, C_TOP - 0.36, C_SUB, 8.6, CX1 - CX0, color=MUTED, style="italic", lh=1.25)
T_TOP = C_TOP - c_head_h
for i, t in enumerate(TILES):
    x0 = CX0 + i * (TW + TGAP); y1 = T_TOP; y0 = T_TOP - tile_h
    ax.add_patch(FancyBboxPatch((x0, y0), TW, tile_h, boxstyle="round,pad=0,rounding_size=0.10",
                                fc=PAPER2, ec=t["accent"], lw=1.6, zorder=1))
    ax.add_patch(Rectangle((x0, y0), 0.085, tile_h, fc=t["accent"], ec="none", zorder=2))
    tx = x0 + TTX
    ax.text(tx, y1 - T_PAD_TOP, t["tag"], fontsize=FS_TAG, fontweight="bold", color=t["accent"], va="top")
    hy = text_block(tx, y1 - T_PAD_TOP - T_HEAD_GAP, t["head"], 11.0, TTW, weight="bold", lh=1.18)
    yb = text_block(tx, hy - 0.10, t["body"], FS_BODY, TTW, lh=LH_BODY)
    ax.text(tx, y0 + 0.11, t["verdict"], fontsize=FS_TAG, fontweight="bold", color=t["accent"], va="bottom")
    assert yb > y0 + 0.24, f"tile {i + 1} body overruns its verdict line"
# arrows between the tiles' heads would imply causation; the tiles stand side by side on purpose
yc = text_block(CX0, T_TOP - tile_h - 0.12, C_FOOT, 7.6, CX1 - CX0, color=MUTED, style="italic", lh=1.30)
assert yc > 0.05, "panel C footnote runs off the figure"

out = sys.argv[1] if len(sys.argv) > 1 else "eagi_ladder.png"
fig.savefig(out, dpi=300, facecolor="white", bbox_inches="tight", pad_inches=0.12)
print(f"wrote {out}  ({W:.1f} x {H:.2f} in)")
