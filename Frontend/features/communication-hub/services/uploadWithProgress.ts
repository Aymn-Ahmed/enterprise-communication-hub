import { getHubStorage } from '../../../core/integration/moduleHost';
import type { HubHttpResponse } from '../../../core/integration/types';

const resolveBaseUrl = () => {
    const fromStorage = getHubStorage().getItem('hub_api_base_url');
    return fromStorage?.trim() || '';
};

export type UploadProgressCallback = (loaded: number, total: number) => void;

/**
 * Upload multipart form data with XMLHttpRequest so we can report upload progress (large documents).
 */
export function uploadFormDataWithProgress(
    path: string,
    formData: FormData,
    onProgress?: UploadProgressCallback
): Promise<HubHttpResponse<{ url?: string }>> {
    const base = resolveBaseUrl();
    const token = getHubStorage().getItem('smartdash_token') ?? '';

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${base}${path}`);

        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable && onProgress) {
                onProgress(ev.loaded, ev.total);
            }
        };

        xhr.onload = () => {
            let data: any = null;
            try {
                data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            } catch {
                data = null;
            }
            const status = xhr.status;
            if (status === 401 && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('hub:session-expired', { detail: { url: path } }));
            }
            if (status === 0 && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('hub:network-error', { detail: { url: path } }));
            }
            resolve({ data, status });
        };

        xhr.onerror = () => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('hub:network-error', { detail: { url: path } }));
            }
            reject(new Error('network'));
        };

        xhr.onabort = () => {
            reject(new Error('aborted'));
        };

        xhr.send(formData);
    });
}
