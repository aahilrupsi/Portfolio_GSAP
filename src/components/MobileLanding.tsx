import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Mail, Linkedin, Github, FileText, Monitor } from 'lucide-react';

const LINKS = [
    {
        icon: Mail,
        label: 'Email',
        href: 'mailto:aahil@mckinneyandco.com',
    },
    {
        icon: Linkedin,
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/aahilrupsi', // update if slug differs
    },
    {
        icon: Github,
        label: 'GitHub',
        href: 'https://github.com/aahilrupsi',
    },
    {
        icon: FileText,
        label: 'Resume',
        href: '/resume.pdf', // drop resume.pdf in public/
        download: true,
    },
];

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
                    // Placeholder shown until preview.gif is added to public/images/
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
            gsap.from('.m-animate', {
                y: 24,
                opacity: 0,
                duration: 0.65,
                stagger: 0.1,
                ease: 'power2.out',
                delay: 0.15,
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen w-full overflow-y-auto flex flex-col items-center px-5 pt-16 pb-12"
            style={{
                backgroundImage: 'url("/images/wallpaper.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Darkening overlay for readability */}
            <div className="fixed inset-0 bg-black/35 pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">

                {/* Name + title */}
                <div className="m-animate text-center">
                    <h1
                        className="text-[52px] leading-none font-bold text-white tracking-tight"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                        Aahil Rupsi
                    </h1>
                    <p className="text-white/55 text-[15px] mt-2.5 font-medium tracking-wide">
                        Software Engineer
                    </p>
                </div>

                {/* Desktop-only notice */}
                <div className="m-animate w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 flex gap-3 items-start">
                    <Monitor size={16} className="text-white/60 flex-none mt-0.5" />
                    <p className="text-white/70 text-[13px] leading-relaxed">
                        This portfolio is a macOS desktop experience. Visit on a larger screen for the full interactive version.
                    </p>
                </div>

                {/* Preview window */}
                <div className="m-animate w-full">
                    <PreviewWindow />
                </div>

                {/* Quick links */}
                <div className="m-animate w-full grid grid-cols-2 gap-3">
                    {LINKS.map(({ icon: Icon, label, href, download }) => (
                        <a
                            key={label}
                            href={href}
                            {...(download
                                ? { download: true }
                                : { target: '_blank', rel: 'noreferrer' }
                            )}
                            className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl px-4 py-3.5 text-white/75 hover:bg-white/20 hover:text-white active:scale-95 transition-all"
                        >
                            <Icon size={15} className="flex-none" />
                            <span className="text-[13px] font-medium">{label}</span>
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <p className="m-animate text-white/25 text-[11px] mt-1">
                    © {new Date().getFullYear()} Aahil Rupsi
                </p>
            </div>
        </div>
    );
}
