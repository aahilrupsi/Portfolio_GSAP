import { useState } from 'react';
import {
    Wifi, Clock, Monitor, FileText, Download, House,
    Folder, User, ChevronLeft, ChevronRight, List, LayoutGrid,
    AppWindow, Music, ImageIcon, Film, Box,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop, type PreviewTarget } from '../../contexts/DesktopContext';
import { PROFILE } from '../../constants/profile';

// ─── Types ────────────────────────────────────────────────────────────────────

type FileKind = 'md' | 'pdf' | 'vcf' | 'app' | 'img' | 'music' | 'txt' | 'glb';

interface FsFile {
    type: 'file';
    name: string;
    kind: FileKind;
    kindLabel: string;
    size: string;
    dateAdded: string;
}

interface FsFolder {
    type: 'folder';
    name: string;
    kindLabel: 'Folder';
    size: string;
    dateAdded: string;
    children: FsEntry[];
}

type FsEntry = FsFile | FsFolder;

// ─── Filesystem data ──────────────────────────────────────────────────────────

const TODAY = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function f(name: string, kind: FileKind, kindLabel: string, size: string, dateAdded: string): FsFile {
    return { type: 'file', name, kind, kindLabel, size, dateAdded };
}
function d(name: string, dateAdded: string, children: FsEntry[]): FsFolder {
    return { type: 'folder', name, kindLabel: 'Folder', size: '--', dateAdded, children };
}

const APPS: FsEntry[] = [
    f('Arc.app',                'app', 'Application', '198 MB',  'Jan 12, 2026'),
    f('Blender.app',            'app', 'Application', '512 MB',  'Oct  3, 2025'),
    f('Figma.app',              'app', 'Application', '286 MB',  'Aug 20, 2025'),
    f('Spotify.app',            'app', 'Application', '411 MB',  'Jun  5, 2025'),
    f('Visual Studio Code.app', 'app', 'Application', '367 MB',  'Jun  5, 2025'),
    f('Warp.app',               'app', 'Application', '145 MB',  'Sep 14, 2025'),
    f('Xcode.app',              'app', 'Application', '14.2 GB', 'Jul  1, 2025'),
];

const DOCS: FsEntry[] = [
    f('me.md',       'md',  'Markdown Text', '2 KB', TODAY),
    f('resume.pdf',  'pdf', 'PDF Document',  '--',   TODAY),
    f('contact.vcf', 'vcf', 'Contact Card',  '1 KB', TODAY),
    d('Source Files', TODAY, []),
];

const PETS: FsEntry[] = [
    f('buddy.jpg',    'img', 'JPEG Image', '3.2 MB', 'Feb 14, 2026'),
    f('mittens.jpg',  'img', 'JPEG Image', '2.8 MB', 'Mar  3, 2026'),
    f('peanut.jpg',   'img', 'JPEG Image', '4.1 MB', 'Apr  7, 2026'),
    f('snowball.jpg', 'img', 'JPEG Image', '2.3 MB', 'May 20, 2026'),
];

const PICS: FsEntry[] = [
    d('Pets',        'Feb 14, 2026', PETS),
    d('Screenshots', 'Jan  5, 2026', []),
    d('Wallpapers',  'Jun  5, 2025', []),
];

const PLAYLISTS: FsEntry[] = [
    f('coding.m3u',     'music', 'Audio Playlist', '3 KB', 'Sep 14, 2025'),
    f('gym.m3u',        'music', 'Audio Playlist', '2 KB', 'Nov  1, 2025'),
    f('late-night.m3u', 'music', 'Audio Playlist', '4 KB', 'Dec 12, 2025'),
];

const MUSIC: FsEntry[] = [d('Playlists', 'Sep 14, 2025', PLAYLISTS)];

const DESKTOP: FsEntry[] = [f('todo.txt', 'txt', 'Plain Text Document', '1 KB', TODAY)];

const DOWNLOADS: FsEntry[] = [f('macbook.glb', 'glb', '3D Scene', '4.2 MB', 'Apr  1, 2026')];

const HOME: FsEntry[] = [
    d('Applications', 'Jun  5, 2025', APPS),
    d('Desktop',      TODAY,          DESKTOP),
    d('Documents',    TODAY,          DOCS),
    d('Downloads',    'Apr  1, 2026', DOWNLOADS),
    d('Movies',       'Jun  5, 2025', []),
    d('Music',        'Sep 14, 2025', MUSIC),
    d('Pictures',     'Feb 14, 2026', PICS),
];

const FILESYSTEM: Record<string, FsEntry[]> = {
    Home:         HOME,
    AirDrop:      [],
    Recents:      [],
    Applications: APPS,
    Desktop:      DESKTOP,
    Documents:    DOCS,
    Downloads:    DOWNLOADS,
    Music:        MUSIC,
    Pictures:     PICS,
};

// ─── Sidebar data ─────────────────────────────────────────────────────────────

interface SidebarItem {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
    root: string;
}

const FAVORITES: SidebarItem[] = [
    { id: 'airdrop',      label: 'AirDrop',      icon: Wifi,      color: 'text-blue-400',   root: 'AirDrop'      },
    { id: 'recents',      label: 'Recents',      icon: Clock,     color: 'text-gray-400',   root: 'Recents'      },
    { id: 'applications', label: 'Applications', icon: AppWindow, color: 'text-blue-500',   root: 'Applications' },
    { id: 'desktop',      label: 'Desktop',      icon: Monitor,   color: 'text-blue-400',   root: 'Desktop'      },
    { id: 'documents',    label: 'Documents',    icon: FileText,  color: 'text-blue-500',   root: 'Documents'    },
    { id: 'downloads',    label: 'Downloads',    icon: Download,  color: 'text-blue-500',   root: 'Downloads'    },
    { id: 'music',        label: 'Music',        icon: Music,     color: 'text-red-400',    root: 'Music'        },
    { id: 'pictures',     label: 'Pictures',     icon: ImageIcon, color: 'text-yellow-500', root: 'Pictures'     },
];

const LOCATIONS: SidebarItem[] = [
    { id: 'home', label: PROFILE.firstName, icon: House, color: 'text-gray-500', root: 'Home' },
];

const TAGS = [
    { label: 'Red',    dot: 'bg-red-500'    },
    { label: 'Orange', dot: 'bg-orange-400' },
    { label: 'Green',  dot: 'bg-green-500'  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function FolderIcon({ name, size }: { name: string; size: number }) {
    switch (name) {
        case 'Applications': return <AppWindow  size={size} className="text-blue-500   flex-none" />;
        case 'Desktop':      return <Monitor    size={size} className="text-blue-400   flex-none" />;
        case 'Documents':    return <FileText   size={size} className="text-blue-500   flex-none" />;
        case 'Downloads':    return <Download   size={size} className="text-blue-500   flex-none" />;
        case 'Movies':       return <Film       size={size} className="text-gray-500   flex-none" />;
        case 'Music':        return <Music      size={size} className="text-red-400    flex-none" />;
        case 'Pictures':     return <ImageIcon  size={size} className="text-yellow-500 flex-none" />;
        case 'Pets':         return <Folder     size={size} className="text-pink-400   flex-none" />;
        default:             return <Folder     size={size} className="text-blue-400   flex-none" />;
    }
}

function FileIcon({ kind, size }: { kind: FileKind; size: number }) {
    switch (kind) {
        case 'app':   return <AppWindow  size={size} className="text-blue-600   flex-none" />;
        case 'img':   return <ImageIcon  size={size} className="text-green-600  flex-none" />;
        case 'music': return <Music      size={size} className="text-pink-500   flex-none" />;
        case 'glb':   return <Box        size={size} className="text-purple-500 flex-none" />;
        case 'txt':   return <FileText   size={size} className="text-gray-500   flex-none" />;
        case 'vcf':   return <User       size={size} className="text-green-600  flex-none" />;
        case 'pdf':   return <FileText   size={size} className="text-red-500    flex-none" />;
        default:      return <FileText   size={size} className="text-blue-600   flex-none" />;
    }
}

function EntryIcon({ entry, size = 14 }: { entry: FsEntry; size?: number }) {
    if (entry.type === 'folder') return <FolderIcon name={entry.name} size={size} />;
    return <FileIcon kind={entry.kind} size={size} />;
}

// Kinds that open in PreviewWindow
const PREVIEWABLE = new Set<FileKind>(['md', 'pdf', 'vcf', 'img']);

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinderWindow() {
    const { closeWindow, openPreview } = useDesktop();

    const [sidebarId, setSidebarId]       = useState<string>('documents');
    const [pathStack, setPathStack]       = useState<string[]>([]);
    const [selectedName, setSelectedName] = useState<string | null>(null);

    const allItems    = [...FAVORITES, ...LOCATIONS];
    const activeSidebar = allItems.find(i => i.id === sidebarId) ?? FAVORITES[4];
    const root        = activeSidebar.root;

    const getEntries = (): FsEntry[] => {
        let entries = FILESYSTEM[root] ?? [];
        for (const seg of pathStack) {
            const sub = entries.find(e => e.type === 'folder' && e.name === seg) as FsFolder | undefined;
            entries = sub?.children ?? [];
        }
        return entries;
    };

    const entries = getEntries();

    const breadcrumbParts: string[] = [PROFILE.firstName];
    if (root !== 'Home') breadcrumbParts.push(root);
    breadcrumbParts.push(...pathStack);
    const breadcrumb = breadcrumbParts.join(' › ');

    const navigateSidebar = (item: SidebarItem) => {
        setSidebarId(item.id);
        setPathStack([]);
        setSelectedName(null);
    };

    const handleOpen = (entry: FsEntry) => {
        if (entry.type === 'folder') {
            setPathStack(prev => [...prev, entry.name]);
            setSelectedName(null);
        } else if (PREVIEWABLE.has(entry.kind)) {
            openPreview({ name: entry.name, kind: entry.kind } as PreviewTarget);
        }
    };

    const goBack = () => {
        setPathStack(prev => prev.slice(0, -1));
        setSelectedName(null);
    };

    // ── Sidebar ──────────────────────────────────────────────────────────────

    const renderItem = (item: SidebarItem) => (
        <button
            key={item.id}
            onClick={() => navigateSidebar(item)}
            className={`flex items-center gap-2 py-[3px] px-2 rounded-[5px] cursor-default text-left select-none ${
                sidebarId === item.id ? 'bg-[#0062d6]' : 'hover:bg-black/[0.06]'
            }`}
            style={{ width: 'calc(100% - 8px)', margin: '0 4px' }}
        >
            <item.icon
                size={14}
                className={`flex-none ${sidebarId === item.id ? 'text-white' : item.color}`}
            />
            <span className={`text-[12px] truncate ${sidebarId === item.id ? 'text-white' : 'text-gray-700'}`}>
                {item.label}
            </span>
        </button>
    );

    const Sidebar = (
        <div className="py-2">
            <p className="px-3 pt-1 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider select-none">
                Favorites
            </p>
            {FAVORITES.map(renderItem)}

            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider select-none">
                Locations
            </p>
            {LOCATIONS.map(renderItem)}

            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider select-none">
                Tags
            </p>
            {TAGS.map(tag => (
                <div
                    key={tag.label}
                    className="flex items-center gap-2 py-[3px] px-2 rounded-[5px] hover:bg-black/[0.06] cursor-default select-none"
                    style={{ width: 'calc(100% - 8px)', margin: '0 4px' }}
                >
                    <span className={`w-2.5 h-2.5 rounded-full flex-none ${tag.dot}`} />
                    <span className="text-[12px] text-gray-700">{tag.label}</span>
                </div>
            ))}
        </div>
    );

    const windowTitle = pathStack.length > 0 ? pathStack[pathStack.length - 1] : root === 'Home' ? PROFILE.firstName : root;

    return (
        <DraggableWindow id="finder" resizable minWidth={580} minHeight={400}>
            <MacWindow
                onClose={() => closeWindow('finder')}
                title={windowTitle}
                theme="light"
                className="w-full h-full"
                sidebar={Sidebar}
                sidebarClassName="w-44 bg-[#f0f0f0] border-r border-gray-300/70"
                contentClassName="overflow-hidden"
            >
                {/* ── Toolbar ──────────────────────────────────────────── */}
                <div className="flex items-center gap-1 px-2 h-9 border-b border-gray-200 bg-[#f9f9f9] flex-none">
                    <button
                        onClick={goBack}
                        disabled={pathStack.length === 0}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-default transition-colors"
                    >
                        <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                    <button disabled className="p-1 rounded opacity-30 cursor-default">
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center bg-gray-200 rounded-md p-0.5 gap-0.5">
                        <button className="p-1 rounded bg-white shadow-sm cursor-default">
                            <List size={14} className="text-gray-600" />
                        </button>
                        <button className="p-1 rounded opacity-40 cursor-default">
                            <LayoutGrid size={14} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* ── Column headers ────────────────────────────────────── */}
                <div className="flex items-center h-6 border-b border-gray-200 bg-[#f5f5f5] flex-none select-none">
                    <span className="flex-1 pl-8 text-[11px] font-medium text-gray-500">Name</span>
                    <span className="w-[130px] text-[11px] font-medium text-gray-500">Date Added</span>
                    <span className="w-16 text-[11px] font-medium text-gray-500 text-right pr-3">Size</span>
                    <span className="w-28 text-[11px] font-medium text-gray-500">Kind</span>
                </div>

                {/* ── File list ─────────────────────────────────────────── */}
                <div
                    className="flex-1 overflow-y-auto bg-white custom-scrollbar"
                    onClick={() => setSelectedName(null)}
                >
                    {entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 select-none">
                            {root === 'AirDrop' ? (
                                <>
                                    <Wifi size={40} className="text-blue-300" />
                                    <p className="text-[13px] text-gray-400">AirDrop is not available</p>
                                </>
                            ) : (
                                <p className="text-[13px] text-gray-400">This folder is empty.</p>
                            )}
                        </div>
                    ) : (
                        <div className="pt-0.5">
                            {entries.map(entry => {
                                const sel = selectedName === entry.name;
                                return (
                                    <div
                                        key={entry.name}
                                        className={`flex items-center h-[22px] cursor-default select-none ${
                                            sel ? 'bg-[#0062d6]' : 'hover:bg-[#e8edf5]'
                                        }`}
                                        onClick={e => { e.stopPropagation(); setSelectedName(entry.name); }}
                                        onDoubleClick={() => handleOpen(entry)}
                                    >
                                        <span className={`flex items-center gap-1.5 flex-1 text-[12px] truncate pl-3 ${sel ? 'text-white' : 'text-gray-800'}`}>
                                            <EntryIcon entry={entry} size={14} />
                                            {entry.name}
                                        </span>
                                        <span className={`w-[130px] text-[12px] ${sel ? 'text-white/80' : 'text-gray-400'}`}>
                                            {entry.dateAdded}
                                        </span>
                                        <span className={`w-16 text-[12px] text-right pr-3 ${sel ? 'text-white/80' : 'text-gray-400'}`}>
                                            {entry.size}
                                        </span>
                                        <span className={`w-28 text-[12px] ${sel ? 'text-white/80' : 'text-gray-400'}`}>
                                            {entry.kindLabel}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Path bar ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-3 h-[22px] border-t border-gray-200 bg-[#f5f5f5] flex-none select-none">
                    <span className="text-[11px] text-gray-400 truncate">{breadcrumb}</span>
                    <span className="text-[11px] text-gray-400 flex-none ml-4">
                        {entries.length} {entries.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
            </MacWindow>
        </DraggableWindow>
    );
}
