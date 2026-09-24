// COMPONENT 02 — Cabinet body, marquee sign, side fixtures, feet.
// Drawn in SVG, cabinet-local coordinates from geo2(). Colors sampled from the
// reference photo's side panel (#d90201), pushed brighter per review.
const N = require('./neon.js');

const ENAMEL = ['#7a0003', '#c8060c', '#ff2a22', '#f2141a', '#dc0a10', '#b40508', '#640003'];

function bodyPath(g, inset = 0) {
  const { W, bodyH, radiusTop: R } = g;
  const r = R - inset;
  const rb = 34 - inset;
  const a = inset;
  const b = W - inset;
  const t = inset;
  const bt = bodyH - inset;
  return `M ${a} ${t + r} Q ${a} ${t} ${a + r} ${t} L ${b - r} ${t} Q ${b} ${t} ${b} ${t + r} L ${b} ${bt - rb} Q ${b} ${bt} ${b - rb} ${bt} L ${a + rb} ${bt} Q ${a} ${bt} ${a} ${bt - rb} Z`;
}

function screw(x, y, r = 5, rot = 30) {
  return `<g transform="translate(${x} ${y})"><circle r="${r + 1.2}" fill="#3a0003" opacity=".8"/><circle r="${r}" fill="url(#chromeDisc)"/><g transform="rotate(${rot})" stroke="#4a4f55" stroke-width="${r * 0.28}" stroke-linecap="round"><line x1="${-r * 0.55}" y1="0" x2="${r * 0.55}" y2="0"/><line x1="0" y1="${-r * 0.55}" x2="0" y2="${r * 0.55}"/></g><circle cx="${-r * 0.35}" cy="${-r * 0.4}" r="${r * 0.28}" fill="#fff" opacity=".7"/></g>`;
}

function seam(x1, y1, x2, y2) {
  const v = x1 === x2;
  const off = v ? [2, 0] : [0, 2];
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2c0002" stroke-width="2.2"/><line x1="${x1 + off[0]}" y1="${y1 + off[1]}" x2="${x2 + off[0]}" y2="${y2 + off[1]}" stroke="#ff8a7a" stroke-width="1" opacity=".38"/>`;
}

function defs(id) {
  return `<defs>
<linearGradient id="${id}-enamel" x1="0" y1="0" x2="1" y2="0">${ENAMEL.map((c, i) => `<stop offset="${[0, 0.05, 0.24, 0.42, 0.78, 0.95, 1][i]}" stop-color="${c}"/>`).join('')}</linearGradient>
<linearGradient id="${id}-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
<radialGradient id="chromeDisc" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#cfd5db"/><stop offset=".7" stop-color="#7c838b"/><stop offset="1" stop-color="#3b3f45"/></radialGradient>
<linearGradient id="${id}-chromeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".18" stop-color="#b9c0c7"/><stop offset=".5" stop-color="#5d636b"/><stop offset=".62" stop-color="#9aa1a9"/><stop offset=".85" stop-color="#e2e6ea"/><stop offset="1" stop-color="#4b5057"/></linearGradient>
<linearGradient id="${id}-chromeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4b5057"/><stop offset=".15" stop-color="#e2e6ea"/><stop offset=".4" stop-color="#8f969e"/><stop offset=".55" stop-color="#f6f8fa"/><stop offset=".8" stop-color="#7c838b"/><stop offset="1" stop-color="#34383d"/></linearGradient>
<filter id="${id}-peel" x="0%" y="0%" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0"/></filter>
<filter id="${id}-blur12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="${id}-blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
<clipPath id="${id}-clip"><path d="${'__BODY__'}"/></clipPath>
</defs>`;
}

/** Painted steel body: enamel, gloss streak, orange-peel texture, rim, seams, screws. */
function body(g, id) {
  const bp = bodyPath(g);
  let o = defs(id).replace('__BODY__', bp);
  // cast shadow on the wall behind
  o += `<path d="${bp}" transform="translate(0 18)" fill="#000" opacity=".55" filter="url(#${id}-blur12)"/>`;
  o += `<path d="${bp}" fill="url(#${id}-enamel)"/>`;
  o += `<g clip-path="url(#${id}-clip)">`;
  o += `<rect width="${g.W}" height="${g.bodyH}" fill="url(#${id}-shade)"/>`;
  o += `<rect width="${g.W}" height="${g.bodyH}" filter="url(#${id}-peel)" opacity=".05"/>`;
  // long soft gloss streak (glossy paint catching the room light)
  o += `<rect x="${g.W * 0.2}" y="-40" width="46" height="${g.bodyH + 80}" fill="#fff" opacity=".10" filter="url(#${id}-blur12)"/>`;
  o += `<rect x="${g.W * 0.2 + 16}" y="-40" width="6" height="${g.bodyH + 80}" fill="#fff" opacity=".12" filter="url(#${id}-blur4)"/>`;
  o += `</g>`;
  // rolled edge: dark outline + inner highlight
  o += `<path d="${bp}" fill="none" stroke="#2a0002" stroke-width="3"/>`;
  o += `<path d="${bodyPath(g, 3)}" fill="none" stroke="#ff9a8a" stroke-width="1.2" opacity=".35"/>`;
  // recessed channel for the outer tube
  const arch = N.arch(g.outerArch);
  o += `<path d="${arch}" fill="none" stroke="#220002" stroke-width="${g.tube + 18}"/>`;
  o += `<path d="${arch}" fill="none" stroke="#0a0001" stroke-width="${g.tube + 8}"/>`;
  // window gasket + recess
  const wr = g.innerRect;
  o += `<path d="${N.rrect({ ...wr, x1: wr.x1 - 8, x2: wr.x2 + 8, top: wr.top - 8, bottom: wr.bottom + 8, r: wr.r + 8 })}" fill="#140002"/>`;
  o += `<path d="${N.rrect({ ...wr, x1: wr.x1 - 8, x2: wr.x2 + 8, top: wr.top - 8, bottom: wr.bottom + 8, r: wr.r + 8 })}" fill="none" stroke="#ff8a7a" stroke-width="1" opacity=".3" transform="translate(0 1.5)"/>`;
  // panel seams (deck line, right column line)
  const inX1 = g.tc + g.tube / 2 + 14;
  const inX2 = g.W - g.tc - g.tube / 2 - 14;
  o += seam(inX1, g.deck.y - 22, inX2, g.deck.y - 22);
  o += seam(g.col.x - 18, g.marquee.y + g.marquee.h + 18, g.col.x - 18, g.deck.y - 22);
  o += seam(inX1, g.marquee.y + g.marquee.h + 18, inX2, g.marquee.y + g.marquee.h + 18);
  [[inX1 + 12, g.deck.y - 36], [inX2 - 12, g.deck.y - 36], [g.col.x - 4, g.deck.y - 36], [g.col.x - 4, g.marquee.y + g.marquee.h + 34], [inX2 - 12, g.marquee.y + g.marquee.h + 34], [inX1 + 12, g.marquee.y + g.marquee.h + 34], [inX1 + 12, g.bodyH - 90], [inX2 - 12, g.bodyH - 90]]
    .forEach(([x, y], i) => { o += screw(x, y, 5, 20 + i * 37); });
  return o;
}

/** Backlit acrylic name sign. state: 'on' | 'off' */
function marquee(g, id, { name = 'NIKHIL', role = 'AI &amp; BACKEND ENGINEER', state = 'on' } = {}) {
  const m = g.marquee;
  const on = state === 'on';
  const cx = m.x + m.w / 2;
  let o = `<defs>
<linearGradient id="${id}-acr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${on ? '#fff3d0' : '#8f8676'}"/><stop offset=".5" stop-color="${on ? '#fffcee' : '#a39a88'}"/><stop offset="1" stop-color="${on ? '#ffe2a0' : '#7c7462'}"/></linearGradient>
<radialGradient id="${id}-hot" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity="${on ? 0.55 : 0}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="${id}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="${id}-ink" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
</defs>`;
  if (on) o += `<rect x="${m.x - 6}" y="${m.y - 6}" width="${m.w + 12}" height="${m.h + 12}" rx="18" fill="#fff1c0" opacity=".45" filter="url(#${id}-glow)" style="mix-blend-mode:screen"/>`;
  // chrome bezel
  o += `<rect x="${m.x - 10}" y="${m.y - 10}" width="${m.w + 20}" height="${m.h + 20}" rx="18" fill="#1a0002"/>`;
  o += `<rect x="${m.x - 7}" y="${m.y - 7}" width="${m.w + 14}" height="${m.h + 14}" rx="15" fill="url(#${id}-chromeV)"/>`;
  o += `<rect x="${m.x - 7}" y="${m.y - 7}" width="${m.w + 14}" height="${m.h + 14}" rx="15" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>`;
  // acrylic face
  o += `<rect x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="9" fill="url(#${id}-acr)"/>`;
  o += `<rect x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="9" fill="url(#${id}-hot)"/>`;
  // the two fluorescent tubes behind the acrylic, faintly visible
  if (on) [0.3, 0.72].forEach((f) => { o += `<rect x="${m.x + 26}" y="${m.y + m.h * f - 5}" width="${m.w - 52}" height="10" rx="5" fill="#fff" opacity=".45" filter="url(#${id}-ink)"/>`; });
  // name: printed red ink on the back of the acrylic (soft edge), then a crisp face
  const fs = 76;
  const txt = (fill, extra = '') => `<text x="${cx}" y="${m.y + 84}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="${fs}" letter-spacing="10" fill="${fill}"${extra}>${name}</text>`;
  o += txt('#5a0002', ` opacity=".5" transform="translate(0 3)" filter="url(#${id}-ink)"`);
  o += txt(on ? '#e3060a' : '#7a2a26');
  o += txt('none', ` stroke="#7a0004" stroke-width="1.6"`);
  // role line with rules either side
  const ry = m.y + m.h - 18;
  o += `<text x="${cx}" y="${ry}" text-anchor="middle" font-family="'Barlow Condensed', 'Arial Narrow', sans-serif" font-weight="700" font-size="17" letter-spacing="5" fill="${on ? '#7a0004' : '#4a1a18'}">${role}</text>`;
  o += `<line x1="${m.x + 40}" y1="${ry - 6}" x2="${cx - 196}" y2="${ry - 6}" stroke="#7a0004" stroke-width="1.5" opacity=".6"/><line x1="${cx + 196}" y1="${ry - 6}" x2="${m.x + m.w - 40}" y2="${ry - 6}" stroke="#7a0004" stroke-width="1.5" opacity=".6"/>`;
  // glass sheen across the acrylic
  o += `<path d="M ${m.x} ${m.y + 10} Q ${m.x} ${m.y} ${m.x + 10} ${m.y} L ${m.x + m.w * 0.55} ${m.y} L ${m.x + m.w * 0.35} ${m.y + m.h} L ${m.x + 10} ${m.y + m.h} Z" fill="#fff" opacity="${on ? 0.12 : 0.08}"/>`;
  // bezel screws
  [[m.x - 1, m.y - 1], [m.x + m.w + 1, m.y - 1], [m.x - 1, m.y + m.h + 1], [m.x + m.w + 1, m.y + m.h + 1]].forEach(([x, y], i) => { o += screw(x, y, 4, i * 45); });
  return o;
}

/** Round speaker grille (from the photo's right panel). */
function grille({ cx, cy, r }, id) {
  let o = `<circle cx="${cx}" cy="${cy + 3}" r="${r + 3}" fill="#000" opacity=".35" filter="url(#${id}-blur4)"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="#2a0002"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#chromeDisc)"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${r * 0.82}" fill="#16181b"/>`;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 360;
    o += `<g transform="translate(${cx} ${cy}) rotate(${a})"><rect x="${r * 0.3}" y="-2.2" width="${r * 0.46}" height="4.4" rx="2.2" fill="#9aa1a9"/><rect x="${r * 0.3}" y="-2.2" width="${r * 0.46}" height="1.6" rx=".8" fill="#fff" opacity=".6"/></g>`;
  }
  o += `<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="url(#chromeDisc)"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${r * 0.1}" fill="#2a2d31"/>`;
  return o;
}

/** Cylinder lock (from the photo's right panel). */
function lock({ cx, cy, r }, id) {
  let o = `<circle cx="${cx}" cy="${cy + 3}" r="${r + 3}" fill="#000" opacity=".4" filter="url(#${id}-blur4)"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${r + 1.5}" fill="#2a0002"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#chromeDisc)"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${r * 0.68}" fill="#40454c"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${r * 0.6}" fill="url(#chromeDisc)" opacity=".85"/>`;
  o += `<rect x="${cx - r * 0.1}" y="${cy - r * 0.42}" width="${r * 0.2}" height="${r * 0.84}" rx="${r * 0.1}" fill="#0d0e10"/>`;
  o += `<circle cx="${cx - r * 0.45}" cy="${cy - r * 0.5}" r="${r * 0.18}" fill="#fff" opacity=".75"/>`;
  return o;
}

/** Levelling feet + contact shadow. */
function feet(g) {
  let o = `<ellipse cx="${g.W / 2}" cy="${g.H - 4}" rx="${g.W * 0.54}" ry="16" fill="#000" opacity=".6"/>`;
  [90, g.W - 90].forEach((x) => {
    o += `<rect x="${x - 44}" y="${g.bodyH - 2}" width="88" height="${g.feetH - 10}" rx="6" fill="#0f0f12"/>`;
    o += `<rect x="${x - 44}" y="${g.bodyH - 2}" width="88" height="6" fill="#2a2a30"/>`;
    o += `<rect x="${x - 52}" y="${g.H - 14}" width="104" height="10" rx="4" fill="#1b1c20"/>`;
    o += `<rect x="${x - 52}" y="${g.H - 14}" width="104" height="2" rx="1" fill="#6a6f78" opacity=".7"/>`;
  });
  return o;
}

/** Tube ends plug into chrome electrode housings where they meet the deck. */
function tubeSockets(g, id) {
  let o = '';
  [g.outerArch.x1, g.outerArch.x2].forEach((x) => {
    const y = g.outerArch.bottom;
    o += `<rect x="${x - g.tube * 0.62}" y="${y - 6}" width="${g.tube * 1.24}" height="${34}" rx="6" fill="url(#${id}-chromeH)"/>`;
    o += `<rect x="${x - g.tube * 0.62}" y="${y + 20}" width="${g.tube * 1.24}" height="6" fill="#000" opacity=".35"/>`;
  });
  return o;
}

/**
 * The whole shell with lit tubes, ready for interior + controls on top.
 * Returns SVG content in cabinet-local coordinates (wrap in <svg viewBox="0 0 W H">).
 */
function shell(g, { id = 'mq', state = 'on', name, role, windowFill = '#000' } = {}) {
  let o = body(g, id);
  // window (interior components paint into this box)
  o += `<rect x="${g.win.x}" y="${g.win.y}" width="${g.win.w}" height="${g.win.h}" rx="22" fill="${windowFill}"/>`;
  o += N.tube({ id: `${id}-ot`, d: N.arch(g.outerArch), w: g.tube, kind: 'outer', state });
  const clipsV = [0.32, 0.55, 0.78].map((f) => g.outerArch.top + (g.outerArch.bottom - g.outerArch.top) * f);
  clipsV.forEach((y) => { o += N.clip({ x: g.outerArch.x1, y, w: g.tube, lit: state !== 'off' }); o += N.clip({ x: g.outerArch.x2, y, w: g.tube, lit: state !== 'off' }); });
  [0.3, 0.7].forEach((f) => { o += N.clip({ x: g.W * f, y: g.outerArch.top, w: g.tube, vertical: false, lit: state !== 'off' }); });
  o += tubeSockets(g, id);
  o += N.tube({ id: `${id}-it`, d: N.rrect(g.innerRect), w: g.tubeIn, kind: 'inner', state });
  o += marquee(g, id, { name, role, state });
  o += grille(g.grille, id);
  o += lock(g.lock, id);
  o += feet(g);
  return o;
}

module.exports = { defs: (id) => defs(id).replace('__BODY__', ''), shell, body, marquee, grille, lock, feet, screw, bodyPath, ENAMEL };
