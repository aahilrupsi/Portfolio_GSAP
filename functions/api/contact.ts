interface Env {
    DB: D1Database;
    /** Full ntfy.sh topic URL to POST notifications to, e.g. https://ntfy.sh/your-private-topic */
    NTFY_TOPIC_URL?: string;
}

interface ContactPayload {
    fromEmail?: string;
    subject?: string;
    body?: string;
}

const MAX_LEN = { email: 254, subject: 200, body: 5000 } as const;
const RATE_LIMIT_PER_HOUR = 5;

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    let payload: ContactPayload;
    try {
        payload = await request.json();
    } catch {
        return json({ error: 'Invalid JSON body' }, 400);
    }

    const fromEmail = (payload.fromEmail ?? '').trim();
    const subject = (payload.subject ?? '').trim();
    const body = (payload.body ?? '').trim();

    if (!fromEmail || !subject || !body) {
        return json({ error: 'Missing required fields' }, 400);
    }
    if (fromEmail.length > MAX_LEN.email || !isValidEmail(fromEmail)) {
        return json({ error: 'Invalid email address' }, 400);
    }
    if (subject.length > MAX_LEN.subject || body.length > MAX_LEN.body) {
        return json({ error: 'Message too long' }, 400);
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

    const recentCount = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM messages WHERE ip = ?1 AND created_at > datetime('now', '-1 hour')`
    ).bind(ip).first<number>('count');
    if ((recentCount ?? 0) >= RATE_LIMIT_PER_HOUR) {
        return json({ error: 'Too many messages sent recently, please try again later' }, 429);
    }

    await env.DB.prepare(
        `INSERT INTO messages (from_email, subject, body, ip) VALUES (?1, ?2, ?3, ?4)`
    ).bind(fromEmail, subject, body, ip).run();

    if (env.NTFY_TOPIC_URL) {
        try {
            await fetch(env.NTFY_TOPIC_URL, {
                method: 'POST',
                headers: { 'Title': 'New portfolio contact message' },
                body: `From: ${fromEmail}\nSubject: ${subject}\n\n${body}`.slice(0, 4000),
            });
        } catch {
            // A failed notification shouldn't fail the contact form submission.
        }
    }

    return json({ ok: true });
};
