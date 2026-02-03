import { supabase } from '$lib/supabase.js'

export function createUserDataSubscription(userName, callback) {
    let channel = null;

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
            .subscribe();
    }

    const stop = () => {
        if (channel) {
            supabase.removeChannel(channel);
            channel = null;
        }
    }

    return { start, stop };
}