export async function shakeTree(userName) {
    try {
        const response = await fetch('/api/shake-tree', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName })
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to shake tree:', error);
        throw error;
    }
}

export async function sellBasket(userName, clonkData) {
    try {
        const response = await fetch('/api/update-balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, clonkData })
        });

        if(!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to sell basket items:', error);
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

export async function fetchUserData(userName) {
    try {
        const response = await fetch('/api/user-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName })
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        return null;
    }
}

export async function purchaseFruit(userName) {
    try {
        const response = await fetch('/api/purchase-fruit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to purchase fruit:', error);
        throw error;
    }
}