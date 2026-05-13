import { dev } from "$app/environment";
import {produceData} from "$lib/server/produceData.js";
import {checkOrigin} from "$lib/server/authUtils.js";
import {BETTER_AUTH_URL} from "$env/static/private";
import {json} from "@sveltejs/kit";
import {dbPool} from "$lib/auth.js";
import {
    PURCHASE_COOLDOWN,
    PURCHASE_COOLDOWN_DEV,
    PURCHASE_BASE_PRICE,
    PURCHASE_MAX_PRICE,
    PURCHASE_MIN_REMAINING,
    PURCHASE_MAX_REMAINING,
} from "$lib/gameConfig.js";

const COOLDOWN = dev ? PURCHASE_COOLDOWN_DEV : PURCHASE_COOLDOWN;
const validProduceColumns = new Set(produceData.map(p => p.name.toLowerCase()));

function calculatePurchasePrice(remainingCount) {
    const ratio = (remainingCount - PURCHASE_MIN_REMAINING) / (PURCHASE_MAX_REMAINING - PURCHASE_MIN_REMAINING);
    const maxPrice = PURCHASE_BASE_PRICE + (PURCHASE_MAX_PRICE - PURCHASE_BASE_PRICE) / Math.pow(1 - 1 / (PURCHASE_MAX_REMAINING - PURCHASE_MIN_REMAINING), 3);
    const price = PURCHASE_BASE_PRICE + (maxPrice - PURCHASE_BASE_PRICE) * Math.pow(1 - ratio, 3);
    return Math.ceil(price);
}

export async function POST({ request }) {
    try {
        const csrfError = checkOrigin(request, BETTER_AUTH_URL);
        if (csrfError) return csrfError;

        const { twitchId } = await request.json();

        if (!twitchId) {
            return json({error: 'Invalid parameters'}, {status: 400});
        }

        const userResult = await dbPool.query(
            "select balance, last_purchased_fruit from user_game where user_id = $1",
            [twitchId]
        );

        if (userResult.rows.length === 0) {
            return json({error: 'User not found'}, {status: 404});
        }

        const {balance, last_purchased_fruit: last_purchased_fruit} = userResult.rows[0];

        if (last_purchased_fruit) {
            const lastPurchaseTime = new Date(last_purchased_fruit).getTime();
            const nextAvailableTime = lastPurchaseTime + COOLDOWN;
            if (Date.now() < nextAvailableTime) {
                return json({ error: 'Still on cooldown' }, { status: 400 });
            }
        }

        const produceResult = await dbPool.query(
            "SELECT * FROM obtained_produce WHERE user_id = $1",
            [twitchId]
        );

        if (produceResult.rows.length === 0) {
            return json({ error: 'Produce data not found' }, { status: 404 });
        }

        const produceRow = produceResult.rows[0];
        const remainingProduce = Object.keys(produceRow)
            .filter(key => key !== 'user_id' && produceRow[key] === 0);

        if (remainingProduce.length === 0) {
            return json({ error: 'No produce remaining to unlock' }, { status: 400 });
        }

        const price = calculatePurchasePrice(remainingProduce.length);

        if (balance < price) {
            return json({ error: 'Insufficient balance' }, { status: 400 });
        }

        const randomIndex = Math.floor(Math.random() * remainingProduce.length);
        const unlockedFruit = remainingProduce[randomIndex];

        if (!validProduceColumns.has(unlockedFruit)) {
            return json({ error: 'Invalid produce selection' }, { status: 500 });
        }

        await dbPool.query(
            `UPDATE user_game SET balance = balance - $1, last_purchased_fruit = NOW() WHERE user_id = $2`,
            [price, twitchId]
        );

        await dbPool.query(
            `UPDATE obtained_produce SET ${unlockedFruit} = 1 WHERE user_id = $1`,
            [twitchId]
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
        }, {status: 500});
    }
}