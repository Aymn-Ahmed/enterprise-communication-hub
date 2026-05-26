import type { HubTab, ConversationSummary, LastMessagePreview } from '../types/hub.types';

/**
 * Normalizes message type classification across the system.
 */
export const getNormalizedMessageType = (item: any): string => {
    if (!item) return 'Chat';
    
    // 🔍 CONTENT-BASED DETECTION: Higher priority than the label 
    const attachmentVal = String(item.AttachmentUrl || item.attachmentUrl || '').toLowerCase();
    if (attachmentVal.includes('flaticon.com') || attachmentVal.includes('/stickers/')) return 'Sticker';
    
    const payload = item.Payload || item.payload;
    if (payload && (payload.latitude || payload.longitude)) return 'Location';

    // Fallback: Check if MessageType is direct on the item first, then check inside nested message.
    const directType = item.MessageType || item.messageType;
    const nestedMsg = item.Message || item.message || item;
    const nestedType = nestedMsg.MessageType || nestedMsg.messageType || '';
    
    // Strictly read MessageType from the database/API record
    const mType = String(directType || nestedType).toLowerCase().trim();

    if (mType === 'announcement' || mType === 'broadcast') return 'Announcement';
    if (mType === 'schedule' || mType === 'appointment') return 'Schedule';
    if (mType === 'question') return 'Question';
    if (mType === 'sticker') return 'Sticker';
    if (mType === 'location') return 'Location';
    if (mType === 'chat') return 'Chat';
    
    return 'Chat'; // Pure fallback
};

export const tabToType: Record<string, string> = {
    'questions': 'Question',
    'appointments': 'Schedule',
    'announcements': 'Announcement',
    'chat': 'Chat'
};

/**
 * Builds a clean map of the latest message for each entity (User, Dept, Global)
 * strictly filtered by the current tab's required message type.
 */
export const resolveTabSpecificActivity = (
    hubItems: any[],
    backendConversations: ConversationSummary[],
    unreadDeliveries: any[],
    currentDisplayId: number | string,
    activeTab: HubTab
) => {
    const requiredType = tabToType[activeTab || ''] || 'Chat';
    
    console.log('[RUNTIME DEBUG] HubSelectors -> resolveTabSpecificActivity (Input):', {
        activeTab,
        requiredType,
        hubItemsCount: hubItems.length,
        unreadDeliveriesCount: unreadDeliveries.length,
        backendConversationsCount: backendConversations.length
    });

    const messageMap = new Map<string, LastMessagePreview>();
    const unreadMap: Record<string, number> = {};
    const activityMap: Record<string, number> = {};

    const resolveKey = (item: any, isDelivery = false): string => {
        const msg = isDelivery ? (item.Message || item.message || item) : item;
        const fromId = Number(msg.FromUserId || msg.fromUserId || item.CreatedBy || item.createdBy || 0);
        
        // 1. Force Department Key if DepartmentId exists
        const mDeptId = msg.DepartmentId || msg.departmentId || item.DepartmentId || item.departmentId || 0;
        if (mDeptId > 0) return `dept-${mDeptId}`;

        const rawTType = (item.TargetType || item.targetType || msg.TargetType || msg.targetType || '');
        const tType = rawTType.toLowerCase().trim();
        
        // 🚀 Robust ID Resolution: Ensure no leading/trailing spaces or "0" prefix issues
        const rawTId = String(item.TargetId || item.targetId || msg.TargetId || msg.targetId || '0').trim();
        const tId = isNaN(Number(rawTId)) ? rawTId : String(Number(rawTId));
        
        if (tType === 'user') {
            const peerId = fromId === Number(currentDisplayId) ? Number(tId) : fromId;
            return peerId > 0 ? `user-${peerId}` : '';
        } else if (tType === 'department' || tType === 'dept') {
            return `dept-${tId}`;
        } else if (tType === 'global' || tType === 'broadcast') {
            return 'global';
        }

        if (mDeptId > 0) return `dept-${mDeptId}`;
        return '';
    };

    // 1. Process hubItems (local/realtime flow)
    hubItems.forEach(item => {
        const itemType = getNormalizedMessageType(item);
        if (itemType !== requiredType && !(requiredType === 'Chat' && itemType === 'Sticker')) return;
        
        const key = resolveKey(item);
        if (!key) return; // Skip if no valid key could be resolved

        const timestamp = item.CreatedAt || item.createdAt || item.CreatedDate || item.createdDate;
        const time = new Date(timestamp || 0).getTime();

        // Strictly time-based for the specific category
        activityMap[key] = Math.max(activityMap[key] || 0, time);

        const existing = messageMap.get(key);
        const existingTime = existing ? new Date(existing.timestamp || 0).getTime() : 0;

        if (!existing || time >= existingTime) {
                let text = '';
                if (getNormalizedMessageType(item) === 'Sticker') {
                    text = 'ملصق';
                } else {
                    try {
                        const p = typeof item.Payload === 'string' ? JSON.parse(item.Payload) : item.Payload;
                        text = p?.text || item.Message || item.message || 'مرفق';
                    } catch {
                        text = item.Message || item.message || 'رسالة';
                    }
                }

                messageMap.set(key, {
                    text,
                    timestamp: timestamp,
                    isMe: Number(item.FromUserId || item.fromUserId) === Number(currentDisplayId),
                    status: item.Status || item.status || 'Sent',
                    type: requiredType,
                    senderId: Number(item.FromUserId || item.fromUserId),
                    targetType: item.TargetType || item.targetType,
                    targetId: item.TargetId || item.targetId
                });
            }
    });

    // 2. Process Unread Deliveries (REAL-TIME BADGE SOURCE)
    // 🚀 High Priority Fix: Populate unreadMap based on what's locally in hubItems
    if (Array.isArray(unreadDeliveries) && unreadDeliveries.length > 0) {
        hubItems.forEach(item => {
            const dId = Number(item.DeliveryId || item.id || 0);
            const isUnread = unreadDeliveries.includes(dId) && !item.IsRead;
            
            if (isUnread) {
                const itemType = getNormalizedMessageType(item);
                if (itemType === requiredType) {
                    const key = resolveKey(item);
                    if (key) {
                        unreadMap[key] = (unreadMap[key] || 0) + 1;
                        // Also ensure activity map reflects this unread message
                        activityMap[key] = Math.max(activityMap[key] || 0, new Date(item.CreatedAt || 0).getTime());
                    }
                }
            }
        });
    }

    // 3. Process Backend Conversations (Source of Truth for historic previews)
    backendConversations.forEach(conv => {
        const reqType = requiredType.toLowerCase();
        // 🚀 Sticker Support: Stickers should show up in Chat/Announcements tabs
        const isTypeMatch = (conv.lastMessage?.type || '').toLowerCase() === reqType || 
                           (reqType === 'chat' && (conv.lastMessage?.type || '').toLowerCase() === 'sticker');
        
        const time = new Date(conv.lastActiveAt || conv.lastMessage?.timestamp || 0).getTime();
        
        // 🚀 Case-Insensitive Property Access for Server JSON (Pascal vs Camel)
        const getCnt = (pPascal: string, pCamel: string) => (conv as any)[pCamel] !== undefined ? (conv as any)[pCamel] : (conv as any)[pPascal] || 0;

        let tabUnreadCount = 0;
        if (reqType === 'chat') tabUnreadCount = getCnt('UnreadChatCount', 'unreadChatCount');
        else if (reqType === 'question') tabUnreadCount = getCnt('UnreadQuestionCount', 'unreadQuestionCount');
        else if (reqType === 'schedule') tabUnreadCount = getCnt('UnreadScheduleCount', 'unreadScheduleCount');
        else if (reqType === 'announcement') tabUnreadCount = getCnt('UnreadAnnouncementCount', 'unreadAnnouncementCount');
        
        const totalUnread = getCnt('UnreadCount', 'unreadCount');

        // Fallback for safety
        if (tabUnreadCount === 0 && totalUnread > 0 && isTypeMatch) {
            tabUnreadCount = totalUnread;
        }

        const targetKeys: string[] = [];
        const msgTargetType = (conv.lastMessage?.targetType || '').toLowerCase().trim();
        const convType = (conv.type || '').toLowerCase().trim();

        if (convType === 'global' || msgTargetType === 'global') {
            targetKeys.push('global');
        } 
        
        if (convType === 'department' || msgTargetType === 'department') {
            const dKey = `dept-${conv.id}`;
            if (!targetKeys.includes(dKey)) targetKeys.push(dKey);
        }

        if (convType === 'user' && (msgTargetType === 'user' || msgTargetType === '')) {
            const uKey = `user-${conv.id}`;
            if (!targetKeys.includes(uKey)) targetKeys.push(uKey);
        }
        
        // Remove workId based fallback entirely to prevent sender-dept pollution

        if (tabUnreadCount > 0) {
            targetKeys.forEach(key => {
                // Merge backend count with local count (Max ensures we don't double count if overlap exists)
                unreadMap[key] = Math.max(unreadMap[key] || 0, tabUnreadCount);
            });
        }

        if (isTypeMatch) {
            targetKeys.forEach((key: string) => {
                activityMap[key] = Math.max(activityMap[key] || 0, time);
                
                const existing = messageMap.get(key);
                const existingTime = existing ? new Date(existing.timestamp || 0).getTime() : 0;
                const convTime = new Date(conv.lastMessage?.timestamp || 0).getTime();
                if (!existing || convTime > existingTime) {
                    messageMap.set(key, {
                        text: conv.lastMessage?.text || '',
                        timestamp: conv.lastMessage?.timestamp || '',
                        status: conv.lastMessage?.status || 'Sent',
                        type: conv.lastMessage?.type || requiredType,
                        isMe: !!conv.lastMessage?.isMe,
                        senderId: Number(conv.lastMessage?.senderId || 0),
                        targetType:
                            conv.type === 'Department'
                                ? 'Department'
                                : conv.type === 'Global'
                                    ? 'Global'
                                    : 'User',
                        targetId: conv.type === 'Global' ? 'global' : conv.id
                    });
                }
            });
        }
    });

    console.log('[RUNTIME DEBUG] HubSelectors -> resolveTabSpecificActivity:', {
        activeTab,
        requiredType,
        hubItemsCount: hubItems.length,
        unreadDeliveriesCount: unreadDeliveries.length,
        backendConversationsCount: backendConversations.length
    });

    // ... (logic remains same)
    
    // Move the detailed logs to the end of the function before return
    console.log('[RUNTIME DEBUG] First 10 HubItems Data:', hubItems.slice(0, 10).map(item => {
        const msg = item.Message || item.message || item;
        return {
            rawType: (msg.MessageType || msg.messageType || ''),
            normType: getNormalizedMessageType(item),
            target: (item.TargetType || item.targetType || msg.TargetType || msg.targetType || 'User'),
            resolvedKey: resolveKey(item),
            date: item.CreatedDate || item.CreatedAt
        };
    }));

    console.log('[RUNTIME DEBUG] ResolveTabSpecificActivity Maps:', {
        messageMapKeys: Array.from(messageMap.keys()),
        unreadMapKeys: Object.keys(unreadMap),
        activityMapKeys: Object.keys(activityMap)
    });

    return { messageMap, unreadMap, activityMap };
};
