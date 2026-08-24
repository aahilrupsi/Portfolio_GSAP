// Single source of truth for personal/contact info used across the portfolio.
export const PROFILE = {
    name: 'Aahil Rupsi',
    firstName: 'Aahil',
    title: 'Software Engineer',
    email: 'reachout@aahilrupsi.com',
    website: 'https://aahilrupsi.dev',
    github: {
        handle: 'aahilrupsi',
        url: 'https://github.com/aahilrupsi',
    },
    linkedin: {
        handle: 'aahil-rupsi',
        url: 'https://www.linkedin.com/in/aahil-rupsi/',
    },
    // X/Twitter account disabled — no longer public.
    // x: {
    //     handle: 'aahilrupsi',
    //     url: 'https://x.com/aahilrupsi',
    // },
} as const;

export const MAILTO = `mailto:${PROFILE.email}`;
