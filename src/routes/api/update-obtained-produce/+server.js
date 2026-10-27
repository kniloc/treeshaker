import { updateObtainedProduce } from "#lib/server/userUtils.js";
import { requireAuth, checkOrigin } from "#lib/server/authUtils.js";
import { BETTER_AUTH_URL } from '$app/env/private';

export async function POST({request, locals}){
    try {
        const csrfError = checkOrigin(request, BETTER_AUTH_URL);
        if (csrfError) return csrfError;

        const {produceData, twitchId} = await request.json();

        if(typeof produceData !== 'object' || !twitchId) {
            return Response.json({ error: 'Invalid parameters' }, {status: 400});
        }

        const auth = await requireAuth(locals, twitchId);
        if (auth.error) return auth.error;

        await updateObtainedProduce(produceData, twitchId);

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error updating obtained produce:', error);
        return Response.json({
            error: 'Failed to update obtained produce',
            details: error.message
        }, {status: 500});
    }
}
