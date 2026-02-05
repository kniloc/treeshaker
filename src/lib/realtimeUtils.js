import { supabase } from '$lib/supabase.js'
import { fetchUserData } from '$lib/clientUtils.js'

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;
const POLLING_INTERVAL_MS = 15000;

export function createUserDataSubscription(userName, callback) {
    let channel = null;
    let reconnectAttempts = 0;
    let reconnectTimeout = null;
    let pollingInterval = null;
    let usePolling = false;

    const startPolling = () => {
        if (pollingInterval) return;
        console.log('Falling back to polling for updates');
        usePolling = true;
        
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

    const start = () => {
        channel = supabase
            .channel(`user_game_${userName}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_game',
                    filter: `name=eq.${userName}`
                },
                (payload) => {
                    const data = payload.new;
                    callback({
                        turns: data.turns_left,
                        balance: data.balance,
                        lastPurchasedFruit: data.last_purchased_fruit
                    });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    reconnectAttempts = 0;
                    if (pollingInterval) {
                        clearInterval(pollingInterval);
                        pollingInterval = null;
                        usePolling = false;
                    }
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                    handleReconnect();
                }
            });
    }

    const handleReconnect = () => {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            startPolling();
            return;
        }

        reconnectAttempts++;
        
        reconnectTimeout = setTimeout(() => {
            stop();
            start();
        }, RECONNECT_DELAY_MS);
    }

    const stop = () => {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        if (channel) {
            supabase.removeChannel(channel);
            channel = null;
        }
    }

    return { start, stop };
}
