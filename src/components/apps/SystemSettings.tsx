import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';
import { Search } from 'lucide-react';

export default function SystemSettings() {
    const { closeWindow } = useDesktop();

    const Sidebar = (
        <div className="p-3">
            <div className="relative mb-4 mt-2 px-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-white/40" />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-black/20 text-[13px] text-white rounded-md pl-8 pr-3 py-1 outline-none placeholder:text-white/40 border border-white/5 shadow-inner"
                />
            </div>

            <div className="space-y-0.5">
                <div className="flex items-center gap-2 p-1.5 rounded-[5px] bg-[#0062d6] text-white cursor-pointer select-none mx-1">
                    <div className="w-[22px] h-[22px] rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                        <span className="text-[10px] font-bold text-white">A</span>
                    </div>
                    <span className="text-[13px] font-medium">Accessibility</span>
                </div>
            </div>
        </div>
    );

    return (
        <DraggableWindow id="settings" resizable minWidth={480} minHeight={360}>
            <MacWindow
                onClose={() => closeWindow('settings')}
                className="w-full h-full text-white"
                sidebar={Sidebar}
                sidebarClassName="w-[220px] bg-[#21201F] border-r border-black/50"
                contentClassName="bg-[#292727]"
            >
                <div className="flex items-center p-4 h-[52px]">
                    <h2 className="text-[14px] font-bold text-white/90 ml-2 select-none tracking-tight">Accessibility</h2>
                </div>
                <div className="flex-1 p-6 flex flex-col pt-2 text-white/40">
                    {/* Empty for now as requested */}
                </div>
            </MacWindow>
        </DraggableWindow>
    );
}
