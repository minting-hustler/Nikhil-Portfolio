// COMPONENT 07 — The coin, the coin mechanism on the cabinet, and the wallet HUD.

let uid = 0;
/**
 * Minted brass coin. turn: 0 = face-on, 1 = fully edge-on (a thin reeded band).
 * The face is an ellipse squashed by (1 - turn); the reeded edge band grows on the right.
 */
function coin(cx, cy, r, { turn = 0, id } = {}) {
  const k = id || `cn${uid++}`;
  const sx = Math.max(0.06, 1 - turn);
  const edgeW = r * 0.22 * Math.sin(turn * Math.PI / 2);
  let o = `<defs>
<radialGradient id="${k}-f" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#fff6b8"/><stop offset=".35" stop-color="#ffd23a"/><stop offset=".75" stop-color="#d49a00"/><stop offset="1" stop-color="#8a5a00"/></radialGradient>
<linearGradient id="${k}-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a00"/><stop offset=".3" stop-color="#ffe070"/><stop offset=".6" stop-color="#c88a00"/><stop offset="1" stop-color="#6a4200"/></linearGradient>
<pattern id="${k}-reed" width="3" height="${r * 2}" patternUnits="userSpaceOnUse"><rect width="1.4" height="${r * 2}" fill="#6a4200" opacity=".55"/></pattern>
</defs>`;
  o += `<ellipse cx="${cx + edgeW * 0.5}" cy="${cy + r * 0.12}" rx="${r * sx + edgeW}" ry="${r}" fill="#000" opacity=".3"/>`;
  if (edgeW > 0.5) {
    o += `<rect x="${cx}" y="${cy - r}" width="${edgeW + r * sx * 0.02}" height="${r * 2}" rx="${Math.min(edgeW, r * sx) * 0.5}" fill="url(#${k}-e)"/>`;
    o += `<rect x="${cx}" y="${cy - r}" width="${edgeW}" height="${r * 2}" fill="url(#${k}-reed)"/>`;
    o += `<ellipse cx="${cx + edgeW}" cy="${cy}" rx="${r * sx}" ry="${r}" fill="url(#${k}-e)"/>`;
  }
  o += `<g transform="translate(${cx} ${cy}) scale(${sx} 1)">`;
  o += `<circle r="${r}" fill="url(#${k}-f)"/>`;
  o += `<circle r="${r * 0.86}" fill="none" stroke="#8a5a00" stroke-width="${r * 0.05}" opacity=".6"/>`;
  o += `<circle r="${r * 0.82}" fill="none" stroke="#fff4b0" stroke-width="${r * 0.03}" opacity=".7"/>`;
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    o += `<circle cx="${Math.cos(a) * r * 0.93}" cy="${Math.sin(a) * r * 0.93}" r="${r * 0.035}" fill="#8a5a00" opacity=".5"/>`;
  }
  // embossed monogram: shadow, face, highlight
  const t = (fill, dx, dy, op) => `<text x="${dx}" y="${r * 0.3 + dy}" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="${r * 0.95}" fill="${fill}" opacity="${op}">N</text>`;
  o += t('#6a4200', r * 0.03, r * 0.04, 0.7) + t('#f0b41a', 0, 0, 1) + t('#fff8c8', -r * 0.02, -r * 0.03, 0.35);
  o += `<ellipse cx="${-r * 0.35}" cy="${-r * 0.45}" rx="${r * 0.32}" ry="${r * 0.14}" fill="#fff" opacity=".45" transform="rotate(-30 ${-r * 0.35} ${-r * 0.45})"/>`;
  o += `</g>`;
  return o;
}

/**
 * Coin mechanism plate, in cabinet-local coordinates (box from geo2 g.coin).
 * state: 'idle' | 'armed' | 'accepting' | 'returnPressed'
 */
function coinMech(box, { state = 'idle', id = 'cm', coinIn = 0 } = {}) {
  const { x, y, w, h } = box;
  const armed = state === 'armed';
  const acc = state === 'accepting';
  const led = acc ? '#3cff8a' : armed ? '#ffb52e' : '#3a2a10';
  let o = `<defs>
<linearGradient id="${id}-brush" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f4f6"/><stop offset=".15" stop-color="#b9c0c7"/><stop offset=".45" stop-color="#8f969e"/><stop offset=".55" stop-color="#c4cad0"/><stop offset="1" stop-color="#5d636b"/></linearGradient>
<pattern id="${id}-hair" width="${w}" height="2" patternUnits="userSpaceOnUse"><rect width="${w}" height="1" fill="#fff" opacity=".08"/></pattern>
<linearGradient id="${id}-bez" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b3f45"/><stop offset=".3" stop-color="#e8ecef"/><stop offset=".5" stop-color="#8f969e"/><stop offset=".7" stop-color="#f6f8fa"/><stop offset="1" stop-color="#3b3f45"/></linearGradient>
<radialGradient id="${id}-btn" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#c9cfd5"/><stop offset=".8" stop-color="#6b7178"/><stop offset="1" stop-color="#3b3f45"/></radialGradient>
<filter id="${id}-g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
<clipPath id="${id}-slotclip"><rect x="${x + w / 2 - 40}" y="${y + 20}" width="80" height="${58}"/></clipPath>
</defs>`;
  // plate
  o += `<rect x="${x - 2}" y="${y + 4}" width="${w + 4}" height="${h}" rx="12" fill="#000" opacity=".45" filter="url(#${id}-g)"/>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="url(#${id}-brush)"/>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="url(#${id}-hair)"/>`;
  o += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="11.5" fill="none" stroke="#fff" stroke-opacity=".6"/>`;
  // embossed label
  o += `<text x="${x + w / 2}" y="${y + 17}" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="10" letter-spacing="2.5" fill="#fff" opacity=".7">INSERT COIN</text>`;
  o += `<text x="${x + w / 2}" y="${y + 16}" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="10" letter-spacing="2.5" fill="#3b3f45">INSERT COIN</text>`;
  // coin entry: raised chamfered bezel, LED ring, black slot
  const sx = x + w / 2;
  const sy = y + 50;
  if (armed || acc) o += `<rect x="${sx - 22}" y="${sy - 30}" width="44" height="60" rx="14" fill="${led}" opacity=".7" filter="url(#${id}-g)"/>`;
  o += `<rect x="${sx - 19}" y="${sy - 27}" width="38" height="54" rx="11" fill="url(#${id}-bez)"/>`;
  o += `<rect x="${sx - 14}" y="${sy - 22}" width="28" height="44" rx="8" fill="${led}" opacity="${armed || acc ? 1 : 0.9}"/>`;
  o += `<rect x="${sx - 11}" y="${sy - 19}" width="22" height="38" rx="6" fill="#2a2d31"/>`;
  o += `<rect x="${sx - 3}" y="${sy - 16}" width="6" height="32" rx="2" fill="#000"/>`;
  o += `<rect x="${sx - 3}" y="${sy - 16}" width="6" height="3" rx="1" fill="${led}" opacity="${armed || acc ? 0.8 : 0}"/>`;
  // a coin partway into the slot (edge-on), clipped so it disappears into the slot
  if (coinIn > 0) {
    const cy = sy - 34 + coinIn * 34;
    o += `<g clip-path="url(#${id}-slotclip)"><g clip-path="none">${coin(sx - 2, cy - 18 * (1 - coinIn), 16, { turn: 0.94, id: `${id}-c` })}</g></g>`;
    o += `<rect x="${sx - 11}" y="${sy - 2}" width="22" height="21" rx="6" fill="#2a2d31"/><rect x="${sx - 3}" y="${sy - 2}" width="6" height="18" rx="2" fill="#000"/>`;
  }
  // coin return push button
  const bx = x + 34;
  const by = y + 110;
  const pressed = state === 'returnPressed';
  o += `<circle cx="${bx}" cy="${by}" r="16" fill="#2a2d31"/>`;
  o += `<circle cx="${bx}" cy="${by + (pressed ? 1 : 0)}" r="${pressed ? 12 : 13}" fill="url(#${id}-btn)"/>`;
  o += `<circle cx="${bx}" cy="${by + (pressed ? 1 : 0)}" r="${pressed ? 12 : 13}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/>`;
  o += `<text x="${bx}" y="${by + 30}" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="8.5" letter-spacing="1.2" fill="#3b3f45">CANCEL</text>`;
  // coin return cup
  const rx = x + w - 58;
  const ry = y + 94;
  o += `<rect x="${rx}" y="${ry}" width="44" height="34" rx="7" fill="url(#${id}-bez)"/>`;
  o += `<rect x="${rx + 4}" y="${ry + 4}" width="36" height="26" rx="5" fill="#0b0c0e"/>`;
  o += `<rect x="${rx + 4}" y="${ry + 4}" width="36" height="8" rx="4" fill="#000"/>`;
  o += `<text x="${rx + 22}" y="${ry + 46}" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="8.5" letter-spacing="1.2" fill="#3b3f45">RETURN</text>`;
  // screws
  [[x + 9, y + 9], [x + w - 9, y + 9], [x + 9, y + h - 9], [x + w - 9, y + h - 9]].forEach(([a, b]) => {
    o += `<circle cx="${a}" cy="${b}" r="4" fill="url(#${id}-btn)"/><line x1="${a - 2.2}" y1="${b}" x2="${a + 2.2}" y2="${b}" stroke="#4a4f55" stroke-width="1.1"/>`;
  });
  return o;
}

/** Wallet HUD pill: n coins left of 5, as small minted coins. HTML wrapper with inline SVG coins. */
function wallet(n = 5, { font = "'Barlow Condensed','Arial Narrow',sans-serif" } = {}) {
  const coins = Array.from({ length: 5 }, (_, i) => i < n
    ? `<svg width="24" height="24" viewBox="-12 -12 24 24" style="display:block;">${coin(0, 0, 11, { id: `wl${uid++}` })}</svg>`
    : `<div style="width:22px;height:22px;border-radius:50%;border:2px dashed #6b5a20;box-sizing:border-box;margin:1px;"></div>`).join('');
  return `<div style="display:inline-flex;align-items:center;gap:10px;height:48px;padding:0 14px 0 18px;border-radius:24px;background:rgba(10,8,14,.9);border:1px solid rgba(255,210,31,.5);box-shadow:0 0 18px rgba(255,210,31,.18);">
<span style="font:700 13px/1 ${font};letter-spacing:.18em;color:#ffd21f;">COINS</span><div style="display:flex;gap:3px;">${coins}</div></div>`;
}

module.exports = { coin, coinMech, wallet };
