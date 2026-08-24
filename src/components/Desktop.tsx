import React, { useEffect, useRef } from 'react';
import Navbar from '#components/Navbar';
import WindowManager from './WindowManager';
import NotificationStack from './NotificationStack';
import Dock from './Dock';
import { useDesktop } from '../contexts/DesktopContext';
import { useNotifications } from '../contexts/NotificationContext';
import JelloText from '#components/JelloText';

interface DesktopProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export default function Desktop({ children, className = '', ...props }: DesktopProps) {
    const { constrainWindows, openWindow, windowsState } = useDesktop();
    const { setStackBounds } = useNotifications();
    const containerRef = useRef<HTMLDivElement>(null);

    // Watch for size changes and keep windows (and the notification stack) in
    // bounds. This container's actual rendered size is the source of truth —
    // NOT window.innerWidth/innerHeight, which is wrong once Desktop is
    // portaled onto the /macbook 3D screen's smaller CSS3D <Html> surface.
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    console.log(`[Desktop] Constraining windows to: ${width}x${height}`);
                    constrainWindows(width, height);
                    setStackBounds(width, height);
                }
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [constrainWindows, setStackBounds]);

    // Automatically open the Notes app on mount if on the main page,
    // with a slight delay to allow the zoom-in transition to finish.
    useEffect(() => {
        if (window.location.pathname === '/' && !windowsState.notes.isOpen) {
            const timer = setTimeout(() => {
                const targetX = 40;
                const targetY = window.innerHeight - 500 - 40;
                openWindow('notes', targetX, targetY);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []); // Only run on mount

    return (
        <div
            ref={containerRef}
            className={`w-full h-full flex flex-col relative ${className}`}
            {...props}
        >
            <Navbar />
            <WindowManager />
            <NotificationStack />
            <div className="flex-1 relative overflow-hidden">
                {/* Background "WELCOME" text - Persistent across all Desktop views */}
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-auto">
                    <JelloText text="WELCOME" />
                </div>

                {/* Children / App content layer - pointer-events-none here to let text behind be clickable.
                    Nested components (like windows or buttons) must explicitly set pointer-events-auto. */}
                {children && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {children}
                    </div>
                )}
            </div>
            <Dock />
        </div>
    );
}
