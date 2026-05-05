import { produceData } from "./produceData.js";

const treeDistribution = [
    ...Array(39).fill("Common Crops"),
    ...Array(24).fill("Market Favorites"),
    ...Array(16).fill("Gourmet Selection"),
    ...Array(10).fill("Exotic Treasures"),
    ...Array(6).fill("Rare Delicacies"),
    ...Array(5).fill("Bee")
];

const userTrees = new Map();
const userBaskets = new Map();

function shuffleArray(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function getOrCreateTree(twitchId) {
    if (!userTrees.has(twitchId)) {
        userTrees.set(twitchId, shuffleArray([...treeDistribution]));
    }
    return userTrees.get(twitchId);
}

function getOrCreateBasket(twitchId) {
    if (!userBaskets.has(twitchId)) {
        userBaskets.set(twitchId, []);
    }
    return userBaskets.get(twitchId);
}

export function shakeTree(twitchId) {
    const tree = getOrCreateTree(twitchId);
    const basket = getOrCreateBasket(twitchId);

    const randInt = Math.floor(Math.random() * tree.length);
    const chosenCategory = tree[randInt];

    if (chosenCategory === "Bee") {
        resetUserState(twitchId);
        return { isBee: true, produce: null, basket: [] };
    }

    const produceCategory = produceData.filter(p => p.category === chosenCategory);
    const randomProduce = produceCategory[Math.floor(Math.random() * produceCategory.length)];

    tree[randInt] = "Bee";
    basket.push(randomProduce.name);

    return { isBee: false, produce: randomProduce.name, basket: [...basket] };
}

export function getUserBasket(twitchId) {
    return userBaskets.get(twitchId) || [];
}

export function resetUserState(twitchId) {
    userTrees.delete(twitchId);
    userBaskets.delete(twitchId);
}
