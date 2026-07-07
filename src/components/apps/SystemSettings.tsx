import { useState, useEffect, useRef } from 'react';
import { Search, Monitor, Volume2, Cpu, Check } from 'lucide-react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop, compressImage, wallpaperUrl } from '../../contexts/DesktopContext';

type Panel = 'wallpaper' | 'sound' | 'system-info';

// ─── Wallpaper Panel ────────────────────────────────────────────────────────

function WallpaperPanel() {
    const { wallpaper, setWallpaper } = useDesktop();
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const isDefault = wallpaper === 'default';

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const compressed = await compressImage(file);
            setWallpaper(compressed);
        } catch {
            setError('Could not process image. Try a smaller file.');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <p className="text-[12px] text-white/40 mb-5 leading-relaxed">
                Choose a wallpaper for the desktop. Custom wallpapers are saved in your browser.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Default option */}
                <button
                    onClick={() => setWallpaper('default')}
                    className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                        isDefault ? 'border-[#0062d6]' : 'border-white/10 hover:border-white/30'
                    }`}
                >
                    <img
                        src="/images/wallpaper.jpg"
                        alt="Default wallpaper"
                        className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] text-white font-medium drop-shadow">
                        Default
                    </span>
                    {isDefault && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0062d6] flex items-center justify-center">
                            <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                    )}
                </button>

                {/* Custom option / upload prompt */}
                <button
                    onClick={() => fileRef.current?.click()}
                    className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                        !isDefault ? 'border-[#0062d6]' : 'border-white/10 border-dashed hover:border-white/30'
                    }`}
                >
                    {!isDefault ? (
                        <>
                            <img
                                src={wallpaperUrl(wallpaper)}
                                alt="Custom wallpaper"
                                className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] text-white font-medium drop-shadow">
                                Custom
                            </span>
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0062d6] flex items-center justify-center">
                                <Check size={11} className="text-white" strokeWidth={3} />
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-white/5">
                            <span className="text-white/40 text-[22px]">+</span>
                            <span className="text-white/40 text-[10px]">Upload Photo</span>
                        </div>
                    )}
                </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="text-[12px] px-4 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors disabled:opacity-40"
                >
                    {uploading ? 'Processing…' : 'Choose Photo…'}
                </button>

                {!isDefault && (
                    <button
                        onClick={() => setWallpaper('default')}
                        className="text-[12px] px-4 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 transition-colors"
                    >
                        Reset to Default
                    </button>
                )}
            </div>

            {error && (
                <p className="mt-3 text-[11px] text-red-400">{error}</p>
            )}

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
            />
        </div>
    );
}

// ─── Sound Panel ────────────────────────────────────────────────────────────

function SoundPanel() {
    const { soundEnabled, setSoundEnabled } = useDesktop();

    return (
        <div className="flex-1 p-6">
            <p className="text-[12px] text-white/40 mb-6 leading-relaxed">
                UI sounds play when opening apps from the dock and closing windows.
            </p>

            <div className="space-y-px">
                <SoundRow
                    label="UI Sounds"
                    description="Dock clicks and window close"
                    on={soundEnabled}
                    onToggle={() => setSoundEnabled(!soundEnabled)}
                />
            </div>
        </div>
    );
}

function SoundRow({ label, description, on, onToggle }: {
    label: string;
    description: string;
    on: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div>
                <p className="text-[13px] text-white/85">{label}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{description}</p>
            </div>
            <button
                onClick={onToggle}
                className={`relative flex-none w-11 h-6 rounded-full transition-colors duration-200 ${on ? 'bg-[#0062d6]' : 'bg-white/20'}`}
            >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}

// ─── System Info Panel ───────────────────────────────────────────────────────

type InfoMap = Record<string, string>;

function parseBrowser(ua: string): string {
    if (ua.includes('Edg/')) return 'Microsoft Edge';
    if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
    if (ua.includes('Chrome/')) {
        const m = ua.match(/Chrome\/([\d.]+)/);
        return `Chrome ${m?.[1]?.split('.')[0] ?? ''}`.trim();
    }
    if (ua.includes('Firefox/')) {
        const m = ua.match(/Firefox\/([\d.]+)/);
        return `Firefox ${m?.[1]?.split('.')[0] ?? ''}`.trim();
    }
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
    return 'Unknown';
}

function parseOS(ua: string): string {
    if (ua.includes('Windows NT 10.0')) return 'Windows 10 / 11';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('iPhone')) return 'iOS';
    if (ua.includes('iPad')) return 'iPadOS';
    if (ua.includes('Android')) {
        const m = ua.match(/Android ([\d.]+)/);
        return `Android ${m?.[1] ?? ''}`.trim();
    }
    if (ua.includes('Mac OS X')) {
        const m = ua.match(/Mac OS X ([\d_]+)/);
        const v = m?.[1]?.replace(/_/g, '.') ?? '';
        return `macOS ${v}`.trim();
    }
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
}

function SystemInfoPanel() {
    const [ip, setIp] = useState<string>('Loading…');
    const [battery, setBattery] = useState<string>('Unavailable');
    const ua = navigator.userAgent;

    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(d => setIp(d.ip))
            .catch(() => setIp('Unavailable'));

        // Battery API (Chrome/Edge only)
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((bat: any) => {
                const pct = Math.round(bat.level * 100);
                const charging = bat.charging ? ' ⚡' : '';
                setBattery(`${pct}%${charging}`);
            }).catch(() => {});
        }
    }, []);

    const sections: { heading: string; rows: InfoMap }[] = [
        {
            heading: 'Network',
            rows: { 'IP Address': ip },
        },
        {
            heading: 'Browser',
            rows: {
                'Browser': parseBrowser(ua),
                'Language': navigator.language,
                'Cookies': navigator.cookieEnabled ? 'Enabled' : 'Disabled',
                'Online': navigator.onLine ? 'Yes' : 'No',
            },
        },
        {
            heading: 'Display',
            rows: {
                'Screen': `${window.screen.width} × ${window.screen.height}`,
                'Viewport': `${window.innerWidth} × ${window.innerHeight}`,
                'Pixel Ratio': String(window.devicePixelRatio),
                'Color Depth': `${window.screen.colorDepth}-bit`,
            },
        },
        {
            heading: 'Hardware',
            rows: {
                'OS': parseOS(ua),
                'CPU Cores': String(navigator.hardwareConcurrency ?? 'Unknown'),
                ...('deviceMemory' in navigator ? { 'RAM (approx.)': `${(navigator as any).deviceMemory} GB` } : {}),
                'Battery': battery,
                'Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
            {sections.map(({ heading, rows }) => (
                <div key={heading}>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">{heading}</p>
                    <div className="rounded-lg overflow-hidden border border-white/5">
                        {Object.entries(rows).map(([label, value], i, arr) => (
                            <div
                                key={label}
                                className={`flex items-center justify-between px-3 py-2 bg-white/[0.03] ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                                <span className="text-[12px] text-white/45">{label}</span>
                                <span className="text-[12px] text-white/80 font-mono text-right max-w-[55%] truncate">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Root ────────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: { id: Panel; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'wallpaper',   label: 'Wallpaper',    icon: Monitor },
    { id: 'sound',       label: 'Sound',        icon: Volume2 },
    { id: 'system-info', label: 'System Info',  icon: Cpu },
];

export default function SystemSettings() {
    const { closeWindow } = useDesktop();
    const [activePanel, setActivePanel] = useState<Panel>('wallpaper');
    const [search, setSearch] = useState('');

    const filtered = SIDEBAR_ITEMS.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    const titles: Record<Panel, string> = {
        wallpaper:   'Wallpaper',
        sound:       'Sound',
        'system-info': 'System Information',
    };

    const Sidebar = (
        <div className="p-3 h-full flex flex-col">
            <div className="relative mb-3 mt-1 px-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-white/35" />
                <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-black/20 text-[13px] text-white rounded-md pl-8 pr-3 py-1 outline-none placeholder:text-white/35 border border-white/5"
                />
            </div>

            <div className="space-y-0.5">
                {filtered.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActivePanel(id)}
                        className={`w-full flex items-center gap-2 p-1.5 rounded-[5px] text-left transition-colors select-none mx-0 ${
                            activePanel === id
                                ? 'bg-[#0062d6] text-white'
                                : 'text-white/75 hover:bg-white/10'
                        }`}
                    >
                        <div className={`w-[22px] h-[22px] rounded-md flex items-center justify-center flex-none ${
                            activePanel === id ? 'bg-white/20' : 'bg-white/10'
                        }`}>
                            <Icon size={12} className={activePanel === id ? 'text-white' : 'text-white/60'} />
                        </div>
                        <span className="text-[13px] font-medium">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <DraggableWindow id="settings" resizable minWidth={480} minHeight={360}>
            <MacWindow
                onClose={() => closeWindow('settings')}
                className="w-full h-full text-white"
                sidebar={Sidebar}
                sidebarClassName="w-[200px] bg-[#21201F] border-r border-black/50"
                contentClassName="bg-[#292727] flex flex-col"
            >
                {/* Panel title */}
                <div className="flex items-center px-5 h-[44px] border-b border-white/5 flex-none">
                    <h2 className="text-[13px] font-semibold text-white/80 select-none tracking-tight">
                        {titles[activePanel]}
                    </h2>
                </div>

                {/* Panel content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {activePanel === 'wallpaper'   && <WallpaperPanel />}
                    {activePanel === 'sound'        && <SoundPanel />}
                    {activePanel === 'system-info'  && <SystemInfoPanel />}
                </div>
            </MacWindow>
        </DraggableWindow>
    );
}
