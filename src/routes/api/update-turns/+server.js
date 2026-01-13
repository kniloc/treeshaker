import {json} from "@sveltejs/kit";
import {updateNumberOfTurns} from "$lib/server/userUtils.js";

export async function POST({request}) {
    try {
        const { numberOfTurns, userName } = await request.json();

        if(typeof numberOfTurns !== 'number' || !userName) {
            return json({ error: 'Invalid parameters' }, {status: 400});
        }

        await updateNumberOfTurns(numberOfTurns, userName);

        return json({ success: true });
    } catch (error) {
        console.error('Error updating turns:', error);
        return json({
            error: 'Failed to update turns',
            details: error.message
        }, {status: 500});
    }
}