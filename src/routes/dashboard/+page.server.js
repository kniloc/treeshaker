import {getProduceImages} from "$lib/server/imageUtils.js";
import {getObtainedProduceData, getUserBalance, getUserData} from "$lib/server/userUtils.js";

export async function load({locals}) {
    const session = locals.session;

    const produceImages = await getProduceImages();
    const username = session.user.name.toLowerCase();
    const obtainedProduceData = await getObtainedProduceData(username);
    const userData = await getUserData(username);

    return {
        images: produceImages.images,
        username,
        obtainedProduceData: obtainedProduceData[0],
        userBalance: userData[0].balance,
        lastPurchasedFruit: userData[0].last_purchased_fruit
    };
}