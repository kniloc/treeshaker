<script>
    import {authClient} from "$lib/auth-client.js";
    import {goto} from "$app/navigation";

    async function signOut() {
        try {
            await authClient.signOut();
            await goto('/', {replaceState: true});
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    }
</script>

<span class="navigation">
    <a href="/dashboard">Dashboard</a> | <button class="sign-out" onclick={signOut}>Sign Out</button>
</span>

<style>
    a, a:visited {
        color: var(--color-white);
        padding-right: 4px;
        font-size: 20px;
    }

    .navigation {
        margin-bottom: 10px;
    }

    .sign-out {
        cursor: pointer;
        text-decoration: underline;
        color: var(--color-white);
        background: none;
        border: none;
        font-size: 20px;
    }
</style>