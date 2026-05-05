import {getProduceImages} from "$lib/server/imageUtils.js";
import {getObtainedProduceData, getUserBalance} from "$lib/server/userUtils.js";
import {dbPool} from "$lib/auth.js";
import {error} from "@sveltejs/kit";

export async function load({params}) {
    const produceImages = await getProduceImages();
    const username = params.user;

    const userResult = await dbPool.query(
        `SELECT a."accountId"
         FROM "user" u
         JOIN account a ON a."userId" = u.id AND a."providerId" = 'twitch'
         WHERE LOWER(u.name) = $1`,
        [username.toLowerCase()]
    );

    const twitchId = userResult.rows[0]?.accountId;
    if (!twitchId) error(404, 'User not found');

    const obtainedProduceData = await getObtainedProduceData(twitchId);
    const userBalance = await getUserBalance(twitchId);

    return {
        images: produceImages.images,
        username,
        obtainedProduceData: obtainedProduceData[0],
        userBalance: userBalance[0].balance
    };
}