import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSignalRAdapter } from '../../../core/realtime/useSignalRAdapter';

const typingCompositeKey = (chatId: string, userId: string) => `${chatId}|${userId}`;

interface UseHubRealtimeProps {
    open: boolean;
    loadCounts: () => void;
    loadConversations: () => void;
    loadHubItems: () => void;
    onStatusUpdate: (callback: (prev: any[]) => any[]) => void;
    onReactionUpdate: (callback: (prev: any[]) => any[]) => void;
    onInfoModalUpdate: (callback: (prev: any[]) => any[]) => void;
    /** Sync typing into ChatContext (and UI). */
    onRemoteTyping?: (userId: string, chatId: string, isTyping: boolean) => void;
}

export const useHubRealtime = ({
    open,
    loadCounts,
    loadConversations,
    loadHubItems,
    onStatusUpdate,
    onReactionUpdate,
    onInfoModalUpdate,
    onRemoteTyping
}: UseHubRealtimeProps) => {
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new window.Set());
    const [typingKeys, setTypingKeys] = useState<Set<string>>(() => new window.Set());
    const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const parseDateSafe = (dateVal: any): Date => {
        if (!dateVal) return new Date();
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    const messageCallback = useCallback((_message: any) => {
        if (reloadTimerRef.current) {
            clearTimeout(reloadTimerRef.current);
        }
        reloadTimerRef.current = setTimeout(() => {
            loadCounts();
            if (open) {
                loadConversations();
                loadHubItems();
            }
        }, 150);
    }, [open, loadCounts, loadConversations, loadHubItems]);

    useEffect(() => {
        return () => {
            Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
            typingTimeoutsRef.current = {};
            if (reloadTimerRef.current) {
                clearTimeout(reloadTimerRef.current);
                reloadTimerRef.current = null;
            }
        };
    }, []);

    const signalROptions = useMemo(() => ({
        onUserOnline: (userId: string) => {
            setOnlineUsers(prev => {
                const updated = new window.Set(prev);
                updated.add(userId);
                return updated;
            });
        },
        onUserOffline: (userId: string) => {
            setOnlineUsers(prev => {
                const updated = new window.Set(prev);
                updated.delete(userId);
                return updated;
            });
        },
        onInitialOnlineUsers: (userIds: string[]) => {
            setOnlineUsers(new window.Set(userIds));
        },
        onUserTyping: (userId: string, chatId: string, isTyping: boolean) => {
            const key = typingCompositeKey(String(chatId), String(userId));
            const prevTimer = typingTimeoutsRef.current[key];
            if (prevTimer) {
                clearTimeout(prevTimer);
                delete typingTimeoutsRef.current[key];
            }

            if (isTyping) {
                onRemoteTyping?.(String(userId), String(chatId), true);
                setTypingKeys((prev) => {
                    const next = new window.Set(prev);
                    next.add(key);
                    return next;
                });
                typingTimeoutsRef.current[key] = setTimeout(() => {
                    delete typingTimeoutsRef.current[key];
                    setTypingKeys((prev) => {
                        const next = new window.Set(prev);
                        next.delete(key);
                        return next;
                    });
                    onRemoteTyping?.(String(userId), String(chatId), false);
                }, 3000);
            } else {
                onRemoteTyping?.(String(userId), String(chatId), false);
                setTypingKeys((prev) => {
                    const next = new window.Set(prev);
                    next.delete(key);
                    return next;
                });
            }
        },
        onMessageDelivered: (data: any) => {
            const msgId = data.messageId || data.MessageId;
            const recipientId = Number(data.recipientId || data.RecipientId || 0);

            onStatusUpdate((prev: any[]) => prev.map((item: any) => {
                if ((item.Id || item.id) === msgId) {
                    return {
                        ...item,
                        IsDeliveredStatus: true,
                        isDeliveredStatus: true,
                        Status: 'Delivered',
                        status: 'Delivered'
                    };
                }
                return item;
            }));

            onInfoModalUpdate((prev: any[]) => prev.map(d => {
                if (Number(d.UserId || d.userId) === recipientId) {
                    return {
                        ...d,
                        status: 'Delivered',
                        DeliveredAt: parseDateSafe(data.deliveredAt || data.DeliveredAt).toISOString()
                    };
                }
                return d;
            }));
        },
        onMessagesDelivered: (data: any) => {
            const ids = data.messageIds || data.MessageIds || [];
            onStatusUpdate((prev: any[]) => prev.map((item: any) => {
                if (ids.includes(item.Id || item.id)) {
                    return {
                        ...item,
                        IsDeliveredStatus: true,
                        isDeliveredStatus: true,
                        Status: 'Delivered',
                        status: 'Delivered'
                    };
                }
                return item;
            }));
        },
        onMessageRead: (data: any) => {
            const msgId = data.messageId || data.MessageId;
            const recipientId = Number(data.recipientId || data.RecipientId || 0);

            onStatusUpdate((prev: any[]) => prev.map((item: any) => {
                if ((item.Id || item.id) === msgId) {
                    return {
                        ...item,
                        IsReadStatus: true,
                        isReadStatus: true,
                        Status: 'Read',
                        status: 'Read',
                        IsReadByRecipient: true,
                        isReadByRecipient: true,
                        IsRead: true,
                        isRead: true
                    };
                }
                return item;
            }));

            onInfoModalUpdate((prev: any[]) => prev.map(d => {
                if (Number(d.UserId || d.userId) === recipientId) {
                    return {
                        ...d,
                        status: 'Read',
                        isRead: true,
                        ReadAt: parseDateSafe(data.readAt || data.ReadAt).toISOString()
                    };
                }
                return d;
            }));
        },
        onMessagesRead: (data: any) => {
            const ids = data.messageIds || data.MessageIds || [];
            const readerId = Number(data.readerId || data.ReaderId || data.recipientId || data.RecipientId || 0);

            onStatusUpdate((prev: any[]) => prev.map((item: any) => {
                if (ids.includes(item.Id || item.id)) {
                    return {
                        ...item,
                        IsReadStatus: true,
                        isReadStatus: true,
                        Status: 'Read',
                        status: 'Read',
                        IsReadByRecipient: true,
                        isReadByRecipient: true,
                        IsRead: true,
                        isRead: true
                    };
                }
                return item;
            }));

            onInfoModalUpdate((prev: any[]) => prev.map(d => {
                if (Number(d.UserId || d.userId) === readerId) {
                    return {
                        ...d,
                        status: 'Read',
                        isRead: true,
                        ReadAt: parseDateSafe(data.readAt || data.ReadAt).toISOString()
                    };
                }
                return d;
            }));
        },
        onReactionUpdated: (data: any) => {
            const msgId = Number(data.messageId || data.MessageId);
            const updatedReactions = data.reactions || data.Reactions || [];

            onReactionUpdate((prev: any[]) => prev.map((item: any) => {
                if (Number(item.Id || item.id) === msgId) {
                    return {
                        ...item,
                        Reactions: updatedReactions,
                        reactions: updatedReactions
                    };
                }
                return item;
            }));
        }
    }), [onStatusUpdate, onReactionUpdate, onInfoModalUpdate, onRemoteTyping]);

    const {
        isConnected,
        isConnecting,
        connectionPhase,
        notifyTyping,
        joinRoom,
        joinGlobalChannel,
        joinDepartmentChannel,
        joinDepartmentChat,
        startConnection
    } = useSignalRAdapter(messageCallback, signalROptions);

    return {
        isConnected,
        isConnecting,
        connectionPhase,
        startConnection,
        onlineUsers,
        typingKeys,
        notifyTyping,
        joinRoom,
        joinGlobalChannel,
        joinDepartmentChannel,
        joinDepartmentChat
    };
};
