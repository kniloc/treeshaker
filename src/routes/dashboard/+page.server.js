import {getProduceImages} from "$lib/server/imageUtils.js";
import {getObtainedProduceData, getUserData} from "$lib/server/userUtils.js";
import {getTwitchId} from "$lib/server/twitchUtils.js";

export async function load({locals}) {
    const session = locals.session;

    const produceImages = await getProduceImages();
    const twitchId = await getTwitchId(session.user.id);
    const obtainedProduceData = await getObtainedProduceData(twitchId);
    const userData = await getUserData(twitchId);

    return {
        images: produceImages.images,
        username: session.user.name.toLowerCase(),
        twitchId,
        obtainedProduceData: obtainedProduceData[0],
        userBalance: userData[0].balance,
        lastPurchasedFruit: userData[0].last_purchased_fruit
    };
}