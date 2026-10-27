import { decrementTurns } from "#lib/server/userUtils.js";
import { shakeTree } from "#lib/server/treeState.js";
import { requireAuth, checkOrigin } from "#lib/server/authUtils.js";
import { BETTER_AUTH_URL } from "$app/env/private";

export async function POST({ request, locals }) {
    try {
        const csrfError = checkOrigin(request, BETTER_AUTH_URL);
        if (csrfError) return csrfError;

        const { twitchId } = await request.json();

        if (!twitchId) {
            return Response.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const auth = await requireAuth(locals, twitchId);
        if (auth.error) return auth.error;

        const newTurns = await decrementTurns(twitchId);

        if (newTurns === null) {
            return Response.json({ error: 'No turns remaining or user not found' }, { status: 400 });
        }

        const result = shakeTree(twitchId);

        return Response.json({
            success: true,
            turns: newTurns,
            isBee: result.isBee,
            produce: result.produce,
            basket: result.basket
        });
    } catch (error) {
        console.error('Error shaking tree:', error);
        return Response.json({
            error: 'Failed to shake tree',
            details: error.message
        }, { status: 500 });
    }
}
