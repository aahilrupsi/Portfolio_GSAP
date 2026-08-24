import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
    type ActiveNotification,
    type NotifyOptions,
    NOTIFICATION_WIDTH,
    NOTIFICATION_STACK_TOP,
    NOTIFICATION_STACK_RIGHT,
    NOTIFICATION_STACK_ROW_HEIGHT,
    NOTIFICATION_DEFAULT_DURATION,
} from '../types/notification';

const SEEN_KEY = 'portfolio-notifications-seen';

function getSeenIds(): Set<string> {
    try {
        return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
    } catch {
        return new Set();
    }
}

function markSeen(id: string) {
    try {
        const seen = getSeenIds();
        seen.add(id);
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
    } catch {
        // localStorage unavailable (private browsing, quota, etc.) — worst case
        // the one-time notification re-shows on a future visit.
    }
}

export interface StackBounds {
    width: number;
    height: number;
}

interface NotificationContextType {
    notifications: ActiveNotification[];
    notify: (options: NotifyOptions) => void;
    dismiss: (key: string) => void;
    removeNotification: (key: string) => void;
    setStackBounds: (width: number, height: number) => void;
    bounds: StackBounds;
}

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    notify: () => {},
    dismiss: () => {},
    removeNotification: () => {},
    setStackBounds: () => {},
    bounds: { width: 0, height: 0 },
});

export const useNotifications = () => useContext(NotificationContext);

// Re-flows every non-leaving notification into sequential stack slots
// (top-right, growing downward) so dismissing one closes the gap for
// whatever is left below it. `containerWidth` is the actual rendered width
// of the Desktop surface — NOT window.innerWidth, which is wrong when
// Desktop is portaled onto the /macbook 3D screen's smaller CSS3D <Html>
// element.
function restack(list: ActiveNotification[], containerWidth: number): ActiveNotification[] {
    let stackIndex = 0;
    return list.map(n => {
        if (n.leaving) return n;
        const x = containerWidth - NOTIFICATION_WIDTH - NOTIFICATION_STACK_RIGHT;
        const y = NOTIFICATION_STACK_TOP + stackIndex * NOTIFICATION_STACK_ROW_HEIGHT;
        stackIndex += 1;
        return { ...n, x, y };
    });
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<ActiveNotification[]>([]);
    const counterRef = useRef(0);
    const timersRef = useRef<Record<string, number>>({});

    // Set by Desktop.tsx's ResizeObserver, which measures the actual
    // container (correct both at '/' and inside the /macbook 3D screen).
    // Kept as both a ref (read synchronously inside restack) and state
    // (so Notification.tsx can react to it for drag bounds).
    const [bounds, setBounds] = useState<StackBounds>({ width: window.innerWidth, height: window.innerHeight });
    const boundsRef = useRef(bounds);

    const setStackBounds = useCallback((width: number, height: number) => {
        boundsRef.current = { width, height };
        setBounds({ width, height });
    }, []);

    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            Object.values(timers).forEach(window.clearTimeout);
        };
    }, []);

    // Marks a notification as leaving so its exit animation can play, and
    // immediately restacks everything else so lower notifications slide up to
    // close the gap in step with that exit animation. The notification is
    // actually removed from state once its animation finishes (see
    // Notification.tsx's onComplete -> removeNotification).
    const dismiss = useCallback((key: string) => {
        setNotifications(prev => restack(prev.map(n => (n.key === key ? { ...n, leaving: true } : n)), boundsRef.current.width));
        const timer = timersRef.current[key];
        if (timer) {
            window.clearTimeout(timer);
            delete timersRef.current[key];
        }
    }, []);

    const removeNotification = useCallback((key: string) => {
        setNotifications(prev => restack(prev.filter(n => n.key !== key), boundsRef.current.width));
    }, []);

    const notify = useCallback((options: NotifyOptions) => {
        if (options.trigger === 'one-time') {
            if (getSeenIds().has(options.id)) return;
            markSeen(options.id);
        }

        setNotifications(prev => {
            const key = `${options.id}-${counterRef.current++}`;

            const next: ActiveNotification = {
                ...options,
                key,
                x: boundsRef.current.width - NOTIFICATION_WIDTH - NOTIFICATION_STACK_RIGHT,
                y: NOTIFICATION_STACK_TOP,
                zIndex: 100 + prev.length,
                leaving: false,
            };

            if (options.trigger === 'temporary') {
                const duration = options.duration ?? NOTIFICATION_DEFAULT_DURATION;
                timersRef.current[key] = window.setTimeout(() => dismiss(key), duration);
            }

            return restack([...prev, next], boundsRef.current.width);
        });
    }, [dismiss]);

    return (
        <NotificationContext.Provider value={{ notifications, notify, dismiss, removeNotification, setStackBounds, bounds }}>
            {children}
        </NotificationContext.Provider>
    );
};
