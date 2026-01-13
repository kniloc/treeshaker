<script>
    import {updateObtainedProduce, updateTimestamp} from "$lib/clientUtils.js";
    const {data} = $props();
    const name = $derived(data.username);
    const produceData = $derived(data.obtainedProduceData);
    const userBalance = $derived(data.userBalance);
    const remainingProduce = $derived(Object.keys(produceData).filter(key => produceData[key] === 0));
    const isButtonDisabled = $derived(!hasEnoughBalance());

    function calculatePurchasePrice() {
        const basePrice = 150;
        const targetMaxPrice = 20000;
        const minRemaining = 1;  // Price maxes at 20k
        const maxRemaining = 30; // Feature unlocks; price is 150
        const ratio = (remainingProduce.length - minRemaining) / (maxRemaining - minRemaining);
        const maxPrice = basePrice + (targetMaxPrice - basePrice) / Math.pow(1 - 1 / (maxRemaining - minRemaining), 3);

        const price = basePrice + (maxPrice - basePrice) * Math.pow(1 - ratio, 3);

        return Math.ceil(price);
    }

    function hasEnoughBalance() {
        const price = calculatePurchasePrice();
        return userBalance >= price;
    }

    //TODO: add polling to update user data after purchase.

    function purchaseRandomFruit() {
        const randomIndex = Math.floor(Math.random() * remainingProduce.length);

        const payload = {[remainingProduce[randomIndex]]: 1};
        updateTimestamp(name);

        //updateObtainedProduce(payload, name);
    }
</script>

<button type="button" class="purchase-button" onclick={purchaseRandomFruit}>Purchase Fruit (§{calculatePurchasePrice()})</button>

<style>
    .purchase-button {
        display: block;
        text-decoration: none;
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

        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }
    }
</style>