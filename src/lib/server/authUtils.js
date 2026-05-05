import { json } from "@sveltejs/kit";
import {getTwitchId} from "$lib/server/twitchUtils.js";

export async function requireAuth(locals, twitchId) {
    const session = locals.session;
    if (!session?.user) {
        return { error: json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    const sessionTwitchId = await getTwitchId(session.user.id);
    if (sessionTwitchId !== twitchId) {
        return { error: json({ error: 'Forbidden' }, { status: 403 }) };
    }
    return { user: session.user };
}