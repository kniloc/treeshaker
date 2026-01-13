import {dbPool} from "$lib/auth.js";

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

export async function getLeaderboardData() {
    const query = await dbPool.query("SELECT name, balance FROM user_game WHERE balance > 0 ORDER BY balance DESC LIMIT 5");
    return query.rows;
}

export async function updateNumberOfTurns(turns, username) {
    await dbPool.query("UPDATE user_game SET turns_left = $1 WHERE name = $2", [turns, username]);
}

export async function updateUserBalance(balance, username) {
    await dbPool.query("UPDATE user_game SET balance = $1 WHERE name = $2", [balance, username]);
}

export async function updateObtainedProduce(produceData, username) {
    const setValues = Object.entries(produceData).map(([field, value]) => `${field.toLowerCase()} = ${field.toLowerCase()} + ${value}`).join(", ");
    await dbPool.query(`UPDATE obtained_produce SET ${setValues} WHERE name = $1`, [username]);
}

export async function updateTimestamp(username) {
    await dbPool.query(`UPDATE user_game SET last_purchased_fruit = NOW() WHERE name = $1`, [username]);
}