import { json } from "@sveltejs/kit";
import { dbPool } from "$lib/auth.js";
import { dev } from "$app/environment";

const COOLDOWN_MS = dev ? 60 * 1000 : 12 * 60 * 60 * 1000;

function calculatePurchasePrice(remainingCount) {
    const basePrice = 150;
    const targetMaxPrice = 20000;
    const minRemaining = 1;
    const maxRemaining = 30;
    const ratio = (remainingCount - minRemaining) / (maxRemaining - minRemaining);
    const maxPrice = basePrice + (targetMaxPrice - basePrice) / Math.pow(1 - 1 / (maxRemaining - minRemaining), 3);
    const price = basePrice + (maxPrice - basePrice) * Math.pow(1 - ratio, 3);
    return Math.ceil(price);
}

export async function POST({ request }) {
    try {
        const { userName } = await request.json();

        if (!userName) {
            return json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const userResult = await dbPool.query(
            "SELECT balance, last_purchased_fruit FROM user_game WHERE name = $1",
            [userName]
        );

        if (userResult.rows.length === 0) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        const { balance, last_purchased_fruit } = userResult.rows[0];

        if (last_purchased_fruit) {
            const lastPurchaseTime = new Date(last_purchased_fruit).getTime();
            const nextAvailableTime = lastPurchaseTime + COOLDOWN_MS;
            if (Date.now() < nextAvailableTime) {
                return json({ error: 'Still on cooldown' }, { status: 400 });
            }
        }

        const produceResult = await dbPool.query(
            "SELECT * FROM obtained_produce WHERE name = $1",
            [userName]
        );

        if (produceResult.rows.length === 0) {
            return json({ error: 'Produce data not found' }, { status: 404 });
        }

        const produceData = produceResult.rows[0];
        const remainingProduce = Object.keys(produceData)
            .filter(key => key !== 'name' && produceData[key] === 0);

        if (remainingProduce.length === 0) {
            return json({ error: 'No produce remaining to unlock' }, { status: 400 });
        }

        const price = calculatePurchasePrice(remainingProduce.length);

        if (balance < price) {
            return json({ error: 'Insufficient balance' }, { status: 400 });
        }

        const randomIndex = Math.floor(Math.random() * remainingProduce.length);
        const unlockedFruit = remainingProduce[randomIndex];

        await dbPool.query(
            `UPDATE user_game SET balance = balance - $1, last_purchased_fruit = NOW() WHERE name = $2`,
            [price, userName]
        );

        await dbPool.query(
            `UPDATE obtained_produce SET ${unlockedFruit} = 1 WHERE name = $1`,
            [userName]
        );

        return json({
            success: true,
            unlockedFruit,
            price,
            newBalance: balance - price
        });
    } catch (error) {
        console.error('Error purchasing fruit:', error);
        return json({
            error: 'Failed to purchase fruit',
            details: error.message
        }, { status: 500 });
    }
}
