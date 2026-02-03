export const produceData = [
    {name: "Apple", category: "Common Crops", min: 1, max: 10},
    {name: "Apricot", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Avocado", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Banana", category: "Market Favorites", min: 10, max: 20},
    {name: "Beetroot", category: "Exotic Treasures", min: 25, max: 50},
    {name: "BellPepper", category: "Market Favorites", min: 10, max: 20},
    {name: "Blackberry", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Blackcurrant", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Blueberry", category: "Market Favorites", min: 10, max: 20},
    {name: "Broccoli", category: "Market Favorites", min: 10, max: 20},
    {name: "Carrot", category: "Common Crops", min: 1, max: 10},
    {name: "Cauliflower", category: "Market Favorites", min: 10, max: 20},
    {name: "Celery", category: "Market Favorites", min: 10, max: 20},
    {name: "Cherry", category: "Market Favorites", min: 10, max: 20},
    {name: "Coconut", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Corn", category: "Common Crops", min: 1, max: 10},
    {name: "Cranberry", category: "Exotic Treasures", min: 25, max: 50},
    {name: "DragonFruit", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Fig", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Grapefruit", category: "Rare Delicacies", min: 45, max: 100},
    {name: "GreenCabbage", category: "Gourmet Selection", min: 15, max: 35},
    {name: "GreenGrape", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Guava", category: "Exotic Treasures", min: 25, max: 50},
    {name: "HotPepper", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Jackfruit", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Kiwi", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Kohlrabi", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Leek", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Lemon", category: "Common Crops", min: 1, max: 10},
    {name: "Lime", category: "Common Crops", min: 1, max: 10},
    {name: "Lychee", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Mandarin", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Mango", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Melon", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Mushroom", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Nectarine", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Olive", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Orange", category: "Common Crops", min: 1, max: 10},
    {name: "Papaya", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Parsnip", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Passionfruit", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Peach", category: "Market Favorites", min: 10, max: 20},
    {name: "Pear", category: "Market Favorites", min: 10, max: 20},
    {name: "Peas", category: "Common Crops", min: 1, max: 10},
    {name: "Pineapple", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Plum", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Pomegranate", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Potato", category: "Common Crops", min: 1, max: 10},
    {name: "Pumpkin", category: "Common Crops", min: 1, max: 10},
    {name: "PurpleGrape", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Quince", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Radish", category: "Common Crops", min: 1, max: 10},
    {name: "Raspberry", category: "Market Favorites", min: 10, max: 20},
    {name: "RedCabbage", category: "Gourmet Selection", min: 15, max: 35},
    {name: "RedGrape", category: "Rare Delicacies", min: 45, max: 100},
    {name: "RedOnion", category: "Market Favorites", min: 10, max: 20},
    {name: "Squash", category: "Exotic Treasures", min: 25, max: 50},
    {name: "Starfruit", category: "Rare Delicacies", min: 45, max: 100},
    {name: "Strawberry", category: "Common Crops", min: 1, max: 10},
    {name: "Tangerine", category: "Gourmet Selection", min: 15, max: 35},
    {name: "Tomato", category: "Common Crops", min: 1, max: 10},
    {name: "Turnip", category: "Common Crops", min: 1, max: 10},
    {name: "Watermelon", category: "Market Favorites", min: 10, max: 20},
    {name: "WhiteOnion", category: "Market Favorites", min: 10, max: 20},
    {name: "Yam", category: "Rare Delicacies", min: 45, max: 100}
];

const produceByName = new Map(produceData.map(p => [p.name, p]));

function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateEarnings(basketItems, clonkData) {
    let baseEarnings = 0;

    for (const itemName of basketItems) {
        const produce = produceByName.get(itemName);
        if (!produce) continue;
        baseEarnings += getRandomValue(produce.min, produce.max);
    }

    if (!clonkData?.boost) {
        return { baseEarnings, bonusEarnings: 0, total: baseEarnings };
    }

    const boost = clonkData.boost > 0
        ? clonkData.boost / 10
        : Math.abs(clonkData.boost) / 50;

    const copFishRatio = Math.max(0, Number(clonkData.copFishRatio || 0));
    const boostPlusRatio = boost + copFishRatio;
    const bonusEarnings = boostPlusRatio > 1 ? Math.round(baseEarnings / boostPlusRatio) : 0;

    return { baseEarnings, bonusEarnings, total: baseEarnings + bonusEarnings };
}

export function validateBasketItems(basketItems) {
    if (!Array.isArray(basketItems)) return false;
    return basketItems.every(name => typeof name === 'string' && produceByName.has(name));
}
