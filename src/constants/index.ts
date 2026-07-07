import {
    FileText,
    Users,
    Mail,
    User,
    GitBranch,
    ExternalLink,
    Monitor,
} from 'lucide-react';

export type MenuOption = {
    label: string;
    action: string;
    shortcut: string;
    icon: any;
} | {
    divider: boolean;
    label?: never;
    action?: never;
    shortcut?: never;
    icon?: never;
};

export const navLinks: { label: string; href: string; menuOptions: MenuOption[] }[] = [
    {
        label: 'Resume',
        href: '#resume',
        menuOptions: [
            { label: 'View Resume', action: 'noop', shortcut: '⇧R', icon: FileText },
        ]
    },
    {
        label: 'Contacts',
        href: '#contacts',
        menuOptions: [
            { label: 'Open Contacts', action: 'open:contacts', shortcut: '⇧C', icon: Users },
            { divider: true },
            { label: 'Email', action: 'mailto:subikahaider@gmail.com', shortcut: '⇧M', icon: Mail },
            { label: 'LinkedIn', action: 'https://linkedin.com/in/aahilrupsi', shortcut: '⇧L', icon: User },
            { label: 'GitHub', action: 'https://github.com/aahilrupsi', shortcut: '⇧G', icon: GitBranch },
        ]
    },
    {
        label: 'Projects',
        href: '#projects',
        menuOptions: [
            { label: 'Open Projects', action: 'open:safari', shortcut: '⇧P', icon: Monitor },
            { divider: true },
            { label: 'View on GitHub', action: 'https://github.com/aahilrupsi', shortcut: '⇧V', icon: ExternalLink },
        ]
    },
];
