export type HubToastVariant = 'error' | 'info' | 'success';

export type HubToastDetail = {
    message: string;
    variant?: HubToastVariant;
};

/** Dispatches an in-app toast inside the Hub (listened to by HubNotificationStack). */
export function dispatchHubToast(message: string, variant: HubToastVariant = 'info') {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent<HubToastDetail>('hub:toast', { detail: { message, variant } }));
}
