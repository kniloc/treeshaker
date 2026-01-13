<script>
    const {text, isLink = false} = $props();
</script>

<header>
    {#if isLink}
        <a href="https://twitch.tv/colinahscopy_"><h1 class="header-text">{text}</h1></a>
    {:else}
        <h1 class="header-text">{text}</h1>
    {/if}
</header>

<style>
    .header-text {
        font-size: 35px;
        font-weight: normal;
    }

    header {
        cursor: default;
        text-align: center;
    }

    a, a:visited {
        color: var(--color-white);
    }
</style>