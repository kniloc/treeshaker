import { json } from "@sveltejs/kit";

export function requireAuth(locals, userName) {
    const session = locals.session;

    if (!session?.user) {
        return { error: json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    if (session.user.name.toLowerCase() !== userName?.toLowerCase()) {
        return { error: json({ error: 'Forbidden' }, { status: 403 }) };
    }

    return { user: session.user };
}
