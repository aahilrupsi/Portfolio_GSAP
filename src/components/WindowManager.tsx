import { useDesktop } from '../contexts/DesktopContext';
import AboutThisMac from './apps/AboutThisMac';
import SystemSettings from './apps/SystemSettings';
import NotesWindow from './apps/NotesWindow';
import SafariWindow from './apps/SafariWindow';

export default function WindowManager() {
    const { windowsState } = useDesktop();

    console.log('[WindowManager] Rendering. windowsState:', windowsState);

    return (
        <div className="absolute inset-0 pointer-events-none z-80">
            {windowsState.about.isOpen && <AboutThisMac />}
            {windowsState.settings.isOpen && <SystemSettings />}
            {windowsState.notes.isOpen && <NotesWindow />}
            {windowsState.safari.isOpen && <SafariWindow />}
        </div>
    );
}
