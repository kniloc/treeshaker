import { json } from "@sveltejs/kit";
import { decrementTurns } from "$lib/server/userUtils.js";
import { shakeTree } from "$lib/server/treeState.js";
import { requireAuth } from "$lib/server/authUtils.js";

export async function POST({ request, locals }) {
    try {
        const { userName } = await request.json();

        if (!userName) {
            return json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const auth = requireAuth(locals, userName);
        if (auth.error) return auth.error;

        const newTurns = await decrementTurns(userName);

        if (newTurns === null) {
            return json({ error: 'No turns remaining or user not found' }, { status: 400 });
        }

        const result = shakeTree(userName);

        return json({
            success: true,
            turns: newTurns,
            isBee: result.isBee,
            produce: result.produce,
            basket: result.basket
        });
    } catch (error) {
        console.error('Error shaking tree:', error);
        return json({
            error: 'Failed to shake tree',
            details: error.message
        }, { status: 500 });
    }
}
