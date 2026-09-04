import { useState, useRef, useEffect } from 'react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';
import { PROFILE } from '../../constants/profile';
import gsap from 'gsap';

export default function NotesWindow() {
    const { closeWindow, windowsState } = useDesktop();
    const [title, setTitle] = useState('Portfolio Guide');
    const [content, setContent] = useState(
        `My name is ${PROFILE.name}. Welcome to my portfolio! Here is some stuff for you to try out.\n\n` +
        '1. Click and drag the "Welcome" text, its made to be interactive. See how far you can stretch it.\n' +
        '2. Explore the apps in the dock.\n' +
        '3. Feel free to edit this note - it\'s just for you!\n\n' +
        'Enjoy your stay!'
    );

    const isMacbookRoute = window.location.pathname === '/macbook';

    const containerRef = useRef<HTMLDivElement>(null);

    // Initial animation: Simple Entrance
    useEffect(() => {
        if (windowsState.notes.isOpen && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { scale: 0.9, opacity: 0, y: 10 },
                { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            );
        }
    }, [windowsState.notes.isOpen]);

    const currentDate = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(new Date());

    return (
        <DraggableWindow id="notes" resizable minWidth={320} minHeight={360}>
            <div ref={containerRef} className="w-full h-full">
                <MacWindow
                    onClose={() => closeWindow('notes')}
                    title={title}
                    theme="light"
                    className="w-full h-full flex flex-col shadow-2xl"
                    contentClassName="flex-1 flex flex-col"
                >
                    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-white">
                        {/* Date Header */}
                        <div className="text-center text-[11px] text-gray-400 mb-6 font-medium tracking-tight">
                            {currentDate}
                        </div>

                        {/* Editable Title */}
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            onInput={(e) => setTitle(e.currentTarget.textContent || '')}
                            className="text-[28px] font-bold text-gray-800 mb-4 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
                            data-placeholder="Note Title"
                        >
                            {title}
                        </div>

                        {/* Editable Body */}
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setContent(e.currentTarget.innerText)}
                            className="flex-1 text-[15px] leading-relaxed text-gray-700 outline-none whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
                            data-placeholder="Start typing..."
                        >
                            {content}
                        </div>

                        {!isMacbookRoute && (
                            <div className="text-[15px] leading-relaxed text-gray-700 mt-4">
                                P.S. Click <a href="/macbook" className="text-blue-500 underline hover:text-blue-600">here</a> for some threejs stuff I'm playing around with.
                            </div>
                        )}
                    </div>

                    {/* Bottom Bar Gradient (Subtle) */}
                    <div className="h-4 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none" />
                </MacWindow>
            </div>
        </DraggableWindow>
    );
}
