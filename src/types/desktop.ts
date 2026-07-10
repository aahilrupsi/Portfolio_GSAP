export type WindowType = 'about' | 'settings' | 'notes' | 'safari' | 'contacts' | 'finder' | 'preview' | 'spotify';

export interface WindowState {
    isOpen: boolean;
    zIndex: number;
    x: number;
    y: number;
}

export type WindowsState = Record<WindowType, WindowState>;

export const WINDOW_DEFAULTS: Record<WindowType, { width: number; height: number }> = {
    about:    { width: 300,  height: 480 },
    settings: { width: 720,  height: 540 },
    notes:    { width: 450,  height: 500 },
    safari:   { width: 900,  height: 600 },
    contacts: { width: 800,  height: 560 },
    finder:   { width: 820,  height: 540 },
    preview:  { width: 700,  height: 520 },
    spotify:  { width: 400,  height: 640 },
};
