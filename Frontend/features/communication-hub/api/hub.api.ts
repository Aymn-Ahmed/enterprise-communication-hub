/** 
 * API Service for Hub. 
 * Functions to handle file uploads and SignalR connection logic.
 */
import { getApiClient } from '../../../core/api/apiClient';

export const hubApi = {
    uploadFile: async (formData: FormData) => {
        const api = getApiClient();
        return await api.post('/api/HubAttachments/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    // ... more API methods
};
