import {json} from "@sveltejs/kit";
import {updateObtainedProduce} from "$lib/server/userUtils.js";
import {requireAuth} from "$lib/server/authUtils.js";

export async function POST({request, locals}){
    try {
        const {produceData, userName} = await request.json();

        if(typeof produceData !== 'object' || !userName) {
            return json({ error: 'Invalid parameters' }, {status: 400});
        }

        const auth = requireAuth(locals, userName);
        if (auth.error) return auth.error;

        await updateObtainedProduce(produceData, userName);

        return json({ success: true });
    } catch (error) {
        console.error('Error updating obtained produce:', error);
        return json({
            error: 'Failed to update obtained produce',
            details: error.message
        }, {status: 500});
    }
}