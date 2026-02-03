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

function getOrCreateTree(username) {
    if (!userTrees.has(username)) {
        userTrees.set(username, shuffleArray([...treeDistribution]));
    }
    return userTrees.get(username);
}

function getOrCreateBasket(username) {
    if (!userBaskets.has(username)) {
        userBaskets.set(username, []);
    }
    return userBaskets.get(username);
}

export function shakeTree(username) {
    const tree = getOrCreateTree(username);
    const basket = getOrCreateBasket(username);

    const randInt = Math.floor(Math.random() * tree.length);
    const chosenCategory = tree[randInt];

    if (chosenCategory === "Bee") {
        resetUserState(username);
        return { isBee: true, produce: null, basket: [] };
    }

    const produceCategory = produceData.filter(p => p.category === chosenCategory);
    const randomProduce = produceCategory[Math.floor(Math.random() * produceCategory.length)];

    tree[randInt] = "Bee";
    basket.push(randomProduce.name);

    return { isBee: false, produce: randomProduce.name, basket: [...basket] };
}

export function getUserBasket(username) {
    return userBaskets.get(username) || [];
}

export function resetUserState(username) {
    userTrees.delete(username);
    userBaskets.delete(username);
}
