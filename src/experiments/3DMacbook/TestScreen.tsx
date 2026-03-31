import { useEffect, useState } from 'react'
import Desktop from '#components/Desktop'

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
    const [bootState, setBootState] = useState<'turning_on' | 'booting' | 'loaded'>('turning_on')
    const [progress, setProgress] = useState(0)

    const handleLaunch = () => {
        // Inform the 3D Camera system to execute the Dive animation
        window.dispatchEvent(new Event('launch-portfolio'))
    }

    useEffect(() => {
        // Delay fade-in slightly after component mount (at 5.0 seconds from Macbook.tsx).
        // This ensures the screen doesn't "flash" on, but softly glows into the typical Apple boot.
        const turnOnTimer = setTimeout(() => {
            setBootState('booting')

            // Advance the loading bar smoothly and pseudo-randomly
            let currentProg = 0;
            const interval = setInterval(() => {
                currentProg += Math.random() * 8 + 4; // Between 4% and 12% at a time
                if (currentProg >= 100) {
                    currentProg = 100;
                    clearInterval(interval);
                    // Pause for effect when completely full, then fade to website
                    setTimeout(() => setBootState('loaded'), 500);
                }
                setProgress(currentProg);
            }, 100); // 100ms cycle

            return () => clearInterval(interval);
        }, 300);

        return () => clearTimeout(turnOnTimer);
    }, [])

    return (
        <div
            className="relative overflow-hidden bg-black text-white"
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            {/* macOS BOOT SEQUENCE LAYER */}
            <div
                className={`absolute inset-0 bg-black flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out z-20 pointer-events-none ${bootState === 'turning_on' ? 'opacity-0' :
                    bootState === 'loaded' ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                <AppleLogo />

                {/* macOS Loading Bar */}
                <div className="w-64 h-1.5 bg-[#333333] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* PAYLOAD LAYER (The Actual Website) */}
            <Desktop
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out z-10 ${bootState === 'loaded' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                style={{ backgroundImage: 'url("/images/wallpaper.jpg")' }}
            >
                {/* Launch Button Container centered in the remaining space */}
                <div className="w-full h-full flex items-center justify-center">
                    <button
                        onClick={handleLaunch}
                        className="relative group p-[2px] rounded-full overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 pointer-events-auto"
                    >
                        {/* The Animated Aura Gradient */}
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* The Frosted Glass Pill */}
                        <div className="relative inline-flex h-full w-full items-center justify-center rounded-full bg-black/40 backdrop-blur-xl px-12 py-5 text-lg font-medium text-white transition-all group-hover:bg-black/20">
                            Enter Full Screen
                        </div>
                    </button>
                </div>
            </Desktop>
        </div>
    )
}
