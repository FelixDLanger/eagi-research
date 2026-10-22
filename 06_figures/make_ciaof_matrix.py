"""
CIAOF — Core Integrity Adherence-Outcome Framework (framework figure).

Reproduces Figure 1 of the CIAOF working paper, revised version (October 2026). Every number on the
figure is taken from the archived run of 2026-08-12 (notebook v13.0, panel hash 736040245229, seed 42).

Revision notes (October 2026), against the figure of the September 2026 version:
  - redrawn with measured text wrapping, so no label can run past its card or box (three overruns
    in the earlier figure: the override line, one quadrant heading, one quadrant body line);
  - rule 4 no longer quotes an association from the companion study: that association did not
    survive validation and was withdrawn (EAGI working paper, Section 4.6);
  - rule 3 reads "assessment" rather than "score", as in the paper's Section 7.3.

Run:  python make_ciaof_matrix.py [output.png]
Requires only matplotlib.
"""
import re
import sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle, FancyArrowPatch

plt.rcParams["font.family"] = "DejaVu Sans"   # pinned: identical output on Colab, Linux, macOS

# ---- house palette (shared with the EAGI figure and the TRVA Navigator) ----
INK, PAPER, PAPER2 = "#261C15", "#f5f2eb", "#ede9df"
GOLD, TEAL, TEALL = "#c8a84b", "#1a6b72", "#2a9fa8"
RED, MUTED, LINE = "#c0392b", "#6b6457", "#c9c2b6"

W = 13.6
fig = plt.figure(figsize=(W, 9), dpi=100)
ax = fig.add_axes([0, 0, 1, 1]); ax.axis("off")
R = fig.canvas.get_renderer()


def _w(s, fs, weight="normal", style="normal"):
    t = ax.text(0, 0, s, fontsize=fs, fontweight=weight, fontstyle=style)
    w = t.get_window_extent(renderer=R).width / fig.dpi
    t.remove()
    return w


def fits(s, fs, width, weight="normal", style="normal"):
    return _w(s, fs, weight, style) <= width


def wrap(s, fs, width, weight="normal", style="normal"):
    """Greedy word wrap against measured width (inches), with a 3% safety margin."""
    out, cur = [], ""
    for word in re.split(r" +", s.strip()):         # NBSP binds
        cand = (cur + " " + word).strip()
        if _w(cand, fs, weight, style) <= width * 0.97 or not cur:
            cur = cand
        else:
            out.append(cur); cur = word
    if cur: out.append(cur)
    for ln in out:
        assert _w(ln, fs, weight, style) <= width, f"cannot fit: {ln!r}"
    return out


def step(fs, lh): return fs / 72 * lh


def block_h(s, fs, width, lh, **kw): return len(wrap(s, fs, width, **kw)) * step(fs, lh)


def text_block(x, y, s, fs, width, color=INK, weight="normal", style="normal", lh=1.30, ha="left"):
    lines = wrap(s, fs, width, weight, style)
    for i, ln in enumerate(lines):
        xx = x if ha == "left" else x + width / 2
        ax.text(xx, y - i * step(fs, lh), ln, fontsize=fs, color=color, fontweight=weight,
                fontstyle=style, va="top", ha=ha)
    return y - len(lines) * step(fs, lh)


_NB = lambda t: re.sub(r"\b(p|α|β|n|r|SD) = ", lambda m: m.group(1) + " = ", t)

# ================================================================ content
TITLE = "CIAOF — Core Integrity Adherence–Outcome Framework"
SUB = ("A decision aid warranted by the absence of an identifiable universal rule, not by evidence that "
       "any rule works.")
A_HEAD = "A.  The CIAOF decision matrix"
A_SUB = "Classify every business capability on two axes. The treatment follows."
B_HEAD = "B.  Operating frame — what the evidence adds"
B_SUB = "Five rules derived from the empirical results. Each carries its warrant."
OVERRIDE = ("Regulatory or audit obligation → standard plus a certified, maintained add-on, regardless "
            "of quadrant.")
QUADS = {   # (row, col): row 0 = high impact, col 1 = high standard-fit
    (0, 0): dict(accent=GOLD, tag="DIFFERENTIATING  ·  LOW STANDARD-FIT", head="Extend beside the core",
                 body="Tailored logic, bespoke process, custom code — on the platform, never in the core. "
                      "This is where build effort earns a return."),
    (0, 1): dict(accent=TEAL, tag="DIFFERENTIATING  ·  HIGH STANDARD-FIT",
                 head="Adopt standard; extend at the edge",
                 body="Impact is captured through adoption speed. Rebuilding what the standard already "
                      "delivers converts advantage into maintenance."),
    (1, 0): dict(accent=TEALL, tag="SUPPORTING  ·  LOW STANDARD-FIT", head="Simplify, then standardise",
                 body="Change the process before changing the software. A coverage gap in a supporting "
                      "function rarely justifies build cost."),
    (1, 1): dict(accent=MUTED, tag="SUPPORTING  ·  HIGH STANDARD-FIT", head="Standard — zero deviation",
                 body="Deviation requests denied by default; total cost of ownership dominates."),
}
AXIS_NOTE = ("how completely the standard product covers the capability AS DELIVERED — not how "
             "standardised the process currently is")
RULES = [
    dict(n="1", col=TEAL, rule="Assess data harmonisation and API integration first",
         why="88% of explained variance sits in two of five dimensions. That is where an assessment "
             "discriminates between firms.",
         warrant="Shapley decomposition · descriptive"),
    dict(n="2", col=MUTED, rule="Impose no uniform minimum across dimensions",
         why="No floor effect (p = 0.53) and no dimension acts as a necessary condition. A common bar "
             "has no warrant.",
         warrant="Weakest-link and necessity tests · null"),
    dict(n="3", col=TEAL, rule="Treat the assessment as a position, not a dial",
         why="94% of variance is between firms; within-firm SD is 0.019. Revisit on transformation "
             "cycles, not reporting cycles.",
         warrant="Variance decomposition · descriptive"),
    dict(n="4", col=RED, rule="Anchor the business case on downside, not upside",
         why="No upside association survives. The companion study's attempt to price IT-control failure "
             "from public data did not survive validation, so the downside case is argued, not measured.",
         warrant="No validated estimate · EAGI working paper, 2026"),
    dict(n="5", col=GOLD, rule="Record every judgement",
         why="Axis assessments, regulatory flag, treatment, accountable owner, review trigger. The "
             "substitute for a threshold.",
         warrant="Follows from the absence of any identifiable rule"),
]
FOOT = ("The matrix organises a judgement; it does not replace one. Its own testable implication — that "
        "standardisation pays less where differentiation intensity is higher — carries the predicted sign "
        "but does not reach significance (β = −0.544, p = 0.107). No claim is made that following the "
        "matrix improves performance.")
for r in RULES: r["why"] = _NB(r["why"])
FOOT = _NB(FOOT)

# ================================================================ geometry
AX0, AX1 = 0.25, 7.55          # panel A
QX0, QX1 = 1.00, AX1           # quadrant grid (room on the left for the vertical axis)
QG = 0.24                       # gap between quadrant cards
QW = (QX1 - QX0 - QG) / 2
QTX = 0.32; QTW = QW - QTX - 0.18
BX0, BX1 = 8.05, W - 0.25      # panel B
RW = BX1 - BX0; BTX = 0.58; BTW = RW - BTX - 0.14
FS_Q, LH_Q = 9.0, 1.32
FS_WHY, LH_WHY = 8.6, 1.30
FS_TAG = 7.6

for q in QUADS.values():
    assert fits(q["tag"], FS_TAG, QTW, "bold"), f"tag too long: {q['tag']}"
for r in RULES:
    assert fits(r["warrant"], 7.3, BTW, style="italic"), f"warrant too long: {r['warrant']}"

TOP_HEADER = 2.15
# override box
OV_LAB_W = _w("OVERRIDE", 8.2, "bold") + 0.35
OV_TW = QX1 - QX0 - 0.30 - OV_LAB_W
ov_h = 0.20 + block_h(OVERRIDE, 9.0, OV_TW, 1.28) + 0.18
# quadrant cards: tag + head (may wrap) + body
q_need = {k: 0.16 + 0.24 + block_h(q["head"], 12.6, QTW, 1.15, weight="bold") + 0.12
          + block_h(q["body"], FS_Q, QTW, LH_Q) + 0.22 for k, q in QUADS.items()}
row_h = [max(q_need[(r, 0)], q_need[(r, 1)], 2.05) for r in (0, 1)]
LBL = 0.30                                         # room for the "high"/"low" axis labels
grid_h = row_h[0] + QG + row_h[1]
xaxis_h = 0.22 + 0.30 + 0.12 + block_h(AXIS_NOTE, 8.4, QX1 - QX0, 1.25, style="italic")
a_h = ov_h + 0.22 + LBL + grid_h + LBL + xaxis_h
# rule cards
rule_need = [0.14 + block_h(r["rule"], 11.2, BTW, 1.18, weight="bold") + 0.10
             + block_h(r["why"], FS_WHY, BTW, LH_WHY) + 0.38 for r in RULES]
RGAP = 0.14
foot_h = 0.12 + block_h(FOOT, 8.2, RW, 1.30, style="italic")
b_h = sum(rule_need) + RGAP * (len(RULES) - 1) + foot_h
body_h = max(a_h, b_h)
slack_b = body_h - b_h
rule_h = [h + slack_b / len(RULES) for h in rule_need]
H = TOP_HEADER + body_h + 0.25
fig.set_size_inches(W, H)
ax.set_xlim(0, W); ax.set_ylim(0, H)

# ================================================================ header
ax.text(0.25, H - 0.30, TITLE, fontsize=17, fontweight="bold", color=INK, va="top")
text_block(0.25, H - 0.74, SUB, 9.8, W - 0.5, color=MUTED, style="italic", lh=1.25)
ax.text(AX0, H - 1.22, A_HEAD, fontsize=13.5, fontweight="bold", color=INK, va="top")
text_block(AX0, H - 1.62, A_SUB, 9.0, AX1 - AX0, color=MUTED, style="italic", lh=1.25)
ax.text(BX0, H - 1.22, B_HEAD, fontsize=13.5, fontweight="bold", color=INK, va="top")
text_block(BX0, H - 1.62, B_SUB, 9.0, RW, color=MUTED, style="italic", lh=1.25)
assert fits(TITLE, 17, W - 0.5, "bold") and fits(A_HEAD, 13.5, BX0 - AX0 - 0.3, "bold") \
    and fits(B_HEAD, 13.5, W - 0.1 - BX0, "bold"), "a heading is too long"
assert len(wrap(SUB, 9.8, W - 0.5, style="italic")) == 1

# ================================================================ panel A
TOP = H - TOP_HEADER
# override box (dashed, red)
oy1 = TOP; oy0 = TOP - ov_h
ax.add_patch(FancyBboxPatch((QX0, oy0), QX1 - QX0, ov_h, boxstyle="round,pad=0,rounding_size=0.08",
                            fc="white", ec=RED, lw=1.6, ls=(0, (4, 3)), zorder=1))
ax.text(QX0 + 0.22, oy1 - 0.20, "OVERRIDE", fontsize=8.2, fontweight="bold", color=RED, va="top")
yo = text_block(QX0 + 0.22 + OV_LAB_W, oy1 - 0.20, OVERRIDE, 9.0, OV_TW, lh=1.28)
assert yo > oy0 + 0.08, "override text overruns its box"

gy1 = oy0 - 0.22 - LBL                              # top of the quadrant grid
ax.text(QX0, gy1 + 0.06, "high — differentiating", fontsize=8.6, fontstyle="italic", color=MUTED, va="bottom")
for (r, c), q in QUADS.items():
    x0 = QX0 + c * (QW + QG)
    y1 = gy1 - (0 if r == 0 else row_h[0] + QG)
    h = row_h[r]; y0 = y1 - h
    ax.add_patch(FancyBboxPatch((x0, y0), QW, h, boxstyle="round,pad=0,rounding_size=0.10",
                                fc=PAPER2, ec=q["accent"], lw=2.0, zorder=1))
    ax.add_patch(Rectangle((x0, y0), 0.09, h, fc=q["accent"], ec="none", zorder=2))
    tx = x0 + QTX
    ax.text(tx, y1 - 0.16, q["tag"], fontsize=FS_TAG, fontweight="bold", color=q["accent"], va="top")
    hy = text_block(tx, y1 - 0.40, q["head"], 12.6, QTW, weight="bold", lh=1.15)
    yb = text_block(tx, hy - 0.12, q["body"], FS_Q, QTW, lh=LH_Q)
    assert yb > y0 + 0.10, f"quadrant {r, c} overruns its card"
gy0 = gy1 - grid_h                                  # bottom of the grid
ax.text(QX0, gy0 - 0.08, "low — enabling / supporting", fontsize=8.6, fontstyle="italic", color=MUTED, va="top")
# vertical axis
ax.add_patch(FancyArrowPatch((0.62, gy0), (0.62, gy1 + 0.02), arrowstyle="-|>", mutation_scale=14,
                             lw=1.8, color=INK))
ax.text(0.34, (gy0 + gy1) / 2, "BUSINESS IMPACT", rotation=90, fontsize=10.5, fontweight="bold",
        color=INK, va="center", ha="center")
# horizontal axis
xa = gy0 - LBL - 0.10
ax.add_patch(FancyArrowPatch((QX0, xa), (QX1, xa), arrowstyle="-|>", mutation_scale=14, lw=1.8, color=INK))
ax.text((QX0 + QX1) / 2, xa - 0.12, "STANDARD-FIT", fontsize=10.5, fontweight="bold", color=INK,
        va="top", ha="center")
yn = text_block(QX0, xa - 0.44, AXIS_NOTE, 8.4, QX1 - QX0, color=RED, style="italic", lh=1.25, ha="center")
assert yn > 0.05, "panel A runs off the figure"

# ================================================================ panel B
y = TOP
for i, r in enumerate(RULES):
    h = rule_h[i]; y0 = y - h
    ax.add_patch(FancyBboxPatch((BX0, y0), RW, h, boxstyle="round,pad=0,rounding_size=0.08",
                                fc=PAPER, ec=LINE, lw=1.2, zorder=1))
    ax.add_patch(Rectangle((BX0, y0), 0.07, h, fc=r["col"], ec="none", zorder=2))
    ax.text(BX0 + 0.20, y - 0.12, r["n"], fontsize=17, fontweight="bold", color=r["col"], va="top")
    tx = BX0 + BTX
    hy = text_block(tx, y - 0.14, r["rule"], 11.2, BTW, weight="bold", lh=1.18)
    yb = text_block(tx, hy - 0.10, r["why"], FS_WHY, BTW, lh=LH_WHY)
    ax.text(tx, y0 + 0.10, r["warrant"], fontsize=7.3, fontstyle="italic", color=MUTED, va="bottom")
    assert yb > y0 + 0.26, f"rule {r['n']} overruns its warrant line"
    y = y0 - RGAP
yf = text_block(BX0, y + RGAP - 0.12, FOOT, 8.2, RW, color=MUTED, style="italic", lh=1.30)
assert yf > 0.05, "panel B runs off the figure"

out = sys.argv[1] if len(sys.argv) > 1 else "ciaof_matrix.png"
fig.savefig(out, dpi=300, facecolor="white", bbox_inches="tight", pad_inches=0.12)
print(f"wrote {out}  ({W:.1f} x {H:.2f} in)")
