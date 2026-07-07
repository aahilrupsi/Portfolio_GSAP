import { useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { useDesktop } from '../contexts/DesktopContext';
import gsap from 'gsap';

import finderIcon from '../assets/dock_icons/finder.png';
import notesIcon from '../assets/dock_icons/notes.png';
import settingsIcon from '../assets/dock_icons/settings.png';
import safariIcon from '../assets/dock_icons/safari.png';

interface DockIconProps {
    label: string;
    isOpen: boolean;
    onClick: () => void;
    src: string;
    tooltipId: string;
}

function DockIcon({ label, isOpen, onClick, src, tooltipId }: DockIconProps) {
    const iconRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        gsap.to(iconRef.current, {
            scale: 1.25,
            y: -8,
            duration: 0.18,
            ease: 'back.out(2)'
        });
    };

    const handleMouseLeave = () => {
        gsap.to(iconRef.current, {
            scale: 1,
            y: 0,
            duration: 0.15,
            ease: 'power2.out'
        });
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
            <img src={src} alt={label} draggable={false} />
            <div className={`dock-dot transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
}

export default function Dock() {
    const { windowsState, openWindow } = useDesktop();

    return (
        <div id="dock">
            <div className="dock-container">
                {/* Finder - always shows dot */}
                <DockIcon
                    label="Finder"
                    isOpen={true}
                    onClick={() => {}}
                    src={finderIcon}
                    tooltipId="dock-tt"
                />

                {/* Separator */}
                <div className="dock-separator" />

                {/* Notes */}
                <DockIcon
                    label="Notes"
                    isOpen={windowsState.notes.isOpen}
                    onClick={() => openWindow('notes')}
                    src={notesIcon}
                    tooltipId="dock-tt"
                />

                {/* System Settings */}
                <DockIcon
                    label="System Settings"
                    isOpen={windowsState.settings.isOpen}
                    onClick={() => openWindow('settings')}
                    src={settingsIcon}
                    tooltipId="dock-tt"
                />

                {/* Safari */}
                <DockIcon
                    label="Safari"
                    isOpen={windowsState.safari.isOpen}
                    onClick={() => openWindow('safari')}
                    src={safariIcon}
                    tooltipId="dock-tt"
                />
            </div>

            <Tooltip
                id="dock-tt"
                place="top"
                offset={10}
                className="!text-xs !py-1 !px-3 !rounded-lg !bg-gray-800/90 !text-white !shadow-xl"
            />
        </div>
    );
}
