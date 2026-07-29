/* ============================================================================
 * studio-kit.js — the behaviours Studio rebuilds on every surface.
 *
 *   import { tip, sortableTable, stagger, dodge, fmt } from '../../kit/studio-kit.js';
 *
 * Behaviour, not looks. Each export exists because Studio hand-wrote it again on
 * a later surface and reintroduced a bug it had already fixed:
 *   tip()            — the hover layer is standing on every surface (2026-07-26)
 *   sortableTable()  — filters and sorts over ONE list, never parallel lists (2026-07-15)
 *   stagger()        — an entrance that teaches an axis, once, not on every re-sort
 *   dodge()          — collision spacing MEASURED, never a constant tuned to a font
 *                      size (2026-07-28 defect class: a magic 34px broke on a 1.5px
 *                      type change and was invisible until it fired)
 *   fmt              — tabular, signed, and ordinal formatting in the hobby's units
 * ========================================================================== */

/* ------------------------------------------------------------------ tooltip */
let _tipEl = null;

function tipEl() {
  if (_tipEl) return _tipEl;
  _tipEl = document.createElement('div');
  _tipEl.className = 'sk-tip';
  _tipEl.setAttribute('role', 'status');
  _tipEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(_tipEl);
  return _tipEl;
}

/**
 * Bind a hover/focus tip to an element.
 * @param {Element} el
 * @param {string} title
 * @param {string} body  may contain <b> <em> <u>; tags are stripped for aria-label
 *
 * The aria-label is set from the SAME strings, so a screen reader and a mouse
 * reader get the same facts — nothing may live only in a tooltip, because touch
 * has no hover.
 */
export function tip(el, title, body) {
  const show = (e) => {
    const t = tipEl();
    t.innerHTML = `<b>${title}</b>${body}`;
    t.dataset.open = 'true';
    const r = t.getBoundingClientRect();
    const x = e.clientX ?? (el.getBoundingClientRect().left + 8);
    const y = e.clientY ?? (el.getBoundingClientRect().top + 8);
    t.style.left = `${x + 14 + r.width > innerWidth - 8 ? x - r.width - 14 : x + 14}px`;
    t.style.top = `${y + 14 + r.height > innerHeight - 8 ? y - r.height - 14 : y + 14}px`;
  };
  const hide = () => { if (_tipEl) _tipEl.dataset.open = 'false'; };
  el.addEventListener('mousemove', show);
  el.addEventListener('mouseleave', hide);
  el.addEventListener('focus', show);
  el.addEventListener('blur', hide);
  if (!el.hasAttribute('aria-label')) {
    el.setAttribute('aria-label', `${title} — ${body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`);
  }
  return el;
}

/* --------------------------------------------------------------------- table */
/**
 * One queryable list with sortable columns — never two parallel lists, and never
 * tabs over the same population (2026-07-15, restated 2026-07-26).
 *
 * @param {object} o
 * @param {HTMLTableElement} o.table
 * @param {Array<object>} o.rows
 * @param {Array<{key:string,label:string,sub?:string,cell:(row:object)=>Node|string,sortable?:boolean}>} o.columns
 * @param {string} o.initialSort
 * @param {1|-1} [o.initialDir]
 * @param {(row:object)=>boolean} [o.pin]  rows matching stay at the top under
 *        every sort — the reader's own team is the reference the others are read
 *        against, the way every team page in the category puts your team first.
 */
export function sortableTable({ table, rows, columns, initialSort, initialDir = 1, pin = null }) {
  const thead = table.querySelector('thead') || table.createTHead();
  const tbody = table.querySelector('tbody') || table.createTBody();
  let headRow = thead.querySelector('tr.sk-headrow');
  if (!headRow) { headRow = document.createElement('tr'); headRow.className = 'sk-headrow'; thead.appendChild(headRow); }

  let sortKey = initialSort;
  let sortDir = initialDir;

  headRow.innerHTML = '';
  const ths = columns.map((c) => {
    const th = document.createElement('th');
    th.innerHTML = `${c.label}<span class="sk-caret"></span>${c.sub || ''}`;
    if (c.sortable !== false) {
      th.dataset.sort = c.key;
      th.setAttribute('aria-sort', 'none');
      th.tabIndex = 0;
      const go = () => {
        if (sortKey === c.key) sortDir = -sortDir; else { sortKey = c.key; sortDir = 1; }
        render();
      };
      th.addEventListener('click', go);
      th.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    }
    headRow.appendChild(th);
    return th;
  });

  function render() {
    ths.forEach((th, i) => {
      const active = columns[i].key === sortKey;
      if (th.dataset.sort) th.setAttribute('aria-sort', active ? (sortDir === 1 ? 'ascending' : 'descending') : 'none');
      th.querySelector('.sk-caret').textContent = active ? (sortDir === 1 ? '▲' : '▼') : '';
    });

    const sorted = rows.slice().sort((a, b) => {
      if (pin) { const pa = pin(a), pb = pin(b); if (pa !== pb) return pa ? -1 : 1; }
      let x = a[sortKey], y = b[sortKey];
      // a missing value sorts last in either direction, never as a zero
      if (x === null || x === undefined) x = sortDir === 1 ? Infinity : -Infinity;
      if (y === null || y === undefined) y = sortDir === 1 ? Infinity : -Infinity;
      if (typeof x === 'string') return sortDir * String(x).localeCompare(String(y));
      return sortDir * (x - y);
    });

    tbody.innerHTML = '';
    for (const row of sorted) {
      const tr = document.createElement('tr');
      if (pin && pin(row)) tr.classList.add('is-you');
      for (const c of columns) {
        const td = document.createElement('td');
        const v = c.cell(row);
        if (v instanceof Node) td.appendChild(v); else td.innerHTML = v ?? '';
        if (c.numeric) td.classList.add('sk-num');
        if (c.seam) td.classList.add('sk-seam');
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.dispatchEvent(new CustomEvent('sk:render', { detail: { sortKey, sortDir, rows: sorted } }));
  }

  render();
  return { render, get sortKey() { return sortKey; }, get sortDir() { return sortDir; } };
}

/* ------------------------------------------------------------------ entrance */
/**
 * Stagger an entrance across marks so the motion teaches the axis rather than
 * decorating it (WCAG SC 2.3.3 exempts motion that IS the information).
 * Plays ONCE — a re-sort must not replay it.
 */
export function stagger(root, selector = '.sk-mark', { step = 22, rowStep = 45 } = {}) {
  const rows = [...root.querySelectorAll('tr')];
  const assign = (el, i, r) => { el.style.transitionDelay = `${r * rowStep + i * step}ms`; };
  if (rows.length) {
    rows.forEach((tr, r) => [...tr.querySelectorAll(selector)].forEach((el, i) => assign(el, i, r)));
  } else {
    [...root.querySelectorAll(selector)].forEach((el, i) => assign(el, i, 0));
  }
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('sk-enter-done')));
}

/* -------------------------------------------------------------------- dodge */
/**
 * Space colliding marks along one axis.
 *
 * @param {Array<number>} positions  in px along the axis, any order
 * @param {number} extent            the axis length in px
 * @param {number} markPx            the RENDERED width of the mark
 *
 * The rule this encodes: a collision, dodge or truncation rule must measure what
 * is actually rendered. A constant tuned to one type size is a latent defect that
 * fires on the next edit and is invisible until then (2026-07-28) — so markPx is
 * a required argument and callers are expected to measure it, not guess.
 */
export function dodge(positions, extent, markPx) {
  const order = positions.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x);
  let last = -Infinity;
  for (const p of order) {
    if (p.x - last < markPx) p.x = last + markPx;
    last = p.x;
  }
  // if the run overflowed the axis, pull the whole run back rather than clipping
  const over = last - (extent - markPx / 2);
  if (over > 0) for (const p of order) p.x -= over;
  const out = new Array(positions.length);
  for (const p of order) out[p.i] = p.x;
  return out;
}

/** Measure a mark's rendered width instead of assuming it. */
export function measureMark(el) {
  const r = el.getBoundingClientRect();
  return { w: r.width, h: r.height };
}

/* ------------------------------------------------------------------ formatting */
export const fmt = {
  /** A count, or an em-dash — never a bare 0 where the quantity is absent. */
  count: (n) => (n ? String(n) : '—'),
  /** Signed, for a diverging quantity. */
  signed: (n) => (n > 0 ? `+${n}` : String(n)),
  pct: (x, dp = 0) => (x === null || x === undefined ? '—' : `${(x * 100).toFixed(dp)}%`),
  /** Draft-pick ordinal in the hobby's own words. */
  ordinal: (n) => ({ 1: '1st', 2: '2nd', 3: '3rd' }[n] || `${n}th`),
  /** Rank movement chip — the ONLY sanctioned green/red (2026-07-15). */
  rankMove(delta) {
    const s = document.createElement('span');
    s.className = 'sk-rankmove';
    s.dataset.dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
    s.textContent = delta > 0 ? `▲${delta}` : delta < 0 ? `▼${Math.abs(delta)}` : '–';
    s.setAttribute('aria-label',
      delta > 0 ? `up ${delta} places` : delta < 0 ? `down ${Math.abs(delta)} places` : 'unchanged');
    return s;
  },
  /** A position badge in the product's own hue for that position. */
  pos(p) {
    const s = document.createElement('span');
    s.className = 'sk-pos';
    s.dataset.pos = p;
    s.textContent = p;
    return s;
  },
};

/* ------------------------------------------------------------- small builders */
/** A bar with a track and its number in a separate cell (no label can overflow). */
export function bar({ value, max = 1, label, thin = false }) {
  const wrap = document.createElement('div');
  wrap.className = 'sk-bar';
  const pct = value === null || value === undefined ? 0 : Math.max(0, Math.min(1, value / max)) * 100;
  wrap.innerHTML =
    `<span class="sk-bar-track">${value === null || value === undefined ? '' :
      `<span class="sk-bar-fill${thin ? ' is-thin' : ''}" style="width:${pct}%"></span>`}</span>` +
    `<span class="sk-bar-value">${label ?? (value === null || value === undefined ? '—' : value)}</span>`;
  return wrap;
}

/** A hatched stretch meaning "this entity did not exist yet" — never a blank. */
export function absent({ widthPct, label }) {
  const f = document.createDocumentFragment();
  const a = document.createElement('div');
  a.className = 'sk-absent';
  a.style.left = '0';
  a.style.width = `${widthPct}%`;
  a.setAttribute('aria-hidden', 'true');
  f.appendChild(a);
  if (label) {
    const l = document.createElement('span');
    l.className = 'sk-absent-label';
    l.style.left = '2px';
    l.textContent = label;
    f.appendChild(l);
  }
  return f;
}
