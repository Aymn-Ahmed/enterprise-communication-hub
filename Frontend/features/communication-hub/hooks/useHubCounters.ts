import { useState, useCallback, useEffect } from 'react';
import { hubService } from '../services/hubService';
import type { HubCounts } from '../types/hub.types';

interface UseHubCountersProps {
    currentDisplayId: string;
    onCountsUpdate?: (total: number) => void;
}

export const useHubCounters = ({ currentDisplayId, onCountsUpdate }: UseHubCountersProps) => {
    const [counts, setCounts] = useState<HubCounts>({
        questions: 0,
        appointments: 0,
        announcements: 0,
        chat: 0,
        total: 0
    });
    const [unreadDeliveries, setUnreadDeliveries] = useState<any[]>([]);

    const loadCounts = useCallback(async () => {
        try {
            if (!currentDisplayId || Number(currentDisplayId) === 0) return;

            // 🚀 STEP 1: Fast load badge numbers from the new optimized endpoint
            const countsRes = await hubService.getUnreadCounts();
            if (countsRes.data) {
                setCounts(countsRes.data);
                if (onCountsUpdate) onCountsUpdate(countsRes.data.total);
            }

            // 🚀 STEP 2: Load unread delivery IDs for indicator matching
            const deliversRes = await hubService.getUnreadDeliveries();
            const data = Array.isArray(deliversRes.data) ? deliversRes.data : [];
            setUnreadDeliveries(data);

        } catch (error: any) {
            console.error('[useHubCounters] Error loading counts:', {
                status: error?.response?.status,
                responseData: error?.response?.data,
                requestUrl: error?.config?.url,
                requestParams: error?.config?.params,
                requestData: error?.config?.data,
                raw: error
            });
        }
    }, [currentDisplayId, onCountsUpdate]);


    // Removed internal useEffect to prevent double loading
    // The parent (CommunicationHub) will orchestrate loadCounts sequentially with other calls.
    useEffect(() => {
        if (currentDisplayId && Number(currentDisplayId) > 0) {
            loadCounts();
        }
    }, [currentDisplayId, loadCounts]);

    return {
        counts,
        unreadDeliveries,
        setUnreadDeliveries,
        loadCounts
    };
};
