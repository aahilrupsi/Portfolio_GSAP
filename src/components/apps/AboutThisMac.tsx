import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';

export default function AboutThisMac() {
    const { closeWindow } = useDesktop();

    return (
        <DraggableWindow id="about">
            <MacWindow
                onClose={() => closeWindow('about')}
                className="w-[300px] bg-[#22201F] text-white/90"
            >
                <div className="flex flex-col items-center p-8 pt-16">
                    {/* Laptop Placeholder */}
                    <div className="w-32 h-24 bg-white/10 rounded-lg mb-6 flex items-center justify-center text-xs text-white/50">
                        Laptop Image Here
                    </div>

                    <h1 className="text-2xl font-bold mb-1 tracking-tight">MacBook Air</h1>
                    <p className="text-xs text-white/50 font-medium mb-6">13-inch, M4, 2025</p>

                    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs mb-8 w-full px-2">
                        <span className="text-right text-white/60 font-medium">Chip</span>
                        <span>Apple M4</span>

                        <span className="text-right text-white/60 font-medium">Memory</span>
                        <span>16 GB</span>

                        <span className="text-right text-white/60 font-medium">Serial number</span>
                        <span>M59P2CQ4YJ</span>

                        <span className="text-right text-white/60 font-medium">macOS</span>
                        <span>Tahoe 26.3.1 (a)</span>
                    </div>

                    <button className="bg-white/10 hover:bg-white/20 border border-white/5 transition-colors px-4 py-1 rounded-md text-[13px] font-medium mb-6 cursor-pointer">
                        More Info...
                    </button>

                    <div className="text-center text-[10px] text-white/40 leading-[14px]">
                        <a href="#" className="underline hover:text-white/60 transition-colors">Regulatory Certification</a>
                        <br />
                        ™ and © 1983-2026 Apple Inc.<br />
                        All Rights Reserved.
                    </div>
                </div>
            </MacWindow>
        </DraggableWindow>
    );
}
