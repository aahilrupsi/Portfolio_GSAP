import { useDesktop } from '../contexts/DesktopContext';
import AboutThisMac from './apps/AboutThisMac';
import SystemSettings from './apps/SystemSettings';
import NotesWindow from './apps/NotesWindow';
import SafariWindow from './apps/SafariWindow';
import ContactsWindow from './apps/ContactsWindow';
import FinderWindow from './apps/FinderWindow';
import PreviewWindow from './apps/PreviewWindow';
import MailWindow from './apps/MailWindow';

export default function WindowManager() {
    const { windowsState } = useDesktop();

    console.log('[WindowManager] Rendering. windowsState:', windowsState);

    return (
        <div className="absolute inset-0 pointer-events-none z-80">
            {windowsState.about.isOpen && <AboutThisMac />}
            {windowsState.settings.isOpen && <SystemSettings />}
            {windowsState.notes.isOpen && <NotesWindow />}
            {windowsState.safari.isOpen && <SafariWindow />}
            {windowsState.contacts.isOpen && <ContactsWindow />}
            {windowsState.finder.isOpen && <FinderWindow />}
            {windowsState.preview.isOpen && <PreviewWindow />}
            {windowsState.mail.isOpen && <MailWindow />}
        </div>
    );
}
