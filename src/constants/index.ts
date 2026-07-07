import { 
    Info, 
    Briefcase, 
    Code, 
    GraduationCap, 
    Mail, 
    User, 
    GitBranch, 
    Monitor, 
    Palette, 
    FileText 
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
        label: 'Portfolio',
        href: '#portfolio',
        menuOptions: [
            { label: 'About Me', action: 'about', shortcut: '⇧A', icon: Info },
            { label: 'Experience', action: 'experience', shortcut: '⇧E', icon: Briefcase },
            { label: 'Skills', action: 'skills', shortcut: '⇧S', icon: Code },
            { label: 'Education', action: 'education', shortcut: '⇧D', icon: GraduationCap },
        ]
    },
    {
        label: 'Contact',
        href: '#contact',
        menuOptions: [
            { label: 'Email Me', action: 'email', shortcut: '⇧M', icon: Mail },
            { label: 'LinkedIn', action: 'linkedin', shortcut: '⇧L', icon: User },
            { label: 'GitHub', action: 'github', shortcut: '⇧G', icon: GitBranch },
        ]
    },
    {
        label: 'Projects',
        href: '#projects',
        menuOptions: [
            { label: 'Web Apps', action: 'web', shortcut: '⇧W', icon: Monitor },
            { label: 'Animations', action: 'animations', shortcut: '⇧N', icon: Palette },
            { divider: true },
            { label: 'Case Studies', action: 'case', shortcut: '⇧C', icon: FileText },
        ]
    },
];
