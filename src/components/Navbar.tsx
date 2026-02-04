import { useState, useEffect } from 'react'
import { navLinks } from '#constants'

/**
 * Navbar component that mimics the macOS Status Bar.
 */
const Navbar = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute is enough for hh:mm
        return () => clearInterval(timer);
    }, []);

    /**
     * Formats date to match macOS style: Wed Feb 4 12:28 PM
     */
    const formatTime = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        };
        // Remove commas to match the clean macOS look
        return date.toLocaleString('en-US', options).replace(/,/g, '');
    };

    return (
        <nav className="navbar">
            {/* Left Side: Logo, Title, and Navigation Links */}
            <div className="left-side">
                <div className="logo-container">
                    <img src="icons/Apple_logo_white.svg" alt="Apple Logo" />
                </div>

                <p className="nav-title">MacBook Pro</p>

                <ul>
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <a href={link.href}>{link.label}</a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Side: Status Icons and Clock */}
            <div className="right-side">
                <div className="status-icons">
                    {/* Using simple spans as placeholders for future SVG icons */}
                    <span className="text-[12px] opacity-80 cursor-pointer hover:opacity-100 transition-opacity">WiFi</span>
                    <span className="text-[12px] opacity-80 cursor-pointer hover:opacity-100 transition-opacity">CC</span>
                </div>

                <time className="cursor-default">
                    {formatTime(currentTime)}
                </time>
            </div>
        </nav>
    );
};

export default Navbar;
