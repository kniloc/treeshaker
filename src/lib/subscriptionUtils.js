import { fetchUserData } from '$lib/clientUtils.js'

const POLLING_INTERVAL_MS = 15000;

export function createUserDataSubscription(userName, callback) {
    let pollingInterval = null;

    const start = () => {
        if (pollingInterval) return;
        
        pollingInterval = setInterval(async () => {
            const data = await fetchUserData(userName);
            if (data) {
                callback({
                    turns: data.turns,
                    balance: data.balance,
                    lastPurchasedFruit: data.lastPurchasedFruit
                });
            }
        }, POLLING_INTERVAL_MS);
    }

    const stop = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }

    return { start, stop };
}
