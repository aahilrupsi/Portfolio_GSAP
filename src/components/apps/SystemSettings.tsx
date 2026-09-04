import { useState, useEffect, useRef } from 'react';
import { Search, Monitor, Volume2, Cpu, Check } from 'lucide-react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop, compressImage, wallpaperUrl } from '../../contexts/DesktopContext';

type Panel = 'wallpaper' | 'sound' | 'system-info';

// Tiny inline preview for the Classic wallpaper swatch — the full-res photo
// (1.9MB) only loads once the user actually selects it.
const CLASSIC_WALLPAPER_THUMB =
    'data:image/jpeg;base64,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';

// ─── Wallpaper Panel ────────────────────────────────────────────────────────

function WallpaperPanel() {
    const { wallpaper, setWallpaper, customWallpaper, setCustomWallpaper } = useDesktop();
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const isTahoe = wallpaper === 'tahoe';
    const isDefault = wallpaper === 'default';
    const isCustom = wallpaper === 'custom';

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const compressed = await compressImage(file);
            setCustomWallpaper(compressed);
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

            <div className="grid grid-cols-3 gap-3 mb-6">
                {/* Tahoe option (default) */}
                <button
                    onClick={() => setWallpaper('tahoe')}
                    className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                        isTahoe ? 'border-[#0062d6]' : 'border-white/10 hover:border-white/30'
                    }`}
                >
                    <img
                        src="/images/wallpaper-tahoe.jpg"
                        alt="Tahoe wallpaper"
                        className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] text-white font-medium drop-shadow">
                        Tahoe
                    </span>
                    {isTahoe && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0062d6] flex items-center justify-center">
                            <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                    )}
                </button>

                {/* Classic option — the image itself only loads once selected, so
                    visitors who never pick it never pay for the 1.9MB download. */}
                <button
                    onClick={() => setWallpaper('default')}
                    className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                        isDefault ? 'border-[#0062d6]' : 'border-white/10 hover:border-white/30'
                    }`}
                >
                    {isDefault ? (
                        <img
                            src="/images/wallpaper.jpg"
                            alt="Classic wallpaper"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={CLASSIC_WALLPAPER_THUMB}
                            alt="Classic wallpaper"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] text-white font-medium drop-shadow">
                        Classic
                    </span>
                    {isDefault && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0062d6] flex items-center justify-center">
                            <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                    )}
                </button>

                {/* Custom option — keeps showing the last uploaded photo (even while
                    inactive) so switching to Tahoe/Classic and back doesn't lose it. */}
                <button
                    onClick={() => customWallpaper ? setWallpaper('custom') : fileRef.current?.click()}
                    className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                        isCustom ? 'border-[#0062d6]' : 'border-white/10 border-dashed hover:border-white/30'
                    }`}
                >
                    {customWallpaper ? (
                        <>
                            <img
                                src={wallpaperUrl('custom', customWallpaper)}
                                alt="Custom wallpaper"
                                className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] text-white font-medium drop-shadow">
                                Custom
                            </span>
                            {isCustom && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0062d6] flex items-center justify-center">
                                    <Check size={11} className="text-white" strokeWidth={3} />
                                </div>
                            )}
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
                    {uploading ? 'Processing…' : customWallpaper ? 'Choose Different Photo…' : 'Choose Photo…'}
                </button>

                {!isTahoe && (
                    <button
                        onClick={() => setWallpaper('tahoe')}
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
