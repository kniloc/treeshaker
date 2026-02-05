import {dbPool} from "$lib/auth.js";
import {produceData} from "$lib/server/produceData.js";

const allowedColumnNames = produceData.map(item => item.name.toLowerCase());

export async function getObtainedProduceData(username) {
    const query = await dbPool.query("SELECT * FROM obtained_produce WHERE name = $1", [username]);
    return query.rows.map(({name, ...rest}) => rest);
}

export async function getUserBalance(username) {
    const query = await dbPool.query("SELECT balance FROM user_game WHERE name = $1", [username]);
    return query.rows;
}

export async function getUserData(username) {
    const query = await dbPool.query("SELECT * FROM user_game WHERE name = $1", [username]);
    return query.rows;
}

const LEADERBOARD_EXCLUDED_USERS = ['colinahscopy_'];

export async function getLeaderboardData() {
    const query = await dbPool.query(
        "SELECT name, balance FROM user_game WHERE balance > 0 AND name != ALL($1) ORDER BY balance DESC LIMIT 5",
        [LEADERBOARD_EXCLUDED_USERS]
    );
    return query.rows;
}

export async function decrementTurns(username) {
    const result = await dbPool.query(
        "UPDATE user_game SET turns_left = turns_left - 1 WHERE name = $1 AND turns_left > 0 RETURNING turns_left",
        [username]
    );
    return result.rows[0]?.turns_left ?? null;
}

export async function addToBalance(amount, username) {
    if (amount <= 0) return null;
    const result = await dbPool.query(
        "UPDATE user_game SET balance = balance + $1 WHERE name = $2 RETURNING balance",
        [amount, username]
    );
    return result.rows[0]?.balance ?? null;
}

export async function updateObtainedProduce(produceData, username) {
    const updates = [];

    for (const [field, count] of Object.entries(produceData)) {
        const column = field.toLowerCase();
        if (!allowedColumnNames.includes(column)) continue;
        if (!Number.isInteger(count) || count < 0 ) continue;

        updates.push(`${column} = ${column} + ${count}`)
    }

    if (updates.length === 0) return;
    await dbPool.query(`UPDATE obtained_produce SET ${updates.join(", ")} WHERE name = $1`, [username]);
}

export async function updateTimestamp(username) {
    await dbPool.query(`UPDATE user_game SET last_purchased_fruit = NOW() WHERE name = $1`, [username]);
}