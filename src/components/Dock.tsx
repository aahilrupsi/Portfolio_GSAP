import { useEffect, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { useDesktop } from '../contexts/DesktopContext';

import finderIcon from '../assets/dock/finder.png';
import notesIcon from '../assets/dock/notes.png';
import settingsIcon from '../assets/dock/settings.png';
import safariIcon from '../assets/dock/safari.png';
import contactsIcon from '../assets/dock/contacts.png';
import spotifyIcon from '../assets/dock/spotify.png';
import mailIcon from '../assets/dock/mail.png';
import terminalIcon from '../assets/dock/terminal.png';

interface DockIconProps {
    label: string;
    isOpen: boolean;
    onClick: () => void;
    tooltipId: string;
    src?: string;
    children?: React.ReactNode;
}

function DockIcon({ label, isOpen, onClick, tooltipId, src, children }: DockIconProps) {
    return (
        <div
            className="dock-icon flex flex-col items-center"
            onClick={onClick}
            data-tooltip-id={tooltipId}
            data-tooltip-content={label}
        >
            <div className="dock-icon-inner">
                {src
                    ? <img src={src} alt={label} draggable={false} />
                    : children
                }
            </div>
            <div className={`dock-dot transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
}

// Distance (px) over which the magnification falls off, and how much the
// closest icon grows by. Mirrors the real macOS Dock's magnification curve.
const MAGNIFY_SIGMA = 90;
const MAGNIFY_AMPLITUDE = 0.4;

export default function Dock() {
    const { windowsState, openWindow, playSound } = useDesktop();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const icons = Array.from(container.querySelectorAll<HTMLElement>('.dock-icon-inner'));
        let centers: number[] = [];

        const captureCenters = () => {
            centers = icons.map((icon) => {
                const rect = icon.getBoundingClientRect();
                return rect.left + rect.width / 2;
            });
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (!centers.length) captureCenters();
            icons.forEach((icon, i) => {
                const distance = e.clientX - centers[i];
                const magnify = 1 + MAGNIFY_AMPLITUDE * Math.exp(-(distance * distance) / (2 * MAGNIFY_SIGMA * MAGNIFY_SIGMA));
                icon.style.setProperty('--m', magnify.toFixed(3));
            });
        };

        const handlePointerLeave = () => {
            icons.forEach((icon) => icon.style.setProperty('--m', '1'));
            centers = [];
        };

        container.addEventListener('pointerenter', captureCenters);
        container.addEventListener('pointermove', handlePointerMove);
        container.addEventListener('pointerleave', handlePointerLeave);

        return () => {
            container.removeEventListener('pointerenter', captureCenters);
            container.removeEventListener('pointermove', handlePointerMove);
            container.removeEventListener('pointerleave', handlePointerLeave);
        };
    }, []);

    return (
        <div id="dock">
            <div className="dock-container" ref={containerRef}>
                {/* Finder */}
                <DockIcon label="Finder" isOpen={windowsState.finder.isOpen} onClick={() => { playSound('open'); openWindow('finder'); }} src={finderIcon} tooltipId="dock-tt" />

                <div className="dock-separator" />

                {/* Notes */}
                <DockIcon label="Notes" isOpen={windowsState.notes.isOpen} onClick={() => { playSound('open'); openWindow('notes'); }} src={notesIcon} tooltipId="dock-tt" />

                {/* Contacts */}
                <DockIcon label="Contacts" isOpen={windowsState.contacts.isOpen} onClick={() => { playSound('open'); openWindow('contacts'); }} src={contactsIcon} tooltipId="dock-tt" />

                {/* System Settings */}
                <DockIcon label="System Settings" isOpen={windowsState.settings.isOpen} onClick={() => { playSound('open'); openWindow('settings'); }} src={settingsIcon} tooltipId="dock-tt" />

                {/* Safari */}
                <DockIcon label="Safari" isOpen={windowsState.safari.isOpen} onClick={() => { playSound('open'); openWindow('safari'); }} src={safariIcon} tooltipId="dock-tt" />

                <div className="dock-separator" />

                {/* Spotify */}
                <DockIcon label="Spotify" isOpen={windowsState.spotify.isOpen} onClick={() => { playSound('open'); openWindow('spotify'); }} src={spotifyIcon} tooltipId="dock-tt" />

                {/* Mail */}
                <DockIcon label="Mail" isOpen={windowsState.mail.isOpen} onClick={() => { playSound('open'); openWindow('mail'); }} src={mailIcon} tooltipId="dock-tt" />

                {/* Terminal */}
                <DockIcon label="Terminal" isOpen={windowsState.terminal.isOpen} onClick={() => { playSound('open'); openWindow('terminal'); }} src={terminalIcon} tooltipId="dock-tt" />
            </div>

            <Tooltip
                id="dock-tt"
                place="top"
                offset={10}
                noArrow
                className="!text-xs !py-1 !px-3 !rounded-lg !bg-gray-800/90 !text-white !border-0 !shadow-none"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
            />
        </div>
    );
}
