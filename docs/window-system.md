# Window System

The window system is the core of the desktop UI. It has three layers:

1. **`DesktopContext`** — shared state (which windows are open, where they are)
2. **`DraggableWindow`** — the outer shell (position, size, drag, resize, z-order)
3. **`MacWindow`** — the inner shell (visual chrome: title bar, traffic lights, sidebar slot)

---

## Types (`src/types/desktop.ts`)

```ts
type WindowType = 'about' | 'settings' | 'notes' | 'safari';

interface WindowState {
    isOpen: boolean;
    zIndex: number;
    x: number;      // left offset from (0,0) of the desktop container
    y: number;      // top offset from (0,0) of the desktop container
}

type WindowsState = Record<WindowType, WindowState>;

const WINDOW_DEFAULTS: Record<WindowType, { width: number; height: number }> = {
    about:    { width: 300,  height: 480 },
    settings: { width: 720,  height: 540 },
    notes:    { width: 450,  height: 500 },
    safari:   { width: 900,  height: 600 },
};
```

`WINDOW_DEFAULTS` defines the **initial** size when a window is first opened. The user can resize it after that (if `resizable` is true on `DraggableWindow`).

---

## DesktopContext (`src/contexts/DesktopContext.tsx`)

### API

| Method | Signature | Effect |
|---|---|---|
| `openWindow` | `(type, x?, y?) => void` | Opens window at given position (defaults to centered). If already open, just focuses it. |
| `closeWindow` | `(type) => void` | Sets `isOpen: false`. |
| `focusWindow` | `(type) => void` | Brings window to front (`zIndex = maxZ + 1`). No-ops if already on top. |
| `updatePosition` | `(type, x, y) => void` | Updates stored x/y after a drag. |
| `constrainWindows` | `(width, height) => void` | Clamps all open window positions so they don't overflow the given dimensions. Called by `Desktop` on resize. |
| `sleepScreen` | `() => void` | Shows the black sleep overlay. Dismissed by mouse movement (>5px delta) or keydown. |
| `restartSequence` | `() => void` | Sleeps screen, then after 1s navigates to `/macbook` to replay the 3D intro. |

### Sleep overlay

Rendered directly inside `DesktopProvider`'s JSX (not in `Desktop`), so it works at any route. A `<div className="fixed inset-0 bg-black z-9999">` covers everything, listening for mouse movement or keydown to wake.

---

## WindowManager (`src/components/WindowManager.tsx`)

Thin coordinator — reads `windowsState` and conditionally mounts each app component:

```tsx
{windowsState.about.isOpen && <AboutThisMac />}
{windowsState.settings.isOpen && <SystemSettings />}
{windowsState.notes.isOpen && <NotesWindow />}
{windowsState.safari.isOpen && <SafariWindow />}
```

It sits at `z-80` with `pointer-events-none`; individual windows opt back into pointer events via `DraggableWindow`.

---

## DraggableWindow (`src/components/DraggableWindow.tsx`)

**Props:**
```ts
{
    id: WindowType;          // ties into DesktopContext
    children: React.ReactNode;
    resizable?: boolean;     // default false
    minWidth?: number;       // default 300
    minHeight?: number;      // default 200
}
```

**What it does:**

- Reads `windowsState[id]` for `{ x, y, zIndex }`.
- Applies position as `transform: translate(x, y)` on `position: absolute` (top/left both 0). This avoids interfering with GSAP CSS3D transforms used in the 3D scene.
- Uses **GSAP `Draggable`** — trigger is the `.drag-handle` div inside `MacWindow`'s title bar. On drag end, calls `updatePosition` to persist position to context.
- On `pointerDown`, calls `focusWindow` to bring to front.
- Size lives in **local state**, initialized from `WINDOW_DEFAULTS[id]`.
- Resize handles (when `resizable=true`): 4 corners + right edge + bottom edge. Each calls `handleResizeStart(e, direction)` which attaches `pointermove`/`pointerup` on `window` directly (not React events) to avoid capture issues.

**Resize directions:**
- `nw` — expands/shrinks left+top
- `ne` — expands/shrinks right+top  
- `sw` — expands/shrinks left+bottom
- `se` — expands/shrinks right+bottom
- `e` — width only (right edge)
- `s` — height only (bottom edge)

Note: `bounds` is intentionally commented out of the `Draggable` config because it conflicts with CSS3D transforms when the window is rendered inside the 3D MacBook screen.

---

## MacWindow (`src/components/MacWindow.tsx`)

Pure presentational — renders the macOS window chrome.

**Props:**
```ts
{
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    sidebar?: React.ReactNode;      // optional left sidebar panel
    sidebarClassName?: string;
    contentClassName?: string;
    theme?: 'light' | 'dark';       // default 'dark'
}
```

**Structure:**
```
<div (root, rounded, shadowed, flex row)>
    <div (title bar, h-11, absolute top-0)>
        • traffic light buttons (red/yellow/green)
        • .drag-handle  ← GSAP Draggable attaches here
        • centered title text
    </div>
    <div (optional sidebar, flex-none, pt-11)>  ← only if sidebar prop given
        {sidebar}
    </div>
    <div (main content, flex-1, pt-11)>          ← padding clears the title bar
        {children}
    </div>
</div>
```

The title bar is `position: absolute` across the full width, so both the sidebar and content columns appear below it via `pt-11`. This lets the sidebar and content area lay out side-by-side without the title bar affecting flex flow.

The red (close) button calls `onClose` with `e.stopPropagation()` to prevent the click from propagating to `DraggableWindow`'s `onPointerDown → focusWindow`. Yellow and green are decorative (opacity 50%, `cursor-default`).

---

## Adding a New Window

1. Add the type to `WindowType` in `src/types/desktop.ts`
2. Add an entry to `WINDOW_DEFAULTS` with initial `width`/`height`
3. Add `{ isOpen: false, zIndex: 100, x: 0, y: 0 }` to `initialWindowsState` in `DesktopContext`
4. Create the component in `src/components/apps/`, wrapping with `<DraggableWindow id="yourType">` and `<MacWindow ...>`
5. Import and conditionally render it in `WindowManager`
6. Optionally add a `DockIcon` to `Dock` and an `openWindow('yourType')` call
