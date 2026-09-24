// Geometry for the fully drawn machine (replaces the photo-derived G(mob)).
// All values are cabinet-local design px, origin = cabinet top-left. Desktop places the
// cabinet at page x=240, y=64. Every component reads its box from here so parts line up.

function geo2({ rows = 4 } = {}) {
  const W = 960;
  const tube = 58; // C01 outer tube diameter
  const tubeIn = 26; // C01 inner tube diameter
  const tc = 36; // outer tube centerline inset from the cabinet edge
  const g = {
    W, tube, tubeIn, tc,
    radiusTop: 120,
    // marquee (lit name sign) across the top, inside the outer tube
    marquee: { x: 96, y: 78, w: W - 192, h: 128 },
    // glass window
    win: { x: 92, y: 238, w: 610 },
    rowPitch: 340,
    rows,
    // right control column
    col: { x: 736, w: 150 },
  };
  g.win.h = 60 + rows * g.rowPitch; // headroom for the ceiling light + rows
  g.win.y2 = g.win.y + g.win.h;
  g.deck = { y: g.win.y2 + 44, h: 560 }; // lower control plate + tray
  g.bodyH = g.deck.y + g.deck.h + 40;
  g.feetH = 46;
  g.H = g.bodyH + g.feetH;
  // right column fixtures
  g.grille = { cx: g.col.x + g.col.w / 2, cy: g.win.y + 40, r: 30 };
  g.lock = { cx: g.col.x + g.col.w / 2, cy: g.win.y + 124, r: 20 };
  g.screen = { x: g.col.x, y: g.win.y + 176, w: 150, h: 316 }; // sticky touchscreen (C08)
  g.coin = { x: g.col.x + 5, y: g.screen.y + g.screen.h + 22, w: 140, h: 170 }; // coin mech (C09)
  // tube paths (centerlines)
  g.outerArch = { x1: tc, x2: W - tc, top: tc, bottom: g.bodyH - 60, r: g.radiusTop - 10 };
  const wi = tubeIn / 2 + 4;
  g.innerRect = { x1: g.win.x - wi, x2: g.win.x + g.win.w + wi, top: g.win.y - wi, bottom: g.win.y2 + wi, r: 30 };
  return g;
}

module.exports = { geo2 };
