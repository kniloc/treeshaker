<script>
    let {topFive = []} = $props();
</script>

<div class="leaderboard">
    <h2 class="cursor-default">Leaderboard</h2>
    <table>
        <thead>
            <tr>
                <th scope="col" class="header cursor-default">Username</th>
                <th scope="col" class="header cursor-default">Balance</th>
            </tr>
        </thead>
        <tbody>
            {#each topFive as {name, balance}, i}
                <tr class={i % 2 === 0 ? 'even' : 'odd'}>
                    <td><a href="/dashboard/{name}">{name}</a></td>
                    <td class="balance cursor-default">{balance}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .cursor-default {
        cursor: default;
    }

    .header {
        background-color: var(--color-rich-walnut);
    }

    .leaderboard {
        background-color: var(--color-pine-green);
        border-radius: 8px;
        padding: 10px;
    }

    a, a:visited {
        text-decoration: none;
        color: var(--color-white);
    }

    table {
        margin: 0 auto;
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 4px;
        text-align: left;
    }

    th, td {
        padding: 5px;
        font-size: 24px;
    }

    tr.even {
        background-color: rgb(255, 255, 255, 0.05);
    }

    tr.odd {
        background-color: rgb(255, 255, 255, 0.15);
    }
</style>