import { getApiClient } from '../../../core/api/apiClient';
import { uploadFormDataWithProgress, type UploadProgressCallback } from './uploadWithProgress';

/**
 * Hub Service for centralized API calls.
 * Separates data fetching logic from the UI components.
 */
export const hubService = {
    // 1. Get Unread Counts (Optimized - Numbers only)
    getUnreadCounts: async () => {
        const api = getApiClient();
        return await api.get('/api/messages/counts');
    },

    // 1b. Get Unread Delivery IDs (High Efficiency)
    getUnreadDeliveries: async () => {
        const api = getApiClient();
        return await api.get('/api/messages/my-deliveries');
    },

    // 2. Fetch Messages/Conversations
    getMessages: async (messageType: string) => {
        const api = getApiClient();
        return await api.get(`/api/messages/all?messageType=${messageType}`);
    },
    
    // 2b. Fetch Conversation Summaries (WhatsApp-style)
    getConversations: async () => {
        const api = getApiClient();
        return await api.get('/api/messages/conversations');
    },

    // 3. Forward a message
    forwardMessage: async (payload: any) => {
        const api = getApiClient();
        return await api.post('/api/messages/forward', payload);
    },

    // 4. Load Users (Simple List)
    getUsersSimple: async () => {
        const api = getApiClient();
        return await api.get('/api/users/list-simple');
    },

    // 5. Load Users (CRUD fallback)
    getUsersCrud: async () => {
        const api = getApiClient();
        return await api.get('/api/crud/userss');
    },

    // 6. Load Work Types / Departments
    getWorkTypes: async () => {
        const api = getApiClient();
        return await api.get('/api/WorkTypes/GetWorkTypes');
    },

    // 7. Load Work Types / Departments (CRUD fallback)
    getWorkTypesCrud: async () => {
        const api = getApiClient();
        return await api.get('/api/crud/WorkType');
    },

    // 8. Toggle Reaction
    toggleReaction: async (messageId: number | string, userId: number | string, reactionType: string) => {
        const api = getApiClient();
        return await api.post(`/api/messages/${messageId}/reaction?userId=${userId}`, { ReactionType: reactionType });
    },

    // 9. Upload Attachment
    uploadAttachment: async (formData: FormData) => {
        const api = getApiClient();
        return await api.post('/api/HubAttachments/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /** Same endpoint as uploadAttachment, with XMLHttpRequest progress (large documents). */
    uploadAttachmentWithProgress: async (formData: FormData, onProgress?: UploadProgressCallback) => {
        return uploadFormDataWithProgress('/api/HubAttachments/upload', formData, onProgress);
    },

    // 9b. Upload Avatar
    uploadAvatar: async (formData: FormData) => {
        const api = getApiClient();
        return await api.post('/api/users/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // 9c. Upload Cover
    uploadCover: async (formData: FormData) => {
        const api = getApiClient();
        return await api.post('/api/users/upload-cover', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // 10. Update Legacy Message (Editing)
    updateLegacyMessage: async (msgId: number | string, payload: any) => {
        const api = getApiClient();
        return await api.put(`/api/crud/Question/${msgId}`, payload);
    },

    // 10b. Update Appointment Auto (Mark as Done)
    updateAppointmentAuto: async (msgId: number | string, payload: any) => {
        const api = getApiClient();
        return await api.put(`/api/crud/AppointmentAuto/${msgId}`, payload);
    },

    // 10c. Update Message (WhatsApp Architecture - New System)
    updateHubMessage: async (msgId: number | string, payload: any) => {
        const api = getApiClient();
        return await api.put(`/api/messages/${msgId}`, payload);
    },

    // 11. Dispatch New Message
    dispatchMessage: async (payload: any) => {
        const api = getApiClient();
        return await api.post('/api/messages/dispatch', payload);
    },

    // 12. Delete Message (System)
    deleteMessage: async (msgId: number | string) => {
        const api = getApiClient();
        return await api.delete(`/api/messages/delete/${msgId}`);
    },

    // 13. Delete Legacy Message (CRUD)
    deleteLegacyMessage: async (msgId: number | string) => {
        const api = getApiClient();
        return await api.delete(`/api/crud/Question/${msgId}`);
    },

    // 14. Mark Message as Read (Bulk)
    markMessageRead: async (payload: any) => {
        const api = getApiClient();
        return await api.post('/api/messages/mark-read', payload);
    },

    // 14b. Mark Message as Read (Single delivery)
    markReadSingle: async (deliveryId: number | string) => {
        const api = getApiClient();
        return await api.post(`/api/messages/mark-read/${deliveryId}`);
    },

    // 14bb. Mark Messages as Read (Batch delivery)
    markReadBatch: async (deliveryIds: number[]) => {
        const api = getApiClient();
        return await api.post('/api/messages/mark-read-batch', deliveryIds);
    },

    // 14c. Mark Messages as Delivered (Bulk ACK)
    markDeliveredBatch: async (deliveryIds: number[]) => {
        const api = getApiClient();
        return await api.post('/api/messages/mark-delivered-batch', deliveryIds);
    },

    // 15. Get User Profile
    getUserProfile: async (id: number | string) => {
        const api = getApiClient();
        return await api.get(`/api/users/profile/${id}`);
    },

    // 16. Get User Details
    getUserDetails: async (id: number | string) => {
        const api = getApiClient();
        return await api.get(`/api/users/GetUserDetails/${id}`);
    },

    // 17. Get Reaction Details
    getReactionDetails: async (messageId: number | string) => {
        const api = getApiClient();
        return await api.get(`/api/messages/${messageId}/reaction-details`);
    },

    // 18. Mark Whole Conversation as Read (Surgical Clearance)
    markReadConversation: async (peerId: string, messageType?: string) => {
        const api = getApiClient();
        return await api.post('/api/messages/mark-read-conversation', { peerId, messageType });
    }
};
