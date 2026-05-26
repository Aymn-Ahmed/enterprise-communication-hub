import { getHubStorage } from '../integration/moduleHost';
import type { HubApiClient, HubHttpResponse } from '../integration/types';
import { emitThrottledWindowEvent } from './httpEventGuards';

const buildHeaders = (customHeaders?: Record<string, string>) => {
    const token = getHubStorage().getItem('smartdash_token') ?? '';
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...customHeaders
    };
};

const resolveBaseUrl = () => {
    const fromStorage = getHubStorage().getItem('hub_api_base_url');
    return fromStorage?.trim() || '';
};

const request = async <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body?: any,
    config?: { headers?: Record<string, string> }
): Promise<HubHttpResponse<T>> => {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const headers = buildHeaders({
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(config?.headers ?? {})
    });

    let response: Response;
    try {
        response = await fetch(`${resolveBaseUrl()}${url}`, {
            method,
            headers,
            body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body)
        });
    } catch {
        emitThrottledWindowEvent('hub:network-error', { url }, 1200);
        return { data: null as T, status: 0 };
    }

    let data: any = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (response.status === 401) {
        emitThrottledWindowEvent('hub:session-expired', { url }, 800);
    }

    return {
        data: data as T,
        status: response.status
    };
};

export const defaultApiClient: HubApiClient = {
    get: <T = any>(url: string) => request<T>('GET', url),
    post: <T = any>(url: string, body?: any, config?: { headers?: Record<string, string> }) =>
        request<T>('POST', url, body, config),
    put: <T = any>(url: string, body?: any, config?: { headers?: Record<string, string> }) =>
        request<T>('PUT', url, body, config),
    delete: <T = any>(url: string) => request<T>('DELETE', url)
};
