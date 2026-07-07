import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/all';
import { useDesktop } from '../contexts/DesktopContext';
import { type WindowType, WINDOW_DEFAULTS } from '../types/desktop';

gsap.registerPlugin(Draggable);

interface DraggableWindowProps {
    id: WindowType;
    children: React.ReactNode;
    resizable?: boolean;
    minWidth?: number;
    minHeight?: number;
}

export default function DraggableWindow({ id, children, resizable = false, minWidth = 300, minHeight = 200 }: DraggableWindowProps) {
    const { windowsState, focusWindow, updatePosition } = useDesktop();
    const windowRef = useRef<HTMLDivElement>(null);
    const state = windowsState[id];
    const draggableRef = useRef<globalThis.Draggable | null>(null);

    const defaults = WINDOW_DEFAULTS[id];
    const [size, setSize] = useState({ width: defaults.width, height: defaults.height });

    useEffect(() => {
        const el = windowRef.current;
        if (!el) return;

        const [instance] = Draggable.create(el, {
            trigger: el.querySelector('.drag-handle') as HTMLElement,
            // bounds: 'body', // Removed to avoid issues with CSS3D transforms
            onDragEnd() {
                updatePosition(id, this.x, this.y);
            },
        });

        instance.update();
        draggableRef.current = instance;

        return () => { 
            instance.kill(); 
            draggableRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Keep draggable in sync with external position updates
    useEffect(() => {
        if (draggableRef.current) {
            draggableRef.current.update();
        }
    }, [state.x, state.y]);

    console.log(`[DraggableWindow] Rendering ${id}:`, { x: state.x, y: state.y, zIndex: state.zIndex });

    const handleResizeStart = (e: React.PointerEvent, direction: 'se' | 'sw' | 's' | 'e' | 'ne' | 'nw') => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;
        const windowX = state.x;
        const windowY = state.y;
        let finalX = windowX;
        let finalY = windowY;

        const onMove = (moveEvent: PointerEvent) => {
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = windowX;
            let newY = windowY;
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (direction === 'se' || direction === 'e' || direction === 'ne') {
                newWidth = Math.max(minWidth, startWidth + deltaX);
            }
            if (direction === 'sw' || direction === 'e' || direction === 'nw') {
                newWidth = Math.max(minWidth, startWidth - deltaX);
                newX = windowX + deltaX;
            }
            if (direction === 'se' || direction === 's' || direction === 'sw') {
                newHeight = Math.max(minHeight, startHeight + deltaY);
            }
            if (direction === 'ne' || direction === 'nw') {
                newHeight = Math.max(minHeight, startHeight - deltaY);
                newY = windowY + deltaY;
            }

            setSize({ width: newWidth, height: newHeight });
            finalX = newX;
            finalY = newY;
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            if (finalX !== windowX || finalY !== windowY) {
                updatePosition(id, finalX, finalY);
            }
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    return (
        <div
            ref={windowRef}
            className="pointer-events-auto relative"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: size.width,
                height: size.height,
                transform: `translate(${state.x}px, ${state.y}px)`,
                zIndex: state.zIndex
            }}
            onPointerDown={() => focusWindow(id)}
        >
            {children}

            {resizable && (
                <>
                    {/* Top-left corner handle */}
                    <div
                        onPointerDown={(e) => handleResizeStart(e, 'nw')}
                        className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize"
                        style={{ zIndex: 100 }}
                    />

                    {/* Top-right corner handle */}
                    <div
                        onPointerDown={(e) => handleResizeStart(e, 'ne')}
                        className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize"
                        style={{ zIndex: 100 }}
                    />

                    {/* Bottom-left corner handle */}
                    <div
                        onPointerDown={(e) => handleResizeStart(e, 'sw')}
                        className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize"
                        style={{ zIndex: 100 }}
                    />

                    {/* Bottom-right corner handle */}
                    <div
                        onPointerDown={(e) => handleResizeStart(e, 'se')}
                        className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize"
                        style={{ zIndex: 100 }}
                    />

                    {/* Right edge handle */}
                    <div
                        onPointerDown={(e) => handleResizeStart(e, 'e')}
                        className="absolute top-3 right-0 bottom-3 w-1.5 cursor-ew-resize"
                        style={{ zIndex: 100 }}
                    />

                    {/* Bottom edge handle */}
                    <div
                        onPointerDown={(e) => handleResizeStart(e, 's')}
                        className="absolute bottom-0 left-3 right-3 h-1.5 cursor-ns-resize"
                        style={{ zIndex: 100 }}
                    />
                </>
            )}
        </div>
    );
}
