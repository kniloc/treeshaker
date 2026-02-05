async function apiRequest(url, body) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Server error' };
        }

        return { success: true, data };
    } catch (error) {
        console.error(`API request failed: ${url}`, error);
        return { success: false, error: 'Network error' };
    }
}

export async function shakeTree(userName) {
    const result = await apiRequest('/api/shake-tree', { userName });
    if (!result.success) return null;
    return result.data;
}

export async function sellBasket(userName, clonkData) {
    const result = await apiRequest('/api/update-balance', { userName, clonkData });
    if (!result.success) return null;
    return result.data;
}

export async function updateObtainedProduce(produceData, userName) {
    const result = await apiRequest('/api/update-obtained-produce', { produceData, userName });
    if (!result.success) return null;
    return result.data;
}

export async function fetchUserData(userName) {
    const result = await apiRequest('/api/user-data', { userName });
    if (!result.success) return null;
    return result.data;
}

export async function purchaseFruit(userName) {
    const result = await apiRequest('/api/purchase-fruit', { userName });
    if (!result.success) return null;
    return result.data;
}
