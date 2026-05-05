import { json } from "@sveltejs/kit";
import { getUserData } from "$lib/server/userUtils.js";
import { requireAuth } from "$lib/server/authUtils.js";

export async function POST({ request, locals }) {
    try {
        const { twitchId } = await request.json();

        if (!twitchId) {
            return json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const auth = await requireAuth(locals, twitchId);
        if (auth.error) return auth.error;

        const users = await getUserData(twitchId);
        const userData = users[0];

        if (!userData) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json({
            turns: userData.turns_left,
            balance: userData.balance
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return json({
            error: 'Failed to fetch user data',
            details: error.message
        }, { status: 500 });
    }
}
