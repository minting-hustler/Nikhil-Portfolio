// Shared helpers + drawing parts for the vending-machine portfolio boards.
// Everything is emitted as plain absolutely-positioned HTML with inline styles.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const F = {
  disp: "'Bungee',Impact,sans-serif",
  ui: "'Barlow Condensed','Arial Narrow',sans-serif",
  mono: "'Share Tech Mono',monospace",
};

const K = {
  wall: '#0c0a10', wall2: '#14111b',
  red: '#e0281f', redD: '#9d100c', redH: '#ff5a3d',
  yel: '#ffd21f', glow: '#ffb300',
  ink: '#141018', cream: '#f5efdf',
  steel: '#2b2f37', chrome: '#c9d1d9',
  screen: '#07141d', cyan: '#78f0ff', amber: '#ffb52e',
  mute: '#8b8593',
};

const PAL = {
  yellow: { b: '#f7c21a', l: '#ffe680', d: '#a87700' },
  teal:   { b: '#1fb3ad', l: '#7de8e0', d: '#0b6460' },
  pink:   { b: '#ec3f96', l: '#ff9ccd', d: '#95165a' },
  blue:   { b: '#2f7fe3', l: '#8fc0ff', d: '#123f8c' },
  orange: { b: '#ff7a1c', l: '#ffbe85', d: '#a63f00' },
  lime:   { b: '#8fd12f', l: '#cdf28b', d: '#456e0a' },
  violet: { b: '#8b5cf6', l: '#c4adff', d: '#43229c' },
};

const CANS = [];
{
  const cols = ['yellow', 'teal', 'pink', 'blue', 'orange', 'lime', 'pink', 'violet', 'teal', 'orange', 'blue', 'yellow'];
  const glyphs = ['circle', 'bars', 'diamond', 'ring', 'tri', 'plus', 'plus', 'circle', 'bars', 'tri', 'ring', 'diamond'];
  ['A', 'B', 'C', 'D'].forEach((L, r) => [1, 2, 3].forEach((n, c) => {
    const i = r * 3 + c;
    CANS.push({ code: L + n, n: String(i + 1).padStart(2, '0'), col: cols[i], glyph: glyphs[i], r, c });
  }));
}
const canBy = (code) => CANS.find((c) => c.code === code);

// ---------- primitives ----------
const box = (x, y, w, h, st = '', inner = '', attr = '') =>
  `<div ${attr} style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;box-sizing:border-box;${st}">${inner}</div>`;

const ICONS = {
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  term: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  down: '<line x1="12" y1="4" x2="12" y2="18"/><polyline points="6 12 12 18 18 12"/>',
  ext: '<path d="M7 17 17 7"/><polyline points="8 7 17 7 17 16"/>',
  close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  muted: '<polygon points="4 9 8 9 13 5 13 19 8 15 4 15 4 9"/><line x1="17" y1="9" x2="22" y2="15"/><line x1="22" y1="9" x2="17" y2="15"/>',
  check: '<polyline points="5 12 10 17 19 7"/>',
  chev: '<polyline points="9 6 15 12 9 18"/>',
  back: '<polyline points="15 6 9 12 15 18"/>',
};
const icon = (n, size = 24, color = 'currentColor', sw = 2) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="display:block;flex:none;fill:none;stroke:${color};stroke-width:${sw};stroke-linecap:round;stroke-linejoin:round;">${ICONS[n]}</svg>`;

function glyph(g, c, s = 26) {
  const b = 'flex:none;';
  switch (g) {
    case 'circle': return `<div style="${b}width:${s}px;height:${s}px;border-radius:50%;background:${c};"></div>`;
    case 'ring': return `<div style="${b}width:${s}px;height:${s}px;border-radius:50%;border:5px solid ${c};box-sizing:border-box;"></div>`;
    case 'diamond': return `<div style="${b}width:${Math.round(s * 0.74)}px;height:${Math.round(s * 0.74)}px;background:${c};transform:rotate(45deg);margin:${Math.round(s * 0.08)}px 0;"></div>`;
    case 'bars': return `<div style="${b}display:flex;gap:3px;align-items:flex-end;height:${s}px;"><div style="width:7px;height:${Math.round(s * 0.45)}px;background:${c};"></div><div style="width:7px;height:${s}px;background:${c};"></div><div style="width:7px;height:${Math.round(s * 0.7)}px;background:${c};"></div></div>`;
    case 'tri': return `<div style="${b}width:0;height:0;border-left:${s / 2}px solid transparent;border-right:${s / 2}px solid transparent;border-bottom:${Math.round(s * 0.9)}px solid ${c};"></div>`;
    default: return `<div style="${b}position:relative;width:${s}px;height:${s}px;"><div style="position:absolute;left:${Math.round(s * 0.38)}px;top:0;width:${Math.round(s * 0.24)}px;height:${s}px;background:${c};"></div><div style="position:absolute;left:0;top:${Math.round(s * 0.38)}px;width:${s}px;height:${Math.round(s * 0.24)}px;background:${c};"></div></div>`;
  }
}

// ---------- the can (design size 120 x 206) ----------
function can(c, x, y, s = 1, o = {}) {
  const p = PAL[c.col];
  const label = o.label != null ? o.label : `[PROJECT ${c.n}]`;
  const inner = `<div style="position:absolute;left:0;top:0;width:120px;height:206px;transform:scale(${s});transform-origin:0 0;">
<div style="position:absolute;left:14px;top:26px;width:92px;height:168px;border-radius:8px 8px 14px 14px/6px 6px 18px 18px;background:linear-gradient(90deg,${p.d} 0%,${p.b} 18%,${p.l} 34%,${p.b} 56%,${p.b} 82%,${p.d} 100%);box-shadow:inset 0 -12px 16px rgba(0,0,0,.38);"></div>
<div style="position:absolute;left:24px;top:12px;width:72px;height:24px;border-radius:36px 36px 0 0/16px 16px 0 0;background:linear-gradient(90deg,${p.d},${p.l} 40%,${p.b} 70%,${p.d});"></div>
<div style="position:absolute;left:26px;top:6px;width:68px;height:14px;border-radius:50%;background:linear-gradient(90deg,#8d959e,#f0f3f6 40%,#a4acb5);"></div>
<div style="position:absolute;left:34px;top:9px;width:52px;height:8px;border-radius:50%;background:radial-gradient(#59616b,#2b3037);"></div>
<div style="position:absolute;left:52px;top:10px;width:18px;height:6px;border-radius:3px;background:#c9d0d7;"></div>
<div style="position:absolute;left:20px;top:188px;width:80px;height:12px;border-radius:0 0 40px 40px/0 0 12px 12px;background:linear-gradient(90deg,#6d747d,#d9dee3 40%,#8a919a);"></div>
<div style="position:absolute;left:14px;top:62px;width:92px;height:98px;background:linear-gradient(90deg,rgba(0,0,0,.26) 0%,rgba(255,255,255,0) 20%,rgba(255,255,255,.38) 34%,rgba(255,255,255,0) 52%,rgba(0,0,0,.3) 100%),#f4eddc;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;">
<div style="font:400 22px/1 ${F.disp};color:${p.d};">${c.code}</div>
${glyph(c.glyph, p.b, 24)}
<div style="font:700 11px/1 ${F.ui};letter-spacing:.06em;color:${K.ink};white-space:nowrap;">${esc(label)}</div>
</div>
<div style="position:absolute;left:24px;top:38px;width:7px;height:148px;border-radius:4px;background:linear-gradient(rgba(255,255,255,.55),rgba(255,255,255,.05));"></div>
</div>`;
  let st = '';
  if (o.rot) st += `transform:rotate(${o.rot}deg);`;
  if (o.op != null) st += `opacity:${o.op};`;
  if (o.filter) st += `filter:${o.filter};`;
  return box(x, y, Math.round(120 * s), Math.round(206 * s), st, inner);
}

// empty spring coil where a can used to be
function coil(cx, plateY, s = 1) {
  const w = Math.round(92 * s);
  return box(cx - w / 2, plateY - Math.round(30 * s), w, Math.round(24 * s),
    `border-radius:12px;background:repeating-linear-gradient(78deg,#9aa4ae 0 5px,rgba(154,164,174,0) 5px 12px);opacity:.85;`) +
    box(cx - w / 2, plateY - Math.round(16 * s), w, 4, 'background:#5b636d;border-radius:2px;');
}

function coinDot(x, y, d, on = true) {
  if (!on) return box(x, y, d, d, 'border-radius:50%;border:2px dashed #6b5a20;');
  return box(x, y, d, d,
    `border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3a3,#ffc21a 45%,#b87a00);box-shadow:inset 0 0 0 2px rgba(120,70,0,.5),inset 0 0 0 4px rgba(255,235,150,.55),0 3px 8px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font:400 ${Math.round(d * 0.5)}px/1 ${F.disp};color:#7a4a00;`, '1');
}

function coinsRow(x, y, coins, total, d, gap) {
  let out = '';
  for (let i = 0; i < total; i++) out += coinDot(x + i * (d + gap), y, d, i < coins);
  return out;
}

function neon(color1 = '#ffd21f', color2 = 'rgba(255,179,0,.8)') {
  return `0 0 6px ${color1},0 0 22px ${color2},0 0 60px rgba(255,138,0,.45)`;
}

function chip(x, y, text, st = '') {
  return `<div style="position:absolute;left:${x}px;top:${y}px;height:26px;padding:0 10px;box-sizing:border-box;border-radius:13px;display:flex;align-items:center;font:700 13px/1 ${F.ui};letter-spacing:.14em;white-space:nowrap;${st}">${esc(text)}</div>`;
}

function btn(x, y, w, h, st, inner, aria) {
  return `<button type="button" aria-label="${esc(aria)}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;box-sizing:border-box;margin:0;padding:0;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:${F.ui};${st}">${inner}</button>`;
}

// ---------- document wrapper ----------
function doc(title, w, h, body, css = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Barlow+Condensed:wght@500;600;700&family=Share+Tech+Mono&display=swap">
<style>
body{margin:0;background:#0c0a10;}
${css}
</style>
</helmet>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
renderVals() { return {}; }
}
</script>
</body>
</html>
`;
}

const root = (w, h, inner, st = '') =>
  `<div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;background:${K.wall};font-family:${F.ui};color:${K.cream};${st}">${inner}</div>`;

module.exports = { btn, esc, F, K, PAL, CANS, canBy, box, icon, ICONS, glyph, can, coil, coinDot, coinsRow, neon, chip, doc, root };
