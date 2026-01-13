export async function updateNumberOfTurns(numberOfTurns, userName) {
    try {
        const response = await fetch('/api/update-turns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({numberOfTurns, userName})
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to update number of turns:', error);
        throw error;
    }
}

export async function updateBalance(balance, userName) {
    try {
        const response = await fetch('/api/update-balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({balance, userName})
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to update balance:', error);
        throw error;
    }
}

export async function updateObtainedProduce(produceData, userName) {
    try {
        const response = await fetch('/api/update-obtained-produce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({produceData, userName})
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to update obtained produce:', error);
        throw error;
    }
}

export async function updateTimestamp(userName) {
    try {
        const response = await fetch('/api/update-timestamp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({userName})
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
        }
    } catch (error) {
        console.error('Failed to update timestamp:', error);
        throw error;
    }
}