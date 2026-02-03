import {json} from "@sveltejs/kit";
import {addToBalance} from "$lib/server/userUtils.js";
import {calculateEarnings} from "$lib/server/produceData.js";
import {getUserBasket, resetUserState} from "$lib/server/treeState.js";

export async function POST({request}) {
    try {
        const { userName, clonkData } = await request.json();

        if(!userName) {
            return json({ error: 'Invalid parameters' }, {status: 400});
        }

        const basketItems = getUserBasket(userName);

        if (basketItems.length < 5) {
            return json({ error: 'Need at least 5 items to sell' }, {status: 400});
        }

        const { baseEarnings, bonusEarnings, total } = calculateEarnings(basketItems, clonkData);
        const newBalance = await addToBalance(total, userName);

        if (newBalance === null) {
            return json({ error: 'Failed to update balance' }, {status: 400});
        }

        resetUserState(userName);

        return json({ success: true, balance: newBalance, baseEarnings, bonusEarnings });
    } catch (error) {
        console.error('Error updating balance:', error);
        return json({
            error: 'Failed to update balance',
            details: error.message
        }, {status: 500});
    }
}
