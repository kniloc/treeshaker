import {json} from "@sveltejs/kit";
import {addToBalance} from "$lib/server/userUtils.js";
import {calculateEarnings} from "$lib/server/produceData.js";
import {getUserBasket, resetUserState} from "$lib/server/treeState.js";
import {requireAuth} from "$lib/server/authUtils.js";

export async function POST({request, locals}) {
    try {
        const { twitchId, clonkData } = await request.json();

        if(!twitchId) {
            return json({ error: 'Invalid parameters' }, {status: 400});
        }

        const auth = await requireAuth(locals, twitchId);
        if (auth.error) return auth.error;

        const basketItems = getUserBasket(twitchId);

        if (basketItems.length < 5) {
            return json({ error: 'Need at least 5 items to sell' }, {status: 400});
        }

        const { baseEarnings, bonusEarnings, total } = calculateEarnings(basketItems, clonkData);
        const newBalance = await addToBalance(total, twitchId);

        if (newBalance === null) {
            return json({ error: 'Failed to update balance' }, {status: 400});
        }

        resetUserState(twitchId);

        return json({ success: true, balance: newBalance, baseEarnings, bonusEarnings });
    } catch (error) {
        console.error('Error updating balance:', error);
        return json({
            error: 'Failed to update balance',
            details: error.message
        }, {status: 500});
    }
}
