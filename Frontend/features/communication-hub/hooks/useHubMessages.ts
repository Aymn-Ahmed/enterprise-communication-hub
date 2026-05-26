import { useState, useCallback, useEffect } from 'react';
import { hubService } from '../services/hubService';
import type { HubTab, UserLookUp, ConversationSummary } from '../types/hub.types';

interface UseHubMessagesProps {
    currentDisplayId: string;
    currentUserRawId: number;
    activeTab: HubTab;
}

export const useHubMessages = ({ currentDisplayId, currentUserRawId, activeTab }: UseHubMessagesProps) => {
    // We'll use the imported useEffect directly
    // 1. Message State
    const [hubItems, setHubItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);

    // 2. Input/Compose State
    const [messageText, setMessageText] = useState('');
    const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 3. Edit/Reply State
    const [editingMessage, setEditingMessage] = useState<any>(null);
    const [replyTo, setReplyTo] = useState<any>(null);

    // --- Actions ---

    // A. Load Messages
    const loadHubItems = useCallback(async (tabOverride?: HubTab) => {
        if (!currentDisplayId || currentDisplayId === '0') return;
        setIsLoadingItems(true);
        try {
            const typeMap: Record<string, string> = {
                'questions': 'Question', 'appointments': 'Schedule', 'announcements': 'Announcement', 'chat': 'Chat'
            };
            const currentTab = tabOverride || activeTab;
            const targetMType = (currentTab ? typeMap[currentTab] : null) || 'Question';
            const res = await hubService.getMessages(targetMType);
            const data = Array.isArray(res.data) ? res.data : [];

            const mappedItems = data.map((d: any) => {
                const rawPayload = d.Payload || d.payload;
                let payload = {};
                if (typeof rawPayload === 'string' && rawPayload.trim()) {
                    try { payload = JSON.parse(rawPayload); } catch { payload = { text: rawPayload }; }
                } else if (rawPayload && typeof rawPayload === 'object') {
                    payload = rawPayload;
                }

                // 🚀 Normalize all casing variations and sub-objects into a single structure
                const normalizedItem = {
                    ...d,
                    // ID must ALWAYS be the primary Message ID
                    Id: d.MessageId ?? d.messageId ?? d.Id ?? d.id,
                    
                    CreatedAt: d.CreatedAt ?? d.createdAt ?? d.CreatedDate ?? d.createdDate ?? d.date ?? d.Date,
                    FromUserId: d.FromUserId ?? d.fromUserId ?? d.CreatedBy ?? d.createdBy,
                    TargetType: d.TargetType ?? d.targetType,
                    TargetId: d.TargetId ?? d.targetId,
                    MessageType: d.MessageType ?? d.messageType,
                    Payload: payload,
                    
                    // Unified Delivery & Read status (Elevated to top level)
                    // ✅ Logical Priority: Explicit DeliveryId > MyDelivery Object > Primary ID as Fallback
                    DeliveryId: d.DeliveryId ?? d.deliveryId ?? d.MyDelivery?.Id ?? d.myDelivery?.id ?? null,
                    IsRead: (d.IsRead ?? d.isRead ?? d.MyDelivery?.IsRead ?? d.myDelivery?.isRead) ?? (d.Status === 1 || d.status === 1 || d.Status === 'Read' || d.status === 'Read'),
                    IsDelivered: !!((d.DeliveredAt ?? d.deliveredAt ?? d.MyDelivery?.DeliveredAt ?? d.myDelivery?.deliveredAt) || (d.Status === 'Delivered' || d.status === 'Delivered' || d.Status === 'Read' || d.status === 'Read')),
                    DeliveredAt: d.DeliveredAt ?? d.deliveredAt ?? d.MyDelivery?.DeliveredAt ?? d.myDelivery?.deliveredAt,

                    Message: d.Message || d.message || d.Name || d.name || d.Notes || d.notes || (payload as any)?.text || "",
                    Name: d.Name || d.name || d.Message || d.message || (payload as any)?.text || "",
                    Title: d.Title || d.title || (payload as any)?.title || "",
                    // 🚀 Priority: payload.attachments > item.AttachmentUrl > item.attachmentUrl
                    AttachmentUrl: (payload as any)?.attachments || d.AttachmentUrl || d.attachmentUrl || "",
                    date: d.date || d.Date || (payload as any)?.date || (payload as any)?.Date || "",
                    time: d.time || d.Time || (payload as any)?.time || (payload as any)?.Time || "",
                    replyTo: d.replyTo || (payload as any)?.replyTo || null
                };

                return normalizedItem;
            }).sort((a: any, b: any) => {
                const tA = new Date(a.CreatedAt || 0).getTime();
                const tB = new Date(b.CreatedAt || 0).getTime();
                return tA - tB;
            });

            setHubItems(mappedItems);
            
            // 🚀 Silent Acknowledgment: Batch Mark as Delivered
            const unconfirmedDeliveries = mappedItems
                .filter((item: any) => {
                    const isRecipient = Number(item.FromUserId) !== Number(currentDisplayId);
                    const notDelivered = !item.IsDelivered && !item.DeliveredAt;
                    return isRecipient && notDelivered && item.DeliveryId && item.DeliveryId !== 0;
                })
                .map((item: any) => item.DeliveryId);

            if (unconfirmedDeliveries.length > 0) {
                hubService.markDeliveredBatch(unconfirmedDeliveries).catch(err => {
                    console.error('[ACK] Silent delivery status update failed:', err);
                });
            }
        } catch (error) {
            console.error('[useHubMessages] Error loading items:', error);
        } finally {
            setIsLoadingItems(false);
        }
    }, [currentDisplayId, activeTab]);

    // A2. Load Conversations (WhatsApp-style)
    const loadConversations = useCallback(async () => {
        if (!currentDisplayId || currentDisplayId === '0') return;
        setIsLoadingConversations(true);
        try {
            const res = await hubService.getConversations();
            setConversations(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('[useHubMessages] Error loading conversations:', error);
        } finally {
            setIsLoadingConversations(false);
        }
    }, [currentDisplayId]);

    // B. Send/Update Message
    const sendMessage = useCallback(async (params: {
        targets: { type: 'User' | 'Department' | 'Global'; id: string }[];
        messageCategory: HubTab;
        appointmentData?: { date: string; time: string };
        stickerUrl?: string;
        location?: { lat: number; lng: number };
        manualBlob?: Blob; // 🚀 Supported for direct voice sending
        manualAttachments?: string[];
        manualText?: string;
    }) => {
        if (!currentDisplayId || currentDisplayId === '0') {
            throw new Error('Identity missing');
        }

        setIsSubmitting(true);
        try {
            // 1. Handle recording (State or Manual)
            let finalAttachmentUrls = params.manualAttachments ? [...params.manualAttachments] : [...attachmentUrls];
            const blobToUpload = params.manualBlob || recordingBlob;
            
            if (blobToUpload) {
                const formData = new FormData();
                formData.append('file', blobToUpload, 'recording.webm');
                const uploadRes = await hubService.uploadAttachment(formData);
                if (uploadRes.data?.url) {
                    finalAttachmentUrls.push(uploadRes.data.url);
                }
            }

            // 🚀 Correctly join ALL attachments (Uploads + Voice)
            const joinedAttachments = params.stickerUrl || finalAttachmentUrls.filter(Boolean).join('|');
            const typeMap: Record<string, string> = {
                'questions': 'Question',
                'appointments': 'Schedule',
                'announcements': 'Announcement',
                'chat': 'Chat',
                'conversations': 'Chat'
            };

            // 2. Editing Logic (WhatsApp Architecture - New System)
            if (editingMessage) {
                const msgId = editingMessage.Id || editingMessage.id;

                // Build modern payload (WhatsApp-style)
                let currentPayload = {};
                try {
                    currentPayload = typeof editingMessage.Payload === 'string'
                        ? JSON.parse(editingMessage.Payload)
                        : (editingMessage.Payload || {});
                } catch (e) {
                    // If parsing fails, treat the whole payload as text
                    currentPayload = { text: String(editingMessage.Payload || '') };
                }

                const updatedPayload = {
                    ...currentPayload,
                    text: params.manualText ?? (messageText.trim() || (currentPayload as any).text || 'مرفق'),
                    attachments: joinedAttachments || (currentPayload as any).attachments,
                    isEdited: true,
                    editedAt: new Date().toISOString()
                };

                await hubService.updateHubMessage(msgId, {
                    payload: JSON.stringify(updatedPayload)
                });
            }
            else {
                const isSticker = !!params.stickerUrl;
                const isLocation = !!params.location;
                const activeText = params.manualText ?? messageText;
                const isVoice = !!params.manualBlob || !!recordingBlob;
                const txt = isSticker ? 'ملصق' : (isLocation ? 'موقعي الحالي' : (activeText.trim() || (isVoice ? '' : 'مرفق جديد')));
                const mType = (params.messageCategory ? typeMap[params.messageCategory] : null) || 'Chat';

                const payloadData = {
                    title: isSticker ? 'ملصق' : (isLocation ? 'الموقع الجغرافي' : `[${mType}] ${txt.slice(0, 30)}`),
                    text: activeText.trim() || txt,
                    attachments: joinedAttachments,
                    replyTo: replyTo ? {
                        id: replyTo.Id || replyTo.id,
                        text: replyTo.Payload?.text || (typeof replyTo.Payload === 'string' ? replyTo.Payload : ''),
                        sender: replyTo.FromUserName || 'مستخدم'
                    } : null,
                    ...(params.appointmentData && {
                        time: params.appointmentData.time,
                        date: params.appointmentData.date
                    }),
                    ...(params.location && {
                        latitude: params.location.lat,
                        longitude: params.location.lng
                    })
                };

                console.log('[DEBUG] Final Payload Schema:', payloadData);
                console.log('[DEBUG] Final Payload Text:', payloadData.text);
                console.log('[DEBUG] Final Payload Attachments:', payloadData.attachments);

                for (const target of params.targets) {
                    const finalDispatchPayload = {
                        fromUserId: currentDisplayId,
                        messageType: mType,
                        targetType: target.type,
                        targetId: target.id,
                        payload: JSON.stringify(payloadData)
                    };
                    try {
                        console.log('[DEBUG] Dispatching Message with Payload:', finalDispatchPayload);
                        const response = await hubService.dispatchMessage(finalDispatchPayload);
                        console.log('[DEBUG] Send Message Response:', response.data);
                    } catch (dispatchError: any) {
                        console.error('SEND dispatch failed for target:', target.id, dispatchError);
                        console.error('SEND dispatch error details:', dispatchError?.response?.data || dispatchError?.message);
                        throw dispatchError;
                    }
                }
            }

            // Cleanup
            setMessageText('');
            setAttachmentUrls([]);
            setRecordingBlob(null);
            setEditingMessage(null);
            setReplyTo(null);
            loadHubItems(); // Refresh
            loadConversations(); // Refresh conversation summaries
        } catch (error: any) {
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [currentDisplayId, attachmentUrls, recordingBlob, editingMessage, messageText, replyTo, loadHubItems, loadConversations]);

    // C. Delete Message
    const deleteMessage = useCallback(async (msgId: number) => {
        try {
            await hubService.deleteMessage(msgId).catch(() => hubService.deleteLegacyMessage(msgId));
            setHubItems(prev => prev.filter(item => (item.Id || item.id) !== msgId));
            loadConversations(); // Refresh
        } catch (error) {
            console.error('[useHubMessages] Delete failed:', error);
            throw error;
        }
    }, []);

    // D. Forward Message
    const forwardMessage = useCallback(async (item: any, targets: { type: string; id: string }[]) => {
        try {
            const payloadData = typeof item.Payload === 'string' ? JSON.parse(item.Payload) : item.Payload;
            for (const target of targets) {
                await hubService.dispatchMessage({
                    fromUserId: currentDisplayId,
                    messageType: item.MessageType || item.messageType || 'Question',
                    targetType: target.type,
                    targetId: target.id,
                    payload: JSON.stringify(payloadData)
                });
            }
            loadHubItems();
        } catch (error) {
            console.error('[useHubMessages] Forward failed:', error);
            throw error;
        }
    }, [currentDisplayId, loadHubItems]);

    // E. Mark as Read
    const markAsRead = useCallback(async (item: any) => {
        try {
            const deliveryId = item.DeliveryId || 0;
            const itemId = item.Id || item.id;
            const isSentByMe = Number(item.FromUserId || item.fromUserId || item.CreatedBy || item.createdBy || 0) === Number(currentDisplayId);
            if (isSentByMe) return;

            if (deliveryId > 0) {
                if (item.IsRead === true || item.isRead === true) return;
                await hubService.markReadSingle(deliveryId);
                setHubItems(prev => prev.map(x => (x.Id || x.id) === itemId ? { ...x, IsRead: true, isRead: true, Status: 1, status: 1 } : x));
            } else {
                const isSchedule = (item.MessageType || item.messageType) === 'Schedule';
                if (isSchedule) {
                    if (item.Done === true || item.done === true) return;
                    await hubService.updateAppointmentAuto(itemId, { ...item, Done: true, done: true });
                    setHubItems(prev => prev.map(x => (x.Id || x.id) === itemId ? { ...x, Done: true, done: true } : x));
                } else {
                    if (item.Status === 1 || item.status === 1 || item.Status === '1' || item.status === '1') return;
                    await hubService.updateLegacyMessage(itemId, { ...item, Status: 1, status: 1 });
                    setHubItems(prev => prev.map(x => (x.Id || x.id) === itemId ? { ...x, Status: 1, status: 1 } : x));
                }
            }
        } catch (error) {
            console.error('[useHubMessages] Error marking as read:', error);
        }
    }, [currentDisplayId]);

    // F. Batch Delivery Acknowledgment (Explicit Export if needed)
    const markAsDeliveredBatch = useCallback(async (deliveryIds: number[]) => {
        if (!deliveryIds.length) return;
        try {
            await hubService.markDeliveredBatch(deliveryIds);
        } catch (error) {
            console.error('[useHubMessages] Batch Delivery ACK failed:', error);
        }
    }, []);

    // 🚀 Auto-Trigger (Silent Acknowledgment)
    // Whenever hubItems update, we check for messages that need a "Delivered" ACK.
    // This covers both initial load and incoming SignalR messages.
    useEffect(() => {
        if (!hubItems.length || !currentDisplayId || currentDisplayId === '0') return;

        const unconfirmedIds = hubItems
            .filter((item: any) => {
                const isRecipient = Number(item.FromUserId) !== Number(currentDisplayId);
                return isRecipient && !item.IsDelivered && item.DeliveryId && item.DeliveryId !== 0;
            })
            .map((item: any) => item.DeliveryId);

        if (unconfirmedIds.length > 0) {
            hubService.markDeliveredBatch(unconfirmedIds).catch(err => {
                console.error('[ACK] Silent delivery status update failed:', err);
            });
            
            // Optimistic update to prevent re-triggering the same batch
            // We set IsDelivered to true locally
            setHubItems(prev => prev.map(item => 
                unconfirmedIds.includes(item.DeliveryId) ? { ...item, IsDelivered: true } : item
            ));
        }
    }, [hubItems, currentDisplayId]);

    return {
        // State
        hubItems,
        setHubItems,
        isLoadingItems,
        messageText,
        setMessageText,
        attachmentUrls,
        setAttachmentUrls,
        recordingBlob,
        setRecordingBlob,
        isSubmitting,
        editingMessage,
        setEditingMessage,
        replyTo,
        setReplyTo,
        conversations,
        setConversations,
        isLoadingConversations,

        // Actions
        loadHubItems,
        loadConversations,
        sendMessage,
        deleteMessage,
        forwardMessage,
        markAsRead,
        markAsDeliveredBatch
    };
};
