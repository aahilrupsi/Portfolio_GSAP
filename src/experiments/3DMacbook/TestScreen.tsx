import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import Desktop from '#components/Desktop'
import { useDesktop } from '../../contexts/DesktopContext'

interface TestScreenProps {
    width: number
    height: number
}

// macOS Apple Logo (Vector Path)
const AppleLogo = () => (
    <svg viewBox="0 0 384 512" fill="white" className="w-24 h-24 mb-16">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
)

export default function TestScreen({ width, height }: TestScreenProps) {
    const { openWindow, closeWindow } = useDesktop()
    const [bootState, setBootState] = useState<'turning_on' | 'booting' | 'loaded'>('turning_on')
    const [progress, setProgress] = useState(0)
    const [showWelcomeButtons, setShowWelcomeButtons] = useState(true)
    const welcomeRef = useRef<HTMLDivElement>(null)

    const handleLaunch = () => {
        closeWindow('notes')
        window.dispatchEvent(new Event('launch-portfolio'))
    }

    const handleSkip = () => {
        if (welcomeRef.current) {
            // Pop out animation for buttons begins
            gsap.to(welcomeRef.current, {
                scale: 1.1,
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => setShowWelcomeButtons(false)
            });
        } else {
            setShowWelcomeButtons(false)
        }
    }

    useEffect(() => {
        console.log('[TestScreen] Mount');
        const bootTimer = setTimeout(() => {
            console.log('[TestScreen] Boot Phase 1: booting');
            setBootState('booting');
            setProgress(50);

            const finishTimer = setTimeout(() => {
                console.log('[TestScreen] Boot Phase 2: loaded');
                setBootState('loaded');
                setProgress(100);
                
                console.log('[TestScreen] Attempting to open Notes window...');
                // Position at bottom left: x = 40, y = height - window_height - 40
                // Notes window height is 500
                openWindow('notes', 40, height - 500 - 40);
            }, 2000);

            return () => clearTimeout(finishTimer);
        }, 1000);

        return () => clearTimeout(bootTimer);
    }, []); // Run once on mount


    return (
        <div
            className="relative overflow-hidden bg-black text-white"
            style={{ width: `${width}px`, height: `${height}px` }}
        >

            {/* macOS BOOT SEQUENCE LAYER */}
            <div
                className={`absolute inset-0 bg-black flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out z-50 pointer-events-none ${bootState === 'turning_on' ? 'opacity-0' :
                    bootState === 'loaded' ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                <AppleLogo />
                <div className="w-64 h-1.5 bg-[#333333] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Payload Layer (The Actual Website) */}
            <Desktop
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out z-10 ${bootState === 'loaded' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                style={{ backgroundImage: 'url("/images/wallpaper.jpg")' }}
            >
                {showWelcomeButtons ? (
                    <div className="w-full h-full relative flex flex-col items-center justify-end pointer-events-none">
                        {/* Control Options Container - Perfectly Centered */}
                        <div ref={welcomeRef} className="pb-32 z-30 w-full flex justify-center pointer-events-auto">
                            <div className="flex items-center bg-white/[0.03] border border-white/[0.05] backdrop-blur-md rounded-full font-bold tracking-[0.2em] text-[13px] text-white/50 shadow-2xl">
                                <div className="flex-1 min-w-[220px] py-5 px-10 text-right">
                                    <button
                                        onClick={handleLaunch}
                                        className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        GO FULL SCREEN
                                    </button>
                                </div>

                                {/* Vertical Separator - This stays at the exact screen center */}
                                <div className="w-[1px] h-4 bg-white/10 flex-none" />

                                <div className="flex-1 min-w-[220px] py-5 px-10 text-left">
                                    <button
                                        onClick={handleSkip}
                                        className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        SKIP FULL SCREEN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center pointer-events-none" />
                )}
            </Desktop>
        </div>
    )
}
