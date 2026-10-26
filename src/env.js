import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	BETTER_AUTH_URL: { static: true },
	AUTH_TWITCH_ID: { static: true },
	AUTH_TWITCH_SECRET: { static: true },
	X_POSTGRES_URL: { static: true },
	BLOB_READ_WRITE_TOKEN: { static: true }
});
