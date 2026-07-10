import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Mail, ExternalLink, GitBranch, FileText, Monitor } from 'lucide-react';

const NOTICE = "This portfolio is a macOS desktop experience. Visit on a larger screen for the full interactive version. Quick links have been provided below.";

const LINKS = [
    {
        icon: Mail,
        label: 'Email',
        descriptor: 'mailto',
        href: 'mailto:aahil@mckinneyandco.com',
    },
    {
        icon: ExternalLink,
        label: 'LinkedIn',
        descriptor: 'linkedin.com',
        href: 'https://linkedin.com/in/aahilrupsi',
    },
    {
        icon: GitBranch,
        label: 'GitHub',
        descriptor: 'github.com',
        href: 'https://github.com/aahilrupsi',
    },
    {
        icon: FileText,
        label: 'Resume',
        descriptor: '.pdf',
        href: '/resume.pdf',
        download: true,
    },
];

function TypewriterText({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        let i = 0;
        const start = setTimeout(() => {
            const tick = setInterval(() => {
                i++;
                setDisplayed(text.slice(0, i));
                if (i >= text.length) {
                    clearInterval(tick);
                    setDone(true);
                }
            }, 22);
            return () => clearInterval(tick);
        }, startDelay);
        return () => clearTimeout(start);
    }, [text, startDelay]);

    return (
        <span>
            {displayed}
            {!done && (
                <span className="inline-block w-[2px] h-[1em] bg-white/70 ml-[1px] align-middle animate-pulse" />
            )}
        </span>
    );
}

function PreviewWindow() {
    const [gifError, setGifError] = useState(false);

    return (
        <div className="w-full rounded-xl overflow-hidden shadow-2xl border border-white/10">
            {/* Title bar */}
            <div className="bg-[#1c1a19] h-9 flex items-center px-3 relative">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff6157]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffc030]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2acb42]" />
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white/30 font-medium pointer-events-none select-none">
                    Portfolio Preview
                </span>
            </div>

            {/* Preview area */}
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
                {!gifError ? (
                    <img
                        src="/images/preview.gif"
                        alt="Portfolio desktop preview"
                        className="w-full h-full object-cover"
                        onError={() => setGifError(true)}
                    />
                ) : (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: 'url("/images/wallpaper.jpg")' }}
                    />
                )}
                {gifError && (
                    <p className="relative text-white/30 text-xs select-none">
                        Preview coming soon
                    </p>
                )}
            </div>
        </div>
    );
}

export default function MobileLanding() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Fade+rise for name, notice box, preview window
            gsap.from('.m-animate', {
                y: 24,
                opacity: 0,
                duration: 0.65,
                stagger: 0.1,
                ease: 'power2.out',
                delay: 0.15,
            });

            // Slide in from right for each link row
            gsap.from('.link-row', {
                x: 50,
                opacity: 0,
                duration: 0.45,
                stagger: 0.08,
                ease: 'power2.out',
                delay: 0.55,
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen w-full flex flex-col items-center px-5 pt-16 pb-8 overflow-y-auto"
            style={{
                backgroundImage: 'url("/images/wallpaper.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Darkening overlay */}
            <div className="fixed inset-0 bg-black/35 pointer-events-none" />

            {/* Main content */}
            <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6 flex-1">

                {/* Name + title */}
                <div className="m-animate text-center">
                    <h1
                        className="text-[52px] leading-none font-bold text-white tracking-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                        Aahil Rupsi
                    </h1>
                    <p className="text-white text-[15px] mt-2.5 font-medium tracking-wide opacity-80">
                        Software Engineer
                    </p>
                </div>

                {/* Desktop-only notice — box restored, typewriter text */}
                <div className="m-animate w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 flex gap-3 items-start">
                    <Monitor size={16} className="text-white flex-none mt-0.5" />
                    <p className="text-white text-[13px] leading-relaxed opacity-80 min-h-[3.5rem]">
                        <TypewriterText text={NOTICE} startDelay={800} />
                    </p>
                </div>

                {/* Preview window */}
                <div className="m-animate w-full">
                    <PreviewWindow />
                </div>

                {/* Links — full-width editorial list */}
                <div className="w-full">
                    <p className="text-[10px] text-white/70 uppercase tracking-[0.18em] mb-3 font-medium">
                        Get in touch
                    </p>
                    <div className="border-t border-white/15">
                        {LINKS.map(({ icon: Icon, label, descriptor, href, download }) => (
                            <a
                                key={label}
                                href={href}
                                {...(download
                                    ? { download: true }
                                    : { target: '_blank', rel: 'noreferrer' }
                                )}
                                className="link-row group flex items-center w-full py-[18px] border-b border-white/15 active:bg-white/5 transition-colors"
                            >
                                <span
                                    className="flex-1 text-[26px] font-bold leading-none text-white tracking-tight"
                                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                >
                                    {label}
                                </span>
                                <span className="text-[11px] text-white/60 font-mono mx-4">
                                    {descriptor}
                                </span>
                                <Icon size={15} className="text-white flex-none" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer — anchored to bottom */}
            <p className="relative z-10 text-white/60 text-[11px] mt-8">
                © {new Date().getFullYear()} Aahil Rupsi
            </p>
        </div>
    );
}
