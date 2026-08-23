import {
    FileText,
    Users,
    Mail,
    User,
    GitBranch,
    ExternalLink,
    Monitor,
} from 'lucide-react';
import { PROFILE, MAILTO } from './profile';

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
            { label: 'Email', action: MAILTO, shortcut: '⇧M', icon: Mail },
            { label: 'LinkedIn', action: PROFILE.linkedin.url, shortcut: '⇧L', icon: User },
            { label: 'GitHub', action: PROFILE.github.url, shortcut: '⇧G', icon: GitBranch },
        ]
    },
    {
        label: 'Projects',
        href: '#projects',
        menuOptions: [
            { label: 'Open Projects', action: 'open:safari', shortcut: '⇧P', icon: Monitor },
            { divider: true },
            { label: 'View on GitHub', action: PROFILE.github.url, shortcut: '⇧V', icon: ExternalLink },
        ]
    },
];
