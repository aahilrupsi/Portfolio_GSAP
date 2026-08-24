import { useState, useEffect, useRef, useCallback } from 'react';
import { navLinks, type MenuOption } from '#constants';
import { PROFILE } from '#constants/profile';
import { useDesktop } from '../contexts/DesktopContext';
import { type WindowType } from '../types/desktop';
import { Apple, Laptop, Settings, Moon, RotateCcw, Power } from 'lucide-react';
import gsap from 'gsap';

const isActionable = (opt: MenuOption): opt is Extract<MenuOption, { action: string }> =>
    typeof opt.action === 'string';

/**
 * Navbar component that mimics the macOS Status Bar with refined "Glass" dropdowns and hotkeys.
 */
const Navbar = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isMenuMode, setIsMenuMode] = useState(false);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const { openWindow, sleepScreen, restartSequence } = useDesktop();

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const closeMenu = useCallback(() => {
        setActiveMenu(null);
        setIsMenuMode(false);
    }, []);

    // Handle clicking outside to close menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeMenu) {
                const target = event.target as HTMLElement;
                if (!target.closest('.nav-item-container') && !target.closest('.dropdown-menu')) {
                    closeMenu();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu, closeMenu]);

    // Global Keyboard Shortcuts (Shift + Key)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.shiftKey) {
                const key = e.key.toUpperCase();
                for (const link of navLinks) {
                    if (link.menuOptions) {
                        const option = link.menuOptions.find(opt => isActionable(opt) && opt.shortcut === `⇧${key}`);
                        if (option && isActionable(option)) {
                            e.preventDefault();
                            handleNavAction(option.action);
                            closeMenu();
                            return;
                        }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeMenu]);

    const formatTime = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        };
        return date.toLocaleString('en-US', options).replace(/,/g, '');
    };

    const openMenu = (label: string) => {
        setActiveMenu(label);
        setIsMenuMode(true);

        setTimeout(() => {
            const el = dropdownRefs.current[label];
            if (el) {
                gsap.fromTo(el,
                    { opacity: 0, scale: 0.98, y: -2 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.12, ease: 'power1.out' }
                );
            }
        }, 0);
    };

    const handleItemClick = (label: string) => {
        if (activeMenu === label) {
            closeMenu();
        } else {
            openMenu(label);
        }
    };

    const handleMouseEnter = (label: string) => {
        if (isMenuMode && activeMenu !== label) {
            setActiveMenu(label);

            setTimeout(() => {
                const el = dropdownRefs.current[label];
                if (el) {
                    gsap.fromTo(el,
                        { opacity: 0, scale: 0.99 },
                        { opacity: 1, scale: 1, duration: 0.08, ease: 'none' }
                    );
                }
            }, 0);
        }
    };

    const handleNavAction = (action: string) => {
        if (action === 'noop') return;
        if (action.startsWith('open:')) {
            openWindow(action.slice(5) as WindowType);
        } else if (action.startsWith('mailto:') || action.startsWith('http')) {
            window.open(action, '_blank', 'noopener,noreferrer');
        }
    };

    const handleAppleAction = (action: string, e: React.MouseEvent) => {
        e.stopPropagation();
        closeMenu();
        if (action === 'about') openWindow('about');
        if (action === 'settings') openWindow('settings');
        if (action === 'sleep') sleepScreen();
        if (action === 'restart') restartSequence();
        if (action === 'shutdown') sleepScreen(); // User specified shutdown does same as sleep
    };

    return (
        <nav className="navbar">
            <div className="left-side">
                {/* Apple Logo Item */}
                <div
                    className={`logo-container nav-item-container ${activeMenu === 'Apple' ? 'active-item' : ''}`}
                    onClick={() => handleItemClick('Apple')}
                    onMouseEnter={() => handleMouseEnter('Apple')}
                >
                    <img src="/icons/apple-logo.svg" alt="Apple Logo" />
                    {activeMenu === 'Apple' && (
                        <div
                            className="dropdown-menu"
                            ref={(el) => { dropdownRefs.current['Apple'] = el; }}
                        >
                            <button className="menu-item" onClick={(e) => handleAppleAction('about', e)}>
                                <span className="flex items-center gap-2">
                                    <Apple size={14} className="opacity-70" /> About This Mac
                                </span>
                            </button>
                            <div className="menu-divider" />
                            <button className="menu-item" onClick={(e) => handleAppleAction('settings', e)}>
                                <span className="flex items-center gap-2">
                                    <Settings size={14} className="opacity-70" /> System Settings
                                </span>
                            </button>
                            <div className="menu-divider" />
                            <button className="menu-item" onClick={(e) => handleAppleAction('sleep', e)}>
                                <span className="flex items-center gap-2">
                                    <Moon size={14} className="opacity-70" /> Sleep
                                </span>
                            </button>
                            <button className="menu-item" onClick={(e) => handleAppleAction('restart', e)}>
                                <span className="flex items-center gap-2">
                                    <RotateCcw size={14} className="opacity-70" /> Restart
                                </span>
                            </button>
                            <button className="menu-item" onClick={(e) => handleAppleAction('shutdown', e)}>
                                <span className="flex items-center gap-2">
                                    <Power size={14} className="opacity-70" /> Shut Down
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                <div
                    className={`nav-item-container ${activeMenu === 'MacBook' ? 'active-item' : ''}`}
                    onClick={() => handleItemClick('MacBook')}
                    onMouseEnter={() => handleMouseEnter('MacBook')}
                >
                    <p className="nav-title px-2">MacBook Pro</p>
                    {activeMenu === 'MacBook' && (
                        <div
                            className="dropdown-menu"
                            ref={(el) => { dropdownRefs.current['MacBook'] = el; }}
                        >
                            <button className="menu-item">
                                <span className="flex items-center gap-2">
                                    <Laptop size={14} className="opacity-70" /> {PROFILE.firstName}'s Hardware
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                <ul>
                    {navLinks.map((link) => (
                        <li
                            key={link.label}
                            className={`nav-item-container ${activeMenu === link.label ? 'active-item' : ''}`}
                            onClick={() => handleItemClick(link.label)}
                            onMouseEnter={() => handleMouseEnter(link.label)}
                        >
                            {link.label}
                            {activeMenu === link.label && link.menuOptions && (
                                <div
                                    className="dropdown-menu"
                                    ref={(el) => { dropdownRefs.current[link.label] = el; }}
                                >
                                    {link.menuOptions.map((opt, idx) => (
                                        <div key={idx} className="group px-0 w-full">
                                            {!isActionable(opt) ? (
                                                <div className="menu-divider" />
                                            ) : (
                                                <button className="menu-item" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNavAction(opt.action);
                                                    closeMenu();
                                                }}>
                                                    <span className="flex items-center gap-2">
                                                        {opt.icon && <opt.icon size={14} className="opacity-70" />}
                                                        {opt.label}
                                                    </span>
                                                    {opt.shortcut && <span className="shortcut">{opt.shortcut}</span>}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="right-side">
                <div className="status-icons"></div>

                <time className="cursor-default">
                    {formatTime(currentTime)}
                </time>
            </div>
        </nav>
    );
};

export default Navbar;
