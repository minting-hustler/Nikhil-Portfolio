# Nikhil Kumar — Portfolio

Static site, no build step for the live pages. Three designs behind one switch.

## Layout
- `index.html` — the shell: top bar + a 3-way switch (3D / Newspaper / Vending). Each design loads in its own
  `<iframe>` (lazy, kept alive once opened), so their CSS and JS never collide. URL hash picks the view:
  `#3d`, `#newspaper`, `#vending` (default: vending).
- `sites/shared/content.js` — ONE place for the About copy and the long-form write-up of all 12 projects
  (problem, what was built, how it works, result, headline stat, colour). All three designs read it for
  their About sections and their `project.html?id=<id>` "read more" pages. Ids: memory, agents, pdf-vision,
  auto-bot, api-logs, ask-ai, rag-tuning, redis-cache, ingestion, opd-claims, rl-control, f1-club
  (slot codes A1…D3 also work as ids).
- `sites/3d/index.html` — "3D" design. First page = `blackhole.js`: Nikhil drawn in ~15k stars
  (`nikhil-stars.js` = his photo cut out with rembg, 104x303, one pixel per star, as a data URI so the
  canvas works from file:// too) with a black hole above his head pulling stars off him. The first
  section is 210vh with a sticky stage: scrolling feeds the hole, press-and-hold pulls harder, the pointer
  scatters stars. Then stack strip, featured work cards, "All twelve" index, career, About, contact.
  `project.html` = the read-more page (tilting 3D stat card, GSAP reveals).
- `sites/newspaper/index.html` — "The Nikhil Gazette": a 1440px broadsheet that scales down as one piece on
  small screens (see the script at the bottom). All content is inline HTML; edit it directly.
  `highlighter.js` turns the pointer into a highlighter: select text → it is marked (CSS Custom Highlight
  API, `<mark>` fallback), click the mark or the "Read about it" tab → the Explainer drawer shows glossary
  entries for terms in the mark (the `G` table) and the story it came from (headline → project id via
  `STORIES`), linking to that story's page. Story headlines are also clickable.
  `about.html` = page 2 (The Long Read). `project.html` = page A3 story per project. Both use `page.css`
  and `inside.js` (ink-on-paper reveals) and reflow on mobile instead of scaling.
- `sites/vending/index.html` — the vending machine (Finish-Draft-1). GENERATED — do not hand-edit.
  Edit `source/vending/` and run `npm run build:vending`. Outside the machine the type is a vintage neon
  sign (Monoton name that flickers on with the machine, Yellowtail script, Tilt Neon for steps/HUD) set
  against Bodoni Moda (Didone, fashion-house style) for reading text.
  `sites/vending/project.html` and `about.html` are hand-written (not generated) and share `pages.css`.
  The project dialog links to `project.html?id=<slot code>`; the ABOUT receipt links to `about.html`.

## Vending machine source (`source/vending/`)
- `parts/data.js` — the 12 cans: name on can, tag text, category (WORK / PROJECTS / RESEARCH), and the
  project-view copy (title, summary, role, year, stack, status, result, optional live/source links).
- `parts/overlays.js` — the four receipts the keys print (ABOUT, SKILLS, RESUME, CONTACT).
- `parts/screen.js` — touchscreen screens. `parts/deck.js` — keys, display, printer, tray.
- `parts/neon.js`, `cabinet.js`, `interior.js`, `shelf.js`, `glass.js`, `coin.js` — the drawn machine.
- `parts/geo2.js` — all geometry. `proto/template.html` — page layout, CSS and the GSAP interaction script.
- GSAP 3.12.5 loads from cdnjs.

## About copy
Written from the resume because there was no About section; Nikhil should read and correct it in
`sites/shared/content.js` (`about`). The vending About page and the newspaper page 2 pull-quote paraphrase it.

## Content still to fill (search for `data-todo` and `[`)
- LinkedIn / GitHub / resume-PDF URLs (`data-todo="linkedin-url"`, `github-url`, `resume-url`, `resume-pdf`).
- OPD Claims live + source links (`parts/data.js`, `live: '#'`, `source: '#'`).
- Amazon ML Summer School: what was actually built (3d + newspaper + vending resume receipt).
- Newspaper photo credit and the claims-dashboard screenshot placeholder.

## Rules
- Keep every design self-contained in its folder. The only shared files are the shell and `sites/shared/content.js`.
- Test on 1440x900 and 390x844. Respect prefers-reduced-motion (all three already do).
- Deploy = push to `main`; GitHub Pages serves the repo root.
