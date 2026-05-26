import type { HubModuleAdapters, HubStorageAdapter, HubUserShape } from './types';

const browserStorage: HubStorageAdapter = {
    getItem: (key) => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
    removeItem: (key) => window.localStorage.removeItem(key)
};

let adapters: HubModuleAdapters = {
    storage: browserStorage
};

export const configureCommunicationHub = (nextAdapters: HubModuleAdapters) => {
    adapters = {
        ...adapters,
        ...nextAdapters,
        storage: nextAdapters.storage ?? adapters.storage ?? browserStorage
    };
};

export const getCommunicationHubAdapters = (): HubModuleAdapters => adapters;

export const getHubStorage = (): HubStorageAdapter => adapters.storage ?? browserStorage;

export const getStoredSmartdashUser = (): HubUserShape | null => {
    try {
        const raw = getHubStorage().getItem('smartdash_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setStoredSmartdashUser = (user: HubUserShape) => {
    getHubStorage().setItem('smartdash_user', JSON.stringify(user));
};
