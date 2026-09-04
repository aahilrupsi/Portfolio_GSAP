import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/all';
import { X, Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { type ActiveNotification, NOTIFICATION_WIDTH } from '../types/notification';

gsap.registerPlugin(Draggable);

const DISMISS_DRAG_DISTANCE = 220; // flick a notification this far to send it away
const DISMISS_OVERSHOOT = 40; // extra travel past the threshold before the clamp catches it

interface NotificationProps {
    notification: ActiveNotification;
}

export default function Notification({ notification }: NotificationProps) {
    const { key, x, y, zIndex, leaving, appName, title, message, icon } = notification;
    const { dismiss, removeNotification } = useNotifications();

    // outerRef holds absolute position, driven entirely through GSAP's x/y
    // transform properties (not a raw inline transform string) so that both
    // Draggable and our own reposition tweens share the same tracked state.
    // cardRef holds the visual card and only ever receives enter/leave
    // scale+opacity tweens, so it never fights the outer element's position.
    const outerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const draggableRef = useRef<globalThis.Draggable | null>(null);
    // Always the notification's current stack slot — a drag that doesn't
    // dismiss it snaps back here, so this must track x/y as they change
    // (e.g. when a notification above this one is dismissed and this one
    // shifts up), not just whatever position it was spawned at.
    const slotRef = useRef({ x, y });

    console.log(`[Notification] Rendering ${key}:`, { x, y, zIndex, leaving });

    // Create the draggable target once per notification instance. Dragging is
    // locked to the x-axis and only rightward, mirroring macOS's swipe-to-dismiss —
    // this is a notification, not a desktop window, so it isn't freely relocatable.
    // Releasing it either dismisses it (dragged past the threshold) or springs it
    // back to its stack slot; it never stays wherever it was dropped.
    useEffect(() => {
        const el = outerRef.current;
        if (!el) return;

        gsap.set(el, { x: slotRef.current.x, y: slotRef.current.y });

        const [instance] = Draggable.create(el, {
            type: 'x',
            zIndexBoost: false,
            liveSnap: {
                x: (val: number) => Math.min(Math.max(val, slotRef.current.x), slotRef.current.x + DISMISS_DRAG_DISTANCE + DISMISS_OVERSHOOT),
            },
            onDragEnd() {
                // macOS dismisses banners on a rightward swipe, not any-direction
                // drag distance — a leftward or vertical drag should just snap back.
                const dx = this.x - slotRef.current.x;
                if (dx > DISMISS_DRAG_DISTANCE) {
                    dismiss(key);
                } else {
                    gsap.to(el, {
                        x: slotRef.current.x, y: slotRef.current.y,
                        duration: 0.5, ease: 'elastic.out(1, 0.65)',
                        onUpdate: () => { draggableRef.current?.update(); },
                    });
                }
            },
        });

        draggableRef.current = instance;

        return () => {
            instance.kill();
            draggableRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // Glide to a new stacked position — e.g. when a notification above this
    // one is dismissed and the rest of the stack shifts up to close the gap.
    // Also fires (as a harmless no-op tween) right after a drag confirms its
    // own position, and keeps Draggable's internal tracking in sync after.
    useEffect(() => {
        const el = outerRef.current;
        if (!el) return;
        slotRef.current = { x, y };
        gsap.to(el, {
            x, y, duration: 0.35, ease: 'power2.out',
            onComplete: () => { draggableRef.current?.update(); },
        });
    }, [x, y]);

    // Entrance: slide/scale in from the menu bar edge, mirroring macOS's banner drop-in.
    useEffect(() => {
        if (!cardRef.current) return;
        gsap.fromTo(cardRef.current,
            { opacity: 0, y: -16, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.4)' }
        );
    }, []);

    // Leave: fade/shrink out, then actually remove from state once the tween finishes.
    useEffect(() => {
        if (!leaving || !cardRef.current) return;
        gsap.to(cardRef.current, {
            opacity: 0,
            scale: 0.9,
            y: -8,
            duration: 0.28,
            ease: 'power2.in',
            onComplete: () => removeNotification(key),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leaving]);

    return (
        <div
            ref={outerRef}
            className="pointer-events-auto absolute top-0 left-0"
            style={{ width: NOTIFICATION_WIDTH, zIndex }}
        >
            <div
                ref={cardRef}
                className="group relative rounded-[20px] overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.45)] cursor-grab active:cursor-grabbing"
            >
                {/* Liquid-glass specular highlight */}
                <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-b from-white/15 via-transparent to-transparent" />

                <div className="relative flex items-start gap-3 px-3.5 py-3">
                    <div className="w-9 h-9 flex-none rounded-[10px] bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                        {icon ? (
                            <img src={icon} alt="" className="w-full h-full object-contain p-1.5" />
                        ) : (
                            <Bell size={16} className="text-white/80" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-white/45 truncate">{appName}</span>
                            <span className="text-[10.5px] text-white/35 flex-none">now</span>
                        </div>
                        <p className="text-[13.5px] font-semibold text-white/95 leading-snug mt-0.5 truncate">{title}</p>
                        {message && (
                            <p className="text-[12.5px] text-white/65 leading-snug mt-0.5 line-clamp-2">{message}</p>
                        )}
                    </div>
                </div>

                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => dismiss(key)}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/70 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 hover:text-white cursor-pointer"
                    aria-label="Dismiss notification"
                >
                    <X size={11} />
                </button>
            </div>
        </div>
    );
}
