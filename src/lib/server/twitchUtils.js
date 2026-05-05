import { dbPool } from '$lib/auth.js';

export async function getTwitchId(betterAuthUserId) {
    const result = await dbPool.query(
        `SELECT "accountId" FROM account WHERE "userId" = $1 AND "providerId" = 'twitch' LIMIT 1`,
        [betterAuthUserId]
    );
    return result.rows[0]?.accountId ?? null;
}
