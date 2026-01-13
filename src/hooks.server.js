import {auth} from "$lib/auth.js";
import {svelteKitHandler} from "better-auth/svelte-kit";

export async function handle({event, resolve}) {
    event.locals.session = await auth.api.getSession({
        headers: event.request.headers
    });

    return svelteKitHandler({event, resolve, auth});
}