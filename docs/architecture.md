# Architecture Overview

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Animation | GSAP 3 |
| 3D | Three.js + `@react-three/fiber` + `@react-three/drei` |
| Icons | `lucide-react` |
| Tooltips | `react-tooltip` |

---

## Entry Points

```
index.html
└── src/main.tsx          → mounts <App /> into #root
    └── src/App.tsx       → route switch + context providers
```

`main.tsx` wraps `<App />` in `<DesktopProvider>` (the global window state).

---

## Routing

There is **no React Router**. Routing is done with a single `useState` watching `window.location.pathname` and re-syncing on `popstate`.

```
/           → <Desktop />         (the main macOS-like UI)
/macbook    → <Experience />      (3D intro sequence)
```

The 3D intro sequence (`/macbook`) is the **entry point for new visitors**. After the camera zooms through the laptop screen, it calls:

```ts
window.history.pushState(null, '', '/')
window.dispatchEvent(new Event('popstate'))
```

…which transitions seamlessly into the real desktop without a full page reload.

---

## Component Tree

```
App
├── (if /macbook) Experience          3D canvas with camera animation
│   └── Canvas
│       ├── CameraController         GSAP-driven camera timeline
│       └── Macbook (GLB model)
│           └── TestScreen           Boot UI + Desktop rendered into laptop screen
│               └── Desktop
│                   ├── Navbar
│                   ├── WindowManager
│                   ├── JelloText
│                   └── Dock
│
└── (if /) Desktop                   Fullscreen macOS-like desktop
    ├── Navbar
    ├── WindowManager
    │   ├── AboutThisMac
    │   ├── SystemSettings
    │   ├── NotesWindow
    │   └── SafariWindow
    ├── JelloText ("WELCOME")
    └── Dock
```

`Desktop` is reused in both routes — inside the 3D screen at `/macbook` and directly at `/`.

---

## Data Flow

Global state lives entirely in `DesktopContext`. There is no Redux, Zustand, or other external store. All window state (open/closed, position, z-index) is managed there.

```
DesktopProvider (src/contexts/DesktopContext.tsx)
    └── windowsState: WindowsState   ← plain object, one entry per WindowType
        └── { about, settings, notes, safari }
            └── { isOpen, zIndex, x, y }
```

Components consume it via:
```ts
const { openWindow, closeWindow, focusWindow, windowsState } = useDesktop();
```

---

## Key Invariants

- **`pointer-events-none` by default at the layout level.** `WindowManager` and the children layer inside `Desktop` are `pointer-events-none`. Individual interactive things (windows, dock, JelloText) must set `pointer-events-auto` themselves.
- **Window z-index is monotonically increasing.** `focusWindow` always sets z to `maxZIndex + 1`, so the last-clicked window is always on top. Z-indices are never reset.
- **`DraggableWindow` owns sizing.** Width/height live in local React state inside `DraggableWindow`, initialized from `WINDOW_DEFAULTS`. Position (`x`, `y`) lives in `DesktopContext`.
- **`Desktop` runs `constrainWindows` on resize** via a `ResizeObserver`, so windows snap back into bounds when the viewport shrinks (e.g. transitioning from 3D screen to full browser).
