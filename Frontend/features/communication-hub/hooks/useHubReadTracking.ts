import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { hubService } from '../services/hubService';
import { getNormalizedMessageType } from '../utils/hubSelectors';
import type { HubTab, UserLookUp } from '../types/hub.types';

type UseHubReadTrackingParams = {
    open: boolean;
    activeTab: HubTab;
    selectedChatUser: UserLookUp | null;
    hubItems: any[];
    isLoadingItems: boolean;
    currentDisplayId: number;
    loadCounts: () => Promise<any> | void;
    loadConversations: () => Promise<any> | void;
    setHubItems: Dispatch<SetStateAction<any[]>>;
    setConversations: Dispatch<SetStateAction<any[]>>;
    setUnreadDeliveries: Dispatch<SetStateAction<number[]>>;
};

export function useHubReadTracking({
    open,
    activeTab,
    selectedChatUser,
    hubItems,
    isLoadingItems,
    currentDisplayId,
    loadCounts,
    loadConversations,
    setHubItems,
    setConversations,
    setUnreadDeliveries
}: UseHubReadTrackingParams) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const isAtBottomRef = useRef(true);
    const lastProcessedMsgIdRef = useRef<number | null>(null);
    const processedMarkReadRef = useRef<Set<number>>(new Set());
    const pendingReadBatchRef = useRef<Set<number>>(new Set());
    const markReadBatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [unreadMessagesInScroll, setUnreadMessagesInScroll] = useState(0);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
            } else if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                    top: scrollContainerRef.current.scrollHeight,
                    behavior
                });
            }
            setShowScrollToBottom(false);
            setUnreadMessagesInScroll(0);
        }, 100);
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isAtBottom = scrollHeight - clientHeight - scrollTop < 40;
        isAtBottomRef.current = isAtBottom;

        if (isAtBottom) {
            setShowScrollToBottom(false);
            setUnreadMessagesInScroll(0);
            return;
        }

        const isScrolledUp = scrollHeight - clientHeight - scrollTop > 400;
        if (isScrolledUp || unreadMessagesInScroll > 0) {
            setShowScrollToBottom(true);
        } else {
            setShowScrollToBottom(false);
        }
    };

    useEffect(() => {
        if (!isLoadingItems && activeTab && selectedChatUser && hubItems.length > 0) {
            const lastMsg = hubItems[hubItems.length - 1];
            const lastMsgId = lastMsg.Id || lastMsg.id;
            if (lastMsgId === lastProcessedMsgIdRef.current) return;

            const senderId = Number(lastMsg.CreatedBy ?? lastMsg.createdBy ?? lastMsg.FromUserId ?? lastMsg.fromUserId ?? 0);
            const isMine = senderId === Number(currentDisplayId);

            if (isMine) {
                lastProcessedMsgIdRef.current = lastMsgId;
                scrollToBottom('auto');
            } else if (isAtBottomRef.current) {
                lastProcessedMsgIdRef.current = lastMsgId;
                scrollToBottom('smooth');
            } else {
                if (lastProcessedMsgIdRef.current === null) {
                    lastProcessedMsgIdRef.current = lastMsgId;
                    scrollToBottom('auto');
                    return;
                }
                const lastIdx = hubItems.findIndex(i => (i.Id || i.id) === lastProcessedMsgIdRef.current);
                const newItemsCount = lastIdx === -1 ? 1 : hubItems.length - 1 - lastIdx;
                if (newItemsCount > 0) {
                    setUnreadMessagesInScroll(prev => prev + newItemsCount);
                    setShowScrollToBottom(true);
                }
                lastProcessedMsgIdRef.current = lastMsgId;
            }
        }
    }, [hubItems, selectedChatUser, activeTab, currentDisplayId, isLoadingItems]);

    useEffect(() => {
        setUnreadMessagesInScroll(0);
        setShowScrollToBottom(false);
        lastProcessedMsgIdRef.current = null;
    }, [selectedChatUser, activeTab]);

    useEffect(() => {
        if (!open || !activeTab || !selectedChatUser) return;

        const peerId = String(selectedChatUser.Id);
        const isGlobal = peerId === 'global';
        const isDept = peerId.startsWith('dept-');
        const cleanPeerId = peerId.replace('dept-', '');

        const tabToType: Record<string, string> = {
            questions: 'Question',
            appointments: 'Schedule',
            announcements: 'Announcement',
            chat: 'Chat'
        };
        const currentTabType = tabToType[activeTab];

        hubService.markReadConversation(peerId, (tabToType as any)[activeTab] || 'Chat')
            .then(() => {
                loadCounts();
                loadConversations();
            })
            .catch(e => console.error('[CommunicationHub] Bulk MarkRead failed:', e));

        const unreadInCurrentTab = hubItems.filter((item: any) => {
            const itemId = item.Id || item.id;
            if (item.IsRead || processedMarkReadRef.current.has(itemId)) return false;

            const actualItemType = getNormalizedMessageType(item);
            const isTabMatch = actualItemType === currentTabType || (currentTabType === 'Chat' && actualItemType === 'Sticker');
            if (!isTabMatch) return false;

            const cBy = Number(item.FromUserId ?? item.fromUserId ?? item.CreatedBy ?? item.createdBy ?? 0);
            const itemTargetType = String(item.TargetType || item.targetType || 'User').toLowerCase();
            const itemTargetId = String(item.TargetId || item.targetId || item.WorkId || item.workId || item.DepartmentId || item.departmentId || '0');
            const itemDeptId = Number(item.DepartmentId || item.departmentId || item.WorkId || item.workId || 0);

            if (isGlobal) return itemTargetType === 'global';
            if (isDept) {
                const isDirectDept = itemTargetType === 'department' && Number(itemTargetId) === Number(cleanPeerId);
                const isLogicDept = itemDeptId === Number(cleanPeerId);
                return isDirectDept || isLogicDept;
            }

            const isPrivateTarget = (itemTargetType === 'user' || itemTargetType === '' || itemTargetType === 'null');
            if (!isPrivateTarget) return false;
            return (cBy === Number(cleanPeerId)) ||
                (itemTargetType === 'user' && Number(itemTargetId) === Number(cleanPeerId));
        });

        const deliveryIds = unreadInCurrentTab
            .map(m => m.DeliveryId ?? m.deliveryId ?? m.MyDelivery?.Id ?? m.myDelivery?.id)
            .filter(id => id && id !== 0 && id !== '0');

        if (unreadInCurrentTab.length > 0 && deliveryIds.length > 0) {
            unreadInCurrentTab.forEach(m => processedMarkReadRef.current.add(m.Id || m.id));
            deliveryIds.forEach(id => pendingReadBatchRef.current.add(Number(id)));
            if (markReadBatchTimerRef.current) clearTimeout(markReadBatchTimerRef.current);

            markReadBatchTimerRef.current = setTimeout(async () => {
                const batchToPush = Array.from(pendingReadBatchRef.current);
                if (batchToPush.length === 0) return;

                try {
                    const res = await hubService.markReadBatch(batchToPush);
                    loadCounts();
                    loadConversations();
                    if (!res?.data?.success && res?.status !== 200) {
                        batchToPush.forEach(id => processedMarkReadRef.current.delete(id));
                    }
                } catch (error) {
                    console.error('[CommunicationHub] Batch MarkRead failed:', error);
                    batchToPush.forEach(id => processedMarkReadRef.current.delete(id));
                }
            }, 600);

            setHubItems((prev: any[]) => prev.map((item: any) => {
                const itemId = item.Id || item.id;
                const isAmongProcessed = unreadInCurrentTab.some(m => (m.Id || m.id) === itemId);
                if (isAmongProcessed) {
                    return { ...item, IsRead: true, isRead: true, Status: 'Read', status: 'Read', ReadAt: new Date().toISOString() };
                }
                return item;
            }));

            setConversations((prev: any[]) => prev.map(conv => {
                const peer = String(selectedChatUser.Id);
                const isMatch = (peer === 'global' && conv.type === 'Global') ||
                    (peer.startsWith('dept-') && conv.type === 'Department' && String(conv.workId || conv.id) === cleanPeerId) ||
                    (String(conv.id) === peer);

                if (isMatch) {
                    return {
                        ...conv,
                        unreadCount: 0, unreadChatCount: 0, unreadQuestionCount: 0,
                        unreadScheduleCount: 0, unreadAnnouncementCount: 0
                    };
                }
                return conv;
            }));

            setUnreadDeliveries((prev: number[]) => prev.filter(id => !deliveryIds.includes(Number(id))));
        }
    }, [open, activeTab, selectedChatUser, hubItems, loadCounts, loadConversations, setHubItems, setConversations, setUnreadDeliveries]);

    return {
        scrollContainerRef,
        messagesEndRef,
        showScrollToBottom,
        scrollToBottom,
        handleScroll
    };
}
