import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';

export default function SafariWindow() {
    const { closeWindow } = useDesktop();

    return (
        <DraggableWindow id="safari" resizable minWidth={500} minHeight={400}>
            <MacWindow
                onClose={() => closeWindow('safari')}
                title="Safari"
                theme="light"
                className="w-full h-full flex flex-col"
                contentClassName="flex-1 flex flex-col"
            >
                {/* Projects showcase — content coming soon */}
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    Projects coming soon
                </div>
            </MacWindow>
        </DraggableWindow>
    );
}
