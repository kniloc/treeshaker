import { supabase } from '$lib/supabase.js'

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 2000;

export function createUserDataSubscription(userName, callback, onError) {
    let channel = null;
    let reconnectAttempts = 0;
    let reconnectTimeout = null;

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
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error(`Realtime subscription error: ${status}`);
                    handleReconnect();
                } else if (status === 'CLOSED') {
                    handleReconnect();
                }
            });
    }

    const handleReconnect = () => {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnection attempts reached');
            onError?.('Connection lost. Please refresh the page.');
            return;
        }

        reconnectAttempts++;
        console.log(`Reconnecting... attempt ${reconnectAttempts}`);
        
        reconnectTimeout = setTimeout(() => {
            stop();
            start();
        }, RECONNECT_DELAY_MS * reconnectAttempts);
    }

    const stop = () => {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        if (channel) {
            supabase.removeChannel(channel);
            channel = null;
        }
    }

    return { start, stop };
}
