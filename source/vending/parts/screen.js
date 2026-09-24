// COMPONENT 06 — Touchscreen (the sticky control panel). HTML/CSS: text stays crisp and
// it becomes plain React markup. Outer size 150 x 316 design px (geo2 col width).
const { F } = require('../lib');

const NV = { bg: '#051a33', bg2: '#020c1a', line: 'rgba(120,190,255,.22)', t: '#8fd0ff', dim: '#4a7aa8', hi: '#ffd21f', amber: '#ffb52e', ok: '#3cff8a', cream: '#f5efdf' };
const cap = (t, c = NV.t, extra = '') => `<div style="font:700 10px/12px ${F.ui};letter-spacing:.16em;color:${c};${extra}">${t}</div>`;
const disp = (t, size, c = NV.hi, glow = true) => `<div style="font:400 ${size}px/1 ${F.disp};color:${c};${glow ? `text-shadow:0 0 10px ${c}88;` : ''}">${t}</div>`;
const btn = (t, bg = NV.amber, fg = '#141018', glow = true) => `<button type="button" style="all:unset;display:flex;align-items:center;justify-content:center;gap:6px;height:32px;border-radius:6px;background:${bg};color:${fg};white-space:nowrap;font:700 12px/1 ${F.ui};letter-spacing:.06em;${glow ? `box-shadow:0 0 14px ${bg}99, inset 0 1px 0 rgba(255,255,255,.5);` : ''}cursor:pointer;">${t}</button>`;
const arrowDown = (c, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="display:block;fill:none;stroke:${c};stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;"><line x1="12" y1="4" x2="12" y2="19"/><polyline points="6 13 12 19 18 13"/></svg>`;
const coinIcon = (s = 34) => `<div style="width:${s}px;height:${s}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3a3,#ffc21a 45%,#b87a00);box-shadow:inset 0 0 0 2px rgba(120,70,0,.5), inset 0 0 0 4px rgba(255,235,150,.55), 0 0 14px rgba(255,194,26,.6);display:flex;align-items:center;justify-content:center;font:400 ${s * 0.45}px/1 ${F.disp};color:#8a5600;">N</div>`;

function header(title, led = NV.ok) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;height:14px;">${cap(title, NV.hi)}<div style="width:7px;height:7px;border-radius:50%;background:${led};box-shadow:0 0 6px ${led};"></div></div><div style="height:1px;background:${NV.line};margin:6px 0 8px;"></div>`;
}

const SCREENS = {
  off: () => '',
  browse: (p, f = 'ALL') => `${header('SELECT')}
${disp('PICK<br>A CAN', 17)}
<div style="display:flex;flex-direction:column;margin-top:10px;">
${require('./data.js').FILTERS.map(([t, n]) => [t, n, t === f]).map(([t, n, on]) => `<button type="button" style="all:unset;display:flex;align-items:center;gap:7px;height:25px;padding:0 5px;border-radius:4px;${on ? 'background:rgba(120,190,255,.18);' : ''}border-bottom:1px solid ${NV.line};cursor:pointer;"><span style="width:8px;height:8px;border-radius:50%;border:2px solid ${on ? NV.hi : NV.t};box-sizing:border-box;${on ? `background:${NV.hi};` : ''}"></span><span style="flex:1;font:700 12px/1 ${F.ui};letter-spacing:.1em;color:${on ? NV.hi : NV.t};">${t}</span><span style="font:400 11px/1 ${F.mono};color:${NV.dim};">${n}</span></button>`).join('')}
</div>
<div style="margin-top:auto;display:flex;flex-direction:column;gap:3px;">${cap('1 COIN PER CAN', NV.dim)}${cap('TAP A CAN OR A TAG', NV.amber)}</div>`,
  selected: (p) => `${header('SLOT')}
${disp(p.code, 44)}
<div style="font:700 14px/1.1 ${F.ui};color:${NV.cream};margin-top:6px;">${p.name}</div>
<div style="display:inline-flex;align-self:flex-start;margin-top:6px;padding:3px 7px;border-radius:9px;border:1px solid ${NV.t};font:700 10px/1 ${F.ui};letter-spacing:.14em;color:${NV.t};">${p.cat}</div>
<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${NV.line};margin-top:10px;padding-top:8px;">${cap('PRICE')}${cap('1 COIN', NV.hi)}</div>
<div style="margin-top:auto;display:flex;flex-direction:column;gap:6px;">${btn(`INSERT COIN ${arrowDown('#141018', 13)}`)}${cap('OR TAP THE SLOT BELOW', NV.dim, 'text-align:center;')}</div>`,
  paying: (p) => `${header('PAYMENT', NV.amber)}
<div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:22px;">${coinIcon(46)}${disp('COIN<br>ACCEPTED', 15)}</div>
<div style="margin-top:auto;display:flex;flex-direction:column;align-items:center;gap:6px;">${cap('COINS LEFT')}<div style="display:flex;gap:4px;">${[1, 1, 1, 1, 0].map((f) => `<span style="width:10px;height:10px;border-radius:50%;${f ? `background:${NV.hi};box-shadow:0 0 5px ${NV.hi};` : `border:1.5px dashed ${NV.dim};box-sizing:border-box;`}"></span>`).join('')}</div></div>`,
  vending: (p) => `${header('VENDING', NV.amber)}
${disp('DISPENS-<br>ING', 17)}
<div style="margin-top:14px;height:14px;border:2px solid ${NV.t};border-radius:4px;padding:2px;box-sizing:border-box;"><div style="width:62%;height:100%;background:repeating-linear-gradient(90deg,${NV.t} 0 8px,transparent 8px 10px);box-shadow:0 0 8px ${NV.t};"></div></div>
<div style="margin-top:10px;display:flex;flex-direction:column;gap:4px;">${cap(`SLOT ${p.code}`)}${cap(p.name, NV.cream)}</div>
<div style="margin-top:auto;">${cap('WATCH THE COIL TURN', NV.amber)}</div>`,
  ready: (p) => `${header('READY')}
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:16px;">${arrowDown(NV.amber, 44)}${disp('COLLECT<br>BELOW', 16)}</div>
<div style="margin-top:12px;text-align:center;">${cap(`SLOT ${p.code} DELIVERED`)}</div>
<div style="margin-top:auto;display:flex;flex-direction:column;gap:6px;">${btn('SCROLL TO TRAY', NV.amber)}</div>`,
  noCoins: () => `${header('WALLET', '#ff4a4a')}
${disp('OUT OF<br>COINS', 18, '#ff6a5a')}
<div style="font:600 12px/1.3 ${F.ui};color:${NV.t};margin-top:10px;">You collected 5 projects. Want more?</div>
<div style="margin-top:auto;display:flex;flex-direction:column;gap:6px;">${btn('REFILL 5 COINS', NV.hi)}${cap('OR PRESS CONTACT', NV.dim, 'text-align:center;')}</div>`,
  empty: () => `${header('SOLD OUT', '#ff4a4a')}
${disp('ALL 12<br>TAKEN', 18)}
<div style="font:600 12px/1.3 ${F.ui};color:${NV.t};margin-top:10px;">You emptied the machine. Thanks for looking.</div>
<div style="margin-top:auto;display:flex;flex-direction:column;gap:6px;">${btn('SAY HELLO', NV.hi)}${btn('RESTOCK', 'transparent', NV.t, false).replace('background:transparent;', `background:transparent;border:1.5px solid ${NV.t};box-sizing:border-box;`)}</div>`,
};

/**
 * @param {string} state one of SCREENS
 * @param {object} p project (for slot screens)
 */
function touchscreen(state, p, filter) {
  const W = 150;
  const H = 316;
  const off = state === 'off';
  const content = SCREENS[state](p, filter);
  return `<div style="position:relative;width:${W}px;height:${H}px;">
<div style="position:absolute;inset:-3px;border-radius:17px;background:linear-gradient(135deg,#f4f6f8,#8a9098 30%,#e8ecef 52%,#5a5f66 78%,#c9ced4);box-shadow:0 10px 22px rgba(0,0,0,.55), 0 2px 4px rgba(0,0,0,.5);"></div>
<div style="position:absolute;inset:0;border-radius:14px;background:linear-gradient(160deg,#2a2d33 0%,#0c0d10 40%,#050506 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.18), inset 0 0 0 1px #000;"></div>
<div style="position:absolute;left:71px;top:7px;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#3a4a6a,#05070c 70%);box-shadow:0 0 0 1.5px #1a1c20;"></div>
${[[7, 7], [135, 7], [7, 301], [135, 301]].map(([x, y]) => `<div style="position:absolute;left:${x}px;top:${y}px;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f4f6f8,#8a9098 55%,#3b3f45);box-shadow:0 1px 1px rgba(0,0,0,.8);"></div>`).join('')}
<div style="position:absolute;left:11px;top:22px;width:128px;height:272px;border-radius:6px;overflow:hidden;background:${off ? '#030507' : `radial-gradient(ellipse at 50% 0%,#0d3a6a 0%,${NV.bg} 50%,${NV.bg2} 100%)`};box-shadow:inset 0 0 0 1px #000, inset 0 2px 8px rgba(0,0,0,.8);">
<div class="scr-content" style="position:absolute;inset:0;padding:9px 9px 10px;display:flex;flex-direction:column;box-sizing:border-box;">${content}</div>
${off ? '' : `<div style="position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px);"></div>`}
<div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(118deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,.04) 28%,rgba(255,255,255,0) 29%,rgba(255,255,255,0) 100%);"></div>
</div>
<div style="position:absolute;left:0;right:0;bottom:6px;text-align:center;font:700 7px/1 ${F.ui};letter-spacing:.3em;color:#5a5f66;">TOUCH</div>
</div>`;
}

module.exports = { touchscreen, SCREENS, NV };
