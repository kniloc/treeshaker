import {betterAuth} from "better-auth";
import {Pool} from "pg";
import {AUTH_TWITCH_ID, AUTH_TWITCH_SECRET, BETTER_AUTH_URL, X_POSTGRES_URL} from "$env/static/private";

export const dbPool = new Pool({
    connectionString: X_POSTGRES_URL
});

export const auth = betterAuth({
    baseURL: BETTER_AUTH_URL,
    database: dbPool,
    socialProviders: {
        twitch: {
            clientId: AUTH_TWITCH_ID,
            clientSecret: AUTH_TWITCH_SECRET
        }
    },
    account: {
        accountLinking: {
            enabled: true
        }
    },
    databaseHooks: {
        account: {
            create: {
                after: async (account) => {
                    if (account.providerId !== 'twitch') return;
                    const twitchId = account.accountId;
                    try {
                        const userResult = await dbPool.query(
                            `SELECT name FROM "user" WHERE id = $1`,
                            [account.userId]
                        );
                        const name = userResult.rows[0]?.name?.toLowerCase() ?? null;
                        await dbPool.query(
                            "INSERT INTO obtained_produce (user_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                            [twitchId, name]
                        );
                        await dbPool.query(
                            "INSERT INTO user_game (user_id, name, turns_left, balance) VALUES ($1, $2, 10, 0) ON CONFLICT DO NOTHING",
                            [twitchId, name]
                        );
                    } catch (err) {
                        console.error('[auth] failed to create game rows for twitchId', twitchId, err);
                    }
                }
            }
        }
    }
});