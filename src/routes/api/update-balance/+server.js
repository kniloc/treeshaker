import {json} from "@sveltejs/kit";
import {updateUserBalance} from "$lib/server/userUtils.js";

export async function POST({request}) {
    try {
        const { balance, userName } = await request.json();

        if(typeof balance !== 'number' || !userName) {
            return json({ error: 'Invalid parameters' }, {status: 400});
        }

        await updateUserBalance(balance, userName);

        return json({success: true});
    } catch (error) {
        console.error('Error updating balance:', error);
        return json({
            error: 'Failed to update balance',
            details: error.message
        }, {status: 500});
    }
}