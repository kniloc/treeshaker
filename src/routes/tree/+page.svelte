<script>
    import { onMount, onDestroy, untrack } from "svelte";
    import Title from "$lib/components/Title.svelte";
    import Header from "$lib/components/Header.svelte";
    import Navigation from "$lib/components/Tree/Navigation.svelte";
    import Basket from "$lib/components/Tree/Basket.svelte";
    import { produceData } from "$lib/components/LocalData/data.js";
    import { shakeTree as shakeTreeApi, sellBasket, updateObtainedProduce, fetchUserData } from "$lib/clientUtils.js";
    import { createUserDataSubscription } from "$lib/pollingUtils.js";

    // Constants
    const DEV_MODE = import.meta.env.DEV;
    const COOLDOWN_DURATION_SECONDS = DEV_MODE ? 3 : 60;
    const BEE_COOLDOWN_DURATION_SECONDS = DEV_MODE ? 5 : 120;
    const SELLING_MESSAGE_DURATION_MS = 5000;

    const MINIMUM_ITEMS_TO_SELL = 5;

    const { data } = $props();

    // State management - initialized once from props
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

    let userDataSubscription;

    // Lifecycle
    onMount(async () => {
        const userName = data.user?.name;
        if (!userName) return;

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
            }
        );
        userDataSubscription.start();
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

    function startCooldown(buttonElement, isBeeEncounter = false) {
        uiState.isButtonDisabled = true;
        uiState.showBasket = true;
        uiState.showNavigation = false;

        const cooldownDuration = isBeeEncounter ? BEE_COOLDOWN_DURATION_SECONDS : COOLDOWN_DURATION_SECONDS;
        const endTime = Date.now() + (cooldownDuration * 1000);

        gameState.cooldownTimer = setInterval(() => {
            const msRemaining = endTime - Date.now();
            if (msRemaining <= 0) {
                clearInterval(gameState.cooldownTimer);
                resetCooldown(buttonElement);
            } else {
                buttonElement.innerText = formatCountdownTime(msRemaining);
            }
        }, 50);
    }

    function resetCooldown(buttonElement) {
        uiState.isButtonDisabled = false;
        uiState.showBasket = false;
        uiState.showNavigation = true;
        buttonElement.innerText = "Shake the Tree";
    }

    // Event handlers
    async function handleShakeTree(event) {
        if (!hasTurns) return;

        uiState.isButtonDisabled = true;
        const buttonElement = event.target;
        buttonElement.innerText = "Shaking...";

        const result = await shakeTreeApi(user.name);

        if (!result?.success) {
            uiState.isButtonDisabled = false;
            buttonElement.innerText = "Shake the Tree";
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

        startCooldown(buttonElement, result.isBee);
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

<Title text="the tree"/>
{#if hasTurns}
    <Header text="Hi, {user.name}! You have {user.numberOfTurns} {turnsLabel} left."/>
{:else}
    <Header text="You have no turns! Go redeem some more in chat." isLink={true}/>
{/if}

<main>
    {#if uiState.showNavigation}
        <Navigation/>
    {/if}

    <div class="button-container">
        {#if hasTurns}
            <button
                    type="button"
                    class="shake-tree"
                    disabled={uiState.isButtonDisabled}
                    onclick={handleShakeTree}
            >
                Shake the Tree
            </button>
        {/if}

        {#if canSellItems}
            <button type="button" class="sell-items" onclick={sellItems} disabled={uiState.isSelling}>
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
        <h3 class="selling-label">{uiState.sellingLabelText}</h3>
    {/if}

    <img class="the-tree" src="/the-tree.png" alt="a tree"/>
</main>

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
</style>