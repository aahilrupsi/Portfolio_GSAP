# How to Add a New App Window

Step-by-step for adding a new openable window (e.g. a "Terminal" app).

---

## 1. Register the type

**`src/types/desktop.ts`**

```ts
export type WindowType = 'about' | 'settings' | 'notes' | 'safari' | 'terminal';

export const WINDOW_DEFAULTS: Record<WindowType, { width: number; height: number }> = {
    // ... existing entries ...
    terminal: { width: 680, height: 420 },
};
```

---

## 2. Add to initial state

**`src/contexts/DesktopContext.tsx`**

```ts
const initialWindowsState: WindowsState = {
    // ... existing entries ...
    terminal: { isOpen: false, zIndex: 100, x: 0, y: 0 },
};
```

---

## 3. Create the component

**`src/components/apps/TerminalWindow.tsx`**

```tsx
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';

export default function TerminalWindow() {
    const { closeWindow } = useDesktop();

    return (
        <DraggableWindow id="terminal" resizable minWidth={400} minHeight={300}>
            <MacWindow
                onClose={() => closeWindow('terminal')}
                title="Terminal"
                theme="dark"
                className="w-full h-full flex flex-col"
                contentClassName="flex-1"
            >
                {/* your content here */}
            </MacWindow>
        </DraggableWindow>
    );
}
```

**Tips:**
- `theme="dark"` → dark background (`#22201F`), light text. `theme="light"` → white background.
- Pass `sidebar={<SidebarJSX />}` to `MacWindow` if you want a two-column layout (like System Settings).
- Use `resizable` if the user should be able to resize it.

---

## 4. Mount in WindowManager

**`src/components/WindowManager.tsx`**

```tsx
import TerminalWindow from './apps/TerminalWindow';

// inside the return:
{windowsState.terminal.isOpen && <TerminalWindow />}
```

---

## 5. (Optional) Add a dock icon

**`src/components/Dock.tsx`**

```tsx
import terminalIcon from '../assets/dock_icons/terminal.png';

// inside Dock's return, add:
<DockIcon
    label="Terminal"
    isOpen={windowsState.terminal.isOpen}
    onClick={() => openWindow('terminal')}
    src={terminalIcon}
    tooltipId="dock-tt"
/>
```

Place the icon PNG at `src/assets/dock_icons/terminal.png`. macOS-style icons look best at 56×56 or 80×80px.

---

## 6. (Optional) Add an entrance animation

If you want the window to animate in, add a `useEffect` that fires when `windowsState.yourType.isOpen` becomes true:

```tsx
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    if (windowsState.terminal.isOpen && containerRef.current) {
        gsap.fromTo(containerRef.current,
            { scale: 0.9, opacity: 0, y: 10 },
            { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
    }
}, [windowsState.terminal.isOpen]);
```

Wrap your `<DraggableWindow>` in a `<div ref={containerRef}>` (see `NotesWindow` for the pattern).
