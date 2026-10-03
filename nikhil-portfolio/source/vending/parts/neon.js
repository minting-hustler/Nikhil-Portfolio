// COMPONENT 01 — Neon tube.
// One continuous SVG path per rod (no photo tiles, so no seams), drawn as a stack of
// concentric strokes. Each band's color is sampled from the reference photo's rod
// cross-section, so the tube shows the same red edge -> orange -> yellow -> orange
// streak -> white-hot core "multiple lines" a real tube does.
//
// React port: <NeonTube d={path} w={px} kind="outer|inner" state="off|warm|on|surge" />
// Same band table, same order; GSAP drives the wrapper's --on / opacity.

// [width as fraction of tube width, color]. Drawn widest first.
const BANDS = {
  outer: [
    [1.0, '#8a0004'], // glass wall seen edge-on (dark rim)
    [0.92, '#ff1208'], // red phosphor coat, pushed brighter per review
    [0.82, '#ff2a10'],
    [0.72, '#ff4a0c'], // red to orange
    [0.62, '#ff8a00'], // orange shoulder
    [0.52, '#ffd000'], // yellow body
    [0.42, '#fff000'],
    [0.33, '#f99200'], // the orange streak the photo shows inside the core
    [0.24, '#ffe800'],
    [0.13, '#fff7b0'], // hot core
    [0.05, '#ffffff'],
  ],
  inner: [
    [1.0, '#3f3300'],
    [0.88, '#a88600'],
    [0.74, '#e6c200'],
    [0.58, '#fae106'],
    [0.4, '#fff27a'],
    [0.22, '#fffbd6'],
    [0.08, '#ffffff'],
  ],
  off: [
    [1.0, '#2a0a08'],
    [0.86, '#5a1a14'],
    [0.6, '#7a2c1e'],
    [0.34, '#8e4a30'],
    [0.12, '#b07a5a'],
  ],
  offInner: [
    [1.0, '#221c08'],
    [0.84, '#4a4012'],
    [0.5, '#6a5c20'],
    [0.16, '#8a7a3a'],
  ],
};

const HALO = { outer: ['#ff2000', '#ffae00'], inner: ['#ffd400', '#fff06a'] };
const GLINT = { outer: '#ffffff', inner: '#63c7b1' }; // inner tube's glass picks up that cyan-green fringe

const stroke = (d, w, color, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

/**
 * @param {object} o
 * @param {string} o.id    unique id prefix (filters/masks)
 * @param {string} o.d     SVG path data (centerline of the tube)
 * @param {number} o.w     tube diameter in px
 * @param {'outer'|'inner'} o.kind
 * @param {'off'|'warm'|'on'|'surge'} o.state
 * @param {[number,number]} o.light  specular offset direction (unit-ish), default upper-left
 */
function tube({ id, d, w, kind = 'outer', state = 'on', light = [-1, -1], straight = false }) {
  const FR = straight ? 'filterUnits="userSpaceOnUse" x="-4000" y="-4000" width="12000" height="12000"' : 'x="-15%" y="-12%" width="130%" height="124%"';
  const lit = state !== 'off';
  const bands = lit ? BANDS[kind] : BANDS[kind === 'outer' ? 'off' : 'offInner'];
  const haloAmt = { off: 0, warm: 0.45, on: 1, surge: 1.35 }[state];
  const [h1, h2] = HALO[kind];
  const gx = (light[0] * w * 0.24).toFixed(2);
  const gy = (light[1] * w * 0.24).toFixed(2);

  let o = `<defs>
<filter id="${id}-halo" ${FR}><feGaussianBlur stdDeviation="${(w * 0.95).toFixed(1)}"/></filter>
<filter id="${id}-bloom" ${FR}><feGaussianBlur stdDeviation="${(w * 0.28).toFixed(1)}"/></filter>
<filter id="${id}-soft" ${FR}><feGaussianBlur stdDeviation="${Math.min(w * 0.03, 1.3).toFixed(2)}"/></filter>
<mask id="${id}-m" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="12000" height="12000">${stroke(d, w * 0.86, '#fff')}</mask>
</defs>`;

  if (haloAmt > 0) {
    o += `<g style="mix-blend-mode:screen">`;
    o += stroke(d, w * 2.8, h1, ` opacity="${(0.36 * haloAmt).toFixed(2)}" filter="url(#${id}-halo)"`);
    o += stroke(d, w * 1.25, h2, ` opacity="${(0.55 * haloAmt).toFixed(2)}" filter="url(#${id}-bloom)"`);
    o += `</g>`;
  }
  // the tube itself: concentric bands, softened a hair so bands read as a round
  // gradient but the individual lines stay visible
  o += `<g filter="url(#${id}-soft)"${state === 'warm' ? ' opacity=".72"' : ''}>`;
  bands.forEach(([f, c]) => { o += stroke(d, w * f, c); });
  o += `</g>`;
  // specular glint on the glass, offset toward the light, clipped to the tube
  o += `<g mask="url(#${id}-m)">`;
  o += stroke(d, w * (kind === 'inner' ? 0.16 : 0.09), lit ? GLINT[kind] : '#e8d0c0', ` opacity="${lit ? 0.75 : 0.35}" transform="translate(${gx} ${gy})"`);
  o += stroke(d, w * 0.04, '#ffffff', ` opacity="${lit ? 0.5 : 0.25}" transform="translate(${(-gx * 0.9).toFixed(2)} ${(-gy * 0.9).toFixed(2)})"`);
  o += `</g>`;
  if (state === 'surge') o += stroke(d, w * 0.5, '#fffbe0', ` opacity=".45" style="mix-blend-mode:screen" filter="url(#${id}-bloom)"`);
  return o;
}

/** Mounting clip across a straight run. (x,y) = center on the tube, vertical = run direction. */
function clip({ x, y, w, vertical = true, lit = true }) {
  const along = w * 0.34;
  const across = w * 1.34;
  const [rw, rh] = vertical ? [across, along] : [along, across];
  const rx = x - rw / 2;
  const ry = y - rh / 2;
  const edge = lit ? '#ffc640' : '#6a4a3a';
  const gid = `cg${Math.round(x)}_${Math.round(y)}`;
  const grad = vertical
    ? `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a0000"/><stop offset=".22" stop-color="#e0141c"/><stop offset=".5" stop-color="#ff4048"/><stop offset=".78" stop-color="#c8101a"/><stop offset="1" stop-color="#2a0000"/></linearGradient>`
    : `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0000"/><stop offset=".22" stop-color="#e0141c"/><stop offset=".5" stop-color="#ff4048"/><stop offset=".78" stop-color="#c8101a"/><stop offset="1" stop-color="#2a0000"/></linearGradient>`;
  let o = `<defs>${grad}</defs>`;
  // contact shadow the band casts onto the glowing tube
  o += vertical
    ? `<rect x="${rx}" y="${ry + rh}" width="${rw}" height="${rh * 0.5}" fill="#000" opacity="${lit ? 0.28 : 0.4}"/>`
    : `<rect x="${rx + rw}" y="${ry}" width="${rw * 0.5}" height="${rh}" fill="#000" opacity="${lit ? 0.28 : 0.4}"/>`;
  o += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="${Math.min(rw, rh) * 0.25}" fill="url(#${gid})"/>`;
  if (vertical) {
    o += `<rect x="${rx}" y="${ry}" width="${rw}" height="${Math.max(1, rh * 0.14)}" fill="${edge}" opacity=".85"/>`;
    o += `<rect x="${rx}" y="${ry + rh - rh * 0.14}" width="${rw}" height="${Math.max(1, rh * 0.14)}" fill="${edge}" opacity=".6"/>`;
  } else {
    o += `<rect x="${rx}" y="${ry}" width="${Math.max(1, rw * 0.14)}" height="${rh}" fill="${edge}" opacity=".85"/>`;
    o += `<rect x="${rx + rw - rw * 0.14}" y="${ry}" width="${Math.max(1, rw * 0.14)}" height="${rh}" fill="${edge}" opacity=".6"/>`;
  }
  // two chrome screw heads at the band ends, where it's fixed to the cabinet
  const sr = w * 0.085;
  const ends = vertical ? [[rx + sr * 1.4, y], [rx + rw - sr * 1.4, y]] : [[x, ry + sr * 1.4], [x, ry + rh - sr * 1.4]];
  ends.forEach(([sx, sy]) => {
    o += `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="#2a0a0a"/><circle cx="${sx - sr * 0.15}" cy="${sy - sr * 0.15}" r="${sr * 0.72}" fill="#d8d0c8"/><circle cx="${sx - sr * 0.35}" cy="${sy - sr * 0.35}" r="${sr * 0.3}" fill="#fff" opacity=".8"/>`;
  });
  return o;
}

/** Centerline of a rounded-rect run: left side up, across the top, right side down. */
function arch({ x1, x2, top, bottom, r }) {
  return `M ${x1} ${bottom} L ${x1} ${top + r} Q ${x1} ${top} ${x1 + r} ${top} L ${x2 - r} ${top} Q ${x2} ${top} ${x2} ${top + r} L ${x2} ${bottom}`;
}
/** Full closed rounded rect (for the inner window tube). */
function rrect({ x1, x2, top, bottom, r }) {
  return `M ${x1 + r} ${top} L ${x2 - r} ${top} Q ${x2} ${top} ${x2} ${top + r} L ${x2} ${bottom - r} Q ${x2} ${bottom} ${x2 - r} ${bottom} L ${x1 + r} ${bottom} Q ${x1} ${bottom} ${x1} ${bottom - r} L ${x1} ${top + r} Q ${x1} ${top} ${x1 + r} ${top} Z`;
}

module.exports = { tube, clip, arch, rrect, BANDS };
