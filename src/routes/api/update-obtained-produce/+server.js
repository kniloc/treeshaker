import {json} from "@sveltejs/kit";
import {updateObtainedProduce} from "$lib/server/userUtils.js";
import {requireAuth, checkOrigin} from "$lib/server/authUtils.js";
import {BETTER_AUTH_URL} from "$env/static/private";

export async function POST({request, locals}){
    try {
        const csrfError = checkOrigin(request, BETTER_AUTH_URL);
        if (csrfError) return csrfError;

        const {produceData, twitchId} = await request.json();

        if(typeof produceData !== 'object' || !twitchId) {
            return json({ error: 'Invalid parameters' }, {status: 400});
        }

        const auth = await requireAuth(locals, twitchId);
        if (auth.error) return auth.error;

        await updateObtainedProduce(produceData, twitchId);

        return json({ success: true });
    } catch (error) {
        console.error('Error updating obtained produce:', error);
        return json({
            error: 'Failed to update obtained produce',
            details: error.message
        }, {status: 500});
    }
}