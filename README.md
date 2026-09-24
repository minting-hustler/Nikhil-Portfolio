# Nikhil Kumar — Portfolio

New Age portfolio

AI & Backend Engineer. One site, three ways to read it: **3D**, **Newspaper**, **Vending machine**.

Open `index.html`, or run locally:

```bash
npx serve .        # then open http://localhost:3000
```

(Opening the file directly also works, but a local server behaves exactly like the live site.)

## Structure

```
index.html               the switch (3D / Newspaper / Vending)
sites/3d/                design 1
sites/newspaper/         design 2: The Nikhil Gazette
sites/vending/           design 3: the vending machine (generated)
source/vending/          component source for the vending machine
```

Edit the vending machine in `source/vending/`, then `npm run build:vending`.

## Deploy

Pushed to GitHub and served by GitHub Pages from `main` (root). Every push to `main` updates the live site.

