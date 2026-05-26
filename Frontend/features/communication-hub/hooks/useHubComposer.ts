import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { hubService } from '../services/hubService';
import type { HubTab, UserLookUp } from '../types/hub.types';
import { dispatchHubToast } from '../utils/hubToastEvents';

type Target = { type: 'User' | 'Department' | 'Global'; id: string };

type UseHubComposerParams = {
    activeTab: HubTab;
    selectedChatUser: UserLookUp | null;
    selectedDepartment: string;
    sendMessage: (payload: any) => Promise<any>;
    loadCounts: () => Promise<any> | void;
    cancelRecording: () => void;
    setPendingMediaFiles: Dispatch<SetStateAction<File[]>>;
    /** 0–100 while uploading media; pass null when done or idle */
    onUploadProgress?: (percent: number | null) => void;
};

const getTargets = (selectedChatUser: UserLookUp | null, selectedDepartment: string): Target[] => {
    const targets: Target[] = [];
    if (selectedChatUser) {
        if (selectedChatUser.Type === 'Department') targets.push({ type: 'Department', id: String(selectedChatUser.Id).replace('dept-', '') });
        else if (selectedChatUser.Type === 'Global') targets.push({ type: 'Global', id: '0' });
        else targets.push({ type: 'User', id: String(selectedChatUser.Id) });
    } else if (selectedDepartment) {
        targets.push({ type: 'Department', id: String(selectedDepartment) });
    }
    return targets;
};

export function useHubComposer({
    activeTab,
    selectedChatUser,
    selectedDepartment,
    sendMessage,
    loadCounts,
    cancelRecording,
    setPendingMediaFiles,
    onUploadProgress
}: UseHubComposerParams) {
    const sendVoiceMessage = useCallback(async (blob: Blob) => {
        const targets = getTargets(selectedChatUser, selectedDepartment);
        if (targets.length === 0) return;

        try {
            await sendMessage({
                targets,
                messageCategory: activeTab === 'chat' ? 'chat' : (activeTab || 'chat'),
                manualBlob: blob
            });
            cancelRecording();
            await loadCounts();
        } catch (error: any) {
            console.error('Voice send failed:', error);
            dispatchHubToast('فشل إرسال التسجيل الصوتي. حاول مرة أخرى.', 'error');
        }
    }, [selectedChatUser, selectedDepartment, sendMessage, activeTab, cancelRecording, loadCounts]);

    const handleSendMedia = useCallback(async (files: File[], caption: string) => {
        try {
            onUploadProgress?.(0);
            const uploadedUrls: string[] = [];
            const n = files.length;
            for (let i = 0; i < n; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);
                const res = await hubService.uploadAttachmentWithProgress(formData, (loaded, total) => {
                    const share = 100 / n;
                    const base = (i / n) * 100;
                    const pct = base + (loaded / Math.max(total, 1)) * share;
                    onUploadProgress?.(Math.min(100, Math.round(pct)));
                });
                if (res.data?.url) uploadedUrls.push(res.data.url);
            }

            const targets = getTargets(selectedChatUser, selectedDepartment);
            if (targets.length === 0) {
                throw new Error('الرجاء اختيار جهة اتصال أولاً');
            }

            await sendMessage({
                targets,
                messageCategory: activeTab === 'chat' ? 'chat' : (activeTab || 'chat'),
                manualAttachments: uploadedUrls,
                manualText: caption
            });

            setPendingMediaFiles([]);
            await loadCounts();
        } catch (error: any) {
            console.error('Upload failed:', error);
            dispatchHubToast('فشل رفع أو إرسال الوسائط. حاول مجدداً.', 'error');
            throw error;
        } finally {
            onUploadProgress?.(null);
        }
    }, [selectedChatUser, selectedDepartment, sendMessage, activeTab, setPendingMediaFiles, loadCounts, onUploadProgress]);

    const handleInlineSubmit = useCallback(async (params: {
        messageText: string;
        attachmentUrls: string[];
        audioBlob: Blob | null;
        recordingBlob: Blob | null;
        appointmentDate: string;
        appointmentTime: string;
        locationPreview: { lat: number; lng: number } | null;
        setAppointmentDate: Dispatch<SetStateAction<string>>;
        setAppointmentTime: Dispatch<SetStateAction<string>>;
        setLocationPreview: Dispatch<SetStateAction<{ lat: number; lng: number } | null>>;
    }) => {
        const {
            messageText,
            attachmentUrls,
            audioBlob,
            recordingBlob,
            appointmentDate,
            appointmentTime,
            locationPreview,
            setAppointmentDate,
            setAppointmentTime,
            setLocationPreview
        } = params;

        if (!messageText.trim() && attachmentUrls.length === 0 && !audioBlob && !recordingBlob) return;
        const targets = getTargets(selectedChatUser, selectedDepartment);
        if (targets.length === 0) {
            dispatchHubToast('الرجاء اختيار جهة اتصال أولاً.', 'info');
            return;
        }

        try {
            await sendMessage({
                targets,
                messageCategory: activeTab === 'chat' ? 'chat' : (activeTab || 'chat'),
                appointmentData: (activeTab === 'appointments') ? {
                    date: appointmentDate,
                    time: appointmentTime
                } : undefined,
                location: locationPreview ? { lat: locationPreview.lat, lng: locationPreview.lng } : undefined
            });
            setAppointmentDate('');
            setAppointmentTime('');
            setLocationPreview(null);
            cancelRecording();
            await loadCounts();
        } catch (error: any) {
            dispatchHubToast(`فشل الإرسال: ${error?.message || 'خطأ غير معروف'}`, 'error');
        }
    }, [selectedChatUser, selectedDepartment, sendMessage, activeTab, cancelRecording, loadCounts]);

    const handleStickerSelect = useCallback(async (stickerUrl: string) => {
        if (!selectedChatUser) return;
        const targets = getTargets(selectedChatUser, selectedDepartment);

        try {
            await sendMessage({
                targets,
                messageCategory: activeTab,
                stickerUrl
            });
        } catch (error: any) {
            dispatchHubToast(`فشل إرسال الملصق: ${error?.message || ''}`, 'error');
        }
    }, [selectedChatUser, selectedDepartment, sendMessage, activeTab]);

    const handleSendLocationDirect = useCallback(async (loc: { lat: number; lng: number }) => {
        if (!selectedChatUser) return;
        const targets = getTargets(selectedChatUser, selectedDepartment);

        try {
            await sendMessage({
                targets,
                messageCategory: activeTab,
                location: { lat: loc.lat, lng: loc.lng }
            });
            await loadCounts();
        } catch (error: any) {
            dispatchHubToast(`فشل إرسال الموقع: ${error?.message || ''}`, 'error');
        }
    }, [selectedChatUser, selectedDepartment, sendMessage, activeTab, loadCounts]);

    return {
        sendVoiceMessage,
        handleSendMedia,
        handleInlineSubmit,
        handleStickerSelect,
        handleSendLocationDirect
    };
}
