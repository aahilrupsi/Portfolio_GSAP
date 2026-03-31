import React from 'react';
import Navbar from '#components/Navbar';

interface DesktopProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export default function Desktop({ children, className = '', ...props }: DesktopProps) {
    return (
        <div className={`w-full h-full flex flex-col ${className}`} {...props}>
            <Navbar />
            <div className="flex-1 relative overflow-hidden pointer-events-none">
                {/* Children / Bottom layer */}
                {children && (
                    <div className="absolute inset-0 pointer-events-auto z-0">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
