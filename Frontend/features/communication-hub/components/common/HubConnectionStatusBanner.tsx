import React from 'react';
import type { HubRealtimeConnectionPhase } from '../../../../core/integration/types';

type HubConnectionStatusBannerProps = {
    /** Hub panel visible (parent controls with `open`) */
    visible: boolean;
    browserOnline: boolean;
    sessionMessage: string | null;
    onDismissSession: () => void;
    isConnected: boolean;
    isConnecting: boolean;
    connectionPhase: HubRealtimeConnectionPhase | undefined;
    onRetryRealtime?: () => void;
};

export function HubConnectionStatusBanner({
    visible,
    browserOnline,
    sessionMessage,
    onDismissSession,
    isConnected,
    isConnecting,
    connectionPhase,
    onRetryRealtime
}: HubConnectionStatusBannerProps) {
    if (!visible) return null;

    if (sessionMessage) {
        return (
            <div
                className="shrink-0 z-[60] px-3 py-2 text-sm text-center bg-amber-100 text-amber-900 border-b border-amber-200 flex items-center justify-center gap-2 flex-wrap"
                role="alert"
            >
                <span>{sessionMessage}</span>
                <button
                    type="button"
                    className="text-xs underline font-semibold"
                    onClick={onDismissSession}
                >
                    إخفاء
                </button>
            </div>
        );
    }

    if (!browserOnline) {
        return (
            <div className="shrink-0 z-[60] px-3 py-2 text-sm text-center bg-slate-800 text-white border-b border-slate-600" role="alert">
                لا يوجد اتصال بالإنترنت. تحقق من الشبكة ثم أعد المحاولة.
            </div>
        );
    }

    if (connectionPhase === 'reconnecting') {
        return (
            <div className="shrink-0 z-[60] px-3 py-2 text-sm text-center bg-blue-100 text-blue-900 border-b border-blue-200" role="status">
                جاري إعادة الاتصال بالخادم الفوري…
            </div>
        );
    }

    if (isConnecting && !isConnected) {
        return (
            <div className="shrink-0 z-[60] px-3 py-2 text-sm text-center bg-blue-50 text-blue-800 border-b border-blue-100" role="status">
                جاري الاتصال بالخادم الفوري…
            </div>
        );
    }

    if (!isConnected && !isConnecting && connectionPhase === 'disconnected') {
        return (
            <div
                className="shrink-0 z-[60] px-3 py-2 text-sm text-center bg-orange-50 text-orange-900 border-b border-orange-200 flex items-center justify-center gap-2 flex-wrap"
                role="alert"
            >
                <span>انقطع الاتصال الفوري. سيتم إعادة المحاولة تلقائياً، أو يمكنك المحاولة يدوياً.</span>
                {onRetryRealtime ? (
                    <button
                        type="button"
                        className="text-xs font-bold underline"
                        onClick={() => {
                            void onRetryRealtime();
                        }}
                    >
                        إعادة الاتصال
                    </button>
                ) : null}
            </div>
        );
    }

    return null;
}
