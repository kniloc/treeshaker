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
                    const twitchId = account.accountId;
                    await dbPool.query("INSERT INTO obtained_produce (user_id) VALUES ($1) ON CONFLICT DO NOTHING", [twitchId]);
                    await dbPool.query(
                        "INSERT INTO user_game (user_id, turns_left, balance) VALUES ($1, 10, 0) ON CONFLICT DO NOTHING",
                        [twitchId]
                    );
                }
            }
        }
    }
});