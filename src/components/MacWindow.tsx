import React from 'react';

interface MacWindowProps {
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string; // App container overall style
    sidebar?: React.ReactNode; // Optional sidebar
    sidebarClassName?: string;
    contentClassName?: string;
}

export default function MacWindow({
    title,
    onClose,
    children,
    className = '',
    sidebar,
    sidebarClassName = '',
    contentClassName = ''
}: MacWindowProps) {
    return (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-2xl drop-shadow-2xl overflow-hidden flex border border-[#3e3e3e]/40 pointer-events-auto ${className}`}>
            {/* Optional Sidebar */}
            {sidebar && (
                <div className={`flex-none flex flex-col ${sidebarClassName}`}>
                    {/* Window Controls (Mac Buttons) inside Sidebar if sidebar exists */}
                    <div className="flex gap-2 items-center p-4">
                        <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#ff6157] cursor-pointer hover:bg-[#ff6157]/80" />
                        <button className="w-3 h-3 rounded-full bg-[#ffc030] cursor-default opacity-50" />
                        <button className="w-3 h-3 rounded-full bg-[#2acb42] cursor-default opacity-50" />
                    </div>
                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto">
                        {sidebar}
                    </div>
                </div>
            )}

            {/* Main Window Content */}
            <div className={`flex-1 flex flex-col relative ${contentClassName}`}>
                {/* Window Controls (Mac Buttons) inside Main Content if no sidebar */}
                {!sidebar && (
                    <div className="absolute top-4 left-4 flex gap-2 items-center z-10">
                        <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#ff6157] cursor-pointer hover:bg-[#ff6157]/80" />
                        <button className="w-3 h-3 rounded-full bg-[#ffc030] cursor-default opacity-50" />
                        <button className="w-3 h-3 rounded-full bg-[#2acb42] cursor-default opacity-50" />
                    </div>
                )}
                
                {/* Title if present (for normal windows) */}
                {title && (
                    <div className="w-full text-center py-3 text-sm font-semibold text-white/80 select-none">
                        {title}
                    </div>
                )}
                
                {children}
            </div>
        </div>
    );
}
