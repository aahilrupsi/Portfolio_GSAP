import { useState, useRef, useEffect } from 'react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';
import { PROFILE } from '../../constants/profile';
import gsap from 'gsap';

const PROMPT = `${PROFILE.firstName.toLowerCase()}@portfolio ~ %`;

const HELP_TEXT =
    'available commands:\n' +
    '  help       show this message\n' +
    '  clear      clear the screen\n' +
    '  whoami     quick summary\n' +
    `  contact    ways to reach ${PROFILE.firstName.toLowerCase()}\n` +
    '  resume     where to find the resume\n' +
    '  projects   where to find project write-ups\n\n' +
    `anything else is treated as a question and answered by a small AI — try "what does ${PROFILE.firstName.toLowerCase()} work on?"`;

// Answered locally so common asks don't burn AI requests (or hit the rate limiter) for no reason.
const LOCAL_ANSWERS: Record<string, string> = {
    whoami: `${PROFILE.name} — ${PROFILE.title}. Building this portfolio, among other things.`,
    contact:
        `email:    ${PROFILE.email}\n` +
        `github:   github.com/${PROFILE.github.handle}\n` +
        `linkedin: linkedin.com/in/${PROFILE.linkedin.handle}\n\n` +
        // X/Twitter account disabled — no longer public.
        // `x:        x.com/${PROFILE.x.handle}\n\n` +
        '(or just open the Contacts app in the dock)',
    resume: 'resume.pdf is in Finder → Documents. Or ask me anything and I\'ll answer directly.',
    projects: 'check the Safari app\'s start page for a project overview — or ask me about a specific one.',
};

interface Line {
    id: number;
    kind: 'input' | 'output' | 'system' | 'error' | 'pending';
    text: string;
}

interface AIResult {
    text: string;
    ok: boolean;
}

async function askAI(message: string, history: { role: 'user' | 'assistant'; content: string }[]): Promise<AIResult> {
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history }),
        });

        if (res.status === 429) {
            return { text: 'rate limit exceeded — slow down and try again in a moment.', ok: false };
        }
        if (!res.ok) {
            throw new Error(`status ${res.status}`);
        }

        const data = await res.json();
        return { text: data.reply ?? '(empty response)', ok: true };
    } catch {
        return { text: "connection refused — the AI backend isn't wired up yet. check back soon.", ok: false };
    }
}

export default function TerminalWindow() {
    const { closeWindow, windowsState } = useDesktop();
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const nextId = useRef(0);
    const conversationRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const typingTimeout = useRef<number | undefined>(undefined);

    const [lines, setLines] = useState<Line[]>([]);
    const [draft, setDraft] = useState('');
    const [isBusy, setIsBusy] = useState(false);
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [histIndex, setHistIndex] = useState<number | null>(null);

    const pushLine = (kind: Line['kind'], text: string) => {
        const id = nextId.current++;
        setLines(prev => [...prev, { id, kind, text }]);
        return id;
    };

    // Entrance animation + one-time boot text, mirrors NotesWindow/SpotifyWindow.
    useEffect(() => {
        if (windowsState.terminal.isOpen && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { scale: 0.9, opacity: 0, y: 10 },
                { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
            );
        }
        if (windowsState.terminal.isOpen && lines.length === 0) {
            const today = new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            pushLine('system', `Last login: ${today} on ttys000`);
            pushLine('system', `Hi, I'm a small AI that knows a bit about ${PROFILE.firstName}. Ask me anything, or type 'help'.`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowsState.terminal.isOpen]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [lines]);

    useEffect(() => {
        return () => window.clearTimeout(typingTimeout.current);
    }, []);

    const typeOutLine = (full: string) => {
        const id = nextId.current++;
        setLines(prev => [...prev, { id, kind: 'output', text: '' }]);
        let i = 0;
        const step = () => {
            i += Math.max(1, Math.round(full.length / 60));
            const chunk = full.slice(0, i);
            setLines(prev => prev.map(l => (l.id === id ? { ...l, text: chunk } : l)));
            if (i < full.length) {
                typingTimeout.current = window.setTimeout(step, 16);
            }
        };
        step();
    };

    const focusInput = () => inputRef.current?.focus();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed || isBusy) return;

        setCmdHistory(prev => [...prev, trimmed]);
        setHistIndex(null);
        pushLine('input', trimmed);
        setDraft('');

        const lower = trimmed.toLowerCase();
        if (lower === 'clear') { setLines([]); return; }
        if (lower === 'help') { pushLine('system', HELP_TEXT); return; }
        if (LOCAL_ANSWERS[lower]) { pushLine('system', LOCAL_ANSWERS[lower]); return; }

        setIsBusy(true);
        const pendingId = pushLine('pending', '');
        const result = await askAI(trimmed, conversationRef.current);
        setLines(prev => prev.filter(l => l.id !== pendingId));
        setIsBusy(false);

        if (result.ok) {
            conversationRef.current.push({ role: 'user', content: trimmed }, { role: 'assistant', content: result.text });
            typeOutLine(result.text);
        } else {
            pushLine('error', result.text);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length === 0) return;
            const nextIndex = histIndex === null ? cmdHistory.length - 1 : Math.max(0, histIndex - 1);
            setHistIndex(nextIndex);
            setDraft(cmdHistory[nextIndex]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIndex === null) return;
            const nextIndex = histIndex + 1;
            if (nextIndex >= cmdHistory.length) {
                setHistIndex(null);
                setDraft('');
            } else {
                setHistIndex(nextIndex);
                setDraft(cmdHistory[nextIndex]);
            }
        }
    };

    const lineColor: Record<Line['kind'], string> = {
        input: 'text-white/90',
        output: 'text-white/80',
        system: 'text-white/50',
        error: 'text-red-400/90',
        pending: 'text-white/40',
    };

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
                        onClick={focusInput}
                        className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 font-mono text-[13px] leading-relaxed"
                    >
                        {lines.map(line => (
                            <div key={line.id} className={`whitespace-pre-wrap break-words ${lineColor[line.kind]}`}>
                                {line.kind === 'input' ? (
                                    <>
                                        <span className="text-[#2ee66b]">{PROMPT}</span> {line.text}
                                    </>
                                ) : line.kind === 'pending' ? (
                                    <span className="animate-pulse">…</span>
                                ) : (
                                    line.text
                                )}
                            </div>
                        ))}

                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <span className="text-[#2ee66b] font-mono text-[13px] flex-none">{PROMPT}</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={draft}
                                onChange={e => setDraft(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isBusy}
                                autoFocus
                                spellCheck={false}
                                autoComplete="off"
                                className="flex-1 bg-transparent outline-none border-none font-mono text-[13px] text-white/90 caret-[#2ee66b] disabled:opacity-50"
                            />
                        </form>
                    </div>
                </MacWindow>
            </div>
        </DraggableWindow>
    );
}
