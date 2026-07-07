# Styling Reference

## Stack

- **Tailwind CSS v4** via `@tailwindcss/vite` (the Vite plugin, not PostCSS)
- Single CSS entry point: `src/index.css`
- No separate `tailwind.config.js` — theme is configured inline with `@theme {}` in the CSS file

---

## Fonts

Both loaded from Google Fonts in `src/index.css`:

| Font | Use |
|---|---|
| Inter | UI text (navbar, menus, window content) |
| Bricolage Grotesque | `JelloText` "WELCOME" headline; variable font with `opsz`, `wdth`, `wght` axes |

---

## Theme Variables (`@theme {}` in index.css)

```css
--font-inter: "Inter", sans-serif;
--breakpoint-3xl: 1920px;

/* macOS palette */
--color-macos-blue: #007AFF;
--color-macos-text: #1D1D1F;
--color-macos-dark-text: #F5F5F7;

/* Dropdown menu */
--color-macos-menu-bg: rgba(75, 75, 75, 0.45);
--color-macos-menu-border: rgba(255, 255, 255, 0.15);

/* Misc */
--blur-macos: 20px;
--shadow-macos-menu: 0 10px 30px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.1);
```

Use these as Tailwind utilities: `bg-macos-blue`, `text-macos-text`, `blur-macos`, `shadow-macos-menu`.

---

## Custom Utilities

Defined with `@utility` (Tailwind v4 syntax):

```css
.flex-center   → flex items-center justify-center
.col-center    → flex flex-col items-center justify-center
.abs-center    → absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
```

---

## Component CSS (in `@layer components`)

Several component IDs have their own CSS blocks. These are **legacy styles** from an earlier version of the codebase — most of the active components now use Tailwind utility classes directly on JSX. These classes are kept in CSS for any that still reference them:

| Selector | Component |
|---|---|
| `.navbar`, `.dropdown-menu`, `.menu-item` | `Navbar` component |
| `#dock`, `.dock-container`, `.dock-icon`, `.dock-dot`, `.dock-separator` | `Dock` component |
| `#window-controls`, `#window-header` | Legacy window chrome (not used by `MacWindow`) |
| `#safari`, `#terminal`, `#contact`, `#photos`, `#resume`, `#finder`, `#home`, `#txtfile`, `#imgfile` | Legacy window stubs, currently unused |

`#safari` in particular has leftover CSS from an earlier Safari implementation — it does not conflict with the current `SafariWindow.tsx` (which uses Tailwind utilities directly), but the CSS block is dead weight.

---

## Body / HTML

```css
html, body {
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;
    background-image: url("/images/wallpaper.jpg");
    background-size: cover;
    background-position: center;
}
```

The wallpaper is set on `body` so it shows through even before React mounts. `overflow: hidden` prevents any scroll at the page level — the app is a single fixed-size canvas.

---

## Custom Scrollbar

`.custom-scrollbar` class — applies subtle macOS-style scrollbar:
```css
::-webkit-scrollbar         { width: 8px }
::-webkit-scrollbar-track   { transparent }
::-webkit-scrollbar-thumb   { rgba(0,0,0,0.1), border-radius: 10px }
```

Used in `NotesWindow` on the content area.

---

## `.grab` utility

```css
.grab { cursor: grabbing !important; }
```

Added to `document.body` during a `JelloText` drag interaction. Removed on `mouseup`. Prevents the cursor from flickering back to `default` when the pointer leaves a character span mid-drag.

---

## Path Aliases (Vite)

Configured in `vite.config.ts`:

```ts
'#components' → src/components/
'#constants'  → src/constants/
'#store'      → src/store/       (not yet used)
'#hoc'        → src/hoc/         (not yet used)
'#windows'    → src/windows/     (not yet used)
```

Use like: `import Desktop from '#components/Desktop'`

---

## Asset Organization

Two asset locations — keep the distinction, it's a Vite convention:

### `public/` — static files served at a known URL (no bundling)

Referenced as absolute URL strings in CSS or JS. Not hashed.

```
public/
├── icons/
│   └── apple-logo.svg          ← Navbar Apple logo (CSS/img src="/icons/apple-logo.svg")
├── images/
│   ├── wallpaper.jpg           ← body background + TestScreen background
│   └── ucsd-seal.svg           ← available for future use
└── models/
    └── macbook.glb             ← Three.js model (useGLTF('/models/macbook.glb'))
```

### `src/assets/` — bundled by Vite (import in TS/TSX)

Imported in component files. Vite hashes the filename for cache-busting.

```
src/assets/
└── dock/
    ├── finder.png
    ├── notes.png
    ├── safari.png
    └── settings.png
```

**Rule of thumb:** If the path is in a CSS string or loaded by a library (Three.js, etc.) → `public/`. If it's `import`ed in a React component → `src/assets/`.
