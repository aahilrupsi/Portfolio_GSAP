import { useState, useRef, useEffect } from 'react';
import {
    Inbox, Send, FileEdit, Trash2, Search, SquarePen,
    Loader2, CheckCircle2, AlertCircle, ChevronLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';
import { PROFILE } from '../../constants/profile';
import gsap from 'gsap';

// ─── Data ────────────────────────────────────────────────────────────────────

const OWNER_EMAIL = PROFILE.email;

type MailboxId = 'inbox' | 'sent' | 'drafts' | 'trash';

interface MailMessage {
    id: string;
    from: { name: string; email: string };
    subject: string;
    preview: string;
    body: string;
    date: string;
    read: boolean;
}

const SEED_INBOX: MailMessage[] = [
    {
        id: 'welcome',
        from: { name: PROFILE.name, email: OWNER_EMAIL },
        subject: 'Say hi 👋',
        preview: "Thanks for poking around my portfolio — if you'd like to reach me directly...",
        body: `Thanks for poking around my portfolio! If you'd like to reach me directly, hit "New Message" above and send something over — it'll land in my real inbox.\n\n— ${PROFILE.firstName}`,
        date: 'Today',
        read: false,
    },
    {
        id: 'github',
        from: { name: 'GitHub', email: 'notifications@github.com' },
        subject: '[Portfolio_GSAP] New star on your repository',
        preview: `Someone starred ${PROFILE.github.handle}/Portfolio_GSAP`,
        body: 'Someone just starred your repository Portfolio_GSAP. Keep building!',
        date: 'Yesterday',
        read: true,
    },
    // {
    //     id: 'recruiter',
    //     from: { name: 'Talent Partner', email: 'noreply@talentnetwork.example' },
    //     subject: 'Your profile is getting attention',
    //     preview: 'Hiring managers have been viewing your profile this week...',
    //     body: 'Hiring managers have been viewing your profile this week. Keep your portfolio up to date to get noticed!',
    //     date: 'Mon',
    //     read: true,
    // },
];

// ─── Mailbox sidebar config ──────────────────────────────────────────────────

interface MailboxItem {
    id: MailboxId;
    label: string;
    Icon: LucideIcon;
}

const MAILBOXES: MailboxItem[] = [
    { id: 'inbox',  label: 'Inbox',  Icon: Inbox },
    { id: 'sent',   label: 'Sent',   Icon: Send },
    { id: 'drafts', label: 'Drafts', Icon: FileEdit },
    { id: 'trash',  label: 'Trash',  Icon: Trash2 },
];

// ─── Send ───────────────────────────────────────────────────────────────────
async function sendMail(payload: { fromEmail: string; subject: string; body: string }): Promise<void> {
    const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        throw new Error('Failed to send message');
    }
}

type SendState = 'idle' | 'sending' | 'sent' | 'error';

// ─── Component ───────────────────────────────────────────────────────────────

export default function MailWindow() {
    const { closeWindow, windowsState } = useDesktop();
    const containerRef = useRef<HTMLDivElement>(null);
    const nextSentId = useRef(1);

    const [mailbox, setMailbox]         = useState<MailboxId>('inbox');
    const [inbox, setInbox]             = useState<MailMessage[]>(SEED_INBOX);
    const [sent, setSent]               = useState<MailMessage[]>([]);
    const [selectedId, setSelectedId]   = useState<string | null>(null);
    const [composing, setComposing]     = useState(false);

    const [fromEmail, setFromEmail] = useState('');
    const [subject, setSubject]     = useState('');
    const [body, setBody]           = useState('');
    const [sendState, setSendState] = useState<SendState>('idle');

    useEffect(() => {
        if (windowsState.mail.isOpen && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { scale: 0.9, opacity: 0, y: 10 },
                { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
            );
        }
    }, [windowsState.mail.isOpen]);

    const messagesByMailbox: Record<MailboxId, MailMessage[]> = {
        inbox, sent, drafts: [], trash: [],
    };
    const messages = messagesByMailbox[mailbox];
    const unreadCount = inbox.filter(m => !m.read).length;
    const selected = messages.find(m => m.id === selectedId) ?? null;

    const openMailbox = (id: MailboxId) => {
        setMailbox(id);
        setSelectedId(null);
        setComposing(false);
    };

    const openMessage = (msg: MailMessage) => {
        setComposing(false);
        setSelectedId(msg.id);
        if (mailbox === 'inbox' && !msg.read) {
            setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
        }
    };

    const startCompose = () => {
        setComposing(true);
        setSelectedId(null);
        setSubject('');
        setBody('');
        setSendState('idle');
    };

    const isValid = fromEmail.trim() !== '' && subject.trim() !== '' && body.trim() !== '';

    const handleSend = async () => {
        if (!isValid || sendState === 'sending') return;
        setSendState('sending');
        try {
            await sendMail({ fromEmail: fromEmail.trim(), subject: subject.trim(), body: body.trim() });
            const id = `sent-${nextSentId.current++}`;
            setSent(prev => [{
                id,
                from: { name: 'You', email: fromEmail.trim() },
                subject: subject.trim(),
                preview: body.trim().slice(0, 80),
                body: body.trim(),
                date: 'Just now',
                read: true,
            }, ...prev]);
            setSendState('sent');
            setTimeout(() => {
                setComposing(false);
                setMailbox('sent');
                setSelectedId(id);
                setSendState('idle');
            }, 1100);
        } catch {
            setSendState('error');
        }
    };

    // ── Sidebar ──────────────────────────────────────────────────────────────
    const sidebar = (
        <div className="py-2">
            <p className="px-3 pt-1 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider select-none">
                Mailboxes
            </p>
            {MAILBOXES.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    onClick={() => openMailbox(id)}
                    className={`flex items-center gap-2 py-[5px] px-2 rounded-[6px] cursor-default text-left select-none w-full ${
                        mailbox === id ? 'bg-[#0062d6] text-white' : 'text-white/80 hover:bg-white/[0.06]'
                    }`}
                    style={{ width: 'calc(100% - 8px)', margin: '0 4px' }}
                >
                    <Icon size={14} className="flex-none" />
                    <span className="text-[13px] flex-1 truncate">{label}</span>
                    {id === 'inbox' && unreadCount > 0 && (
                        <span className={`text-[10px] font-semibold rounded-full px-1.5 py-px flex-none ${
                            mailbox === id ? 'bg-white/25 text-white' : 'bg-[#3a78e0] text-white'
                        }`}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );

    // ── Toolbar ──────────────────────────────────────────────────────────────
    const toolbar = (
        <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 max-w-xs relative">
                <div className="flex items-center gap-2 bg-[#3a3a3c] rounded-lg px-3 h-[26px]">
                    <Search size={12} className="text-gray-500 flex-none" />
                    <input
                        type="text"
                        placeholder="Search"
                        disabled
                        className="flex-1 text-[13px] text-gray-300 outline-none bg-transparent placeholder:text-gray-500 cursor-default"
                    />
                </div>
            </div>
            <div className="flex-1" />
            <button
                onClick={startCompose}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title="New Message"
            >
                <SquarePen size={16} className="text-gray-300" />
            </button>
        </div>
    );

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <DraggableWindow id="mail" resizable minWidth={640} minHeight={420}>
            <div ref={containerRef} className="w-full h-full">
                <MacWindow
                    onClose={() => closeWindow('mail')}
                    theme="dark"
                    titleBarContent={toolbar}
                    sidebar={sidebar}
                    sidebarClassName="w-40 bg-[#1e1c1b] border-r border-black/60"
                    className="w-full h-full"
                    contentClassName="flex-1 flex flex-row min-h-0"
                >
                    {/* Message list */}
                    <div className="w-64 flex-none flex flex-col bg-[#201e1d] border-r border-black/50 overflow-y-auto custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center h-full">
                                <p className="text-[12px] text-white/30 select-none">No messages</p>
                            </div>
                        ) : messages.map(msg => {
                            const isSelected = selected?.id === msg.id;
                            return (
                                <div
                                    key={msg.id}
                                    onClick={() => openMessage(msg)}
                                    className={`px-3 py-2.5 border-b border-black/30 cursor-default select-none ${
                                        isSelected ? 'bg-[#0062d6]' : 'hover:bg-white/[0.05]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`text-[13px] font-semibold truncate ${
                                            !msg.read && mailbox === 'inbox' ? 'text-white' : isSelected ? 'text-white' : 'text-white/70'
                                        }`}>
                                            {mailbox === 'sent' ? msg.from.name : msg.from.name}
                                        </span>
                                        <span className={`text-[10px] flex-none ${isSelected ? 'text-white/70' : 'text-white/35'}`}>
                                            {msg.date}
                                        </span>
                                    </div>
                                    <p className={`text-[12px] truncate mt-0.5 ${isSelected ? 'text-white/85' : 'text-white/60'}`}>
                                        {msg.subject}
                                    </p>
                                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/60' : 'text-white/35'}`}>
                                        {msg.preview}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detail / compose pane */}
                    <div className="flex-1 min-w-0 flex flex-col bg-[#252321] overflow-y-auto custom-scrollbar">
                        {composing ? (
                            <div className="flex-1 flex flex-col">
                                <div className="px-5 py-3 border-b border-black/30 space-y-2 flex-none">
                                    <div className="flex items-center gap-2 text-[13px]">
                                        <span className="text-white/40 w-14 flex-none">To:</span>
                                        <span className="text-white/85">{OWNER_EMAIL}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px]">
                                        <span className="text-white/40 w-14 flex-none">From:</span>
                                        <input
                                            type="email"
                                            value={fromEmail}
                                            onChange={e => setFromEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            maxLength={254}
                                            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/25"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px]">
                                        <span className="text-white/40 w-14 flex-none">Subject:</span>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={e => setSubject(e.target.value)}
                                            placeholder="Subject"
                                            maxLength={200}
                                            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/25"
                                        />
                                    </div>
                                </div>
                                <textarea
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    placeholder="Write your message..."
                                    maxLength={5000}
                                    className="flex-1 min-h-0 bg-transparent outline-none text-white text-[13px] leading-relaxed p-5 resize-none placeholder:text-white/25"
                                />
                                <div className="px-5 py-3 border-t border-black/30 flex items-center gap-3 flex-none">
                                    <button
                                        onClick={handleSend}
                                        disabled={!isValid || sendState === 'sending' || sendState === 'sent'}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0062d6] hover:bg-[#0071f0] disabled:bg-white/10 disabled:text-white/30 text-white text-[13px] font-medium transition-colors"
                                    >
                                        {sendState === 'sending' && <Loader2 size={13} className="animate-spin" />}
                                        {sendState === 'sent' && <CheckCircle2 size={13} />}
                                        {sendState === 'error' && <AlertCircle size={13} />}
                                        {sendState === 'idle' && 'Send'}
                                        {sendState === 'sending' && 'Sending…'}
                                        {sendState === 'sent' && 'Sent'}
                                        {sendState === 'error' && 'Try Again'}
                                    </button>
                                    <button
                                        onClick={() => setComposing(false)}
                                        className="text-white/40 hover:text-white/70 text-[13px] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : selected ? (
                            <div className="flex-1 flex flex-col">
                                <div className="px-5 py-4 border-b border-black/30 flex-none">
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="flex items-center gap-1 text-[12px] text-white/40 hover:text-white/70 mb-3 md:hidden"
                                    >
                                        <ChevronLeft size={14} /> Back
                                    </button>
                                    <h2 className="text-[16px] font-semibold text-white">{selected.subject}</h2>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-[12px] text-white/50">
                                            <span className="text-white/80 font-medium">{selected.from.name}</span>
                                            {' '}&lt;{selected.from.email}&gt;
                                        </div>
                                        <span className="text-[11px] text-white/35 flex-none">{selected.date}</span>
                                    </div>
                                </div>
                                <div className="flex-1 px-5 py-4 text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap">
                                    {selected.body}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-[13px] text-white/25 select-none">No message selected</p>
                            </div>
                        )}
                    </div>
                </MacWindow>
            </div>
        </DraggableWindow>
    );
}
