import {getLeaderboardData} from "$lib/server/userUtils.js";

export async function load() {
    const leaderboardData = await getLeaderboardData();

    return {
        leaderboardData
    };
}