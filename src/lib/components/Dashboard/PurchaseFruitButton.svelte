<script>
    import {onMount, onDestroy} from "svelte";
    import { purchaseFruit } from "$lib/clientUtils.js";
    import {invalidateAll} from "$app/navigation";
    import {
        PURCHASE_COOLDOWN,
        PURCHASE_COOLDOWN_DEV,
        PURCHASE_BASE_PRICE,
        PURCHASE_MAX_PRICE,
        PURCHASE_MIN_REMAINING,
        PURCHASE_MAX_REMAINING,
    } from "$lib/gameConfig.js";

    const DEV_MODE = import.meta.env.DEV;
    const COOLDOWN_MS = DEV_MODE ? PURCHASE_COOLDOWN_DEV : PURCHASE_COOLDOWN;

    let {data} = $props();
    const twitchId = $derived(data.twitchId);
    const produceData = $derived(data.obtainedProduceData);
    const userBalance = $derived(data.userBalance);
    const lastPurchasedFruit = $derived(data.lastPurchasedFruit);
    const remainingProduce = $derived(Object.keys(produceData).filter(key => produceData[key] === 0));

    let isPurchasing = $state(false);
    let now = $state(Date.now());
    let timerInterval = null;

    const timeUntilNextPurchase = $derived(getTimeUntilNextPurchase());
    const isOnCooldown = $derived(timeUntilNextPurchase > 0);
    const isButtonDisabled = $derived(!hasEnoughBalance() || remainingProduce.length === 0 || isOnCooldown);

    onMount(() => {
        timerInterval = setInterval(() => {
            now = Date.now();
        }, 1000);
    });

    onDestroy(() => {
        if (timerInterval) clearInterval(timerInterval);
    });

    function getTimeUntilNextPurchase() {
        if (!lastPurchasedFruit) return 0;
        const lastPurchaseTime = new Date(lastPurchasedFruit).getTime();
        const nextAvailableTime = lastPurchaseTime + COOLDOWN_MS;
        return Math.max(0, nextAvailableTime - now);
    }

    function formatTimeRemaining(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    function calculatePurchasePrice() {
        const ratio = (remainingProduce.length - PURCHASE_MIN_REMAINING) / (PURCHASE_MAX_REMAINING - PURCHASE_MIN_REMAINING);
        const maxPrice = PURCHASE_BASE_PRICE + (PURCHASE_MAX_PRICE - PURCHASE_BASE_PRICE) / Math.pow(1 - 1 / (PURCHASE_MAX_REMAINING - PURCHASE_MIN_REMAINING), 3);
        const price = PURCHASE_BASE_PRICE + (maxPrice - PURCHASE_BASE_PRICE) * Math.pow(1 - ratio, 3);
        return Math.ceil(price);
    }

    function hasEnoughBalance() {
        const price = calculatePurchasePrice();
        return userBalance >= price;
    }

    async function purchaseRandomFruit() {
        if (isPurchasing || remainingProduce.length === 0 || isOnCooldown) return;

        isPurchasing = true;
        try {
            const result = await purchaseFruit(twitchId);
            if (result?.success) {
                await invalidateAll();
            }
        } finally {
            isPurchasing = false;
        }
    }

    function getButtonText() {
        if (isPurchasing) return "Purchasing...";
        if (isOnCooldown) return `Available in ${formatTimeRemaining(timeUntilNextPurchase)}`;
        return `Purchase Fruit (§${calculatePurchasePrice()})`;
    }
</script>

<button type="button" class="purchase-button" onclick={purchaseRandomFruit} disabled={isButtonDisabled || isPurchasing}>
    {getButtonText()}
</button>

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