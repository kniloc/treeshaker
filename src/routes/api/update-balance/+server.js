import { addToBalance } from "#lib/server/userUtils.js";
import { calculateEarnings } from "#lib/server/produceData.js";
import { getUserBasket, resetUserState } from "#lib/server/treeState.js";
import { requireAuth, checkOrigin } from "#lib/server/authUtils.js";
import { BETTER_AUTH_URL } from "$app/env/private";
import { MIN_BASKET_SIZE } from "#lib/gameConfig.js";

export async function POST({request, locals}) {
    try {
        const csrfError = checkOrigin(request, BETTER_AUTH_URL);
        if (csrfError) return csrfError;

        const { twitchId, clonkData } = await request.json();

        if(!twitchId) {
            return Response.json({ error: 'Invalid parameters' }, {status: 400});
        }

        const auth = await requireAuth(locals, twitchId);
        if (auth.error) return auth.error;

        const basketItems = getUserBasket(twitchId);

        if (basketItems.length < MIN_BASKET_SIZE) {
            return Response.json({ error: 'Need at least 5 items to sell' }, {status: 400});
        }

        const { baseEarnings, bonusEarnings, boostPct, total } = calculateEarnings(basketItems, clonkData);
        const newBalance = await addToBalance(total, twitchId);

        if (newBalance === null) {
            return Response.json({ error: 'Failed to update balance' }, {status: 400});
        }

        resetUserState(twitchId);

        return Response.json({
            success: true,
            balance: newBalance,
            baseEarnings,
            bonusEarnings,
            boostPct
        });
    } catch(error) {
        console.error('Error updating balance:', error);

        return Response.json({ error: 'Failed to update balance', details: error.message }, { status: 500 });
    }
}
