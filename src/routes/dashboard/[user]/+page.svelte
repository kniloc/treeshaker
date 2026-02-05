<script>
    import Title from "$lib/components/Title.svelte";
    import ButtonStyledLink from "$lib/components/Home/ButtonStyledLink.svelte";
    import InfoContainer from "$lib/components/Dashboard/InfoContainer.svelte";
    import ProduceImages from "$lib/components/Dashboard/ProduceImages.svelte";

    const {data} = $props();
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
    <main aria-label="User dashboard for {name}">
        <InfoContainer name={name} balance={userBalance} numberOfProduce={numberOfProduce}/>
        <nav aria-label="Dashboard navigation">
            <ButtonStyledLink text="To the Tree!" link="/tree"/>
        </nav>
        <section aria-label="Collected produce">
            <ProduceImages images={produceImages} data={userData}/>
        </section>
    </main>
{/if}

<style>
    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        font-size: 24px;
    }
</style>