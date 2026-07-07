import { useState } from 'react';
import {
    ExternalLink, Copy, UserPlus, MessageSquare, ThumbsUp,
    Star, GitFork, Code, Mail, Calendar, Heart, Repeat2, Bookmark, Check
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';
import type React from 'react';

// --- Platform logos (inlined SVG — all major platforms block iframe embedding) ---

const LinkedInLogo = () => (
    <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const GitHubLogo = () => (
    <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const EmailLogo = () => (
    <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
);

const XLogo = () => (
    <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// --- Types ---

interface ContactAction {
    Icon: LucideIcon;
    label: string;
    onClick: () => void;
}

interface ContactField {
    label: string;
    value: string;
    link?: string;
    copyValue?: string;
}

interface Contact {
    id: string;
    name: string;
    initials: string;
    subtitle: string;
    gradient: string;
    avatarBg: string;
    Logo: React.ComponentType;
    actions: ContactAction[];
    fields: ContactField[];
}

// --- Contact data ---
// Update URLs below to point to your actual profiles

const CONTACTS: Contact[] = [
    {
        id: 'email',
        name: 'Email',
        initials: 'AR',
        subtitle: 'aahilrupsi@gmail.com',
        gradient: 'linear-gradient(150deg, #b71c1c 0%, #7f0000 55%, #3b0000 100%)',
        avatarBg: '#c62828',
        Logo: EmailLogo,
        actions: [
            { Icon: Mail,        label: 'Compose',  onClick: () => { window.location.href = 'mailto:aahilrupsi@gmail.com'; } },
            { Icon: Copy,        label: 'Copy',     onClick: () => navigator.clipboard.writeText('aahilrupsi@gmail.com') },
            { Icon: Calendar,    label: 'Schedule', onClick: () => window.open('https://calendar.google.com', '_blank') },
            { Icon: ExternalLink,label: 'Open Mail',onClick: () => window.open('https://mail.google.com', '_blank') },
        ],
        fields: [
            { label: 'email', value: 'aahilrupsi@gmail.com', link: 'mailto:aahilrupsi@gmail.com', copyValue: 'aahilrupsi@gmail.com' },
            { label: 'type', value: 'Personal' },
        ],
    },
    {
        id: 'github',
        name: 'GitHub',
        initials: 'GH',
        subtitle: 'aahilrupsi',
        gradient: 'linear-gradient(150deg, #2d333b 0%, #1c2128 55%, #0d1117 100%)',
        avatarBg: '#30363d',
        Logo: GitHubLogo,
        actions: [
            { Icon: Star,        label: 'Star',   onClick: () => window.open('https://github.com/aahilrupsi', '_blank') },
            { Icon: GitFork,     label: 'Fork',   onClick: () => window.open('https://github.com/aahilrupsi', '_blank') },
            { Icon: Code,        label: 'Repos',  onClick: () => window.open('https://github.com/aahilrupsi?tab=repositories', '_blank') },
            { Icon: ExternalLink,label: 'Open',   onClick: () => window.open('https://github.com/aahilrupsi', '_blank') },
        ],
        fields: [
            { label: 'profile url', value: 'github.com/aahilrupsi', link: 'https://github.com/aahilrupsi', copyValue: 'https://github.com/aahilrupsi' },
            { label: 'type', value: 'Code Repository' },
        ],
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        initials: 'in',
        subtitle: 'aahilrupsi',
        gradient: 'linear-gradient(150deg, #1565c0 0%, #0d47a1 55%, #0a2463 100%)',
        avatarBg: '#0a66c2',
        Logo: LinkedInLogo,
        actions: [
            { Icon: UserPlus,    label: 'Connect', onClick: () => window.open('https://linkedin.com/in/aahilrupsi', '_blank') },
            { Icon: MessageSquare, label: 'InMail', onClick: () => window.open('https://linkedin.com/in/aahilrupsi', '_blank') },
            { Icon: ThumbsUp,    label: 'Endorse', onClick: () => window.open('https://linkedin.com/in/aahilrupsi', '_blank') },
            { Icon: ExternalLink,label: 'Open',    onClick: () => window.open('https://linkedin.com/in/aahilrupsi', '_blank') },
        ],
        fields: [
            { label: 'profile url', value: 'linkedin.com/in/aahilrupsi', link: 'https://linkedin.com/in/aahilrupsi', copyValue: 'https://linkedin.com/in/aahilrupsi' },
            { label: 'network', value: 'Professional Network' },
        ],
    },
    {
        id: 'twitter',
        name: 'X / Twitter',
        initials: 'X',
        subtitle: '@aahilrupsi',
        gradient: 'linear-gradient(150deg, #1a1a1a 0%, #111 55%, #050505 100%)',
        avatarBg: '#111',
        Logo: XLogo,
        actions: [
            { Icon: Heart,       label: 'Like',     onClick: () => window.open('https://x.com/aahilrupsi', '_blank') },
            { Icon: Repeat2,     label: 'Repost',   onClick: () => window.open('https://x.com/aahilrupsi', '_blank') },
            { Icon: Bookmark,    label: 'Bookmark', onClick: () => window.open('https://x.com/aahilrupsi', '_blank') },
            { Icon: ExternalLink,label: 'Open',     onClick: () => window.open('https://x.com/aahilrupsi', '_blank') },
        ],
        fields: [
            { label: 'profile url', value: 'x.com/aahilrupsi', link: 'https://x.com/aahilrupsi', copyValue: 'https://x.com/aahilrupsi' },
            { label: 'network', value: 'Social Media' },
        ],
    },
];

// --- Component ---

export default function ContactsWindow() {
    const { closeWindow } = useDesktop();
    const [selectedId, setSelectedId] = useState<string>('linkedin');
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

    const selected = CONTACTS.find(c => c.id === selectedId) ?? CONTACTS[0];
    const Logo = selected.Logo;

    const handleCopy = (value: string, label: string) => {
        navigator.clipboard.writeText(value);
        setCopiedLabel(label);
        setTimeout(() => setCopiedLabel(null), 1800);
    };

    // Alphabetical section groups for the contact list
    const grouped = CONTACTS.reduce<Record<string, Contact[]>>((acc, c) => {
        const letter = c.name[0].toUpperCase();
        (acc[letter] ??= []).push(c);
        return acc;
    }, {});

    const sidebar = (
        <div className="py-2 px-2">
            <button className="w-full text-left px-2.5 py-1.5 rounded-[6px] bg-[#0062d6] text-white text-[13px] font-semibold select-none cursor-default">
                All Contacts
            </button>
        </div>
    );

    return (
        <DraggableWindow id="contacts" resizable minWidth={520} minHeight={380}>
            <MacWindow
                onClose={() => closeWindow('contacts')}
                theme="dark"
                className="w-full h-full"
                sidebar={sidebar}
                sidebarClassName="w-36 bg-[#1e1c1b] border-r border-black/60"
            >
                {/* Inner 2-column body: list + detail */}
                <div className="flex flex-row flex-1 overflow-hidden">

                    {/* Contact list */}
                    <div className="w-52 flex-none flex flex-col bg-[#201e1d] border-r border-black/50 overflow-hidden">
                        {/* Search bar (decorative) */}
                        <div className="px-3 pt-1 pb-2 border-b border-black/30">
                            <div className="flex items-center gap-1.5 bg-black/20 border border-white/[0.06] rounded-md px-2 py-1">
                                <svg className="w-3 h-3 text-white/35 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-[12px] text-white/25 select-none">Search</span>
                            </div>
                        </div>

                        {/* Grouped list */}
                        <div className="flex-1 overflow-y-auto py-1">
                            {Object.entries(grouped)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([letter, contacts]) => (
                                    <div key={letter}>
                                        <div className="px-3 pt-2 pb-0.5 text-[11px] font-semibold text-white/35 select-none tracking-wide">
                                            {letter}
                                        </div>
                                        {contacts.map(contact => {
                                            const isSelected = contact.id === selectedId;
                                            return (
                                                <div
                                                    key={contact.id}
                                                    onClick={() => setSelectedId(contact.id)}
                                                    className={`flex items-center gap-2.5 mx-1.5 px-2 py-1.5 rounded-[6px] cursor-default select-none transition-colors ${
                                                        isSelected
                                                            ? 'bg-[#0062d6] text-white'
                                                            : 'text-white/80 hover:bg-white/[0.06]'
                                                    }`}
                                                >
                                                    <div
                                                        className="w-7 h-7 rounded-full flex-none flex items-center justify-center text-white text-[10px] font-bold uppercase"
                                                        style={{ backgroundColor: contact.avatarBg }}
                                                    >
                                                        {contact.initials}
                                                    </div>
                                                    <span className="text-[13px] font-medium truncate">{contact.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Detail panel */}
                    <div
                        className="flex-1 overflow-y-auto"
                        style={{ background: selected.gradient }}
                    >
                        {/* Hero */}
                        <div className="flex flex-col items-center pt-10 pb-5 px-6 text-center">
                            {/* Logo circle */}
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-2xl ring-1 ring-white/10"
                                style={{ backgroundColor: `${selected.avatarBg}88` }}
                            >
                                <Logo />
                            </div>

                            <h2 className="text-[28px] font-bold text-white tracking-tight leading-tight">
                                {selected.name}
                            </h2>
                            <p className="text-[13px] text-white/55 mt-0.5 mb-5">{selected.subtitle}</p>

                            {/* Action buttons */}
                            <div className="flex gap-4">
                                {selected.actions.map(({ Icon, label, onClick }) => (
                                    <button
                                        key={label}
                                        onClick={onClick}
                                        className="flex flex-col items-center gap-1.5 group"
                                    >
                                        <div className="w-11 h-11 rounded-full bg-white/[0.10] hover:bg-white/[0.18] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center transition-colors">
                                            <Icon size={17} className="text-white" strokeWidth={1.8} />
                                        </div>
                                        <span className="text-[11px] text-white/50 group-hover:text-white/75 transition-colors">
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info cards */}
                        <div className="px-4 pb-6 space-y-2">
                            {selected.fields.map(field => (
                                <div
                                    key={field.label}
                                    className="bg-white/[0.07] backdrop-blur-sm rounded-xl px-4 py-3 border border-white/[0.05]"
                                >
                                    <div className="text-[11px] text-white/40 mb-0.5">{field.label}</div>
                                    <div className="flex items-center justify-between gap-3">
                                        {field.link ? (
                                            <a
                                                href={field.link}
                                                target={field.link.startsWith('mailto') ? undefined : '_blank'}
                                                rel="noreferrer"
                                                className="text-[13px] text-blue-300 hover:text-blue-200 transition-colors truncate"
                                            >
                                                {field.value}
                                            </a>
                                        ) : (
                                            <span className="text-[13px] text-white/80">{field.value}</span>
                                        )}
                                        {field.copyValue && (
                                            <button
                                                onClick={() => handleCopy(field.copyValue!, field.label)}
                                                className="flex-none text-white/30 hover:text-white/65 transition-colors"
                                            >
                                                {copiedLabel === field.label
                                                    ? <Check size={13} className="text-green-400" />
                                                    : <Copy size={13} />
                                                }
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </MacWindow>
        </DraggableWindow>
    );
}
