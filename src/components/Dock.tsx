import { useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { useDesktop } from '../contexts/DesktopContext';
import gsap from 'gsap';

import finderIcon from '../assets/dock/finder.png';
import notesIcon from '../assets/dock/notes.png';
import settingsIcon from '../assets/dock/settings.png';
import safariIcon from '../assets/dock/safari.png';
import contactsIcon from '../assets/dock/contacts.png';
import spotifyIcon from '../assets/dock/spotify.png';

interface DockIconProps {
    label: string;
    isOpen: boolean;
    onClick: () => void;
    tooltipId: string;
    src?: string;
    children?: React.ReactNode;
}

function DockIcon({ label, isOpen, onClick, tooltipId, src, children }: DockIconProps) {
    const iconRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        gsap.to(iconRef.current, { scale: 1.25, y: -8, duration: 0.18, ease: 'back.out(2)' });
    };

    const handleMouseLeave = () => {
        gsap.to(iconRef.current, { scale: 1, y: 0, duration: 0.15, ease: 'power2.out' });
    };

    return (
        <div
            ref={iconRef}
            className="dock-icon flex flex-col items-center"
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-tooltip-id={tooltipId}
            data-tooltip-content={label}
        >
            {src
                ? <img src={src} alt={label} draggable={false} />
                : children
            }
            <div className={`dock-dot transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
}

export default function Dock() {
    const { windowsState, openWindow, playSound } = useDesktop();

    return (
        <div id="dock">
            <div className="dock-container">
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
