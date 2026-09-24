// COMPONENTS 08-09 — The lower deck: control strip (keypad, LCD, receipt printer) and
// delivery bay (flap + tray), kick plate, maker's badge. Cabinet-local coordinates.
const S = require('./shelf.js');

function deckBoxes(g) {
  const x1 = g.tc + g.tube / 2 + 30; // inside the outer tube channel
  const x2 = g.W - g.tc - g.tube / 2 - 30;
  const y = g.deck.y;
  const strip = { x: x1, y: y + 14, w: x2 - x1, h: 132 };
  const keys = { x: strip.x + 26, y: strip.y + 40, kw: 64, kh: 58, gap: 14 };
  const lcd = { x: strip.x + 26 + 4 * 64 + 3 * 14 + 28, y: strip.y + 34, w: 212, h: 62 };
  const printer = { x: lcd.x + lcd.w + 24, y: strip.y + 30, w: strip.x + strip.w - (lcd.x + lcd.w + 30) - 24, h: 76 };
  const bay = { x: x1 + 40, y: strip.y + strip.h + 36, w: x2 - x1 - 80, h: 250 };
  const kick = { x: x1, y: bay.y + bay.h + 30, w: x2 - x1, h: 70 };
  return { x1, x2, strip, keys, lcd, printer, bay, kick };
}

function defs(id) {
  return `<defs>
<linearGradient id="${id}-anod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1e22"/><stop offset=".5" stop-color="#101114"/><stop offset="1" stop-color="#08090b"/></linearGradient>
<linearGradient id="${id}-trim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".2" stop-color="#b9c0c7"/><stop offset=".5" stop-color="#5d636b"/><stop offset=".65" stop-color="#9aa1a9"/><stop offset=".9" stop-color="#e2e6ea"/><stop offset="1" stop-color="#4b5057"/></linearGradient>
<linearGradient id="${id}-keyTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5f68"/><stop offset=".12" stop-color="#3a3e46"/><stop offset=".6" stop-color="#23262c"/><stop offset="1" stop-color="#15171b"/></linearGradient>
<linearGradient id="${id}-keyTopP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2d33"/><stop offset="1" stop-color="#15171b"/></linearGradient>
<linearGradient id="${id}-keySide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0d10"/><stop offset="1" stop-color="#000"/></linearGradient>
<linearGradient id="${id}-lcd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140a02"/><stop offset="1" stop-color="#0a0501"/></linearGradient>
<linearGradient id="${id}-smoke" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f48" stop-opacity=".92"/><stop offset=".5" stop-color="#1c1f25" stop-opacity=".92"/><stop offset="1" stop-color="#0c0d10" stop-opacity=".95"/></linearGradient>
<linearGradient id="${id}-cav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020203"/><stop offset=".55" stop-color="#0e1014"/><stop offset="1" stop-color="#23262c"/></linearGradient>
<linearGradient id="${id}-paper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8e0cc"/><stop offset=".2" stop-color="#fbf7ec"/><stop offset=".8" stop-color="#f6f0e0"/><stop offset="1" stop-color="#ddd4bf"/></linearGradient>
<radialGradient id="${id}-scr" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#cfd5db"/><stop offset=".7" stop-color="#7c838b"/><stop offset="1" stop-color="#3b3f45"/></radialGradient>
<radialGradient id="${id}-trayGlow" cx=".5" cy=".85" r=".6"><stop offset="0" stop-color="#ffd84a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient>
<filter id="${id}-b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="${id}-b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter>
</defs>`;
}

const scr = (x, y, id, r = 4.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-scr)"/><line x1="${x - r * 0.5}" y1="${y}" x2="${x + r * 0.5}" y2="${y}" stroke="#4a4f55" stroke-width="1.2"/>`;

const ICON = {
  ABOUT: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  SKILLS: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  RESUME: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',
  CONTACT: '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/>',
};
const KEYS = ['ABOUT', 'SKILLS', 'RESUME', 'CONTACT'];

/** One tactile key. state: 'idle' | 'hover' | 'pressed' */
function key(x, y, w, h, name, id, state = 'idle') {
  const p = state === 'pressed';
  const hov = state === 'hover';
  const d = p ? 2 : 6; // visible side depth
  let o = '';
  // LED above
  const lit = p || hov;
  o += `<circle cx="${x + w / 2}" cy="${y - 20}" r="3.2" fill="${lit ? '#ffb52e' : '#3a2408'}"/>`;
  if (lit) o += `<circle cx="${x + w / 2}" cy="${y - 20}" r="7" fill="#ffb52e" opacity=".5" filter="url(#${id}-b4)"/>`;
  // silkscreened label above the key
  o += `<text x="${x + w / 2}" y="${y - 7}" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="10.5" letter-spacing="1.6" fill="#d9d4c8">${name}</text>`;
  // well the key sits in
  o += `<rect x="${x - 4}" y="${y - 2}" width="${w + 8}" height="${h + 8}" rx="9" fill="#000"/>`;
  // key side + top
  o += `<rect x="${x}" y="${y + (p ? 3 : 0)}" width="${w}" height="${h}" rx="7" fill="url(#${id}-keySide)"/>`;
  o += `<rect x="${x}" y="${y + (p ? 3 : 0)}" width="${w}" height="${h - d}" rx="7" fill="url(#${id}-${p ? 'keyTopP' : 'keyTop'})"/>`;
  o += `<rect x="${x + 1}" y="${y + (p ? 3 : 0) + 1}" width="${w - 2}" height="${h - d - 2}" rx="6" fill="none" stroke="#fff" stroke-opacity="${p ? 0.08 : 0.22}"/>`;
  // concave dish highlight
  o += `<ellipse cx="${x + w / 2}" cy="${y + (p ? 3 : 0) + (h - d) * 0.3}" rx="${w * 0.34}" ry="${(h - d) * 0.14}" fill="#fff" opacity="${p ? 0.04 : 0.1}"/>`;
  // engraved icon: dark cut + light lower edge, glows amber when lit
  const ic = (stroke, dy, op) => `<g transform="translate(${x + w / 2 - 11} ${y + (p ? 3 : 0) + (h - d) / 2 - 11 + dy})" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="${op}">${ICON[name]}</g>`;
  o += ic('#fff', 1, 0.18) + ic(lit ? '#ffb52e' : '#0a0b0d', 0, 1);
  if (lit) o += `<g filter="url(#${id}-b1)">${ic('#ffb52e', 0, 0.8)}</g>`;
  return o;
}

/** Amber 14-segment style LCD with unlit segment ghosts. */
function lcd(box, text, id, { on = true } = {}) {
  const { x, y, w, h } = box;
  let o = `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="8" fill="url(#${id}-trim)"/>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#${id}-lcd)"/>`;
  const fs = 25;
  const ty = y + h / 2 + fs * 0.36;
  const n = 11;
  const ghost = '8'.repeat(n);
  const mono = "'Share Tech Mono', 'DejaVu Sans Mono', monospace";
  o += `<text x="${x + w / 2}" y="${ty}" text-anchor="middle" font-family="${mono}" font-size="${fs}" letter-spacing="2" fill="#ffb52e" opacity=".07">${ghost}</text>`;
  if (on) {
    const t = text.padEnd(n, ' ').slice(0, n).replace(/ /g, '&#160;');
    o += `<text x="${x + w / 2}" y="${ty}" text-anchor="middle" font-family="${mono}" font-size="${fs}" letter-spacing="2" fill="#ffb52e" opacity=".9" filter="url(#${id}-b4)">${t}</text>`;
    o += `<text x="${x + w / 2}" y="${ty}" text-anchor="middle" font-family="${mono}" font-size="${fs}" letter-spacing="2" fill="#ffd27a">${t}</text>`;
  }
  // scanlines + glass
  for (let yy = y + 2; yy < y + h; yy += 3) o += `<rect x="${x}" y="${yy}" width="${w}" height="1" fill="#000" opacity=".22"/>`;
  o += `<polygon points="${x},${y} ${x + w * 0.5},${y} ${x + w * 0.35},${y + h} ${x},${y + h}" fill="#fff" opacity=".06"/>`;
  return o;
}

/** Receipt printer slot, optionally with paper extruding (0..1 of its length). */
function printer(box, id, { paper = 0, paperText = [] } = {}) {
  const { x, y, w, h } = box;
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#${id}-trim)"/>`;
  o += `<rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="5" fill="url(#${id}-anod)"/>`;
  o += `<text x="${x + 14}" y="${y + 22}" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="10.5" letter-spacing="1.6" fill="#d9d4c8">RECEIPT</text>`;
  o += `<circle cx="${x + w - 18}" cy="${y + 18}" r="3.2" fill="${paper > 0 ? '#3cff8a' : '#0f3a1f'}"/>`;
  // slot + serrated tear bar
  const sy = y + h - 26;
  o += `<rect x="${x + 14}" y="${sy}" width="${w - 28}" height="10" rx="3" fill="#000"/>`;
  let zz = `M ${x + 14} ${sy + 12}`;
  for (let xx = x + 14; xx < x + w - 14; xx += 6) zz += ` L ${xx + 3} ${sy + 15} L ${xx + 6} ${sy + 12}`;
  o += `<path d="${zz}" fill="none" stroke="#c9cfd5" stroke-width="1.3"/>`;
  if (paper > 0) {
    const pl = 300 * paper;
    o += `<rect x="${x + 22}" y="${sy + 5}" width="${w - 44}" height="${pl}" fill="#000" opacity=".4" filter="url(#${id}-b4)" transform="translate(4 6)"/>`;
    o += `<rect x="${x + 22}" y="${sy + 5}" width="${w - 44}" height="${pl}" fill="url(#${id}-paper)"/>`;
    paperText.forEach((t, i) => {
      if (sy + 26 + i * 16 < sy + pl) o += `<text x="${x + 32}" y="${sy + 26 + i * 16}" font-family="'Share Tech Mono','DejaVu Sans Mono',monospace" font-size="9.5" fill="#2a2420">${t}</text>`;
    });
  }
  return o;
}

/** Delivery bay: tray cavity, cans in it, smoked flap. open: 0..1 */
function bay(box, id, { open = 0, cans = [], flap = true } = {}) {
  const { x, y, w, h } = box;
  let o = '';
  // chrome frame
  o += `<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" rx="16" fill="url(#${id}-trim)"/>`;
  o += `<rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" rx="10" fill="#050506"/>`;
  // cavity
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#${id}-cav)"/>`;
  if (cans.length) o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#${id}-trayGlow)"/>`;
  o += `<rect x="${x}" y="${y + h - 16}" width="${w}" height="16" rx="4" fill="#5d636b"/><rect x="${x}" y="${y + h - 16}" width="${w}" height="2" fill="#c9cfd5"/>`;
  // cans lying on their side
  cans.forEach((p, i) => {
    const s = 0.62;
    const cx = x + w / 2 - ((cans.length - 1) * 120) / 2 + i * 120 + ((i * 37) % 9) - 4;
    const cy = y + h - 16 - (S.CAN_W * s) / 2;
    const rot = 90 + (((i * 53) % 7) - 3);
    o += `<g transform="rotate(${rot} ${cx} ${cy})">${S.can(p, cx, cy + (S.CAN_H * s) / 2, `${id}s`, s)}</g>`;
  });
  // smoked acrylic flap on a piano hinge at the top. open folds it inward (upward), shown as
  // a shrinking height with a darkening, perspective-ish lower edge
  const fh = h * (1 - open * 0.86);
  if (flap && fh > 0) {
    o += `<g>`;
    o += `<rect x="${x}" y="${y}" width="${w}" height="${fh}" rx="8" fill="url(#${id}-smoke)"/>`;
    o += `<rect x="${x}" y="${y}" width="${w}" height="${fh}" rx="8" fill="none" stroke="#fff" stroke-opacity=".18"/>`;
    o += `<polygon points="${x + w * 0.08},${y} ${x + w * 0.3},${y} ${x + w * 0.16},${y + fh} ${x - w * 0.06},${y + fh}" fill="#fff" opacity=".07"/>`;
    o += `<polygon points="${x + w * 0.34},${y} ${x + w * 0.37},${y} ${x + w * 0.23},${y + fh} ${x + w * 0.2},${y + fh}" fill="#fff" opacity=".08"/>`;
    if (open < 0.3) {
      const ty = y + fh * 0.58;
      o += `<text x="${x + w / 2}" y="${ty + 1.5}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="30" letter-spacing="14" fill="#000" opacity=".6">PUSH</text>`;
      o += `<text x="${x + w / 2}" y="${ty}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="30" letter-spacing="14" fill="#5a606a" opacity=".85">PUSH</text>`;
      o += `<text x="${x + w / 2}" y="${ty - 1}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="30" letter-spacing="14" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width=".8">PUSH</text>`;
    }
    o += `</g>`;
  }
  // piano hinge
  o += `<rect x="${x}" y="${y - 6}" width="${w}" height="10" rx="3" fill="url(#${id}-trim)"/>`;
  for (let xx = x + 20; xx < x + w; xx += 40) o += `<rect x="${xx}" y="${y - 6}" width="1.5" height="10" fill="#3b3f45"/>`;
  return o;
}

/** Kick plate: vent slots + maker's badge. */
function kick(box, id) {
  const { x, y, w, h } = box;
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#${id}-anod)"/>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="#fff" stroke-opacity=".12"/>`;
  for (let i = 0; i < 18; i++) {
    const sx = x + 30 + i * 20;
    o += `<rect x="${sx}" y="${y + 16}" width="8" height="${h - 32}" rx="4" fill="#000"/><rect x="${sx}" y="${y + h - 17}" width="8" height="1.2" fill="#fff" opacity=".2"/>`;
  }
  const bx = x + w - 250;
  const by = y + 14;
  o += `<rect x="${bx}" y="${by}" width="220" height="${h - 28}" rx="5" fill="url(#${id}-trim)"/>`;
  o += `<text x="${bx + 110}" y="${by + 18}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="12" letter-spacing="2" fill="#2a2d31">NIKHIL MFG. CO.</text>`;
  o += `<text x="${bx + 110}" y="${by + 33}" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="9.5" letter-spacing="2" fill="#3b3f45">MODEL 2026 · 12 SLOT · 1 COIN</text>`;
  o += scr(bx + 10, by + (h - 28) / 2, id, 3.2) + scr(bx + 210, by + (h - 28) / 2, id, 3.2);
  return o;
}

/**
 * Whole deck. st: { lcd: 'READY', keyState: {ABOUT:'hover'}, open: 0..1, trayCans: [projects], paper, paperText }
 */
function deck(g, id = 'dk', st = {}) {
  const b = deckBoxes(g);
  let o = defs(id) + S.defs(`${id}s`);
  // control strip: anodized panel inside a chrome trim
  const s = b.strip;
  o += `<rect x="${s.x - 6}" y="${s.y - 6}" width="${s.w + 12}" height="${s.h + 12}" rx="14" fill="url(#${id}-trim)"/>`;
  o += `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="10" fill="url(#${id}-anod)"/>`;
  o += `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="10" fill="none" stroke="#fff" stroke-opacity=".1"/>`;
  [[s.x + 12, s.y + 12], [s.x + s.w - 12, s.y + 12], [s.x + 12, s.y + s.h - 12], [s.x + s.w - 12, s.y + s.h - 12]].forEach(([a, c]) => { o += scr(a, c, id, 4); });
  KEYS.forEach((k, i) => { o += key(b.keys.x + i * (b.keys.kw + b.keys.gap), b.keys.y, b.keys.kw, b.keys.kh, k, id, (st.keyState || {})[k] || 'idle'); });
  o += lcd(b.lcd, st.lcd ?? 'READY', id, { on: st.lcdOn !== false });
  o += printer(b.printer, id, { paper: st.paper || 0, paperText: st.paperText || [] });
  o += bay(b.bay, id, { open: st.open || 0, cans: st.trayCans || [] });
  o += kick(b.kick, id);
  return o;
}

module.exports = { scr, deck, deckBoxes, key, lcd, printer, bay, kick, defs, KEYS };
