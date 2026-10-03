// Builds the playable prototype: every component (C01-C09, P02) joined into one page,
// driven by GSAP. Output: proto/vending.html
const fs = require('fs');
const path = require('path');
const N = require('../parts/neon.js');
const Cb = require('../parts/cabinet.js');
const I = require('../parts/interior.js');
const S = require('../parts/shelf.js');
const Gl = require('../parts/glass.js');
const Co = require('../parts/coin.js');
const Dk = require('../parts/deck.js');
const T = require('../parts/screen.js');
const O = require('../parts/overlays.js');
const D = require('../parts/data.js');
const { geo2 } = require('../parts/geo2.js');

const g = geo2();
const B = Dk.deckBoxes(g);
const ID = 'pt';
const r1 = (n) => Math.round(n * 10) / 10;

// ------------------------------------------------------------------ machine SVG
const L = { base: '', lit: '', cans: '', glass: '', deck: '' };
let svg = '';
// 1. shell, unlit (body, dark tubes, marquee off, fixtures, feet)
svg += Cb.shell(g, { id: 'mc', state: 'off' });
// 2. lit layer: tubes + clips + marquee on. Power-on flickers this group in.
let lit = Cb.defs('ml');
lit += N.tube({ id: 'lo', d: N.arch(g.outerArch), w: g.tube, kind: 'outer', state: 'on' });
[0.32, 0.55, 0.78].map((f) => g.outerArch.top + (g.outerArch.bottom - g.outerArch.top) * f).forEach((y) => {
  lit += N.clip({ x: g.outerArch.x1, y, w: g.tube }) + N.clip({ x: g.outerArch.x2, y, w: g.tube });
});
[0.3, 0.7].forEach((f) => { lit += N.clip({ x: g.W * f, y: g.outerArch.top, w: g.tube, vertical: false }); });
lit += N.tube({ id: 'li', d: N.rrect(g.innerRect), w: g.tubeIn, kind: 'inner', state: 'on' });
lit += Cb.marquee(g, 'ml', { state: 'on' });
L.lit = lit;
// 3. interior (static) with shelves and back coil halves
svg += I.interior(g, { id: 'in', light: 'on' });
svg += S.defs('sb');
svg += `<g clip-path="url(#in-win)">`;
for (let r = 0; r < g.rows; r++) svg += S.shelf(g, r, 'sb');
D.PROJECTS.forEach((p) => { svg += S.coil(S.colX(g, p.col), S.plateY(g, p.row) - 2, 'back', 'sb'); });
svg += `</g>`;
L.base = svg;
// 4. cans layer (dynamic)
svg = S.defs(ID) + `<defs><clipPath id="cw"><rect x="${g.win.x}" y="${g.win.y}" width="${g.win.w}" height="${g.win.h}" rx="22"/></clipPath></defs>`;
svg += `<g clip-path="url(#cw)">`;
D.PROJECTS.forEach((p) => {
  const cx = S.colX(g, p.col);
  const py = S.plateY(g, p.row);
  const base = py - 4;
  svg += `<g class="can" id="can-${p.code}" data-cx="${cx}" data-base="${base}">`;
  svg += `<ellipse class="halo" cx="${cx}" cy="${r1(base - 95)}" rx="110" ry="130" fill="#ffe04a" opacity="0" filter="url(#${ID}-b6)"/>`;
  svg += `<g class="canInner">${S.can(p, cx, base, ID, 1)}</g></g>`;
  svg += `<g class="coilF" id="coil-${p.code}" data-cx="${cx}" data-cy="${r1(py - 2 - 64 + 6)}">${S.coil(cx, py - 2, 'front', ID)}</g>`;
});
D.PROJECTS.forEach((p) => {
  svg += `<g class="tag" id="tag-${p.code}" data-tag="idle"><g class="t-idle">${S.tag(g, p, p.row, p.col, ID, 'idle')}</g><g class="t-sel">${S.tag(g, p, p.row, p.col, ID, 'selected')}</g><g class="t-taken">${S.tag(g, p, p.row, p.col, ID, 'taken')}</g></g>`;
});
svg += `</g>`;
L.cans = svg;
// 5. glass
L.glass = Gl.glass(g, { id: 'gl' });
// 6. deck: control strip
svg = Dk.defs('dk');
{
  const s = B.strip;
  svg += `<rect x="${s.x - 6}" y="${s.y - 6}" width="${s.w + 12}" height="${s.h + 12}" rx="14" fill="url(#dk-trim)"/>`;
  svg += `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="10" fill="url(#dk-anod)"/>`;
  [[s.x + 12, s.y + 12], [s.x + s.w - 12, s.y + 12], [s.x + 12, s.y + s.h - 12], [s.x + s.w - 12, s.y + s.h - 12]].forEach(([a, c]) => { svg += Dk.scr(a, c, 'dk', 4); });
  Dk.KEYS.forEach((k, i) => {
    const kx = B.keys.x + i * (B.keys.kw + B.keys.gap);
    svg += `<g class="key" id="key-${k}" data-state="idle">${['idle', 'hover', 'pressed'].map((st) => `<g class="k-${st}">${Dk.key(kx, B.keys.y, B.keys.kw, B.keys.kh, k, 'dk', st)}</g>`).join('')}</g>`;
  });
  // LCD: frame + ghosts from the component, live text on top
  svg += Dk.lcd(B.lcd, '', 'dk', { on: false });
  const l = B.lcd;
  const ty = l.y + l.h / 2 + 25 * 0.36;
  const mono = "'Share Tech Mono', 'DejaVu Sans Mono', monospace";
  svg += `<text id="lcdGlow" x="${l.x + l.w / 2}" y="${ty}" text-anchor="middle" font-family="${mono}" font-size="25" letter-spacing="2" fill="#ffb52e" opacity=".9" filter="url(#dk-b4)"></text>`;
  svg += `<text id="lcdText" x="${l.x + l.w / 2}" y="${ty}" text-anchor="middle" font-family="${mono}" font-size="25" letter-spacing="2" fill="#ffd27a"></text>`;
  for (let yy = l.y + 2; yy < l.y + l.h; yy += 3) svg += `<rect x="${l.x}" y="${yy}" width="${l.w}" height="1" fill="#000" opacity=".22"/>`;
  // printer + paper (paper height animated through its clip rect)
  const p = B.printer;
  svg += Dk.printer(p, 'dk', { paper: 0 });
  const sy = p.y + p.h - 26;
  svg += `<circle id="paperLed" cx="${p.x + p.w - 18}" cy="${p.y + 18}" r="3.2" fill="#3cff8a" opacity="0"/>`;
  svg += `<defs><clipPath id="paperClip"><rect id="paperClipRect" x="${p.x}" y="${sy + 5}" width="${p.w}" height="0"/></clipPath></defs>`;
  svg += `<g clip-path="url(#paperClip)"><rect x="${p.x + 22}" y="${sy + 5}" width="${p.w - 44}" height="170" fill="url(#dk-paper)"/>`;
  ['NIKHIL MFG. CO.', '--------------', 'PRINTING', '..........'].forEach((t, i) => { svg += `<text x="${p.x + 32}" y="${sy + 26 + i * 16}" font-family="${mono}" font-size="9.5" fill="#2a2420">${t}</text>`; });
  svg += `</g>`;
}
// 6. delivery bay: cavity, tray glow, tray cans (added live), flap
{
  const b = B.bay;
  svg += Dk.bay(b, 'dk', { open: 0, cans: [], flap: false });
  svg += `<rect id="trayGlow" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="8" fill="url(#dk-trayGlow)" opacity="0"/>`;
  svg += `<g id="tray"></g>`;
  const { x, y, w, h } = b;
  svg += `<g id="flap">`;
  svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#dk-smoke)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="#fff" stroke-opacity=".18"/>`;
  svg += `<polygon points="${x + w * 0.08},${y} ${x + w * 0.3},${y} ${x + w * 0.16},${y + h} ${x - w * 0.06},${y + h}" fill="#fff" opacity=".07"/><polygon points="${x + w * 0.34},${y} ${x + w * 0.37},${y} ${x + w * 0.23},${y + h} ${x + w * 0.2},${y + h}" fill="#fff" opacity=".08"/>`;
  const ty = y + h * 0.58;
  svg += `<text x="${x + w / 2}" y="${ty + 1.5}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="30" letter-spacing="14" fill="#000" opacity=".6">PUSH</text><text x="${x + w / 2}" y="${ty}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="30" letter-spacing="14" fill="#5a606a" opacity=".85">PUSH</text>`;
  svg += `</g>`;
  svg += `<rect x="${x}" y="${y - 6}" width="${w}" height="10" rx="3" fill="url(#dk-trim)"/>`;
  for (let xx = x + 20; xx < x + w; xx += 40) svg += `<rect x="${xx}" y="${y - 6}" width="1.5" height="10" fill="#3b3f45"/>`;
}
svg += Dk.kick(B.kick, 'dk');
L.deck = svg;

// ------------------------------------------------------------------ precomputed fragments
const TRAY_S = 0.62;
const trayCan = {};
const modalCan = {};
D.PROJECTS.forEach((p) => {
  trayCan[p.code] = S.can(p, 0, (S.CAN_H * TRAY_S) / 2, ID, TRAY_S);
  modalCan[p.code] = `<svg viewBox="0 0 380 560" width="380" height="560" aria-hidden="true">${S.defs('md' + p.code)}<ellipse cx="190" cy="500" rx="150" ry="22" fill="#000" opacity=".5"/>${S.can(p, 190, 500, 'md' + p.code, 2.1)}</svg>`;
});
const screens = { off: '', noCoins: T.SCREENS.noCoins(), empty: T.SCREENS.empty() };
D.FILTERS.map(([f]) => f).forEach((f) => { screens[`browse:${f}`] = T.SCREENS.browse(null, f); });
D.PROJECTS.forEach((p) => ['selected', 'paying', 'vending', 'ready'].forEach((st) => { screens[`${st}:${p.code}`] = T.SCREENS[st](p); }));
const bezel = T.touchscreen('browse', D.PROJECTS[0], 'ALL');
const coinMech = (state, coinIn = 0) => {
  const vb = [g.coin.x - 5, g.coin.y - 4, 150, g.coin.h + 10];
  return `<svg class="cm cm-${state}" viewBox="${vb.join(' ')}" width="150" height="${g.coin.h + 10}" aria-hidden="true">${Co.coinMech(g.coin, { state, id: `cm${state}`, coinIn })}</svg>`;
};
const wallets = [0, 1, 2, 3, 4, 5].map((n) => Co.wallet(n));
const receipts = { about: O.receipt('about'), skills: O.receipt('skills'), resume: O.receipt('resume'), contact: O.receipt('contact') };

// hit targets (cabinet coordinates -> % of the machine box)
const pct = (x, y, w, h) => `left:${(x / g.W * 100).toFixed(3)}%;top:${(y / g.H * 100).toFixed(3)}%;width:${(w / g.W * 100).toFixed(3)}%;height:${(h / g.H * 100).toFixed(3)}%;`;
let hits = '';
D.PROJECTS.forEach((p) => {
  const cx = S.colX(g, p.col);
  const py = S.plateY(g, p.row);
  hits += `<button type="button" class="hit slot" data-code="${p.code}" aria-label="Slot ${p.code}, ${p.name}, 1 coin" style="${pct(cx - 80, py - 232, 160, 284)}"></button>`;
});
Dk.KEYS.forEach((k, i) => {
  const kx = B.keys.x + i * (B.keys.kw + B.keys.gap);
  hits += `<button type="button" class="hit key-hit" data-key="${k}" aria-label="${k[0] + k.slice(1).toLowerCase()}" style="${pct(kx - 4, B.keys.y - 28, B.keys.kw + 8, B.keys.kh + 34)}"></button>`;
});

const data = {
  g: { W: g.W, H: g.H, win: g.win, screen: g.screen, coin: g.coin, deckY: g.deck.y, bay: B.bay, printer: B.printer, rowPitch: g.rowPitch },
  projects: D.PROJECTS,
  pal: S.PAL,
  trayCan, modalCan, screens, wallets, receipts,
  canH: S.CAN_H, canW: S.CAN_W, trayS: TRAY_S,
};

// each layer is its own <svg> so the browser composites it separately: animating one
// layer (cans falling, flap opening) never re-rasterizes the filtered neon or the glass.
const box = (vb, extra = '') => `style="left:${(vb[0] / g.W * 100).toFixed(4)}%;top:${(vb[1] / g.H * 100).toFixed(4)}%;width:${(vb[2] / g.W * 100).toFixed(4)}%;height:${(vb[3] / g.H * 100).toFixed(4)}%;${extra}"`;
const layer = (id, vb, content, extra = '') => `<svg class="layer" id="${id}" viewBox="${vb.join(' ')}" ${box(vb, extra)} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${content}</svg>`;
const full = [0, 0, g.W, g.H];
const winVB = [g.win.x - 10, g.win.y - 10, g.win.w + 20, g.win.h + 20];
const deckVB = [0, g.deck.y - 30, g.W, g.H - g.deck.y + 30];
const layers = layer('Lbase', full, L.base)
  + layer('lit', full, L.lit, 'opacity:0;')
  + layer('Lcans', winVB, L.cans)
  + `<div id="interiorDark" ${box([g.win.x, g.win.y, g.win.w, g.win.h], 'border-radius:2.3%/1%;background:#000;opacity:.62;position:absolute;')}></div>`
  + layer('Lglass', winVB, L.glass)
  + `<div class="sweepbox" ${box([g.win.x, g.win.y, g.win.w, g.win.h], 'position:absolute;overflow:hidden;border-radius:2.3%/1%;pointer-events:none;')}><div id="sweep"></div></div>`
  + layer('Ldeck', deckVB, L.deck);
const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const html = tpl
  .replace('__LAYERS__', layers)
  .replace('__HITS__', hits)
  .replace('__BEZEL__', bezel)
  .replace('__CM__', coinMech('idle') + coinMech('armed') + coinMech('accepting', 0.55))
  .replace('__WALLET__', wallets[5])
  .replace('__AR__', `${g.W} / ${g.H}`)
  .replace('__DATA__', JSON.stringify(data).replace(/</g, '\\u003c'));
fs.writeFileSync(path.join(__dirname, 'vending.html'), html);
console.log('ok', (html.length / 1024).toFixed(0) + 'KB');
