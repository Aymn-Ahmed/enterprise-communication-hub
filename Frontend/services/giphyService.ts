export interface StickerData {
    id: string;
    url: string;
    label: string;
}

const getApiKey = (): string => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GIPHY_API_KEY) {
            // @ts-ignore
            return import.meta.env.VITE_GIPHY_API_KEY;
        }

        if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GIPHY_KEY) {
            return process.env.REACT_APP_GIPHY_KEY;
        }
    } catch {
        // Ignore env access issues and fall back.
    }

    return '';
};

const GIPHY_API_KEY = getApiKey();
const GIPHY_API_URL = 'https://api.giphy.com/v1/stickers/trending';

export const fetchStickers = async (limit: number = 24): Promise<StickerData[]> => {
    if (!GIPHY_API_KEY) {
        throw new Error('Missing Giphy API key');
    }

    const response = await fetch(`${GIPHY_API_URL}?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`Giphy API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => ({
        id: item.id,
        url: item.images?.fixed_height_small?.url || '',
        label: item.title || 'Sticker'
    }));
};
