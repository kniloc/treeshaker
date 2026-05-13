import {getUserData} from "$lib/server/userUtils.js";
import {getBoostSound, getProduceImages} from "$lib/server/imageUtils.js";
import {getTwitchId} from "$lib/server/twitchUtils.js";
import {produceData} from "$lib/server/produceData.js";

export async function load({locals}) {
    const session = locals.session;
    const twitchId = await getTwitchId(session.user.id);
    const currentUser = session.user.name.toLowerCase();
    let clonkData = {};
    const users = await getUserData(twitchId);
    const userData = users[0];
    const produceImageSet = await getProduceImages();
    const boostSoundUrl = await getBoostSound();

    const res = await fetch(`https://api.colonq.computer/api/user/${currentUser}`);

    if(res.ok) {
        const data = await res.text();

        if(data) {
            const boost = data.match(/:boost.*?(\d+)/);

            if(boost) {
                clonkData.boost = parseInt(boost[1], 10);
            } else {
                clonkData.boost = null;
            }
        }
    } else {
        console.error(`error: ${res.status}`);
    }

    return {
        clonkData,
        user: userData,
        images: produceImageSet.images,
        twitchId,
        produceData,
        boostSoundUrl
    }
}