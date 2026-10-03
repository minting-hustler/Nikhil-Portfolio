// COMPONENTS 04-06 — Shelf + spiral coil, can, price tag. SVG, cabinet-local coordinates.
const { interiorBox } = require('./interior.js');

const PAL = {
  yellow: { d: '#9a6a00', b: '#f7c21a', l: '#ffe680' },
  teal: { d: '#0a5a56', b: '#1fb3ad', l: '#8aefe6' },
  pink: { d: '#8a1250', b: '#ec3f96', l: '#ffa6d2' },
  blue: { d: '#10387e', b: '#2f7fe3', l: '#9cc8ff' },
  orange: { d: '#9a3a00', b: '#ff7a1c', l: '#ffc48f' },
  lime: { d: '#3f660a', b: '#8fd12f', l: '#d4f59a' },
  violet: { d: '#3d1f8e', b: '#8b5cf6', l: '#cbb6ff' },
};

// shelf layout
const ROW_TOP = 60;
const CAN_W = 116;
const CAN_H = 212;
const colX = (g, c) => g.win.x + g.win.w / 2 + (c - 1) * 186;
const plateY = (g, r) => g.win.y + ROW_TOP + r * g.rowPitch + 262;

function defs(id) {
  return `<defs>
<linearGradient id="${id}-lipFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".12" stop-color="#c9ced4"/><stop offset=".5" stop-color="#8a9098"/><stop offset=".85" stop-color="#5a5f66"/><stop offset="1" stop-color="#2a2d31"/></linearGradient>
<linearGradient id="${id}-plateTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a6f76"/><stop offset="1" stop-color="#b4bac1"/></linearGradient>
<linearGradient id="${id}-underShadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2000" stop-opacity=".55"/><stop offset="1" stop-color="#3a2000" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}-channel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050506"/><stop offset=".5" stop-color="#15171b"/><stop offset="1" stop-color="#050506"/></linearGradient>
<linearGradient id="${id}-wire" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#9aa1a9"/><stop offset="1" stop-color="#4a4f55"/></linearGradient>
<linearGradient id="${id}-alu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b6168"/><stop offset=".18" stop-color="#e9edf1"/><stop offset=".32" stop-color="#ffffff"/><stop offset=".5" stop-color="#a9b0b8"/><stop offset=".78" stop-color="#d6dbe0"/><stop offset="1" stop-color="#4b5057"/></linearGradient>
<radialGradient id="${id}-lid" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f2f5f8"/><stop offset=".6" stop-color="#aeb5bd"/><stop offset="1" stop-color="#6b7178"/></radialGradient>
<filter id="${id}-b6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="${id}-b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
${Object.entries(PAL).map(([k, p]) => `<linearGradient id="${id}-body-${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.d}"/><stop offset=".1" stop-color="${p.b}"/><stop offset=".24" stop-color="${p.l}"/><stop offset=".3" stop-color="${p.b}"/><stop offset=".66" stop-color="${p.b}"/><stop offset=".76" stop-color="#ffd84a" stop-opacity=".9"/><stop offset=".82" stop-color="${p.b}"/><stop offset="1" stop-color="${p.d}"/></linearGradient>`).join('')}
<linearGradient id="${id}-labelShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset=".14" stop-color="#000" stop-opacity="0"/><stop offset=".24" stop-color="#fff" stop-opacity=".55"/><stop offset=".34" stop-color="#fff" stop-opacity="0"/><stop offset=".76" stop-color="#ffcf30" stop-opacity=".18"/><stop offset=".86" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
</defs>`;
}

/** Spiral coil seen from the front: receding loops behind, front loop split around the can. part: 'back' | 'front' */
function coil(cx, py, part, id, s = 1) {
  const R = 64 * s; // loop radius
  const cy = py - R + 6 * s;
  let o = '';
  if (part === 'back') {
    // three receding loops, each a bit smaller and higher (toward the back wall)
    [[0.78, -22, 0.35], [0.86, -14, 0.5], [0.93, -7, 0.65]].forEach(([k, dy, a]) => {
      o += `<ellipse cx="${cx}" cy="${cy + dy * s}" rx="${R * k}" ry="${R * k}" fill="none" stroke="#5c6168" stroke-width="${4.5 * s}" opacity="${a}"/>`;
    });
    // back half of the front loop (goes behind the can)
    o += `<path d="M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none" stroke="#6a7078" stroke-width="${5 * s}"/>`;
  } else {
    // front half of the front loop, passing in front of the can's base, chrome
    o += `<path d="M ${cx + R} ${cy} A ${R} ${R} 0 0 1 ${cx - R} ${cy}" fill="none" stroke="#1a1c20" stroke-width="${7 * s}" opacity=".5" transform="translate(0 ${2 * s})"/>`;
    o += `<path d="M ${cx + R} ${cy} A ${R} ${R} 0 0 1 ${cx - R} ${cy}" fill="none" stroke="url(#${id}-wire)" stroke-width="${5.5 * s}" stroke-linecap="round"/>`;
    o += `<path d="M ${cx + R * 0.7} ${cy + R * 0.66} A ${R} ${R} 0 0 1 ${cx - R * 0.2} ${cy + R * 0.98}" fill="none" stroke="#fff" stroke-width="${1.6 * s}" opacity=".8"/>`;
  }
  return o;
}

/** One shelf plate: shadow it casts on the back wall, top surface, chrome lip + label channel. */
function shelf(g, r, id) {
  const b = interiorBox(g);
  const py = plateY(g, r);
  const depth = 30;
  let o = '';
  o += `<rect x="${b.bx1}" y="${py + 2}" width="${b.bx2 - b.bx1}" height="70" fill="url(#${id}-underShadow)"/>`;
  o += `<polygon points="${b.x},${py} ${b.x + b.w},${py} ${b.bx2 + 6},${py - depth} ${b.bx1 - 6},${py - depth}" fill="url(#${id}-plateTop)"/>`;
  // slots in the tray between coils
  [0.5, 1.5].forEach((k) => {
    const x = g.win.x + g.win.w / 2 + (k - 1) * 186;
    o += `<polygon points="${x - 3},${py} ${x + 3},${py} ${x + 2},${py - depth} ${x - 2},${py - depth}" fill="#3a3e44" opacity=".6"/>`;
  });
  // front lip: chrome top edge, black label channel, chrome bottom edge
  o += `<rect x="${b.x}" y="${py}" width="${b.w}" height="8" fill="url(#${id}-lipFace)"/>`;
  o += `<rect x="${b.x}" y="${py + 8}" width="${b.w}" height="36" fill="url(#${id}-channel)"/>`;
  o += `<rect x="${b.x}" y="${py + 44}" width="${b.w}" height="5" fill="#8a9098"/>`;
  o += `<rect x="${b.x}" y="${py + 49}" width="${b.w}" height="8" fill="#000" opacity=".45" filter="url(#${id}-b2)"/>`;
  return o;
}

function glyph(kind, cx, cy, size, color) {
  const s = size;
  switch (kind) {
    case 'circle': return `<circle cx="${cx}" cy="${cy}" r="${s / 2}" fill="${color}"/>`;
    case 'ring': return `<circle cx="${cx}" cy="${cy}" r="${s / 2 - 3}" fill="none" stroke="${color}" stroke-width="6"/>`;
    case 'diamond': return `<rect x="${cx - s * 0.36}" y="${cy - s * 0.36}" width="${s * 0.72}" height="${s * 0.72}" fill="${color}" transform="rotate(45 ${cx} ${cy})"/>`;
    case 'bars': return `<rect x="${cx - 13}" y="${cy + s * 0.05}" width="7" height="${s * 0.45}" fill="${color}"/><rect x="${cx - 3.5}" y="${cy - s * 0.5}" width="7" height="${s}" fill="${color}"/><rect x="${cx + 6}" y="${cy - s * 0.2}" width="7" height="${s * 0.7}" fill="${color}"/>`;
    case 'tri': return `<polygon points="${cx},${cy - s * 0.5} ${cx + s * 0.52},${cy + s * 0.42} ${cx - s * 0.52},${cy + s * 0.42}" fill="${color}"/>`;
    case 'plus': return `<rect x="${cx - s * 0.13}" y="${cy - s / 2}" width="${s * 0.26}" height="${s}" fill="${color}"/><rect x="${cx - s / 2}" y="${cy - s * 0.13}" width="${s}" height="${s * 0.26}" fill="${color}"/>`;
    default: return '';
  }
}

/**
 * Aluminum can, front view. (cx, baseY) = bottom center on the shelf. s = scale.
 * opts: { dim, lift, selected }
 */
function can(p, cx, baseY, id, s = 1, { dim = false, selected = false } = {}) {
  const pal = PAL[p.color];
  const w = CAN_W * s;
  const h = CAN_H * s;
  const x = cx - w / 2;
  const y = baseY - h;
  const e = 9 * s; // ellipse half-height for the top/bottom perspective
  let o = `<g${dim ? ' opacity=".32"' : ''}>`;
  // contact shadow on the shelf
  o += `<ellipse cx="${cx}" cy="${baseY - 2 * s}" rx="${w * 0.52}" ry="${7 * s}" fill="#000" opacity=".45" filter="url(#${id}-b2)"/>`;
  if (selected) o += `<ellipse cx="${cx}" cy="${baseY - h * 0.45}" rx="${w * 0.95}" ry="${h * 0.62}" fill="#ffe04a" opacity=".5" filter="url(#${id}-b6)"/>`;
  // bottom dome (aluminum)
  o += `<path d="M ${x + 8 * s} ${baseY - 14 * s} L ${x + w - 8 * s} ${baseY - 14 * s} Q ${x + w - 10 * s} ${baseY - 2 * s} ${cx} ${baseY} Q ${x + 10 * s} ${baseY - 2 * s} ${x + 8 * s} ${baseY - 14 * s} Z" fill="url(#${id}-alu)"/>`;
  // body cylinder
  const by1 = y + 30 * s;
  const by2 = baseY - 14 * s;
  o += `<path d="M ${x} ${by1} L ${x + w} ${by1} L ${x + w} ${by2} Q ${cx} ${by2 + e} ${x} ${by2} Z" fill="url(#${id}-body-${p.color})"/>`;
  // shoulder / neck taper (aluminum)
  const ny = y + 12 * s;
  o += `<path d="M ${x} ${by1 + 1} C ${x} ${by1 - 10 * s} ${x + 12 * s} ${ny + 4 * s} ${x + 14 * s} ${ny} L ${x + w - 14 * s} ${ny} C ${x + w - 12 * s} ${ny + 4 * s} ${x + w} ${by1 - 10 * s} ${x + w} ${by1 + 1} Z" fill="url(#${id}-alu)"/>`;
  // lid seen slightly from above: rim ellipse + recessed lid + pull tab
  o += `<ellipse cx="${cx}" cy="${ny}" rx="${w / 2 - 14 * s}" ry="${e}" fill="url(#${id}-alu)"/>`;
  o += `<ellipse cx="${cx}" cy="${ny + 1 * s}" rx="${w / 2 - 20 * s}" ry="${e - 3 * s}" fill="url(#${id}-lid)"/>`;
  o += `<rect x="${cx - 12 * s}" y="${ny - 3 * s}" width="${24 * s}" height="${7 * s}" rx="${3.5 * s}" fill="#c9cfd5" stroke="#6b7178" stroke-width="${0.8 * s}"/>`;
  o += `<ellipse cx="${cx + 4 * s}" cy="${ny + 0.5 * s}" rx="${4 * s}" ry="${2 * s}" fill="#6b7178"/>`;
  // wrapped cream label band: curved top and bottom edges follow the cylinder
  const ly1 = y + 66 * s;
  const ly2 = y + 170 * s;
  const curve = 7 * s;
  o += `<path d="M ${x} ${ly1} Q ${cx} ${ly1 + curve} ${x + w} ${ly1} L ${x + w} ${ly2} Q ${cx} ${ly2 + curve} ${x} ${ly2} Z" fill="#f6efdc"/>`;
  // print on the label
  o += `<text x="${cx}" y="${ly1 + 32 * s}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="${25 * s}" fill="${pal.d}">${p.code}</text>`;
  o += glyph(p.glyph, cx, ly1 + 55 * s, 24 * s, pal.b);
  o += `<text x="${cx}" y="${ly1 + 88 * s}" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="${11.5 * s}" letter-spacing="${0.6 * s}" fill="#1a1418">${p.name}</text>`;
  // thin colored pinstripes at the label edges
  o += `<path d="M ${x} ${ly1 + 5 * s} Q ${cx} ${ly1 + curve + 5 * s} ${x + w} ${ly1 + 5 * s}" fill="none" stroke="${pal.b}" stroke-width="${2 * s}"/>`;
  o += `<path d="M ${x} ${ly2 - 5 * s} Q ${cx} ${ly2 + curve - 5 * s} ${x + w} ${ly2 - 5 * s}" fill="none" stroke="${pal.b}" stroke-width="${2 * s}"/>`;
  // cylinder shading over body + label: dark edges, broad highlight, sharp specular, warm wall reflection
  o += `<path d="M ${x} ${by1} L ${x + w} ${by1} L ${x + w} ${by2} Q ${cx} ${by2 + e} ${x} ${by2} Z" fill="url(#${id}-labelShade)"/>`;
  o += `<rect x="${x + w * 0.2}" y="${by1 + 6 * s}" width="${3.2 * s}" height="${by2 - by1 - 10 * s}" rx="${1.6 * s}" fill="#fff" opacity=".85"/>`;
  o += `<rect x="${x + w * 0.27}" y="${by1 + 10 * s}" width="${1.4 * s}" height="${by2 - by1 - 20 * s}" rx="${0.7 * s}" fill="#fff" opacity=".45"/>`;
  o += `</g>`;
  return o;
}

/** Price tag in the shelf's label channel. state: 'idle' | 'selected' | 'taken' */
function tag(g, p, r, c, id, state = 'idle') {
  const py = plateY(g, r);
  const w = 150;
  const h = 28;
  const x = colX(g, c) - w / 2;
  const y = py + 12;
  const sel = state === 'selected';
  const taken = state === 'taken';
  let o = '';
  if (sel) o += `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="8" fill="#ffd21f" opacity=".6" filter="url(#${id}-b6)"/>`;
  // acrylic tag: cream insert behind clear plastic
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${sel ? '#ffd21f' : taken ? '#3a3d42' : '#f4eddc'}"/>`;
  o += `<rect x="${x + 4}" y="${y + 4}" width="36" height="${h - 8}" rx="3" fill="${sel ? '#141018' : taken ? '#5a5d62' : '#ffd21f'}"/>`;
  o += `<text x="${x + 22}" y="${y + 19}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="12" fill="${sel ? '#ffd21f' : '#141018'}">${p.code}</text>`;
  const nm = taken ? 'SOLD OUT' : p.short;
  o += `<text x="${x + 48}" y="${y + 19}" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="13" letter-spacing="1" fill="${sel ? '#141018' : taken ? '#9a9da2' : '#141018'}">${nm}</text>`;
  // clear plastic sheen over the tag
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h / 2}" rx="4" fill="#fff" opacity=".22"/>`;
  return o;
}

/** A whole row: shelf, back coil halves, cans, front coil halves, tags. */
function shelfRow(g, r, projects, id, st = {}) {
  const py = plateY(g, r);
  let o = shelf(g, r, id);
  projects.forEach((p) => {
    const cx = colX(g, p.col);
    const taken = (st.taken || []).includes(p.code);
    const selected = st.selected === p.code;
    const dim = st.filter && st.filter !== 'ALL' && p.cat !== st.filter;
    o += coil(cx, py - 2, 'back', id);
    if (!taken) {
      o += can(p, cx, py - 4 - (selected ? 10 : 0), id, 1, { selected, dim });
    }
    o += coil(cx, py - 2, 'front', id);
  });
  projects.forEach((p) => {
    const taken = (st.taken || []).includes(p.code);
    const dim = st.filter && st.filter !== 'ALL' && p.cat !== st.filter;
    o += dim ? `<g opacity=".4">${tag(g, p, r, p.col, id, taken ? 'taken' : 'idle')}</g>` : tag(g, p, r, p.col, id, taken ? 'taken' : st.selected === p.code ? 'selected' : 'idle');
  });
  return o;
}

module.exports = { defs, shelf, shelfRow, can, coil, tag, PAL, colX, plateY, CAN_W, CAN_H };
