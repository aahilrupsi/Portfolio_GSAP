import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Share, Plus, Search, Clock, Star, X } from 'lucide-react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';

// ─── Data ────────────────────────────────────────────────────────────────────

const SEARCH_QUIPS = [
    'why is aahil rupsi the best software engineer on earth',
    'can aahil rupsi solve leetcode hard in his sleep',
    'is aahil rupsi better than linus torvalds',
    'is it legal to be this good at coding',
    'best software engineers of all time ft. aahil rupsi',
    'aahil rupsi net worth after portfolio goes viral',
];

const FAVORITES = [
    { name: 'ThePrimeagen', initial: 'P',  color: '#c62828', href: 'https://www.youtube.com/@ThePrimeTimeagen' },
    { name: 'Low Level',    initial: 'LL', color: '#1565c0', href: 'https://www.youtube.com/@LowLevelTV'  },
    { name: 'Fireship',     initial: 'F',  color: '#0d47a1', href: 'https://www.youtube.com/@Fireship'          },
    { name: 'Theo',         initial: 'T',  color: '#4a148c', href: 'https://www.youtube.com/@t3dotgg'           },
    { name: 'Daniel Hirsch',initial: 'DH', color: '#2e7d32', href: 'https://www.youtube.com/@HirschDaniel'       },
    { name: 'Neet Code',     initial: 'NC', color: '#e65100', href: 'https://www.youtube.com/@NeetCode'     },
];

interface Project {
    id: number;
    title: string;
    description: string;
    color: string;
}

const PROJECTS: Project[] = [
    { id: 1, title: 'Portfolio OS',      description: 'macOS-inspired interactive developer portfolio',       color: '#1a237e' },
    { id: 2, title: 'JelloText',         description: 'Variable font physics animation with GSAP',            color: '#b71c1c' },
    { id: 3, title: '3D MacBook Intro',  description: 'Three.js + GSAP cinematic camera fly-through',        color: '#311b92' },
    { id: 4, title: 'Contacts App',      description: 'macOS Contacts clone with live search & detail view',  color: '#004d40' },
    { id: 5, title: 'System Settings',   description: 'Pixel-perfect macOS System Settings replica',          color: '#263238' },
    { id: 6, title: 'Notes App',         description: 'Editable rich-text notes with macOS window chrome',    color: '#bf360c' },
];

// ─── Tab state ───────────────────────────────────────────────────────────────

interface Tab {
    id: number;
    recentlyClosed: Project[];
    selectedIndex: number | null;
}

const COLS = 3;

// ─── Component ───────────────────────────────────────────────────────────────

export default function SafariWindow() {
    const { closeWindow } = useDesktop();
    const nextId = useRef(2);

    const [tabs, setTabs]               = useState<Tab[]>([{ id: 1, recentlyClosed: [], selectedIndex: null }]);
    const [activeTabId, setActiveTabId] = useState(1);
    const [searchFocused, setSearchFocused] = useState(false);

    const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];

    const updateActiveTab = useCallback((patch: Partial<Tab>) => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...patch } : t));
    }, [activeTabId]);

    // ── Tab actions ──────────────────────────────────────────────────────────
    const addTab = () => {
        const id = nextId.current++;
        setTabs(prev => [...prev, { id, recentlyClosed: [], selectedIndex: null }]);
        setActiveTabId(id);
    };

    const switchTab = (id: number) => setActiveTabId(id);

    const removeTab = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (tabs.length === 1) { closeWindow('safari'); return; }
        const idx = tabs.findIndex(t => t.id === id);
        const remaining = tabs.filter(t => t.id !== id);
        setTabs(remaining);
        if (activeTabId === id) setActiveTabId(remaining[Math.min(idx, remaining.length - 1)].id);
    };

    // ── Page actions ─────────────────────────────────────────────────────────
    const openProject = useCallback((project: Project, index: number) => {
        setTabs(prev => prev.map(t => {
            if (t.id !== activeTabId) return t;
            const already = t.recentlyClosed.find(rc => rc.id === project.id);
            const recentlyClosed = already ? t.recentlyClosed : [project, ...t.recentlyClosed].slice(0, 8);
            return { ...t, selectedIndex: index, recentlyClosed };
        }));
    }, [activeTabId]);

    // ── Arrow-key navigation ─────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (searchFocused) return;
            const si = activeTab.selectedIndex;

            if (si === null) {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    updateActiveTab({ selectedIndex: 0 });
                }
                return;
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                updateActiveTab({ selectedIndex: Math.min(si + 1, PROJECTS.length - 1) });
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                updateActiveTab({ selectedIndex: Math.max(si - 1, 0) });
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                updateActiveTab({ selectedIndex: Math.min(si + COLS, PROJECTS.length - 1) });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                updateActiveTab({ selectedIndex: Math.max(si - COLS, 0) });
            } else if (e.key === 'Enter') {
                openProject(PROJECTS[si], si);
            } else if (e.key === 'Escape') {
                updateActiveTab({ selectedIndex: null });
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [searchFocused, activeTab.selectedIndex, updateActiveTab, openProject]);

    // ── Toolbar (injected into MacWindow title bar) ──────────────────────────
    const toolbar = (
        <div className="flex items-center gap-1 flex-1">
            <button disabled className="p-1.5 rounded opacity-30 cursor-default">
                <ChevronLeft size={16} className="text-gray-400" />
            </button>
            <button disabled className="p-1.5 rounded opacity-30 cursor-default">
                <ChevronRight size={16} className="text-gray-400" />
            </button>

            <div className="flex-1 mx-2 relative">
                <div className="flex items-center gap-2 bg-[#3a3a3c] rounded-lg px-3 h-[26px]">
                    <Search size={12} className="text-gray-500 flex-none" />
                    <input
                        type="text"
                        placeholder="Search or enter website name"
                        className="flex-1 text-[13px] text-gray-300 outline-none bg-transparent placeholder:text-gray-500 caret-transparent"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                    />
                </div>

                {searchFocused && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#2c2c2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest border-b border-white/5">
                            Recent Searches
                        </div>
                        {SEARCH_QUIPS.map((quip, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-default select-none">
                                <Clock size={12} className="text-gray-500 flex-none" />
                                <span className="text-[13px] text-gray-300 truncate">{quip}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button className="p-1.5 rounded opacity-30 cursor-default" title="Share">
                <Share size={15} className="text-gray-400" />
            </button>
            <button onClick={addTab} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="New Tab">
                <Plus size={16} className="text-gray-400" />
            </button>
        </div>
    );

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <DraggableWindow id="safari" resizable minWidth={600} minHeight={500}>
            <MacWindow
                onClose={() => closeWindow('safari')}
                theme="dark"
                titleBarContent={toolbar}
                className="w-full h-full flex flex-col"
                contentClassName="flex-1 flex flex-col min-h-0"
            >
                {/* ── Tab Bar ─────────────────────────────────────────────── */}
                <div className="flex items-center gap-1 px-3 h-9 bg-[#1c1c1e] border-b border-black/30 flex-none">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => switchTab(tab.id)}
                            className={`group flex items-center gap-1.5 px-3 h-[26px] rounded-full cursor-default flex-1 max-w-[200px] min-w-0 text-[12px] transition-colors select-none ${
                                activeTabId === tab.id
                                    ? 'bg-[#48484a] text-white/90'
                                    : 'bg-[#38383a] text-white/40 hover:bg-[#3f3f41] hover:text-white/60'
                            }`}
                        >
                            <Star size={10} className="flex-none shrink-0 opacity-60" />
                            <span className="flex-1 truncate min-w-0">Start Page</span>
                            {tabs.length > 1 && (
                                <button
                                    onClick={e => removeTab(tab.id, e)}
                                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity rounded-full p-0.5 hover:bg-white/20 flex-none shrink-0"
                                >
                                    <X size={9} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Start Page ──────────────────────────────────────────── */}
                <div
                    className="flex-1 min-h-0 overflow-y-auto bg-[#1c1c1e] px-8 py-7 space-y-8"
                    onClick={() => updateActiveTab({ selectedIndex: null })}
                >
                    {/* Favorites */}
                    <section onClick={e => e.stopPropagation()}>
                        <h2 className="text-white font-semibold text-[15px] mb-4">Favorites</h2>
                        <div className="flex flex-wrap gap-x-5 gap-y-4">
                            {FAVORITES.map((fav, i) => (
                                <a
                                    key={i}
                                    href={fav.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-1.5 w-16 group no-underline"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div
                                        className="w-14 h-14 rounded-[18px] flex items-center justify-center text-white font-bold text-[15px] select-none transition-transform duration-150 group-hover:scale-105 shadow-lg"
                                        style={{ backgroundColor: fav.color }}
                                    >
                                        {fav.initial}
                                    </div>
                                    <span className="text-[11px] text-gray-400 text-center leading-tight truncate w-full">
                                        {fav.name}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </section>

                    {/* Recently Closed Tabs */}
                    {activeTab.recentlyClosed.length > 0 && (
                        <section onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-semibold text-[15px]">Recently Closed Tabs</h2>
                                <button
                                    onClick={() => updateActiveTab({ recentlyClosed: [] })}
                                    className="text-[#3b9eff] text-[13px] hover:opacity-75 transition-opacity flex items-center gap-1"
                                >
                                    Clear All <span className="text-[10px] ml-0.5">✕</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {activeTab.recentlyClosed.map(tab => (
                                    <div
                                        key={tab.id}
                                        className="bg-[#2c2c2e] hover:bg-[#3a3a3c] transition-colors rounded-full px-4 py-2 text-[13px] text-gray-200 cursor-pointer max-w-[240px] truncate select-none"
                                    >
                                        {tab.title}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Suggestions */}
                    <section onClick={e => e.stopPropagation()}>
                        <h2 className="text-white font-semibold text-[15px] mb-4">Suggestions</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {PROJECTS.map((project, i) => (
                                <div
                                    key={project.id}
                                    className={`relative rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-150 h-44 ${
                                        activeTab.selectedIndex === i
                                            ? 'ring-2 ring-[#3b9eff] ring-offset-2 ring-offset-[#1c1c1e] scale-[1.03]'
                                            : 'hover:scale-[1.02]'
                                    }`}
                                    style={{ backgroundColor: project.color }}
                                    onClick={() => openProject(project, i)}
                                >
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/75 via-black/30 to-transparent">
                                        <p className="text-white font-semibold text-[13px] leading-snug">{project.title}</p>
                                        <p className="text-white/55 text-[11px] mt-0.5 truncate">{project.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </MacWindow>
        </DraggableWindow>
    );
}
