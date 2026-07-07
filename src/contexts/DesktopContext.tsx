import { createContext, useContext, useState, type ReactNode } from 'react';
import { type WindowType, type WindowsState, WINDOW_DEFAULTS } from '../types/desktop';

function centeredPosition(width: number, height: number) {
    return {
        x: window.innerWidth / 2 - width / 2,
        y: window.innerHeight / 2 - height / 2,
    };
}

const initialWindowsState: WindowsState = {
    about: { isOpen: false, zIndex: 100, x: 0, y: 0 },
    settings: { isOpen: false, zIndex: 100, x: 0, y: 0 },
    notes: { isOpen: false, zIndex: 100, x: 0, y: 0 },
    safari: { isOpen: false, zIndex: 100, x: 0, y: 0 },
};

interface DesktopContextType {
    openWindow: (type: WindowType, x?: number, y?: number) => void;
    closeWindow: (type: WindowType) => void;
    focusWindow: (type: WindowType) => void;
    updatePosition: (type: WindowType, x: number, y: number) => void;
    constrainWindows: (width: number, height: number) => void;
    windowsState: WindowsState;
    sleepScreen: () => void;
    restartSequence: () => void;
}

export const DesktopContext = createContext<DesktopContextType>({
    openWindow: () => {},
    closeWindow: () => {},
    focusWindow: () => {},
    updatePosition: () => {},
    constrainWindows: () => {},
    windowsState: initialWindowsState,
    sleepScreen: () => {},
    restartSequence: () => {},
});

export const useDesktop = () => useContext(DesktopContext);

export const DesktopProvider = ({ children }: { children: ReactNode }) => {
    const [windowsState, setWindowsState] = useState<WindowsState>(initialWindowsState);
    const [isSleeping, setIsSleeping] = useState(false);

    const getMaxZIndex = (state: WindowsState) =>
        Math.max(...Object.values(state).map(w => w.zIndex));

    const openWindow = (type: WindowType, x?: number, y?: number) => {
        console.log(`[DesktopContext] openWindow called for: ${type}`);
        setWindowsState(prev => {
            if (prev[type].isOpen) {
                // If already open, just focus it
                const nextZ = getMaxZIndex(prev) + 1;
                return { ...prev, [type]: { ...prev[type], zIndex: nextZ } };
            }
            const { width, height } = WINDOW_DEFAULTS[type];
            const defaultPos = centeredPosition(width, height);
            const initialX = x ?? defaultPos.x;
            const initialY = y ?? defaultPos.y;
            const nextZ = getMaxZIndex(prev) + 1;
            console.log(`[DesktopContext] Opening window: ${type}`, { initialX, initialY, nextZ });
            return { ...prev, [type]: { isOpen: true, zIndex: nextZ, x: initialX, y: initialY } };
        });
    };

    const closeWindow = (type: WindowType) => {
        setWindowsState(prev => ({ ...prev, [type]: { ...prev[type], isOpen: false } }));
    };

    const focusWindow = (type: WindowType) => {
        setWindowsState(prev => {
            const nextZ = getMaxZIndex(prev) + 1;
            if (prev[type].zIndex === nextZ - 1) return prev; // already on top
            return { ...prev, [type]: { ...prev[type], zIndex: nextZ } };
        });
    };

    const updatePosition = (type: WindowType, x: number, y: number) => {
        setWindowsState(prev => ({ ...prev, [type]: { ...prev[type], x, y } }));
    };
    
    /**
     * Ensures all open windows are within the specified dimensions.
     * Useful when transitioning between the 3D Macbook screen and the full browser window.
     */
    const constrainWindows = (viewportWidth: number, viewportHeight: number) => {
        setWindowsState(prev => {
            const newState = { ...prev };
            let hasChanged = false;

            (Object.keys(prev) as WindowType[]).forEach(type => {
                const window = prev[type];
                if (window.isOpen) {
                    const { width: wWidth, height: wHeight } = WINDOW_DEFAULTS[type];
                    
                    // Clamp X (0 to viewportWidth - windowWidth)
                    const maxX = Math.max(0, viewportWidth - wWidth);
                    const newX = Math.min(Math.max(0, window.x), maxX);
                    
                    // Clamp Y (0 to viewportHeight - windowHeight)
                    const maxY = Math.max(0, viewportHeight - wHeight);
                    const newY = Math.min(Math.max(0, window.y), maxY);

                    if (newX !== window.x || newY !== window.y) {
                        newState[type] = { ...window, x: newX, y: newY };
                        hasChanged = true;
                    }
                }
            });

            return hasChanged ? newState : prev;
        });
    };

    const wakeScreen = () => setIsSleeping(false);
    const sleepScreen = () => setIsSleeping(true);

    const restartSequence = () => {
        setIsSleeping(true);
        setTimeout(() => {
            setIsSleeping(false);
            window.location.href = '/macbook';
        }, 1000);
    };

    return (
        <DesktopContext.Provider value={{ openWindow, closeWindow, focusWindow, updatePosition, constrainWindows, windowsState, sleepScreen, restartSequence }}>
            <div className="w-full h-full relative">
                {children}


                {/* Sleep Overlay Layer */}
                {isSleeping && (
                    <div
                        className="fixed inset-0 bg-black z-9999 flex items-center justify-center pointer-events-auto"
                        onMouseMove={(e) => {
                            if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5) {
                                wakeScreen();
                            }
                        }}
                        onKeyDown={() => wakeScreen()}
                        tabIndex={0}
                        autoFocus
                        ref={(el) => { if (el) el.focus(); }}
                    />
                )}
            </div>
        </DesktopContext.Provider>
    );
};

