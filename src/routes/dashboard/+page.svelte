<script>
    import Title from "$lib/components/Title.svelte";
    import ButtonStyledLink from "$lib/components/Home/ButtonStyledLink.svelte";
    import InfoContainer from "$lib/components/Dashboard/InfoContainer.svelte";
    import ProduceImages from "$lib/components/Dashboard/ProduceImages.svelte";
    import PurchaseFruitButton from "$lib/components/Dashboard/PurchaseFruitButton.svelte";

    let {data} = $props();
    const produceImages = $derived(data.images.filter(image => image.name !== "Bee"));
    const name = $derived(data.username);
    const userData = $derived(data.obtainedProduceData);
    const userBalance = $derived(data.userBalance);
    const numberOfProduce = $derived(Object.values(userData).filter(value => value !== 0).length);
    const isLoading = $derived(!data.username);
</script>

{#if isLoading}
    <div class="loading" aria-live="polite">Loading dashboard...</div>
{:else}
    <Title text={name}/>
    <main aria-label="User dashboard">
        <InfoContainer name={name} balance={userBalance} numberOfProduce={numberOfProduce}/>
        <nav class="dashboard-buttons" aria-label="Dashboard navigation">
            <ButtonStyledLink text="To the Tree!" link="/tree"/>
            {#if numberOfProduce >= 35}
                <PurchaseFruitButton data={data}/>
            {/if}
        </nav>
        <section aria-label="Collected produce">
            <ProduceImages images={produceImages} data={userData}/>
        </section>
    </main>
{/if}

<style>
    main {
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    .dashboard-buttons {
        display: flex;
        gap: 10px;
    }

    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        font-size: 24px;
    }
</style>