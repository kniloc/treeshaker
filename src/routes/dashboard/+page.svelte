<script>
    import Title from "$lib/components/Title.svelte";
    import ButtonStyledLink from "$lib/components/Home/ButtonStyledLink.svelte";
    import InfoContainer from "$lib/components/Dashboard/InfoContainer.svelte";
    import ProduceImages from "$lib/components/Dashboard/ProduceImages.svelte";
    import PurchaseFruitButton from "$lib/components/Dashboard/PurchaseFruitButton.svelte";

    const {data} = $props();
    const produceImages = data.images.filter(image => image.name !== "Bee");
    const name = data.username;
    const userData = data.obtainedProduceData;
    const userBalance = data.userBalance;
    const numberOfProduce = Object.values(userData).filter(value => value !== 0).length;
</script>

<Title text={name}/>
<main>
    <InfoContainer name={name} balance={userBalance} numberOfProduce={numberOfProduce}/>
    <div class="dashboard-buttons">
        <ButtonStyledLink text="To the Tree!" link="/tree"/>
        {#if numberOfProduce >= 35 && name === "colinahscopy_"}
            <PurchaseFruitButton data={data}/>
        {/if}
    </div>
    <ProduceImages images={produceImages} data={userData}/>
</main>

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
</style>