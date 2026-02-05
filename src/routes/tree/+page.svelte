<script>
    import { onMount, onDestroy, untrack } from "svelte";
    import Title from "$lib/components/Title.svelte";
    import Header from "$lib/components/Header.svelte";
    import Navigation from "$lib/components/Tree/Navigation.svelte";
    import Basket from "$lib/components/Tree/Basket.svelte";
    import { produceData } from "$lib/components/LocalData/data.js";
    import { shakeTree as shakeTreeApi, sellBasket, updateObtainedProduce, fetchUserData } from "$lib/clientUtils.js";
    import { createUserDataSubscription } from "$lib/subscriptionUtils.js";

    // Constants
    const DEV_MODE = import.meta.env.DEV;
    const COOLDOWN_DURATION_SECONDS = DEV_MODE ? 3 : 60;
    const BEE_COOLDOWN_DURATION_SECONDS = DEV_MODE ? 5 : 120;
    const SELLING_MESSAGE_DURATION_MS = 5000;
    const MINIMUM_ITEMS_TO_SELL = 5;

    const { data } = $props();

    // State management
    let isLoading = $state(true);
    let initialized = false;
    let user = $state({
        name: '',
        numberOfTurns: 0,
        balance: 0,
    });

    $effect(() => {
        if (!initialized && data.user) {
            untrack(() => {
                user.name = data.user.name ?? '';
                user.numberOfTurns = data.user.turns_left ?? 0;
                user.balance = data.user.balance ?? 0;
                initialized = true;
            });
        }
    });

    let gameState = $state({
        lastCaughtProduce: undefined,
        basket: [],
        basketCounts: {},
        cooldownTimer: null,
    });

    let uiState = $state({
        sellingLabelText: "",
        isButtonDisabled: false,
        showBasket: false,
        showNavigation: true,
        isSelling: false,
        shakeButtonText: "Shake the Tree",
    });

    // Derived values
    const basketValue = $derived({
        min: gameState.basket.reduce((sum, item) => sum + item.min, 0),
        max: gameState.basket.reduce((sum, item) => sum + item.max, 0),
    });

    const hasTurns = $derived(user.numberOfTurns > 0);
    const turnsLabel = $derived(user.numberOfTurns === 1 ? "turn" : "turns");
    const clonkData = $derived(data.clonkData);
    const canSellItems = $derived(gameState.basket.length >= MINIMUM_ITEMS_TO_SELL);
    const turnsAnnouncement = $derived(`${user.numberOfTurns} ${turnsLabel} remaining`);

    let userDataSubscription;
    let connectionError = $state(null);

    // Lifecycle
    onMount(async () => {
        const userName = data.user?.name;
        if (!userName) {
            isLoading = false;
            return;
        }

        const freshData = await fetchUserData(userName);
        if (freshData) {
            user.numberOfTurns = freshData.turns;
            user.balance = freshData.balance;
        }

        userDataSubscription = createUserDataSubscription(
            userName,
            (updatedData) => {
                user.numberOfTurns = updatedData.turns;
                user.balance = updatedData.balance;
            },
            (error) => {
                connectionError = error;
            }
        );
        userDataSubscription.start();
        isLoading = false;
    });

    onDestroy(() => {
        userDataSubscription?.stop();
        if (gameState.cooldownTimer) {
            clearInterval(gameState.cooldownTimer);
        }
    });

    // Utility functions
    function getProduceByName(name) {
        return produceData.find(p => p.name === name);
    }

    function getProduceImage(name) {
        return data.images.find(image => image.name === name);
    }

    function formatCountdownTime(ms) {
        const totalSeconds = Math.ceil(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    // Game logic
    function resetBasket() {
        gameState.basket = [];
        gameState.basketCounts = {};
    }

    function startCooldown(isBeeEncounter = false) {
        uiState.isButtonDisabled = true;
        uiState.showBasket = true;
        uiState.showNavigation = false;

        const cooldownDuration = isBeeEncounter ? BEE_COOLDOWN_DURATION_SECONDS : COOLDOWN_DURATION_SECONDS;
        const endTime = Date.now() + (cooldownDuration * 1000);

        gameState.cooldownTimer = setInterval(() => {
            const msRemaining = endTime - Date.now();
            if (msRemaining <= 0) {
                clearInterval(gameState.cooldownTimer);
                resetCooldown();
            } else {
                uiState.shakeButtonText = formatCountdownTime(msRemaining);
            }
        }, 50);
    }

    function resetCooldown() {
        uiState.isButtonDisabled = false;
        uiState.showBasket = false;
        uiState.showNavigation = true;
        uiState.shakeButtonText = "Shake the Tree";
    }

    // Event handlers
    async function handleShakeTree() {
        if (!hasTurns) return;

        uiState.isButtonDisabled = true;
        uiState.shakeButtonText = "Shaking...";

        const result = await shakeTreeApi(user.name);

        if (!result?.success) {
            uiState.isButtonDisabled = false;
            uiState.shakeButtonText = "Shake the Tree";
            return;
        }

        user.numberOfTurns = result.turns;

        if (result.isBee) {
            resetBasket();
            gameState.lastCaughtProduce = getProduceImage("Bee");
        } else {
            const produce = getProduceByName(result.produce);
            if (produce) {
                gameState.basket.push({
                    name: produce.name,
                    min: produce.min,
                    max: produce.max
                });
            }
            gameState.lastCaughtProduce = getProduceImage(result.produce);
        }

        startCooldown(result.isBee);
    }

    function handleCountsUpdate(counts) {
        gameState.basketCounts = counts;
    }

    async function sellItems() {
        uiState.isSelling = true;

        const [sellResult] = await Promise.all([
            sellBasket(user.name, clonkData),
            updateObtainedProduce(gameState.basketCounts, user.name)
        ]);

        if (sellResult) {
            user.balance = sellResult.balance;
            const { baseEarnings, bonusEarnings } = sellResult;

            uiState.sellingLabelText = bonusEarnings > 0
                ? `You made §${baseEarnings} plus an extra §${bonusEarnings}`
                : `You made §${baseEarnings}`;
        } else {
            uiState.sellingLabelText = "Failed to sell items";
        }

        resetBasket();

        setTimeout(() => {
            uiState.sellingLabelText = "";
            uiState.isSelling = false;
            uiState.showBasket = false;
        }, SELLING_MESSAGE_DURATION_MS);
    }
</script>

{#if connectionError}
    <div class="connection-error" role="alert">{connectionError}</div>
{/if}

{#if isLoading}
    <div class="loading" aria-live="polite">Loading...</div>
{:else}
    <Title text="the tree"/>
    {#if hasTurns}
        <Header text="Hi, {user.name}! You have {user.numberOfTurns} {turnsLabel} left."/>
    {:else}
        <Header text="You have no turns! Go redeem some more in chat." isLink={true}/>
    {/if}

    <main>
        <div class="sr-only" aria-live="polite">{turnsAnnouncement}</div>

        {#if uiState.showNavigation}
            <Navigation/>
        {/if}

        <div class="button-container" role="group" aria-label="Game actions">
            {#if hasTurns}
                <button
                    type="button"
                    class="shake-tree"
                    disabled={uiState.isButtonDisabled}
                    aria-disabled={uiState.isButtonDisabled}
                    aria-label="Shake the tree to collect produce"
                    onclick={handleShakeTree}
                >
                    {uiState.shakeButtonText}
                </button>
            {/if}

            {#if canSellItems}
                <button
                    type="button"
                    class="sell-items"
                    onclick={sellItems}
                    disabled={uiState.isSelling}
                    aria-disabled={uiState.isSelling}
                    aria-label="Sell collected items for {basketValue.min} to {basketValue.max} coins"
                >
                    {uiState.isSelling ? "Selling..." : `Sell Items (§${basketValue.min} - §${basketValue.max}) ${clonkData ? "*" : ""}`}
                </button>
            {/if}
        </div>

        {#if uiState.showBasket}
            <Basket
                caught={gameState.lastCaughtProduce}
                basket={gameState.basket}
                onCountsUpdate={handleCountsUpdate}
            />
        {/if}

        {#if uiState.isSelling}
            <h3 class="selling-label" aria-live="polite">{uiState.sellingLabelText}</h3>
        {/if}

        <img class="the-tree" src="/the-tree.png" alt="A fruit tree ready to be shaken"/>
    </main>
{/if}

<style>
    .shake-tree, .sell-items {
        display: block;
        cursor: pointer;
        border: none;
        color: var(--color-white);
        background-color: var(--color-golden-acorn);
        border-radius: 4px;
        margin: 0 auto;
        width: 200px;
        height: 40px;
        font-size: 20px;

        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        &:focus-visible {
            outline: 2px solid var(--color-deep-forest);
            outline-offset: 2px;
        }
    }

    .the-tree {
        position: absolute;
        top: 200px;
    }

    main {
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        font-size: 24px;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    /* Mobile styles */
    @media (max-width: 767px) {
        .button-container {
            display: block;
        }

        .sell-items {
            margin-top: 10px;
        }

        .the-tree {
            scale: 70%;
            top: 170px;
        }
    }

    /* Desktop styles */
    @media (min-width: 768px) {
        .button-container {
            display: flex;
            gap: 10px;
        }
    }

    .connection-error {
        background-color: #f44336;
        color: white;
        padding: 10px 20px;
        text-align: center;
        font-size: 14px;
    }
</style>
