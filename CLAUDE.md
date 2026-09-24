# Nikhil Kumar — Portfolio

Static site, no build step for the live pages. Three designs behind one switch.

## Layout
- `index.html` — the shell: top bar + a 3-way switch (3D / Newspaper / Vending). Each design loads in its own
  `<iframe>` (lazy, kept alive once opened), so their CSS and JS never collide. URL hash picks the view:
  `#3d`, `#newspaper`, `#vending` (default: vending).
- `sites/3d/index.html` — "3D" design: kinetic name, particle portrait (silhouette; photo mode behind USE_PHOTO), stack strip,
  work cards, career timeline, contact. Light/dark toggle. Plain HTML/CSS/JS.
- `sites/newspaper/index.html` — "The Nikhil Gazette": a 1440px broadsheet that scales down as one piece on
  small screens (see the script at the bottom). All content is inline HTML; edit it directly.
- `sites/vending/index.html` — the vending machine (Finish-Draft-1). GENERATED — do not hand-edit.
  Edit `source/vending/` and run `npm run build:vending`.

## Vending machine source (`source/vending/`)
- `parts/data.js` — the 12 cans: name on can, tag text, category (WORK / PROJECTS / RESEARCH), and the
  project-view copy (title, summary, role, year, stack, status, result, optional live/source links).
- `parts/overlays.js` — the four receipts the keys print (ABOUT, SKILLS, RESUME, CONTACT).
- `parts/screen.js` — touchscreen screens. `parts/deck.js` — keys, display, printer, tray.
- `parts/neon.js`, `cabinet.js`, `interior.js`, `shelf.js`, `glass.js`, `coin.js` — the drawn machine.
- `parts/geo2.js` — all geometry. `proto/template.html` — page layout, CSS and the GSAP interaction script.
- GSAP 3.12.5 loads from cdnjs.

## Content still to fill (search for `data-todo` and `[`)
- LinkedIn / GitHub / resume-PDF URLs (`data-todo="linkedin-url"`, `github-url`, `resume-url`, `resume-pdf`).
- OPD Claims live + source links (`parts/data.js`, `live: '#'`, `source: '#'`).
- Amazon ML Summer School: what was actually built (3d + newspaper + vending resume receipt).
- Newspaper photo credit and the claims-dashboard screenshot placeholder.

## Rules
- Keep every design self-contained in its folder; shared nothing except the shell.
- Test on 1440x900 and 390x844. Respect prefers-reduced-motion (all three already do).
- Deploy = push to `main`; GitHub Pages serves the repo root.
