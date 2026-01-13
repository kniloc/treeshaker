<script>
    import { onMount, onDestroy } from "svelte";
    import Title from "$lib/components/Title.svelte";
    import Header from "$lib/components/Header.svelte";
    import Navigation from "$lib/components/Tree/Navigation.svelte";
    import Basket from "$lib/components/Tree/Basket.svelte";
    import { produceData, treeData } from "$lib/components/LocalData/data.js";
    import { updateBalance, updateNumberOfTurns, updateObtainedProduce } from "$lib/clientUtils.js";
    import { createUserDataPoller } from "$lib/pollingUtils.js";

    // Constants
    const COOLDOWN_DURATION_SECONDS = 60;
    const BEE_COOLDOWN_DURATION_SECONDS = 120;
    const SELLING_MESSAGE_DURATION_MS = 5000;
    const POLLING_INTERVAL_MS = 5000;
    const MINIMUM_ITEMS_TO_SELL = 5;
    const BEE_CATEGORY = "Bee";

    const { data } = $props();

    // State management - consolidated
    let user = $state({
        name: data.user?.name ?? '',
        numberOfTurns: data.user?.turns_left ?? 0,
        balance: data.user?.balance ?? 0,
    });

    let gameState = $state({
        lastCaughtProduce: undefined,
        basket: [],
        basketCounts: {},
        currentTree: shuffleArray(treeData),
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

    let userDataPoller;

    // Lifecycle
    onMount(() => {
        userDataPoller = createUserDataPoller(
            user.name,
            (updatedData) => {
                user.numberOfTurns = updatedData.turns;
                user.balance = updatedData.balance;
            },
            POLLING_INTERVAL_MS
        );
        userDataPoller.start();
    });

    onDestroy(() => {
        userDataPoller?.stop();
        if (gameState.cooldownTimer) {
            clearInterval(gameState.cooldownTimer);
        }
    });

    // Utility functions
    function shuffleArray(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    function getProduceImage(produce) {
        return data.images.find(image => image.name === produce.name);
    }

    function getRandomValue(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function formatCountdownTime(ms) {
        const totalSeconds = Math.ceil(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    // Game logic
    function selectProduceFromTree() {
        const randInt = Math.floor(Math.random() * gameState.currentTree.length);
        const chosenCategory = gameState.currentTree[randInt];

        if (chosenCategory === BEE_CATEGORY) {
            return { produce: { name: BEE_CATEGORY }, isBee: true };
        }

        const produceCategory = produceData.filter(p => p.category === chosenCategory);
        gameState.currentTree[randInt] = BEE_CATEGORY;
        const randomProduce = produceCategory[Math.floor(Math.random() * produceCategory.length)];

        return { produce: randomProduce, isBee: false };
    }

    function resetBasket() {
        gameState.basket = [];
        gameState.basketCounts = {};
        gameState.currentTree = shuffleArray(treeData);
    }

    function calculateEarnings() {
        const baseEarnings = gameState.basket.reduce((sum, item) => {
            return sum + getRandomValue(item.min, item.max);
        }, 0);

        if (!clonkData?.boost) {
            return { baseEarnings, bonusEarnings: 0 };
        }

        const boost = clonkData.boost > 0
            ? clonkData.boost / 10
            : Math.abs(clonkData.boost) / 50;

        const copFishRatio = Math.max(0, Number(clonkData.copFishRatio || 0));
        const boostPlusRatio = boost + copFishRatio;
        const bonusEarnings = boostPlusRatio > 1 ? Math.round(baseEarnings / boostPlusRatio) : 0;

        return { baseEarnings, bonusEarnings };
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
    function shakeTree(event) {
        if (!hasTurns) return;

        const { produce, isBee } = selectProduceFromTree();

        if (isBee) {
            resetBasket();
            console.log("WHOOPS YOU DIED LOL");
        } else {
            gameState.basket.push({
                name: produce.name,
                min: produce.min,
                max: produce.max
            });
            gameState.lastCaughtProduce = getProduceImage(produce);
        }

        user.numberOfTurns -= 1;
        updateNumberOfTurns(user.numberOfTurns, user.name);
        startCooldown(event.target, isBee);
    }

    function handleCountsUpdate(counts) {
        gameState.basketCounts = counts;
    }

    async function sellItems() {
        const { baseEarnings, bonusEarnings } = calculateEarnings();
        const totalEarnings = baseEarnings + bonusEarnings;

        user.balance += totalEarnings;

        uiState.sellingLabelText = bonusEarnings > 0
            ? `You made §${baseEarnings} plus an extra §${bonusEarnings}`
            : `You made §${baseEarnings}`;

        uiState.isSelling = true;

        // Update backend
        await Promise.all([
            updateBalance(user.balance, user.name),
            updateObtainedProduce(gameState.basketCounts, user.name)
        ]);

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
                    onclick={shakeTree}
            >
                Shake the Tree
            </button>
        {/if}

        {#if canSellItems}
            <button type="button" class="sell-items" onclick={sellItems}>
                Sell Items (§{basketValue.min} - §{basketValue.max}) {clonkData ? "*" : ""}
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