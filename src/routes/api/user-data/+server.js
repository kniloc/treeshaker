import { json } from "@sveltejs/kit";
import { getUserData } from "$lib/server/userUtils.js";

export async function POST({ request }) {
    try {
        const { userName } = await request.json();

        if (!userName) {
            return json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const users = await getUserData(userName);
        const userData = users.find(user => user.name === userName);

        if (!userData) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json({
            turns: userData.turns_left,
            balance: userData.balance
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return json({
            error: 'Failed to fetch user data',
            details: error.message
        }, { status: 500 });
    }
}
