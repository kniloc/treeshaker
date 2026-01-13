import {getProduceImages} from "$lib/server/imageUtils.js";
import {getObtainedProduceData, getUserBalance} from "$lib/server/userUtils.js";

export async function load({params}) {
    const produceImages = await getProduceImages();
    const username = params.user;
    const obtainedProduceData = await getObtainedProduceData(username);
    const userBalance = await getUserBalance(username);

    return {
        images: produceImages.images,
        username,
        obtainedProduceData: obtainedProduceData[0],
        userBalance: userBalance[0].balance
    };
}