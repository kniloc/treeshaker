<script>
    let {name, balance, numberOfProduce} = $props();
</script>

<div class="info-container">
    <h2>{name}'s profile</h2>
    <h3>Balance: §{balance}</h3>
    <h3>Produce obtained: {numberOfProduce}/65</h3>
</div>

<style>
    .info-container {
        text-align: center;
        cursor: default;
    }
</style>