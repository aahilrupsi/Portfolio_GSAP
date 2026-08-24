// A notification's trigger controls how it enters/leaves, not just when it fires:
//  - 'one-time'   fires at most once ever (tracked in localStorage), stays until dismissed
//  - 'persistent' fires every time it's triggered, stays until the user dismisses it
//  - 'temporary'  fires every time it's triggered, animates away on its own after `duration`
export type NotificationTrigger = 'one-time' | 'persistent' | 'temporary';

export interface NotifyOptions {
    id: string; // stable key for this notification; also the one-time dedup key
    appName: string;
    title: string;
    message?: string;
    icon?: string;
    trigger: NotificationTrigger;
    duration?: number; // ms, only used when trigger === 'temporary'
}

export interface ActiveNotification extends NotifyOptions {
    key: string; // unique per spawned instance (multiple persistent/temporary notifs can share an id)
    x: number;
    y: number;
    zIndex: number;
    leaving: boolean;
}

export const NOTIFICATION_WIDTH = 360;
export const NOTIFICATION_STACK_TOP = 36;
export const NOTIFICATION_STACK_RIGHT = 16;
export const NOTIFICATION_STACK_GAP = 12;
export const NOTIFICATION_STACK_ROW_HEIGHT = 88;
export const NOTIFICATION_DEFAULT_DURATION = 6000;
// Rough card height used only to keep drags from leaving the visible desktop
// area — doesn't need to track the real (content-dependent) height exactly.
export const NOTIFICATION_APPROX_HEIGHT = 108;
