# Portfolio Codebase Docs

Developer reference for `Portfolio_GSAP` — a macOS-inspired portfolio site built with React + GSAP + Three.js.

---

## Docs Index

| File | What's in it |
|---|---|
| [architecture.md](./architecture.md) | Tech stack, routing, component tree, data flow, key invariants |
| [window-system.md](./window-system.md) | DesktopContext API, WindowManager, DraggableWindow, MacWindow |
| [3d-experience.md](./3d-experience.md) | 3D Macbook intro — camera animation, GLB screen mapping, boot sequence |
| [components.md](./components.md) | Desktop, Navbar, Dock, JelloText, all app windows |
| [styling.md](./styling.md) | Tailwind v4 setup, theme variables, custom utilities, path aliases |
| [adding-an-app.md](./adding-an-app.md) | Step-by-step: how to add a new openable window |

---

## Quick orientation

- **Entry route:** `/macbook` — 3D MacBook intro. Camera orbits, zooms through screen into the desktop.
- **Main route:** `/` — the macOS desktop UI directly.
- **State:** Everything lives in `DesktopContext` (which windows are open, their positions, sleep state).
- **No router library** — a single `useState` on `window.location.pathname` with a `popstate` listener.
- **Animations:** GSAP everywhere. Three.js only for the 3D intro. Tailwind for layout/styling.
