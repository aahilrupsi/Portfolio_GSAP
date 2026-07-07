# Components Reference

Non-app components in `src/components/`.

---

## Desktop (`src/components/Desktop.tsx`)

The root layout for the macOS desktop. Used in two places:
- Directly at `/` (full browser window)
- Inside `TestScreen` at `/macbook` (rendered into the 3D laptop screen)

**Layout:**
```
<div (containerRef, flex col, w-full h-full)>
    <Navbar />
    <WindowManager />
    <div (flex-1, relative, overflow-hidden)>
        <JelloText text="WELCOME" />   ← z-0, pointer-events-auto
        {children}                      ← z-10, pointer-events-none (see note)
    </div>
    <Dock />
</div>
```

**Auto-open Notes:** On mount, if the route is `/` and Notes isn't already open, it opens Notes at `(40, height - 500 - 40)` after a 1200ms delay. The delay lets the zoom-in transition from the 3D experience finish before the window appears.

**ResizeObserver:** Watches the container div. On any size change, calls `constrainWindows(width, height)` to keep open windows in bounds. This fires when transitioning from the 3D screen (smaller) to full browser (larger), preventing windows from being stuck off-screen.

**`children` note:** The children layer is `pointer-events-none` to let the `JelloText` behind it remain interactive. Any content passed as `children` must set `pointer-events-auto` on interactive elements. In practice, the only caller that passes children is `TestScreen`, which uses it for the welcome buttons overlay.

---

## Navbar (`src/components/Navbar.tsx`)

macOS-style menu bar across the top. Contains:
- Apple logo (opens the "About This Mac" window)
- Nav items from `src/constants/index.ts` (Portfolio, Contact, Projects), each with a dropdown
- Right side: status icons, clock

The nav items and their dropdowns are defined in `navLinks` in `src/constants/index.ts`. Each item has a `menuOptions` array that drives the dropdown. The `action` field on each option is a string identifier — the Navbar handles these (currently stubbed).

---

## Dock (`src/components/Dock.tsx`)

macOS-style dock pinned to the bottom center via `#dock` CSS (`.absolute.bottom-5.left-1/2.-translate-x-1/2`). Hidden on small screens (`max-sm:hidden`).

**Icons:** Finder, [separator], Notes, System Settings, Safari. Each is a `DockIcon` component.

**DockIcon:**
- On `mouseEnter`: GSAP `scale: 1.25, y: -8` with `back.out(2)` ease
- On `mouseLeave`: GSAP back to `scale: 1, y: 0`
- Shows a small dot indicator below (`dock-dot`) when the corresponding window is open
- Uses `react-tooltip` for labels (all icons share one `Tooltip` with `id="dock-tt"`)

Finder has `isOpen={true}` hardcoded (it always shows the dot) and a no-op `onClick`.

---

## JelloText (`src/components/JelloText.tsx`)

The big interactive "WELCOME" text in the center of the desktop. Uses variable font axis animation via GSAP.

**Font:** Bricolage Grotesque (loaded from Google Fonts). Variable axes used: `font-weight` (200–800) and `wdth` (75–100).

**Initial animation:** On mount, characters fall in from above with elastic easing, staggered in random order.

**Drag interaction:**
1. `mouseDown` on any character → records `mouseInitialY` and which character index was clicked (`charIndexSelected`)
2. `mousemove` on `window` → calculates vertical drag distance as a scale factor (`dragYScale`)
3. Each character gets a `calcfracDispersion` multiplier based on distance from the clicked character (drops off with `elasticDropOff = 0.8` factor)
4. GSAP animates each character's `y`, `fontWeight`, `fontVariationSettings: 'wdth'`, and `scaleY`
5. `mouseup` → springs everything back with `elastic.out(1, 0.3)`, staggered out from the clicked character

**Key constants:**
```ts
weightInit = 600       // resting font weight
weightTarget = 300     // minimum weight when stretched
stretchInit = 100      // resting wdth value
stretchTarget = 75     // compressed wdth value when stretched vertically
maxYScale = 2.0        // maximum vertical stretch
elasticDropOff = 0.8   // how fast the effect fades to neighboring characters
```

---

## App Windows (`src/components/apps/`)

### NotesWindow

A fully editable Notes clone. Title and body are `contentEditable` divs — no textarea, so they render like native macOS Notes. Title syncs live via `onInput`, body syncs on `onBlur`.

Default content is a portfolio welcome guide with instructions. Pre-populated content is set in the `useState` initializer so it's set once and then user-editable.

Opens with a GSAP entrance animation (`scale: 0.9 → 1, opacity: 0 → 1`) triggered when `windowsState.notes.isOpen` becomes true.

### SafariWindow

Currently a placeholder with "Projects coming soon" text. This will become the projects showcase (homepage listing projects, clicking one opens a new tab).

### AboutThisMac

Static info card styled like the macOS "About This Mac" dialog. Shows MacBook Air specs (M4, 16GB, etc.) — content is hardcoded to match the actual machine.

### SystemSettings

Two-column layout matching macOS System Settings. Sidebar has a search field and a single "Accessibility" item (selected/active state). Content area is currently empty. Uses `MacWindow`'s `sidebar` prop.
