import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { type WindowType, type WindowsState, WINDOW_DEFAULTS } from '../types/desktop';

function centeredPosition(width: number, height: number) {
    return {
        x: window.innerWidth / 2 - width / 2,
        y: window.innerHeight / 2 - height / 2,
    };
}

const initialWindowsState: WindowsState = {
    about:    { isOpen: false, zIndex: 100, x: 0, y: 0 },
    settings: { isOpen: false, zIndex: 100, x: 0, y: 0 },
    notes:    { isOpen: false, zIndex: 100, x: 0, y: 0 },
    safari:   { isOpen: false, zIndex: 100, x: 0, y: 0 },
    contacts: { isOpen: false, zIndex: 100, x: 0, y: 0 },
    finder:   { isOpen: false, zIndex: 100, x: 0, y: 0 },
    preview:  { isOpen: false, zIndex: 100, x: 0, y: 0 },
};

// Compress an image file to a base64 JPEG (max 1920px, 80% quality)
export async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            const MAX = 1920;
            const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * ratio);
            canvas.height = Math.round(img.height * ratio);
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas unavailable')); return; }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(objectUrl);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = objectUrl;
    });
}

export function wallpaperUrl(wallpaper: string): string {
    return wallpaper === 'default' ? '/images/wallpaper.jpg' : wallpaper;
}

export interface PreviewTarget {
    name: string;
    kind: 'md' | 'pdf' | 'vcf';
}

interface DesktopContextType {
    openWindow: (type: WindowType, x?: number, y?: number) => void;
    closeWindow: (type: WindowType) => void;
    focusWindow: (type: WindowType) => void;
    updatePosition: (type: WindowType, x: number, y: number) => void;
    constrainWindows: (width: number, height: number) => void;
    windowsState: WindowsState;
    sleepScreen: () => void;
    restartSequence: () => void;
    wallpaper: string;
    setWallpaper: (url: string) => void;
    soundEnabled: boolean;
    setSoundEnabled: (v: boolean) => void;
    playSound: (type: 'open' | 'close') => void;
    previewTarget: PreviewTarget | null;
    openPreview: (target: PreviewTarget) => void;
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
    wallpaper: 'default',
    setWallpaper: () => {},
    soundEnabled: true,
    setSoundEnabled: () => {},
    playSound: () => {},
    previewTarget: null,
    openPreview: () => {},
});

export const useDesktop = () => useContext(DesktopContext);

export const DesktopProvider = ({ children }: { children: ReactNode }) => {
    const [windowsState, setWindowsState] = useState<WindowsState>(initialWindowsState);
    const [isSleeping, setIsSleeping] = useState(false);
    const [wallpaper, setWallpaperState] = useState<string>(
        () => localStorage.getItem('portfolio-wallpaper') || 'default'
    );
    const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);

    const [soundEnabled, setSoundEnabledState] = useState<boolean>(
        () => localStorage.getItem('portfolio-sound') !== 'false'
    );
    const openAudioRef = useRef<HTMLAudioElement | null>(null);
    const closeAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        openAudioRef.current = new Audio('/sounds/open.mp3');
        closeAudioRef.current = new Audio('/sounds/close.mp3');
    }, []);

    // Apply wallpaper to body whenever it changes
    useEffect(() => {
        document.body.style.backgroundImage = `url(${wallpaperUrl(wallpaper)})`;
    }, [wallpaper]);

    const setWallpaper = (url: string) => {
        try {
            localStorage.setItem('portfolio-wallpaper', url);
        } catch {
            console.warn('[DesktopContext] localStorage full — wallpaper not persisted');
        }
        setWallpaperState(url);
    };

    const setSoundEnabled = (v: boolean) => {
        localStorage.setItem('portfolio-sound', String(v));
        setSoundEnabledState(v);
    };

    const playSound = (type: 'open' | 'close') => {
        if (localStorage.getItem('portfolio-sound') === 'false') return;
        try {
            const audio = type === 'open' ? openAudioRef.current : closeAudioRef.current;
            if (!audio) return;
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch {
            // Autoplay blocked — silently skip
        }
    };

    const getMaxZIndex = (state: WindowsState) =>
        Math.max(...Object.values(state).map(w => w.zIndex));

    const openWindow = (type: WindowType, x?: number, y?: number) => {
        setWindowsState(prev => {
            if (prev[type].isOpen) {
                const nextZ = getMaxZIndex(prev) + 1;
                return { ...prev, [type]: { ...prev[type], zIndex: nextZ } };
            }
            const { width, height } = WINDOW_DEFAULTS[type];
            const defaultPos = centeredPosition(width, height);
            const initialX = x ?? defaultPos.x;
            const initialY = y ?? defaultPos.y;
            const nextZ = getMaxZIndex(prev) + 1;
            return { ...prev, [type]: { isOpen: true, zIndex: nextZ, x: initialX, y: initialY } };
        });
    };

    const closeWindow = (type: WindowType) => {
        setWindowsState(prev => ({ ...prev, [type]: { ...prev[type], isOpen: false } }));
    };

    const focusWindow = (type: WindowType) => {
        setWindowsState(prev => {
            const nextZ = getMaxZIndex(prev) + 1;
            if (prev[type].zIndex === nextZ - 1) return prev;
            return { ...prev, [type]: { ...prev[type], zIndex: nextZ } };
        });
    };

    const updatePosition = (type: WindowType, x: number, y: number) => {
        setWindowsState(prev => ({ ...prev, [type]: { ...prev[type], x, y } }));
    };

    const constrainWindows = (viewportWidth: number, viewportHeight: number) => {
        setWindowsState(prev => {
            const newState = { ...prev };
            let hasChanged = false;
            (Object.keys(prev) as WindowType[]).forEach(type => {
                const window = prev[type];
                if (window.isOpen) {
                    const { width: wWidth, height: wHeight } = WINDOW_DEFAULTS[type];
                    const maxX = Math.max(0, viewportWidth - wWidth);
                    const newX = Math.min(Math.max(0, window.x), maxX);
                    const maxY = Math.max(28, viewportHeight - wHeight);
                    const newY = Math.min(Math.max(28, window.y), maxY);
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

    const openPreview = (target: PreviewTarget) => {
        setPreviewTarget(target);
        openWindow('preview');
    };

    const restartSequence = () => {
        setIsSleeping(true);
        setTimeout(() => {
            setIsSleeping(false);
            window.location.href = '/macbook';
        }, 1000);
    };

    return (
        <DesktopContext.Provider value={{
            openWindow, closeWindow, focusWindow, updatePosition, constrainWindows,
            windowsState, sleepScreen, restartSequence,
            wallpaper, setWallpaper,
            soundEnabled, setSoundEnabled, playSound,
            previewTarget, openPreview,
        }}>
            <div className="w-full h-full relative">
                {children}

                {isSleeping && (
                    <div
                        className="fixed inset-0 bg-black z-9999 flex items-center justify-center pointer-events-auto"
                        onMouseMove={(e) => {
                            if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5) wakeScreen();
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
