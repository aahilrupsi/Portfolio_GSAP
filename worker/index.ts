import { handleContact } from './contact';

export interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    NTFY_TOPIC_URL?: string;
}

export default {
    async fetch(request, env): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === '/api/contact' && request.method === 'POST') {
            return handleContact(request, env);
        }
        if (url.pathname.startsWith('/api/')) {
            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (url.pathname === '/resume') {
            const pdfUrl = new URL('/resume.pdf', url);
            return env.ASSETS.fetch(new Request(pdfUrl, request));
        }

        return env.ASSETS.fetch(request);
    },
} satisfies ExportedHandler<Env>;
