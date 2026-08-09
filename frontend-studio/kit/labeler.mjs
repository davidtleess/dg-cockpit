/**
 * labeler — automatic label placement by simulated annealing.
 *
 * WHY THIS EXISTS
 * David, 2026-08-09: "i still don't see a dot for DIKE". Chimere Dike's mark was drawn; his
 * NAME had been pushed 52px away from it by a greedy de-collision loop, landing next to a
 * different player's dot. The reader's honest conclusion is that the dot is missing.
 *
 * Studio recorded this exact failure on 2026-07-31 ("label de-collision pushed names down and
 * left the dots behind, so a name sat beside the wrong mark") and then reintroduced it,
 * because the fix applied then was ad hoc. This is the fix applied as a MECHANISM.
 *
 * The greedy loop it replaces had two structural holes:
 *   - it only knew about label-vs-label overlap, so a label could land on top of a MARK;
 *   - it only moved labels UP, so a crowded label walked arbitrarily far from its anchor
 *     with no cost for the distance.
 *
 * METHOD — Evan Wang's D3-Labeler (CS294-10, Stanford/Berkeley), the approach the literature
 * prefers over force-directed layout, which scatters labels out of the plot when marks are
 * dense. Energy terms and weights are taken from that implementation:
 *
 *   w_len      0.2   leader-line length            — keeps a label near its own mark
 *   w_inter    1.0   leader lines crossing         — stops leaders braiding
 *   w_lab2    30.0   label-label overlap area      — the only term the old loop had
 *   w_lab_anc 30.0   label-over-MARK overlap area  — the term whose absence caused this bug
 *   w_orient   3.0   quadrant preference
 *
 * Moves: 50% random translation (<=5px), 50% rotation about the anchor (<=0.5 rad).
 * Cooling: linear, T -> T - T0/nsweeps.
 *
 * Deterministic by default: seeded PRNG, so the same figure lays out identically every run
 * and a screenshot diff means a real change.
 */

const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const overlapArea = (a, b) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};

const segmentsCross = (p1, p2, p3, p4) => {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < 1e-9) return false;
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  return u > 0 && u < 1 && v > 0 && v < 1;
};

/**
 * @param labels [{x,y,w,h}]  current top-left + measured size; mutated in place
 * @param anchors [{x,y,r}]   the mark each label belongs to, same order
 * @param opts {width,height,sweeps,seed,obstacles:[{x,y,w,h}]}
 * @returns {energy, moved}   final energy and how far each label travelled
 */
export function place(labels, anchors, opts = {}) {
  const { width, height, sweeps = 750, seed = 20260809, obstacles = [] } = opts;
  const rnd = mulberry32(seed);
  const W = { len: 0.2, inter: 1.0, lab2: 30.0, labAnc: 30.0, orient: 3.0 };
  const n = labels.length;
  const start = labels.map((l) => ({ x: l.x, y: l.y }));

  const energy = (i) => {
    const l = labels[i], a = anchors[i];
    const cx = l.x + l.w / 2, cy = l.y + l.h / 2;
    let e = Math.hypot(cx - a.x, cy - a.y) * W.len;

    // quadrant preference: above-right reads best, below-left worst
    const dx = cx - a.x, dy = cy - a.y;
    e += (dx > 0 ? (dy < 0 ? 0 : 2) : (dy < 0 ? 1 : 3)) * W.orient;

    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      e += overlapArea(l, labels[j]) * W.lab2;
      // leader lines crossing each other
      const b = labels[j];
      if (segmentsCross({ x: cx, y: cy }, a,
                        { x: b.x + b.w / 2, y: b.y + b.h / 2 }, anchors[j])) e += W.inter;
    }
    // THE TERM THE OLD LOOP DID NOT HAVE: a label sitting on any mark, not just its own.
    for (const an of anchors)
      e += overlapArea(l, { x: an.x - an.r, y: an.y - an.r, w: an.r * 2, h: an.r * 2 }) * W.labAnc;
    for (const ob of obstacles) e += overlapArea(l, ob) * W.lab2;

    if (l.x < 0 || l.y < 0 || l.x + l.w > width || l.y + l.h > height) e += 4000;
    return e;
  };

  let T = 1.0;
  for (let s = 0; s < sweeps; s++) {
    for (let k = 0; k < n; k++) {
      const i = Math.floor(rnd() * n);
      const l = labels[i], a = anchors[i];
      const before = energy(i);
      const ox = l.x, oy = l.y;
      if (rnd() < 0.5) {                       // translate
        l.x += (rnd() - 0.5) * 10;
        l.y += (rnd() - 0.5) * 10;
      } else {                                  // rotate about the anchor
        const cx = l.x + l.w / 2, cy = l.y + l.h / 2;
        const ang = (rnd() - 0.5) * 1.0;
        const s_ = Math.sin(ang), c_ = Math.cos(ang);
        const nx = a.x + (cx - a.x) * c_ - (cy - a.y) * s_;
        const ny = a.y + (cx - a.x) * s_ + (cy - a.y) * c_;
        l.x = nx - l.w / 2; l.y = ny - l.h / 2;
      }
      const delta = energy(i) - before;
      if (delta > 0 && rnd() >= Math.exp(-delta / Math.max(T, 1e-6))) { l.x = ox; l.y = oy; }
    }
    T -= 1.0 / sweeps;
  }
  return {
    energy: labels.reduce((s2, _, i) => s2 + energy(i), 0),
    moved: labels.map((l, i) => Math.round(Math.hypot(l.x - start[i].x, l.y - start[i].y))),
  };
}
