import React from 'react';
import { useDesktop } from '../contexts/DesktopContext';

interface MacWindowProps {
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string; // App container overall style
    sidebar?: React.ReactNode; // Optional sidebar
    sidebarClassName?: string;
    contentClassName?: string;
    theme?: 'light' | 'dark';
}

export default function MacWindow({
    title,
    onClose,
    children,
    className = '',
    sidebar,
    sidebarClassName = '',
    contentClassName = '',
    theme = 'dark'
}: MacWindowProps) {
    const { playSound } = useDesktop();
    const isDark = theme === 'dark';

    return (
        <div className={`rounded-xl shadow-2xl drop-shadow-2xl overflow-hidden flex border pointer-events-auto relative ${
            isDark ? 'bg-[#22201F] text-white/90 border-[#3e3e3e]/40' : 'bg-white text-black border-black/10'
        } ${className}`}>
            {/* Unified Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-11 z-[60] flex items-center px-4 cursor-grab active:cursor-grabbing">
                <div className="flex gap-2 items-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            playSound('close');
                            onClose();
                        }}
                        className="w-3 h-3 rounded-full bg-[#ff6157] cursor-pointer hover:bg-[#ff6157]/80 flex items-center justify-center"
                    />
                    <button className="w-3 h-3 rounded-full bg-[#ffc030] cursor-default opacity-50" />
                    <button className="w-3 h-3 rounded-full bg-[#2acb42] cursor-default opacity-50" />
                </div>

                {/* Draggable area (excludes corners) */}
                <div className="drag-handle absolute top-0 left-12 right-12 h-11" />
                
                 {title && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className={`text-sm font-semibold select-none ${
                            isDark ? 'text-white/80' : 'text-black/60'
                        }`}>{title}</span>
                    </div>
                )}
            </div>

            {/* Optional Sidebar */}
            {sidebar && (
                <div className={`flex-none flex flex-col pt-11 ${sidebarClassName}`}>
                    <div className="flex-1 overflow-y-auto">
                        {sidebar}
                    </div>
                </div>
            )}

            {/* Main Window Content */}
            <div className={`flex-1 flex flex-col relative pt-11 ${contentClassName}`}>
                {children}
            </div>
        </div>
    );
}
