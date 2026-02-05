import {json} from "@sveltejs/kit";
import {updateTimestamp} from "$lib/server/userUtils.js";
import {requireAuth} from "$lib/server/authUtils.js";

export async function POST({request, locals}){
    try {
        const {userName} = await request.json();

        if(!userName) {
            return json({ error: 'Invalid parameters' }, {status: 400});
        }

        const auth = requireAuth(locals, userName);
        if (auth.error) return auth.error;

        await updateTimestamp(userName);

        return json({ success: true });
    } catch (error) {
        console.error('Error updating timestamp:', error);
        return json({
            error: 'Failed to update timestamp',
            details: error.message
        }, {status: 500});
    }
}