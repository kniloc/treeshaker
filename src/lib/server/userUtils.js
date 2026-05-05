import {dbPool} from "$lib/auth.js";
import {produceData} from "$lib/server/produceData.js";

const allowedColumnNames = produceData.map(item => item.name.toLowerCase());

export async function getObtainedProduceData(twitchId) {
    const query = await dbPool.query("SELECT * FROM obtained_produce WHERE user_id = $1", [twitchId]);
    return query.rows.map(({user_id, ...rest}) => rest);
}

export async function getUserBalance(twitchId) {
    const query = await dbPool.query("SELECT balance FROM user_game WHERE user_id = $1", [twitchId]);
    return query.rows;
}

export async function getUserData(twitchId) {
    const query = await dbPool.query("SELECT * FROM user_game WHERE user_id = $1", [twitchId]);
    return query.rows;
}

const LEADERBOARD_EXCLUDED_IDS = ['82185701'];

export async function getLeaderboardData() {
    const query = await dbPool.query(`
        SELECT ug.user_id, ug.balance, u.name
        FROM user_game ug
                 JOIN "user" u ON u.id = (
            SELECT "userId" FROM account
             WHERE "accountId" = ug.user_id AND "providerId" = 'twitch'
            LIMIT 1
            )
        WHERE ug.balance > 0 AND ug.user_id != ALL($1)
        ORDER BY ug.balance DESC LIMIT 5
    `, [LEADERBOARD_EXCLUDED_IDS]);
    return query.rows;
}

export async function decrementTurns(twitchId) {
    const result = await dbPool.query(
        "UPDATE user_game SET turns_left = turns_left - 1 WHERE user_id = $1 AND turns_left > 0 RETURNING turns_left",
        [twitchId]
    );
    return result.rows[0]?.turns_left ?? null;
}

export async function addToBalance(amount, twitchId) {
    if (amount <= 0) return null;
    const result = await dbPool.query(
        "UPDATE user_game SET balance = balance + $1 WHERE user_id = $2 RETURNING balance",
        [amount, twitchId]
    );
    return result.rows[0]?.balance ?? null;
}

export async function updateObtainedProduce(produceData, twitchId) {
    const updates = [];

    for (const [field, count] of Object.entries(produceData)) {
        const column = field.toLowerCase();
        if (!allowedColumnNames.includes(column)) continue;
        if (!Number.isInteger(count) || count < 0 ) continue;

        updates.push(`${column} = ${column} + ${count}`)
    }

    if (updates.length === 0) return;
    await dbPool.query(`UPDATE obtained_produce SET ${updates.join(", ")} WHERE user_id = $1`, [twitchId]);
}

export async function updateTimestamp(twitchId) {
    await dbPool.query(`UPDATE user_game SET last_purchased_fruit = NOW() WHERE user_id = $1`, [twitchId]);
}