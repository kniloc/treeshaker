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

export async function shakeTree(twitchId) {
    const result = await apiRequest('/api/shake-tree', { twitchId });
    if (!result.success) return null;
    return result.data;
}

export async function sellBasket(twitchId, clonkData) {
    const result = await apiRequest('/api/update-balance', { twitchId, clonkData });
    if (!result.success) return null;
    return result.data;
}

export async function updateObtainedProduce(produceData, twitchId) {
    const result = await apiRequest('/api/update-obtained-produce', { produceData, twitchId });
    if (!result.success) return null;
    return result.data;
}

export async function fetchUserData(twitchId) {
    const result = await apiRequest('/api/user-data', { twitchId });
    if (!result.success) return null;
    return result.data;
}

export async function purchaseFruit(twitchId) {
    const result = await apiRequest('/api/purchase-fruit', { twitchId });
    if (!result.success) return null;
    return result.data;
}
