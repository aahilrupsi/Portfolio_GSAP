import { useState, useEffect, useRef, useCallback } from 'react';
import { navLinks } from '#constants';
import gsap from 'gsap';

/**
 * Navbar component that mimics the macOS Status Bar with dropdown functionality and hotkeys.
 */
const Navbar = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isMenuMode, setIsMenuMode] = useState(false);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

                // Search for shortcut in navLinks
                for (const link of navLinks) {
                    if (link.menuOptions) {
                        const option = link.menuOptions.find(opt => opt.shortcut === `⇧${key}`);
                        if (option) {
                            e.preventDefault();
                            console.log(`Shortcut Triggered: ${option.label}`);
                            // Logic for action would go here
                            alert(`Triggered: ${option.label}`);
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

        // Animate in using GSAP
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

    return (
        <nav className="navbar">
            <div className="left-side">
                {/* Apple Logo Item */}
                <div
                    className={`logo-container nav-item-container ${activeMenu === 'Apple' ? 'active-item' : ''}`}
                    onClick={() => handleItemClick('Apple')}
                    onMouseEnter={() => handleMouseEnter('Apple')}
                >
                    <img src="icons/Apple_logo_white.svg" alt="Apple Logo" />
                    {activeMenu === 'Apple' && (
                        <div
                            className="dropdown-menu"
                            ref={(el) => { dropdownRefs.current['Apple'] = el; }}
                        >
                            <button className="menu-item">
                                <span>About This Mac</span>
                            </button>
                            <div className="menu-divider" />
                            <button className="menu-item">
                                <span>System Settings...</span>
                            </button>
                            <button className="menu-item">
                                <span>App Store...</span>
                            </button>
                            <div className="menu-divider" />
                            <button className="menu-item">
                                <span>Sleep</span>
                            </button>
                            <button className="menu-item">
                                <span>Restart...</span>
                            </button>
                            <button className="menu-item">
                                <span>Shut Down...</span>
                            </button>
                        </div>
                    )}
                </div>

                <p className="nav-title">MacBook Pro</p>

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
                                        <button key={idx} className="menu-item" onClick={(e) => {
                                            e.stopPropagation();
                                            console.log(`Action: ${opt.action}`);
                                            closeMenu();
                                        }}>
                                            <span>{opt.label}</span>
                                            {opt.shortcut && <span className="shortcut">{opt.shortcut}</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="right-side">
                <div className="status-icons">
                    <span className="text-[12px] opacity-80 cursor-default hover:opacity-100 transition-opacity">WiFi</span>
                    <span className="text-[12px] opacity-80 cursor-default hover:opacity-100 transition-opacity">CC</span>
                </div>

                <time className="cursor-default">
                    {formatTime(currentTime)}
                </time>
            </div>
        </nav>
    );
};

export default Navbar;
