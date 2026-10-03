// COMPONENT 03 — Interior: the box behind the glass. Yellow painted steel (your photo's
// #fae106 / #efd402), ribbed back wall, perforated shelf rails, a real fluorescent tube
// with end caps in the ceiling. Cabinet-local coordinates, clipped to the window.

function interiorBox(g) {
  const { x, y, w, h } = g.win;
  const d = 58; // side wall depth (perspective)
  const ceil = 46;
  const floor = 34;
  return { x, y, w, h, d, ceil, floor, bx1: x + d, bx2: x + w - d, by1: y + ceil, by2: y + h - floor };
}

function defs(id, b) {
  return `<defs>
<clipPath id="${id}-win"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="22"/></clipPath>
<linearGradient id="${id}-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd83a"/><stop offset=".08" stop-color="#f4c21c"/><stop offset=".5" stop-color="#e0a810"/><stop offset="1" stop-color="#9a6604"/></linearGradient>
<linearGradient id="${id}-backH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".18" stop-color="#000" stop-opacity="0"/><stop offset=".82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
<linearGradient id="${id}-sideL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe64a"/><stop offset=".45" stop-color="#f4c010"/><stop offset="1" stop-color="#b87e02"/></linearGradient>
<linearGradient id="${id}-sideR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffe64a"/><stop offset=".45" stop-color="#f4c010"/><stop offset="1" stop-color="#b87e02"/></linearGradient>
<linearGradient id="${id}-sideV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4a0" stop-opacity=".25"/><stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#5a3000" stop-opacity=".35"/></linearGradient>
<linearGradient id="${id}-ceil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3c04"/><stop offset="1" stop-color="#b8860c"/></linearGradient>
<linearGradient id="${id}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5204"/><stop offset="1" stop-color="#c8900c"/></linearGradient>
<linearGradient id="${id}-tube" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8fbff"/><stop offset=".35" stop-color="#ffffff"/><stop offset=".7" stop-color="#d8f4ff"/><stop offset="1" stop-color="#9fd8ea"/></linearGradient>
<linearGradient id="${id}-cap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".45" stop-color="#8f969e"/><stop offset="1" stop-color="#3b3f45"/></linearGradient>
<linearGradient id="${id}-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2fcff" stop-opacity=".32"/><stop offset="1" stop-color="#e6fbff" stop-opacity="0"/></linearGradient>
<filter id="${id}-b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="${id}-b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="${id}-b30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
</defs>`;
}

/** Back wall, side walls with rails, ceiling light, floor. Shelves (C04) paint on top. */
function interior(g, { id = 'in', light = 'on' } = {}) {
  const b = interiorBox(g);
  const on = light === 'on';
  let o = defs(id, b);
  o += `<g clip-path="url(#${id}-win)">`;
  // back wall + vertical ribs
  o += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="url(#${id}-back)"/>`;
  let ribs = '';
  for (let x = b.bx1 + 12; x < b.bx2; x += 24) {
    ribs += `<rect x="${x}" y="${b.by1}" width="2" height="${b.by2 - b.by1}" fill="#fff6c0" opacity=".35"/><rect x="${x + 2}" y="${b.by1}" width="2" height="${b.by2 - b.by1}" fill="#6a4000" opacity=".22"/>`;
  }
  o += ribs;
  o += `<rect x="${b.bx1}" y="${b.by1}" width="${b.bx2 - b.bx1}" height="${b.by2 - b.by1}" fill="url(#${id}-backH)"/>`;
  // side walls (trapezoids)
  const L = `${b.x},${b.y} ${b.bx1},${b.by1} ${b.bx1},${b.by2} ${b.x},${b.y + b.h}`;
  const R = `${b.x + b.w},${b.y} ${b.bx2},${b.by1} ${b.bx2},${b.by2} ${b.x + b.w},${b.y + b.h}`;
  o += `<polygon points="${L}" fill="url(#${id}-sideL)"/><polygon points="${L}" fill="url(#${id}-sideV)"/>`;
  o += `<polygon points="${R}" fill="url(#${id}-sideR)"/><polygon points="${R}" fill="url(#${id}-sideV)"/>`;
  // corner shadow lines where side walls meet the back wall
  o += `<line x1="${b.bx1}" y1="${b.by1}" x2="${b.bx1}" y2="${b.by2}" stroke="#6a4000" stroke-width="2" opacity=".55"/>`;
  o += `<line x1="${b.bx2}" y1="${b.by1}" x2="${b.bx2}" y2="${b.by2}" stroke="#6a4000" stroke-width="2" opacity=".55"/>`;
  // perforated shelf rails on each side wall, near the back corner
  const rail = (xa, xb, dir) => {
    let r = `<rect x="${Math.min(xa, xb)}" y="${b.by1 + 10}" width="${Math.abs(xb - xa)}" height="${b.by2 - b.by1 - 20}" fill="#d9a410" opacity=".6"/>`;
    for (let y = b.by1 + 22; y < b.by2 - 20; y += 18) {
      r += `<rect x="${(xa + xb) / 2 - 2.5}" y="${y}" width="5" height="10" rx="1.5" fill="#3a2400" opacity=".75"/><rect x="${(xa + xb) / 2 - 2.5 + dir}" y="${y + 1}" width="5" height="1.5" fill="#fff" opacity=".4"/>`;
    }
    return r;
  };
  o += rail(b.bx1 - 22, b.bx1 - 8, 1);
  o += rail(b.bx2 + 8, b.bx2 + 22, -1);
  // ceiling + fluorescent tube
  const C = `${b.x},${b.y} ${b.x + b.w},${b.y} ${b.bx2},${b.by1} ${b.bx1},${b.by1}`;
  o += `<polygon points="${C}" fill="${on ? `url(#${id}-ceil)` : '#8a7a3a'}"/>`;
  const tx1 = b.bx1 + 20;
  const tx2 = b.bx2 - 20;
  const ty = b.y + 14;
  if (on) o += `<rect x="${tx1}" y="${ty - 10}" width="${tx2 - tx1}" height="34" rx="14" fill="#e6fbff" opacity=".9" filter="url(#${id}-b8)"/>`;
  o += `<rect x="${tx1}" y="${ty}" width="${tx2 - tx1}" height="13" rx="6.5" fill="${on ? `url(#${id}-tube)` : '#c8c4b4'}"/>`;
  o += `<rect x="${tx1 + 6}" y="${ty + 3}" width="${tx2 - tx1 - 12}" height="2" rx="1" fill="#fff" opacity=".9"/>`;
  [tx1 - 10, tx2 - 4].forEach((cx) => {
    o += `<rect x="${cx}" y="${ty - 2}" width="14" height="17" rx="3" fill="url(#${id}-cap)"/>`;
    o += `<rect x="${cx + (cx < tx1 ? -6 : 14)}" y="${ty + 2}" width="6" height="9" rx="1" fill="#2a2d31"/>`;
  });
  // cool light spill down the back wall from the tube
  if (on) o += `<rect x="${b.bx1}" y="${b.by1}" width="${b.bx2 - b.bx1}" height="260" fill="url(#${id}-spill)"/>`;
  // floor of the compartment
  const Fl = `${b.bx1},${b.by2} ${b.bx2},${b.by2} ${b.x + b.w},${b.y + b.h} ${b.x},${b.y + b.h}`;
  o += `<polygon points="${Fl}" fill="url(#${id}-floor)"/>`;
  // inner vignette so the edges fall into shadow
  o += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="22" fill="none" stroke="#3a1c00" stroke-width="36" opacity=".35" filter="url(#${id}-b30)"/>`;
  o += `</g>`;
  return o;
}

module.exports = { interior, interiorBox };
