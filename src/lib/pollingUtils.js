import { supabase } from '$lib/supabase.js'

export async function getCurrentUserData(userName) {
    try {
        const { data, error } = await supabase
            .from('user_game')
            .select('turns_left, balance, last_purchased_fruit')
            .eq('name', userName)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return null;
        }

        return data
    } catch (error) {
        console.error('Failed to get user data:', error);
        return null;
    }
}

export function createUserDataPoller(userName, callback, intervalMs = 5000) {
    let pollInterval = null;
    let isPageVisible = true;
    let lastTurns = null;
    let lastBalance = null;
    let lastTimeStamp = null;

    const checkForUpdates = async () => {
        const data = await getCurrentUserData(userName);

        if (data) {
            // Only call callback if data has changed
            if (data.turns_left !== lastTurns || data.balance !== lastBalance || data.last_purchased_fruit !== lastTimeStamp) {
                lastTurns = data.turns_left;
                lastBalance = data.balance;
                lastTimeStamp = data.last_purchased_fruit

                callback({
                    turns: data.turns_left,
                    balance: data.balance,
                    lastPurchasedFruit: data.last_purchased_fruit
                });
            }
        }
    }

    const handleVisibilityChange = () => {
        isPageVisible = !document.hidden;

        if (isPageVisible) {
            checkForUpdates();

            if (!pollInterval) {
                pollInterval = setInterval(checkForUpdates, intervalMs);
            }
        } else {
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        }
    }

    const start = () => {
        checkForUpdates();

        pollInterval = setInterval(checkForUpdates, intervalMs);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', checkForUpdates);
    }

    const stop = () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }

        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', checkForUpdates);
    }

    return { start, stop };
}