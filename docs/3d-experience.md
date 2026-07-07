# 3D Macbook Intro Experience

**Route:** `/macbook`
**Files:** `src/experiments/3DMacbook/`

The 3D experience is the entry point for visitors. A MacBook renders in a starfield, the camera orbits 360° around it, then zooms through the screen into the real portfolio — no page load, no transition flash.

---

## Files

| File | Role |
|---|---|
| `Experience.tsx` | R3F Canvas setup + `CameraController` |
| `Macbook.tsx` | Loads the GLB model, mounts `TestScreen` onto the screen mesh |
| `TestScreen.tsx` | Boot sequence UI + the actual `<Desktop>` rendered inside the laptop |

---

## Experience.tsx

Sets up the Three.js scene:

```tsx
<Canvas camera={{ position: cameraStart, fov: 35 }}>
    <Stars />
    <Environment preset="city" />
    <Macbook desktopContext={desktopContext} />
    <ContactShadows />
    <CameraController />
</Canvas>
```

`desktopContext` is read via `useContext(DesktopContext)` at the Experience level and passed as a prop into `Macbook` so it can be re-provided inside the `Html` portal (see below).

### CONFIG

All camera positions live in a single `CONFIG` object at the top of the file — change values here to tweak the animation without hunting through the timeline:

```ts
const CONFIG = {
    cameraStart:  new Vector3(0, 5, 12),   // initial position (The Void)
    orbitPos:     new Vector3(0, 1.5, 7),  // front view after 360 orbit
    screenCenter: new Vector3(0, 0, -1.2), // point to look at (center of screen)
    zoomPos:      new Vector3(0, 0, 2.32), // zoomed-in position just in front of screen
}
```

### CameraController

GSAP `useLayoutEffect` timeline:

| Phase | Duration | What happens |
|---|---|---|
| Phase 1 | 4.5s | 360° orbit from start → front, using `Math.cos/sin` on a `phase1State` angle object |
| Pause | 0.5s | Nothing |
| Phase 2 | 2s | Camera moves to `zoomPos`, look target moves to `screenCenter` |

`lookAtTarget` is a mutable `Vector3` (not React state) that GSAP tweens directly. `useFrame` calls `camera.lookAt(lookAtTarget)` every frame, so the look direction animates smoothly regardless of the tween's `onUpdate` timing.

### Launch event

`CameraController` listens for a `"launch-portfolio"` custom event (dispatched by `TestScreen`):

```ts
window.addEventListener('launch-portfolio', handleLaunch)
```

On receipt:
1. GSAP animates `camera.position.z` to `-5` (fly through the screen)
2. GSAP animates `lookAtTarget.z` to `-15` (push focus far back so camera doesn't flip)
3. After 1000ms: `window.history.pushState('/', ...)` + dispatch `popstate` → `App` switches to `<Desktop />`

---

## Macbook.tsx

Loads `macbook_blender_export.glb` from `/files/` (in `public/`).

### Screen detection

On mount, reads two mesh nodes from the GLB:
- **`Screen_Plane`** — a flat quad that covers the screen area; its material is made `opacity: 0` (invisible) so Three.js doesn't draw over the HTML
- **`Object_2`** — the actual rendered screen mesh, used to measure 3D dimensions

From `Object_2`'s bounding box, it calculates the aspect ratio and derives `htmlWidth` / `htmlHeight` so the HTML exactly fills the screen in 3D space.

Scale formula (reverse-engineered from three/drei's `Html` component internals):
```ts
const distanceFactor = 6
const scale = (width3D * (400 / distanceFactor)) / htmlWidth
```

### HTML portal

```tsx
createPortal(
    <Html transform position={...} rotation={[Math.PI/2, 0, 0]} scale={...} distanceFactor={6}>
        <DesktopContext.Provider value={props.desktopContext}>
            <TestScreen width={...} height={...} />
        </DesktopContext.Provider>
    </Html>,
    nodes.Screen_Plane  // parent in 3D scene
)
```

`@react-three/drei`'s `<Html transform>` renders a real DOM element mapped into 3D space. `rotation={[Math.PI/2, 0, 0]}` compensates for the GLB model's coordinate system (screen plane was exported flat/horizontal in Blender, needs to rotate to face the camera).

The `DesktopContext.Provider` re-wraps the context here because the `Html` portal creates a new React tree root that doesn't inherit the parent context.

The screen is hidden for the first **5 seconds** (`showScreen` state, `setTimeout(5000)`) to prevent it from being visible during the 360° orbit (camera would pass behind the laptop and reveal the "wrong" side).

---

## TestScreen.tsx

The `<Desktop>` rendered inside the laptop screen. Also handles the boot animation.

### Boot states

```
'turning_on'  →  (after 1s)  →  'booting'  →  (after 2s)  →  'loaded'
```

- `turning_on`: Black screen, no overlay visible (opacity 0)
- `booting`: Apple logo + progress bar appear (opacity 1), progress set to 50%
- `loaded`: Overlay fades out, `<Desktop>` fades in; `openWindow('notes')` is called to show the welcome note

### Welcome buttons

Two buttons shown over the loaded desktop:
- **GO FULL SCREEN** → dispatches `"launch-portfolio"` event → triggers camera fly-through in `CameraController`
- **SKIP FULL SCREEN** → GSAP fades buttons out, sets `showWelcomeButtons: false`

The button strip is a frosted pill centered horizontally, using `bg-white/[0.03]` + `backdrop-blur-md`.

### Position math for Notes window

```ts
openWindow('notes', 40, height - 500 - 40)
// x = 40px from left
// y = height minus the notes window height (500) minus 40px margin
// → bottom-left of the 3D screen, matching what Desktop does on /
```

---

## Assets

- **GLB model:** `public/models/macbook.glb` — the MacBook 3D model exported from Blender
- **Wallpaper:** `public/images/wallpaper.jpg` — used as background on both the 3D screen's Desktop and the main `<body>` background
