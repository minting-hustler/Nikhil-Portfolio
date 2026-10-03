// COMPONENT 07 — Front glass. Sits over the interior, under nothing. Everything here is
// low-opacity: the goal is that you only notice the glass is there, never the effect.

function glass(g, { id = 'gl', sweep = null } = {}) {
  const { x, y, w, h } = g.win;
  let o = `<defs>
<clipPath id="${id}-c"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22"/></clipPath>
<filter id="${id}-b24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
<filter id="${id}-b10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="${id}-b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.5"/></filter>
<filter id="${id}-smudge" filterUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}"><feTurbulence type="fractalNoise" baseFrequency=".018 .03" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -.55"/></filter>
<filter id="${id}-dust" filterUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="11"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 9 -7.6"/></filter>
<radialGradient id="${id}-touch" cx=".5" cy=".62" r=".32"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}-corner" cx="0" cy="1" r=".35"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="${id}-mt" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-touch)"/></mask>
<mask id="${id}-mc" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-corner)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-corner)" transform="translate(${2 * x + w} 0) scale(-1 1)"/></mask>
<linearGradient id="${id}-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>`;
  o += `<g clip-path="url(#${id}-c)">`;
  // 1. neon reflected in the glass: warm glow hugging the inner edge
  o += `<rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="18" fill="none" stroke="#ffb000" stroke-width="22" opacity=".16" filter="url(#${id}-b24)"/>`;
  o += `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="20" fill="none" stroke="#ff3a10" stroke-width="6" opacity=".10" filter="url(#${id}-b10)"/>`;
  // 2. one broad soft diagonal reflection + two crisp streaks (the room behind the viewer)
  o += `<polygon points="${x + w * 0.05},${y} ${x + w * 0.42},${y} ${x - w * 0.1},${y + h * 0.62} ${x - w * 0.45},${y + h * 0.62}" fill="#fff" opacity=".07" filter="url(#${id}-b24)"/>`;
  o += `<polygon points="${x + w * 0.62},${y} ${x + w * 0.66},${y} ${x + w * 0.12},${y + h * 0.7} ${x + w * 0.09},${y + h * 0.7}" fill="#fff" opacity=".10" filter="url(#${id}-b2)"/>`;
  o += `<polygon points="${x + w * 0.7},${y} ${x + w * 0.715},${y} ${x + w * 0.2},${y + h * 0.66} ${x + w * 0.19},${y + h * 0.66}" fill="#fff" opacity=".07"/>`;
  o += `<polygon points="${x + w * 1.05},${y + h * 0.45} ${x + w * 1.1},${y + h * 0.45} ${x + w * 0.5},${y + h} ${x + w * 0.44},${y + h}" fill="#fff" opacity=".05" filter="url(#${id}-b2)"/>`;
  // 3. fingerprint smudge where people point at the cans, dust in the bottom corners
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${id}-smudge)" mask="url(#${id}-mt)" opacity=".10"/>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${id}-dust)" mask="url(#${id}-mc)" opacity=".35"/>`;
  // 4. optional sweep glint (GSAP animates its x): position 0..1 across the window
  if (sweep != null) {
    const sx = x - w * 0.6 + sweep * w * 1.6;
    o += `<polygon points="${sx + 120},${y} ${sx + 220},${y} ${sx - 380},${y + h} ${sx - 480},${y + h}" fill="url(#${id}-sweep)" opacity=".8"/>`;
  }
  // 5. glass edge: bright bevel top-left, dark bottom-right
  o += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="21" fill="none" stroke="#fff" stroke-width="2" opacity=".35" stroke-dasharray="${w + h} ${w + h}" />`;
  o += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="21" fill="none" stroke="#000" stroke-width="2" opacity=".35" stroke-dasharray="${w + h} ${w + h}" stroke-dashoffset="${w + h}"/>`;
  o += `</g>`;
  return o;
}

module.exports = { glass };
