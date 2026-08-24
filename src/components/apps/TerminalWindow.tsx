import { useState, useRef, useEffect } from 'react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { PROFILE } from '../../constants/profile';
import terminalIcon from '../../assets/dock/terminal.png';
import gsap from 'gsap';

const PROMPT = `${PROFILE.firstName.toLowerCase()}@portfolio ~ %`;

interface Line {
    id: number;
    text: string;
}

export default function TerminalWindow() {
    const { closeWindow, windowsState } = useDesktop();
    const { notify } = useNotifications();
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(0);
    const hasBootedRef = useRef(false);

    const [lines, setLines] = useState<Line[]>([]);

    const pushLine = (text: string) => {
        const id = nextId.current++;
        setLines(prev => [...prev, { id, text }]);
    };

    // Entrance animation + one-time boot text, mirrors NotesWindow/SpotifyWindow.
    useEffect(() => {
        if (windowsState.terminal.isOpen && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { scale: 0.9, opacity: 0, y: 10 },
                { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
            );
        }
        // Guarded with a ref (not just lines.length) because StrictMode double-invokes
        // this effect on mount, and the second pass would otherwise still see the
        // pre-update `lines` value and fire the boot text/notification twice.
        if (windowsState.terminal.isOpen && !hasBootedRef.current) {
            hasBootedRef.current = true;
            const today = new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            pushLine(`Last login: ${today} on ttys000`);
            notify({
                id: 'terminal-coming-soon',
                trigger: 'temporary',
                appName: 'Terminal',
                title: 'Feature incomplete',
                message: "The AI backend for this terminal isn't wired up yet, so input is disabled — coming soon.",
                icon: terminalIcon,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowsState.terminal.isOpen]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [lines]);

    return (
        <DraggableWindow id="terminal" resizable minWidth={420} minHeight={260}>
            <div ref={containerRef} className="w-full h-full">
                <MacWindow
                    onClose={() => closeWindow('terminal')}
                    title={`${PROFILE.firstName.toLowerCase()} — zsh — 80×24`}
                    theme="dark"
                    className="w-full h-full flex flex-col"
                    contentClassName="flex-1 bg-[#1a1a1a] flex flex-col"
                >
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 font-mono text-[13px] leading-relaxed"
                    >
                        {lines.map(line => (
                            <div key={line.id} className="whitespace-pre-wrap break-words text-white/50">
                                {line.text}
                            </div>
                        ))}

                        <div className="flex items-center gap-2">
                            <span className="text-[#2ee66b] font-mono text-[13px] flex-none">{PROMPT}</span>
                            <input
                                type="text"
                                value=""
                                disabled
                                readOnly
                                placeholder="input disabled — coming soon"
                                className="flex-1 bg-transparent outline-none border-none font-mono text-[13px] text-white/40 placeholder:text-white/25 disabled:opacity-50"
                            />
                        </div>
                    </div>
                </MacWindow>
            </div>
        </DraggableWindow>
    );
}
