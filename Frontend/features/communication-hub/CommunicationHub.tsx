import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getApiClient } from '../../core/api/apiClient';
import { getHubStorage, getStoredSmartdashUser, setStoredSmartdashUser } from '../../core/integration/moduleHost';

// Hooks
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useHubMessages } from './hooks/useHubMessages';
import { useHubCounters } from './hooks/useHubCounters';
import { useHubIdentity } from './hooks/useHubIdentity';
import { useHubRealtime } from './hooks/useHubRealtime';
import { useHubProfile } from './hooks/useHubProfile';
import { useHubReadTracking } from './hooks/useHubReadTracking';
import { useHubComposer } from './hooks/useHubComposer';
import { useHubDataLoader } from './hooks/useHubDataLoader';
import { useHubUiState } from './hooks/useHubUiState';
import { useWallpaper } from './context/WallpaperContext';

// Theme & Chat Context (The Architecture Hinges)
import './styles/theme.css';
import { useTheme } from './context/ThemeContext';
import { useChat } from './context/ChatContext';
import { HubConnectionStatusBanner } from './components/common/HubConnectionStatusBanner';
import { HubNotificationStack } from './components/common/HubNotificationStack';
import { dispatchHubToast } from './utils/hubToastEvents';

// Services & Utils
import { hubService } from './services/hubService';
import { parseDateSafe, formatLastSeen, getTabTheme } from './utils/hubUtils';

// Components
import ChatInput from './components/input-area/ChatInput';
import MessageList from './components/message-list/MessageList';
import ReactionPicker from './components/message-list/ReactionPicker';
import ConversationList from './components/sidebar/ConversationList';
import ChatHeader from './components/chat-area/ChatHeader';
import MessageReactionDetails from './components/message-list/MessageReactionDetails';
import ChatFilterTabs from './components/sidebar/ChatFilterTabs';
import HubSidebarSection from './sections/HubSidebarSection';
import HubChatSection from './sections/HubChatSection';
import HubModals from './sections/HubModals';

// Extracted UI Components
import { RecordingUI } from './components/input-area/RecordingUI';
import { HubEmptyState } from './components/common/HubEmptyState';
import MediaPreviewScreen from './components/input-area/MediaPreviewScreen';
import { type MediaViewerData } from './components/common/FullScreenMediaViewer';

import type { CommunicationHubProps, LookUp, UserLookUp, HubTab } from './types/hub.types';

export default function CommunicationHub({ open, onClose, onCountsUpdate, isFullScreen, setIsFullScreen, isPinned, setIsPinned, widgetRef }: CommunicationHubProps & { isFullScreen: boolean, setIsFullScreen: (v: boolean) => void, isPinned: boolean, setIsPinned: (v: boolean) => void, widgetRef: React.RefObject<HTMLDivElement | null> }) {
    const [selectedChatUser, setSelectedChatUser] = useState<UserLookUp | null>(null);
    const [browserOnline, setBrowserOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [sessionBanner, setSessionBanner] = useState<string | null>(null);
    const [mediaUploadPercent, setMediaUploadPercent] = useState<number | null>(null);
    const [attachmentUploadPercent, setAttachmentUploadPercent] = useState<number | null>(null);
    const currentChatId = selectedChatUser ? String(selectedChatUser.Id) : '';

    const { currentDisplayId, currentUserRawId, currentUserWorkId, currentUserName, currentUserAvatar, refreshUser, isMe, resolveIdentityId } = useHubIdentity();
    const { resolvedTheme } = useTheme();
    const { handleRemoteTyping, remoteTypingByChat } = useChat();

    const [activeTab, setActiveTab] = useState<HubTab>(null);

    const {
        hubItems, setHubItems, isLoadingItems,
        messageText, setMessageText,
        attachmentUrls, setAttachmentUrls,
        recordingBlob, setRecordingBlob,
        isSubmitting, editingMessage, setEditingMessage,
        replyTo, setReplyTo,
        conversations, setConversations, isLoadingConversations,
        loadHubItems, loadConversations, sendMessage, deleteMessage, forwardMessage, markAsRead
    } = useHubMessages({
        currentDisplayId,
        currentUserRawId,
        activeTab
    });

    const {
        counts,
        unreadDeliveries,
        setUnreadDeliveries,
        loadCounts
    } = useHubCounters({
        currentDisplayId,
        onCountsUpdate
    });

    const { wallpaperUrl, opacity } = useWallpaper(currentChatId, String(currentDisplayId));

    const ui = useHubUiState();
    const {
        showWallpaperSettings, setShowWallpaperSettings,
        activeFilter, setActiveFilter,
        selectedDepartment, setSelectedDepartment,
        showAttachmentMenu, setShowAttachmentMenu,
        showEmojiPicker, setShowEmojiPicker,
        appointmentDate, setAppointmentDate,
        appointmentTime, setAppointmentTime,
        locationPreview, setLocationPreview,
        showLocationPicker, setShowLocationPicker,
        isUploadingFile, setIsUploadingFile,
        pendingMediaFiles, setPendingMediaFiles,
        expandedItemId, setExpandedItemId,
        activeViewerMedia, setActiveViewerMedia,
        activeMessageMenuId, setActiveMessageMenuId,
        showMediaGallery, setShowMediaGallery,
        userSearchTerm, setUserSearchTerm,
        chatSearchTerm, setChatSearchTerm,
        showChatSearch, setShowChatSearch,
        showInfoModal, setShowInfoModal,
        infoModalItem, setInfoModalItem,
        infoModalData, setInfoModalData,
        isLoadingInfo, setIsLoadingInfo,
        showForwardModal, setShowForwardModal,
        forwardingItem, setForwardingItem,
        isForwarding, setIsForwarding,
        reactionPickerData, setReactionPickerData,
        showReactionDetailsModal, setShowReactionDetailsModal,
        reactionDetailsItem, setReactionDetailsItem,
        reactionDetailsData, setReactionDetailsData,
        isLoadingReactionDetails, setIsLoadingReactionDetails,
        selectedReactionTab, setSelectedReactionTab,
        reactionDetailsPopupPos, setReactionDetailsPopupPos,
        popupPos, setPopupPos
    } = ui;

    const theme = React.useMemo(() => getTabTheme(activeTab), [activeTab]);

    const {
        departments,
        allUsers,
        setAllUsers,
        loadUsers,
        loadDepartments,
        filteredUsers,
        handleFullRefresh
    } = useHubDataLoader({
        open,
        activeTab,
        currentDisplayId: Number(currentDisplayId),
        isMe,
        loadCounts,
        loadConversations,
        loadHubItems,
        setAttachmentUrls
    });

    const typingSubtitle = useMemo(() => {
        if (!selectedChatUser || activeTab !== 'chat') return null;
        const room = String(selectedChatUser.Id);
        const typers = remoteTypingByChat[room];
        if (!typers?.size) return null;
        const others = [...typers].filter((id) => id !== String(currentDisplayId));
        if (others.length === 0) return null;
        const resolveName = (id: string) =>
            filteredUsers.find((u) => String(u.Id) === id)?.Name ||
            allUsers.find((u) => String(u.Id) === id)?.Name ||
            'مستخدم';
        if (others.length === 1) {
            return `(${resolveName(others[0])}) يكتب الآن…`;
        }
        const names = others.slice(0, 3).map(resolveName).join('، ');
        return `(${names}) يكتبون الآن…`;
    }, [selectedChatUser, activeTab, remoteTypingByChat, currentDisplayId, filteredUsers, allUsers]);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

    const emojiBtnRef = useRef<HTMLButtonElement | null>(null);
    const attachBtnRef = useRef<HTMLButtonElement | null>(null);

    // Form inputs state
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        scrollContainerRef,
        messagesEndRef,
        showScrollToBottom,
        scrollToBottom,
        handleScroll
    } = useHubReadTracking({
        open,
        activeTab,
        selectedChatUser,
        hubItems,
        isLoadingItems,
        currentDisplayId: Number(currentDisplayId),
        loadCounts,
        loadConversations,
        setHubItems,
        setConversations,
        setUnreadDeliveries
    });


    const {
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
    } = useHubRealtime({
        open,
        loadCounts,
        loadConversations,
        loadHubItems,
        onStatusUpdate: setHubItems,
        onReactionUpdate: setHubItems,
        onInfoModalUpdate: setInfoModalData,
        onRemoteTyping: handleRemoteTyping
    });

    useEffect(() => {
        const onOnline = () => setBrowserOnline(true);
        const onOffline = () => setBrowserOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    useEffect(() => {
        const onSessionExpired = () => {
            setSessionBanner('انتهت صلاحية الجلسة أو غير مصرّح لك. سجّل الدخول من جديد من الشاشة الرئيسية.');
        };
        window.addEventListener('hub:session-expired', onSessionExpired);
        return () => window.removeEventListener('hub:session-expired', onSessionExpired);
    }, []);

    const {
        showUserProfileModal, setShowUserProfileModal,
        userProfileData, setUserProfileData,
        isLoadingProfile,
        avatarInputRef,
        coverInputRef,
        isUploadingAvatar,
        isUploadingCover,
        profileCropData, setProfileCropData,
        openUserProfile,
        handleAvatarUpload,
        handleCoverUpload,
        handleProfileCropConfirm
    } = useHubProfile({
        refreshUser,
        currentDisplayId,
        setAllUsers,
        isMe
    });

    const {
        isRecording,
        isPaused,
        duration: recordingTime,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        stopAndSend,
        cancelRecording,
        audioBlob,
        setAudioBlob
    } = useVoiceRecorder({
        onSend: (blob) => sendVoiceMessage(blob)
    });

    // Sync Voice Recording blob with HubMessages state
    useEffect(() => {
        setRecordingBlob(audioBlob);
    }, [audioBlob, setRecordingBlob]);



    // Auto-fetch current user details to sync avatar
    useEffect(() => {
        if (open && currentUserRawId > 0) {
            const syncMyProfile = async () => {
                try {
                    const res = await hubService.getUserDetails(currentUserRawId);
                    if (res.data) {
                        const updatedData = res.data;
                        const uStr = getHubStorage().getItem('smartdash_user');
                        if (uStr || getStoredSmartdashUser()) {
                            const u = uStr ? JSON.parse(uStr) : getStoredSmartdashUser();
                            const merged = {
                                ...u,
                                ...updatedData,
                                profilePictureUrl: updatedData.AvatarUrl || updatedData.avatarUrl || updatedData.profilePictureUrl
                            };
                            setStoredSmartdashUser(merged);
                            // Force AuthContext to reload from localStorage
                            refreshUser();
                        }
                    }
                } catch (e) {
                    console.warn("Hub: Failed to sync current user profile", e);
                }
            };
            syncMyProfile();
        }
    }, [open, currentUserRawId, refreshUser]);


    useEffect(() => {
        if (open && isConnected && activeTab === 'chat' && selectedChatUser) {
            const chatId = selectedChatUser.Id.toString();
            joinRoom(chatId).catch(() => { });
        }
    }, [open, isConnected, activeTab, selectedChatUser, joinRoom]);

    useEffect(() => {
        if (open && isConnected) {
            joinGlobalChannel().catch(() => { });
            departments.forEach(dept => {
                if (dept.Id > 0) {
                    joinDepartmentChannel(dept.Id).catch(() => { });
                    joinDepartmentChat(dept.Id).catch(() => { });
                }
            });
        }
    }, [open, isConnected, departments, joinGlobalChannel, joinDepartmentChannel, joinDepartmentChat]);


    const {
        sendVoiceMessage,
        handleSendMedia,
        handleInlineSubmit,
        handleStickerSelect,
        handleSendLocationDirect
    } = useHubComposer({
        activeTab,
        selectedChatUser,
        selectedDepartment,
        sendMessage,
        loadCounts,
        cancelRecording,
        setPendingMediaFiles,
        onUploadProgress: setMediaUploadPercent
    });



    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setActiveMessageMenuId(null);
                setReactionPickerData({ id: null, rect: null, isSentByMe: false });
                setShowAttachmentMenu(false);
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        setActiveMessageMenuId(null);
        setReactionPickerData({ id: null, rect: null, isSentByMe: false });
        setShowAttachmentMenu(false);
        setShowEmojiPicker(false);
    }, [activeTab, selectedChatUser, showUserProfileModal, showForwardModal]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!open) return;
            if (isPinned) return;
            if (showUserProfileModal || showForwardModal || showInfoModal) return;

            const target = event.target as HTMLElement;
            if (!target) return;

            const fabBtn = document.getElementById('hub-fab-btn');
            const clickedOnFab = fabBtn?.contains(target);
            if (clickedOnFab) return;

            if (widgetRef.current && !widgetRef.current.contains(target)) {
                onClose();
            }
        };

        if (open && !isPinned) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, isPinned, onClose, showUserProfileModal, showForwardModal, showInfoModal, widgetRef]);


    const handleSelectChat = useCallback(async (user: UserLookUp) => {
        setSelectedChatUser(user);
        setShowUserProfileModal(false);
    }, []);

    const handleTabChange = useCallback((tab: HubTab) => {
        setActiveTab(tab);
        setSelectedChatUser(null);
        setActiveFilter('all'); // Reset filter to 'all' when switching tabs for a clean view

        // Removed manual loads: The useEffect will capture the activeTab change and fire sequentially
    }, []);

    const handleToggleFullScreen = useCallback(() => {
        setIsFullScreen(!isFullScreen);
    }, [isFullScreen, setIsFullScreen]);

    const handleTogglePinned = useCallback(() => {
        setIsPinned(!isPinned);
    }, [isPinned, setIsPinned]);

    const handleOpenProfile = useCallback(() => {
        openUserProfile(currentDisplayId);
    }, [currentDisplayId, openUserProfile]);

    const handleOpenWallpaperSettings = useCallback(() => {
        setShowWallpaperSettings(true);
    }, []);

    const handleToggleReaction = useCallback(async (messageId: number, reactionType: string) => {
        try {
            const res = await hubService.toggleReaction(messageId, resolveIdentityId('reaction'), reactionType);
            let updatedReactions: any[] | null = null;
            if (Array.isArray(res.data)) {
                updatedReactions = res.data;
            } else if (res.data) {
                updatedReactions = res.data.reactions || res.data.Reactions || res.data.data?.reactions || (Array.isArray(res.data.data) ? res.data.data : null);
            }

            if (updatedReactions !== null) {
                setHubItems(prev => prev.map(item => {
                    if (Number(item.Id || item.id) === Number(messageId)) {
                        return { ...item, Reactions: updatedReactions, reactions: updatedReactions };
                    }
                    return item;
                }));
            }

            const detailId = reactionDetailsItem?.Id || reactionDetailsItem?.id;
            if (showReactionDetailsModal && detailId && Number(detailId) === Number(messageId)) {
                const detailsRes = await hubService.getReactionDetails(messageId);
                setReactionDetailsData(detailsRes.data || []);
            }
        } catch (err) {
            console.error('Error toggling reaction:', err);
            dispatchHubToast('تعذر تحديث التفاعل. حاول مرة أخرى.', 'error');
        }
    }, [resolveIdentityId, reactionDetailsItem, showReactionDetailsModal]);

    const handleShowReactionDetails = useCallback(async (item: any, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setReactionDetailsPopupPos({
                top: rect.top - 120,
                left: Math.max(10, rect.left - 150)
            });
        }
        const msgId = item.Id || item.id;
        setSelectedReactionTab('all');
        setReactionDetailsItem(item);
        setShowReactionDetailsModal(true);
        setIsLoadingReactionDetails(true);
        try {
            const res = await hubService.getReactionDetails(msgId);
            setReactionDetailsData(res.data || []);
        } catch (err) {
            console.error('Error loading reaction details:', err);
            setReactionDetailsData([]);
        } finally {
            setIsLoadingReactionDetails(false);
        }
    }, []);

    const getFileName = useCallback((url: string) => {
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        return lastPart.replace(/^\d{17}_/, '');
    }, []);

    const getFileIconStable = useCallback((url: string) => null, []);

    const handleSetActiveReactionPickerId = useCallback((id: number | null, rect?: { top: number; left: number; width: number; height: number } | null, isSentMe?: boolean, item?: any) => {
        setReactionPickerData({ id, rect: rect || null, isSentByMe: !!isSentMe, item });
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        const mediaFiles: File[] = [];
        const docFiles: File[] = [];
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                mediaFiles.push(file);
            } else {
                docFiles.push(file);
            }
        });

        if (mediaFiles.length > 0) {
            setPendingMediaFiles(mediaFiles);
            if (fileInputRef.current && docFiles.length === 0) {
                fileInputRef.current.value = '';
            }
        }

        if (docFiles.length === 0) return;

        setIsUploadingFile(true);
        setAttachmentUploadPercent(0);
        try {
            const uploadedUrls: string[] = [];
            const n = docFiles.length;
            for (let i = 0; i < n; i++) {
                const formData = new FormData();
                formData.append('file', docFiles[i]);
                const res = await hubService.uploadAttachmentWithProgress(formData, (loaded, total) => {
                    const share = 100 / n;
                    const base = (i / n) * 100;
                    const pct = base + (loaded / Math.max(total, 1)) * share;
                    setAttachmentUploadPercent(Math.min(100, Math.round(pct)));
                });
                if (res.data?.url) uploadedUrls.push(res.data.url);
            }
            setAttachmentUrls(prev => [...prev, ...uploadedUrls]);
        } catch (error) {
            console.error('Upload failed:', error);
            dispatchHubToast('فشل رفع الملفات المستندة. حاول مجدداً.', 'error');
        } finally {
            setAttachmentUploadPercent(null);
            setIsUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };


    const handleToggleMedia = useCallback(() => {
        setShowMediaGallery(prev => !prev);
    }, []);

    const handleCloseChat = useCallback(() => {
        setSelectedChatUser(null);
        setShowMediaGallery(false);
    }, []);

    const handleRefreshItems = useCallback(() => {
        loadHubItems();
    }, [loadHubItems]);

    const handleReactionSelect = useCallback((emoji: string) => {
        handleToggleReaction(Number(reactionPickerData.id), emoji);
        setReactionPickerData({ id: null, rect: null, isSentByMe: false });
    }, [handleToggleReaction, reactionPickerData.id]);

    const handleRemoveAttachment = useCallback((idx: number) => {
        setAttachmentUrls(prev => prev.filter((_, i) => i !== idx));
    }, [setAttachmentUrls]);

    const handleRenderRecordingUI = useCallback((c: string, b: string, bg: string, h: string) => (
        <RecordingUI
            isRecording={isRecording} isPaused={isPaused} recordingTime={recordingTime} recordingBlob={audioBlob} isUploadingFile={isSubmitting} cancelRecording={cancelRecording} resumeRecording={resumeRecording} pauseRecording={pauseRecording} stopRecording={stopAndSend} uploadRecording={sendVoiceMessage} colorHex={c} borderColorClass={b} bgColorClass={bg} btnHoverClass={h}
        />
    ), [isRecording, isPaused, recordingTime, audioBlob, isSubmitting, cancelRecording, resumeRecording, pauseRecording, stopAndSend, sendVoiceMessage]);

    const handleDeleteMessage = useCallback(async (msg: any) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
        try {
            await deleteMessage(msg.Id || msg.id);
            loadCounts();
        } catch (error) {
            dispatchHubToast('حدث خطأ أثناء الحذف. حاول مرة أخرى.', 'error');
        }
    }, [deleteMessage, loadCounts]);

    const onInlineSubmit = useCallback(async () => {
        if (isSubmitting) return;
        await handleInlineSubmit({
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
        });
    }, [isSubmitting, handleInlineSubmit, messageText, attachmentUrls, audioBlob, recordingBlob, appointmentDate, appointmentTime, locationPreview]);


    const handleEmojiClick = (emojiObject: any) => {
        if (!messageInputRef.current) {
            setMessageText(prev => prev + emojiObject.emoji);
            return;
        }
        const cursorPosition = messageInputRef.current.selectionStart || messageText.length;
        const textBeforeCursorPosition = messageText.substring(0, cursorPosition);
        const textAfterCursorPosition = messageText.substring(cursorPosition, messageText.length);
        setMessageText(textBeforeCursorPosition + emojiObject.emoji + textAfterCursorPosition);
        setTimeout(() => {
            if (messageInputRef.current) {
                messageInputRef.current.selectionStart = cursorPosition + emojiObject.emoji.length;
                messageInputRef.current.selectionEnd = cursorPosition + emojiObject.emoji.length;
                messageInputRef.current.focus();
            }
        }, 10);
    };

    const onStickerSelect = useCallback(async (stickerUrl: string) => {
        await handleStickerSelect(stickerUrl);
        setShowEmojiPicker(false);
    }, [handleStickerSelect]);

    const onAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        await Promise.resolve(handleAvatarUpload(e));
    }, [handleAvatarUpload]);

    const onCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        await Promise.resolve(handleCoverUpload(e));
    }, [handleCoverUpload]);


    const onForwardMessage = async (targets: { type: string; id: string }[]) => {
        if (!forwardingItem) return;
        if (isForwarding) return;
        if (targets.length === 0) {
            dispatchHubToast('الرجاء اختيار مستلم لإعادة التوجيه.', 'info');
            return;
        }

        try {
            setIsForwarding(true);
            // Construct payload: we are forwarding the original message content
            // The dispatchMessage backend automatically handles this if we pass the right payload
            await forwardMessage(forwardingItem, targets);

            setShowForwardModal(false);
            setForwardingItem(null);
            loadCounts();
            // Refresh conversation list to show the new messages
            loadHubItems();
        } catch (error) {
            console.error('Forward error:', error);
            dispatchHubToast('فشل إعادة التوجيه. حاول مجدداً.', 'error');
        } finally {
            setIsForwarding(false);
        }
    };


    const mainContent = React.useMemo(() => {
        if (!activeTab) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--hub-panel-bg)] opacity-80 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-[var(--hub-text-main)]">مركز التواصل الذكي</h3>
                    <p className="text-sm text-[var(--hub-text-secondary)]">اختر تطبيقاً من الجانب</p>
                </div>
            );
        }

        if (!selectedChatUser) {
            if (isFullScreen) return <HubEmptyState activeTab={activeTab} />;
            return (
                <ConversationList
                    hubItems={hubItems} unreadDeliveries={unreadDeliveries} departments={departments} allUsers={filteredUsers} conversations={conversations} isLoadingConversations={isLoadingConversations} activeTab={activeTab} selectedChatUser={selectedChatUser} userSearchTerm={userSearchTerm} currentUserRawId={currentUserRawId} currentDisplayId={Number(currentDisplayId)} currentUserWorkId={currentUserWorkId} onlineUsers={onlineUsers} typingUsers={typingKeys} theme={theme} onSelectChat={handleSelectChat} formatLastSeen={formatLastSeen} activeFilter={activeFilter}
                />
            );
        }

        const currentMessages = chatSearchTerm.trim()
            ? hubItems.filter(m => (m.Message || '').toLowerCase().includes(chatSearchTerm.toLowerCase()))
            : hubItems;

        return (
            <div className="flex-1">
                <MessageList
                    hubItems={currentMessages} activeTab={activeTab} selectedChatUser={selectedChatUser} currentUserId={currentUserRawId} currentDisplayId={currentDisplayId} currentUserWorkId={currentUserWorkId} showMediaGallery={showMediaGallery} expandedItemId={expandedItemId} activeReactionPickerId={reactionPickerData.id} activeMessageMenuId={activeMessageMenuId} theme={theme} onExpand={setExpandedItemId} onMarkAsRead={markAsRead} onToggleReaction={handleToggleReaction} setActiveReactionPickerId={handleSetActiveReactionPickerId} setActiveMessageMenuId={setActiveMessageMenuId} setShowEmojiPicker={setShowEmojiPicker} setInfoModalItem={setInfoModalItem} setShowInfoModal={setShowInfoModal} setIsLoadingInfo={setIsLoadingInfo} setInfoModalData={setInfoModalData} setEditingMessage={setEditingMessage} setMessageText={setMessageText} handleDeleteMessage={handleDeleteMessage} setForwardingItem={setForwardingItem} setShowForwardModal={setShowForwardModal} loadUsers={loadUsers} loadDepartments={loadDepartments} setVideoLightboxUrl={(url: string | null) => { if (url) setActiveViewerMedia({ type: 'video', url }); else setActiveViewerMedia(null); }} handleShowReactionDetails={handleShowReactionDetails} openUserProfile={openUserProfile} replyTo={replyTo} setReplyTo={setReplyTo} getFileName={getFileName} getFileIcon={getFileIconStable} parseDateSafe={parseDateSafe} api={getApiClient()} messagesEndRef={messagesEndRef}
                    searchTerm={chatSearchTerm}
                    onOpenMediaViewer={(data: MediaViewerData) => setActiveViewerMedia(data)}
                />
            </div>
        );
    }, [activeTab, selectedChatUser, isFullScreen, hubItems, unreadDeliveries, departments, filteredUsers, conversations, isLoadingConversations, userSearchTerm, chatSearchTerm, currentUserRawId, currentDisplayId, currentUserWorkId, onlineUsers, typingKeys, theme, handleSelectChat, formatLastSeen, activeFilter, isLoadingItems, expandedItemId, reactionPickerData.id, activeMessageMenuId, markAsRead, handleToggleReaction, handleSetActiveReactionPickerId, setActiveMessageMenuId, setShowEmojiPicker, setInfoModalItem, setShowInfoModal, setIsLoadingInfo, setInfoModalData, setEditingMessage, setMessageText, handleDeleteMessage, setForwardingItem, setShowForwardModal, loadUsers, loadDepartments, setActiveViewerMedia, handleShowReactionDetails, openUserProfile, replyTo, setReplyTo, getFileName, getFileIconStable, parseDateSafe, messagesEndRef]);

    // We don't return null if !open, because we want the hooks to run in the background (SignalR, Counters etc)
    // The UI visibility is handled by the parent CommunicationHubWidget or by css classes.
    // if (!open) return null;



    return (
        <div
            className="w-full h-full flex flex-col overflow-hidden rounded-xl relative z-10 bg-transparent communication-hub-root"
            dir="rtl"
            data-theme={resolvedTheme}
        >
            <HubConnectionStatusBanner
                visible={open}
                browserOnline={browserOnline}
                sessionMessage={sessionBanner}
                onDismissSession={() => setSessionBanner(null)}
                isConnected={isConnected}
                isConnecting={!!isConnecting}
                connectionPhase={connectionPhase}
                onRetryRealtime={startConnection}
            />
            <div className="flex flex-row flex-1 min-h-0 overflow-hidden">
                    <HubSidebarSection
                        showWallpaperSettings={showWallpaperSettings}
                        isFullScreen={isFullScreen}
                        currentChatId={currentChatId}
                        currentDisplayId={Number(currentDisplayId)}
                        currentUserName={currentUserName}
                        activeTab={activeTab}
                        counts={counts}
                        isPinned={isPinned}
                        onTabChange={handleTabChange}
                        onClose={onClose}
                        onToggleFullScreen={handleToggleFullScreen}
                        onTogglePinned={handleTogglePinned}
                        onOpenProfile={handleOpenProfile}
                        onOpenWallpaperSettings={handleOpenWallpaperSettings}
                        onRefresh={handleFullRefresh}
                        isRefreshing={isLoadingItems}
                        currentUserAvatar={currentUserAvatar}
                        currentUserRawId={currentUserRawId}
                        setShowWallpaperSettings={setShowWallpaperSettings}
                    />
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

                    <HubChatSection
                        isFullScreen={isFullScreen}
                        activeTab={activeTab}
                        selectedChatUser={selectedChatUser}
                        showScrollToBottom={showScrollToBottom}
                        scrollToBottom={scrollToBottom}
                        scrollContainerRef={scrollContainerRef}
                        handleScroll={handleScroll}
                        fullscreenSidebar={
                            <div className="w-[380px] shrink-0 flex flex-col border-l border-[var(--hub-border)] bg-[var(--hub-panel-bg)] shadow-xl z-20 overflow-hidden">
                                <div className="p-5 bg-[var(--hub-header-bg)] border-b border-[var(--hub-border)]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-extrabold text-2xl text-[var(--hub-text-main)] tracking-tight flex items-center gap-2">
                                            <span>{activeTab === 'questions' ? 'الأسئلة' : activeTab === 'appointments' ? 'المواعيد' : activeTab === 'announcements' ? 'التعاميم' : 'الدردشات'}</span>
                                            <span className="text-sm font-bold opacity-60 bg-[var(--hub-bg)] px-2 py-0.5 rounded-lg mr-2 mr-auto">{currentUserName}</span>
                                        </h3>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><i className="fa fa-search text-xs" /></div>
                                        <input type="text" placeholder="ابحث عن اسم أو قسم..." className="w-full h-11 pr-11 pl-4 text-sm bg-[var(--hub-input-bg)] border-none rounded-xl shadow-sm focus:ring-2 transition-all text-right outline-none" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} dir="rtl" />
                                    </div>
                                    <div className="px-5 pb-2"><ChatFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} className="mb-4" /></div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--hub-panel-bg)] p-2">
                                    <ConversationList
                                        hubItems={hubItems} unreadDeliveries={unreadDeliveries} departments={departments} allUsers={filteredUsers} conversations={conversations} isLoadingConversations={isLoadingConversations} activeTab={activeTab} selectedChatUser={selectedChatUser} userSearchTerm={userSearchTerm} currentUserRawId={currentUserRawId} currentDisplayId={Number(currentDisplayId)} currentUserWorkId={currentUserWorkId} onlineUsers={onlineUsers} typingUsers={typingKeys} theme={theme} onSelectChat={handleSelectChat} formatLastSeen={formatLastSeen} activeFilter={activeFilter}
                                    />
                                </div>
                            </div>
                        }
                        header={
                            <ChatHeader
                                activeTab={activeTab} selectedChatUser={selectedChatUser} theme={theme} isOnline={!!selectedChatUser && onlineUsers.has(selectedChatUser.Id.toString())} isTyping={!!selectedChatUser && !!typingSubtitle} typingSubtitle={typingSubtitle} formatLastSeen={formatLastSeen} currentUserName={currentUserName} showMediaGallery={showMediaGallery} onToggleMedia={handleToggleMedia} onCloseChat={handleCloseChat} onOpenProfile={openUserProfile} userSearchTerm={userSearchTerm} onSearchChange={setUserSearchTerm} isFullScreen={isFullScreen} activeFilter={activeFilter} onFilterChange={setActiveFilter} onRefresh={handleRefreshItems} isRefreshing={isLoadingItems}
                                chatSearchTerm={chatSearchTerm} onChatSearchChange={setChatSearchTerm} showChatSearch={showChatSearch} onToggleChatSearch={() => setShowChatSearch(!showChatSearch)}
                            />
                        }
                        messageArea={
                            <>
                                <div className="absolute inset-0 z-0 pointer-events-none">
                                    <div
                                        className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                                        style={{
                                            backgroundImage: wallpaperUrl ? `url("${wallpaperUrl}")` : 'none',
                                            backgroundRepeat: wallpaperUrl?.includes('28719144-86dc0f70') ? 'repeat' : 'no-repeat',
                                            backgroundSize: wallpaperUrl?.includes('28719144-86dc0f70') ? '400px' : 'cover',
                                            backgroundPosition: 'center',
                                            opacity: opacity,
                                            filter: opacity > 0.8 ? 'none' : 'brightness(0.9)'
                                        }}
                                    />
                                </div>
                                {mainContent}
                                <ReactionPicker
                                    id={reactionPickerData.id} rect={reactionPickerData.rect} isSentByMe={reactionPickerData.isSentByMe} onSelect={handleReactionSelect} onClose={() => setReactionPickerData({ id: null, rect: null, isSentByMe: false })} onShowEmojiPicker={() => setShowEmojiPicker(true)}
                                />
                            </>
                        }
                        composer={
                            <>
                                {attachmentUploadPercent !== null ? (
                                    <div className="px-2 pt-1 shrink-0" dir="rtl">
                                        <div className="h-1 w-full rounded-full bg-[var(--hub-border)] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-[width] duration-150"
                                                style={{ width: `${attachmentUploadPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-[var(--hub-text-secondary)] mt-0.5 text-center">رفع المرفقات {attachmentUploadPercent}%</p>
                                    </div>
                                ) : null}
                                <ChatInput
                                    activeTab={activeTab} selectedChatUser={selectedChatUser} showMediaGallery={showMediaGallery} theme={theme} messageText={messageText} setMessageText={setMessageText} replyTo={replyTo} setReplyTo={setReplyTo} isSubmitting={isSubmitting} handleInlineSubmit={onInlineSubmit} onSendLocationDirect={handleSendLocationDirect} onOpenLocationPicker={() => setShowLocationPicker(true)} editingMessage={editingMessage} setEditingMessage={setEditingMessage} setActiveMessageMenuId={setActiveMessageMenuId} attachmentUrls={attachmentUrls} removeAttachment={handleRemoveAttachment} getFileName={getFileName} showAttachmentMenu={showAttachmentMenu} setShowAttachmentMenu={setShowAttachmentMenu} popupPos={popupPos} setPopupPos={setPopupPos} showEmojiPicker={showEmojiPicker} setShowEmojiPicker={setShowEmojiPicker} handleEmojiClick={handleEmojiClick}
                                    handleStickerSelect={onStickerSelect}
                                    locationPreview={locationPreview} setLocationPreview={setLocationPreview}
                                    isRecording={isRecording} recordingBlob={audioBlob} startRecording={startRecording} renderRecordingUI={handleRenderRecordingUI} messageInputRef={messageInputRef} fileInputRef={fileInputRef} attachBtnRef={attachBtnRef} emojiBtnRef={emojiBtnRef} typingTimeoutRef={typingTimeoutRef} notifyTyping={notifyTyping} appointmentDate={appointmentDate} setAppointmentDate={setAppointmentDate} appointmentTime={appointmentTime} setAppointmentTime={setAppointmentTime}
                                />
                            </>
                        }
                        mediaPreview={
                            pendingMediaFiles.length > 0 ? (
                                <MediaPreviewScreen
                                    files={pendingMediaFiles}
                                    onClose={() => setPendingMediaFiles([])}
                                    onSend={handleSendMedia}
                                    uploadProgress={mediaUploadPercent}
                                />
                            ) : null
                        }
                    />
                    <HubModals
                        showInfoModal={showInfoModal}
                        setShowInfoModal={setShowInfoModal}
                        infoModalItem={infoModalItem}
                        infoModalData={infoModalData}
                        isLoadingInfo={isLoadingInfo}
                        getFileName={getFileName}
                        showUserProfileModal={showUserProfileModal}
                        setShowUserProfileModal={setShowUserProfileModal}
                        userProfileData={userProfileData}
                        isMe={isMe}
                        isLoadingProfile={isLoadingProfile}
                        isUploadingAvatar={isUploadingAvatar}
                        isUploadingCover={isUploadingCover}
                        openUserProfile={openUserProfile}
                        coverInputRef={coverInputRef}
                        avatarInputRef={avatarInputRef}
                        handleAvatarUpload={onAvatarUpload}
                        handleCoverUpload={onCoverUpload}
                        handleSelectChat={handleSelectChat}
                        showForwardModal={showForwardModal}
                        setShowForwardModal={setShowForwardModal}
                        forwardingItem={forwardingItem}
                        allUsers={allUsers}
                        departments={departments}
                        onForwardMessage={onForwardMessage}
                        isForwarding={isForwarding}
                        showReactionDetailsModal={showReactionDetailsModal}
                        setShowReactionDetailsModal={setShowReactionDetailsModal}
                        setReactionDetailsPopupPos={setReactionDetailsPopupPos}
                        reactionDetailsData={reactionDetailsData}
                        isLoadingReactionDetails={isLoadingReactionDetails}
                        selectedReactionTab={selectedReactionTab}
                        setSelectedReactionTab={setSelectedReactionTab}
                        currentUserRawId={currentUserRawId}
                        reactionDetailsPopupPos={reactionDetailsPopupPos}
                        profileCropData={profileCropData}
                        handleProfileCropConfirm={handleProfileCropConfirm}
                        setProfileCropData={setProfileCropData}
                        activeViewerMedia={activeViewerMedia}
                        setActiveViewerMedia={setActiveViewerMedia}
                        showLocationPicker={showLocationPicker}
                        locationPreview={locationPreview}
                        setShowLocationPicker={setShowLocationPicker}
                        handleSendLocationDirect={handleSendLocationDirect}
                    />
            </div>
            <HubNotificationStack visible={open} />
        </div>
    );
}
