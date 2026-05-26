import { configureCommunicationHub } from './index';
import type { HubApiClient, HubStorageAdapter } from './index';

/**
 * Integration template for host applications.
 *
 * Usage:
 * 1) Copy this file into your host app (or keep it here and edit imports).
 * 2) Replace placeholder imports (api client, auth hook, signalR hook).
 * 3) Call setupCommunicationHubIntegration() once at app startup.
 */

// TODO: Replace these imports from your host project:
// import api from '../lib/api';
// import { useAuth } from '../context/AuthContext';
// import { useSignalR } from '../hooks/useSignalR';
const fallbackApiClient: HubApiClient = {
    // أضفنا "as any" لكسر صرامة النوع في حالة الخطأ فقط
    get: async <T>() => ({ data: null as any, status: 501 }),
    post: async <T>() => ({ data: null as any, status: 501 }),
    put: async <T>() => ({ data: null as any, status: 501 }),
    delete: async <T>() => ({ data: null as any, status: 501 })
};

const defaultStorageAdapter: HubStorageAdapter = {
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
    removeItem: (key: string) => window.localStorage.removeItem(key)
};

/**
 * Configure the chat module once during app bootstrap.
 */
export function setupCommunicationHubIntegration(args?: {
    apiClient?: HubApiClient;
    useAuthUserHook?: () => { user: any; refreshUser: () => void };
    useSignalRHook?: (onMessageReceived?: (message: any) => void, options?: any) => any;
    storage?: HubStorageAdapter;
}) {
    configureCommunicationHub({
        apiClient: args?.apiClient ?? fallbackApiClient,
        auth: args?.useAuthUserHook ? { useAuthUserHook: args.useAuthUserHook } : undefined,
        useSignalRHook: args?.useSignalRHook,
        storage: args?.storage ?? defaultStorageAdapter
    });
}

