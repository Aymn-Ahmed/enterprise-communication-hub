import React, { useCallback, useEffect, useState } from 'react';
import type { HubToastDetail, HubToastVariant } from '../../utils/hubToastEvents';

type ToastItem = {
    id: number;
    message: string;
    variant: HubToastVariant;
};

const DEFAULT_NETWORK_MESSAGE = 'تعذر الاتصال بالخادم. تحقق من الشبكة وحاول مرة أخرى.';

const VARIANT_STYLES: Record<HubToastVariant, string> = {
    error: 'bg-red-900/95 text-red-50 border border-red-700/80',
    info: 'bg-slate-900/95 text-slate-50 border border-slate-700/80',
    success: 'bg-emerald-900/95 text-emerald-50 border border-emerald-700/80'
};

/**
 * Non-blocking toasts for the Hub: listens to hub:toast and hub:network-error.
 */
export function HubNotificationStack({ visible }: { visible: boolean }) {
    const [items, setItems] = useState<ToastItem[]>([]);

    const pushToast = useCallback((message: string, variant: HubToastVariant = 'info') => {
        const id = Date.now() + Math.random();
        setItems((prev) => [...prev.slice(-4), { id, message, variant }]);
        window.setTimeout(() => {
            setItems((prev) => prev.filter((t) => t.id !== id));
        }, 5200);
    }, []);

    useEffect(() => {
        const onToast = (e: Event) => {
            const ce = e as CustomEvent<HubToastDetail>;
            const d = ce.detail;
            if (!d?.message) return;
            pushToast(d.message, d.variant ?? 'info');
        };
        const onNetwork = () => {
            pushToast(DEFAULT_NETWORK_MESSAGE, 'error');
        };
        window.addEventListener('hub:toast', onToast as EventListener);
        window.addEventListener('hub:network-error', onNetwork);
        return () => {
            window.removeEventListener('hub:toast', onToast as EventListener);
            window.removeEventListener('hub:network-error', onNetwork);
        };
    }, [pushToast]);

    if (!visible || items.length === 0) return null;

    return (
        <div
            className="pointer-events-none fixed bottom-3 left-3 right-3 z-[200] flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:w-[min(360px,92vw)]"
            dir="rtl"
            aria-live="polite"
        >
            {items.map((t) => (
                <div
                    key={t.id}
                    className={`pointer-events-auto w-full rounded-lg px-3 py-2.5 text-sm shadow-lg backdrop-blur-sm ${VARIANT_STYLES[t.variant]}`}
                    role="status"
                >
                    {t.message}
                </div>
            ))}
        </div>
    );
}
