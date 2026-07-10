import { useRef, useEffect } from 'react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';
import gsap from 'gsap';

const PLAYLIST_ID = '7xSPFdp8SqyOqEd3PjuXB3';

export default function SpotifyWindow() {
    const { closeWindow, windowsState } = useDesktop();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (windowsState.spotify.isOpen && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { scale: 0.9, opacity: 0, y: 10 },
                { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
            );
        }
    }, [windowsState.spotify.isOpen]);

    return (
        <DraggableWindow id="spotify" resizable minWidth={320} minHeight={400}>
            <div ref={containerRef} className="w-full h-full">
                <MacWindow
                    onClose={() => closeWindow('spotify')}
                    title="Spotify"
                    theme="dark"
                    className="w-full h-full flex flex-col"
                    contentClassName="flex-1 bg-black"
                >
                    <iframe
                        title="Spotify Playlist"
                        src={`https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`}
                        className="w-full h-full border-0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                    />
                </MacWindow>
            </div>
        </DraggableWindow>
    );
}
