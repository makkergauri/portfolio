# gauri.makker — portfolio

My personal site. Plain HTML, CSS and JavaScript, plus three.js for the hero render. No build step.

**Light & Sight:** the hero is a small path tracer running live in the browser (it starts as noise and converges in a second or two; drag to orbit the camera), and a "vision layer" then tracks what it rendered with live detection boxes, a scan line and a detection log.

## Files

| File | What it does |
|---|---|
| `index.html` | Home page |
| `project.html` | Case-study page, filled from `data.js` via `project.html?p=slug` |
| `js/data.js` | **All the written content** (experience, projects, notes). Edit this first. |
| `js/pathtracer.js` | The hero render (path tracer shader, drag-to-orbit camera) |
| `js/vision.js` | Hero vision layer: detection boxes, scan line, light motes, detection log |
| `js/main.js` | Theme toggle, cursor, radar page map, scroll effects, case studies |
| `css/style.css` | All styling; colours for both themes are at the top |

## Before publishing

1. Search the project for `PLACEHOLDER` and fill each one in (mostly "My role" and "What I'd do differently" in `js/data.js`).
2. Add `resume.pdf` to the root folder (a version without your phone number).
3. Optional: add real screenshots, e.g. `assets/playvision.webp`, and set `image: "assets/playvision.webp"` for that project in `data.js`.

## Run locally

Open the folder in VS Code and use the **Live Server** extension, or run `python -m http.server` in the folder and open http://localhost:8000.

## Deploy

Push to GitHub, then on vercel.com choose **Add New → Project**, import this repo, and deploy with the default settings (framework preset: Other). Every push to `main` redeploys.
