<script>
    import Title from "$lib/components/Title.svelte";
    import Header from "$lib/components/Header.svelte";
    import LeaderBoard from "$lib/components/Home/LeaderBoard.svelte";
    import {authClient} from "$lib/auth-client.js";

    const {data} = $props();
    const leaderboardData = $derived(data.leaderboardData);

    async function signInWithTwitch() {
        await authClient.signIn.social({
            provider: "twitch",
            callbackURL: `/dashboard`,
        });
    }
</script>

<Title text="Welcome to Tree Shaker"/>
<Header text="Tree Shaker"/>
<main aria-label="Tree Shaker home page">
    <section aria-label="Leaderboard">
        <LeaderBoard topFive={leaderboardData}/>
    </section>
    <button
        class="sign-in"
        onclick={signInWithTwitch}
        aria-label="Sign in with your Twitch account"
    >
        Login with Twitch
    </button>
</main>

<style>
    main {
        max-width: 800px;
        margin: 0 auto;
    }
    .sign-in {
        display: block;
        background-color: var(--color-deep-forest);
        color: var(--color-white);
        border: none;
        border-radius: 4px;
        width: 250px;
        height: 40px;
        margin: 20px auto 0;
        padding: 4px 0;
        font-size: 20px;
        cursor: pointer;

        &:focus-visible {
            outline: 2px solid var(--color-golden-acorn);
            outline-offset: 2px;
        }
    }
</style>