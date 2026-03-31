import React, { createContext, useContext, useState, type ReactNode } from 'react';

type WindowType = 'about' | 'settings';

interface DesktopContextType {
    openWindow: (type: WindowType) => void;
    closeWindow: (type: WindowType) => void;
    activeWindows: WindowType[];
    sleepScreen: () => void;
    restartSequence: () => void;
}

export const DesktopContext = createContext<DesktopContextType>({
    openWindow: () => { },
    closeWindow: () => { },
    activeWindows: [],
    sleepScreen: () => { },
    restartSequence: () => { }
});

export const useDesktop = () => useContext(DesktopContext);

import AboutThisMac from '../components/apps/AboutThisMac';
import SystemSettings from '../components/apps/SystemSettings';

export const DesktopProvider = ({ children }: { children: ReactNode }) => {
    const [activeWindows, setActiveWindows] = useState<WindowType[]>([]);
    const [isSleeping, setIsSleeping] = useState(false);

    const openWindow = (type: WindowType) => {
        setActiveWindows(prev => {
            if (prev.includes(type)) return prev;
            return [...prev, type];
        });
    };

    const closeWindow = (type: WindowType) => {
        setActiveWindows(prev => prev.filter(w => w !== type));
    };

    const wakeScreen = () => {
        setIsSleeping(false);
    };

    const sleepScreen = () => {
        setIsSleeping(true);
    };

    const restartSequence = () => {
        setIsSleeping(true);
        setTimeout(() => {
            setIsSleeping(false);
            window.location.href = '/macbook';
        }, 1000);
    };

    return (
        <DesktopContext.Provider value={{ openWindow, closeWindow, activeWindows, sleepScreen, restartSequence }}>
            <div className="w-full h-full relative">
                {children}

                {/* Global Window Layer */}
                {!isSleeping && (
                    <div className="fixed inset-0 pointer-events-none z-[80]">
                        {activeWindows.includes('about') && <AboutThisMac />}
                        {activeWindows.includes('settings') && <SystemSettings />}
                    </div>
                )}

                {/* Sleep Overlay Layer */}
                {isSleeping && (
                    <div
                        className="fixed inset-0 bg-black z-[9999] flex items-center justify-center pointer-events-auto"
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
