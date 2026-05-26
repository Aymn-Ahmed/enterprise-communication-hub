import React, { useMemo } from 'react';
import { FaImage, FaPlay } from 'react-icons/fa';
import MessageItem from './MessageItem';
import type { HubTab, MessageCategory } from '../../types/hub.types';
import { getFileExtension } from '../../utils/hubUtils';

interface MessageListProps {
    hubItems: any[];
    activeTab: HubTab;
    selectedChatUser: any | null;
    currentUserId: number | string;
    currentDisplayId: string;
    currentUserWorkId: number;
    showMediaGallery: boolean;
    expandedItemId: number | null;
    activeReactionPickerId: number | null;
    activeMessageMenuId: number | null;
    theme: any;
    onExpand: (id: number | null) => void;
    onMarkAsRead: (id: number) => void;
    onToggleReaction: (messageId: number, reaction: string) => void;
    setActiveReactionPickerId: (id: number | null, rect?: { top: number; left: number; width: number; height: number } | null, isSentByMe?: boolean, item?: any) => void;
    setActiveMessageMenuId: (id: number | null) => void;
    setShowEmojiPicker: (show: boolean) => void;
    setInfoModalItem: (item: any) => void;
    setShowInfoModal: (show: boolean) => void;
    setIsLoadingInfo: (loading: boolean) => void;
    setInfoModalData: (data: any) => void;
    setEditingMessage: (item: any) => void;
    setMessageText: (text: string) => void;
    handleDeleteMessage: (id: number) => void;
    setForwardingItem: (item: any) => void;
    setShowForwardModal: (show: boolean) => void;
    loadUsers: () => void;
    loadDepartments: () => void;
    setVideoLightboxUrl: (url: string | null) => void;
    handleShowReactionDetails: (item: any, e?: React.MouseEvent) => void;
    openUserProfile: (id: number | string) => void;
    getFileName: (url: string) => string;
    getFileIcon: (url: string) => React.ReactNode;
    parseDateSafe: (date: any) => Date;
    api: any;
    replyTo?: any | null;
    setReplyTo: (item: any | null) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    searchTerm?: string;
    onOpenMediaViewer?: (data: any) => void;
}

const MessageList: React.FC<MessageListProps> = ({
    hubItems,
    activeTab,
    selectedChatUser,
    currentUserId,
    currentDisplayId,
    currentUserWorkId,
    showMediaGallery,
    expandedItemId,
    activeReactionPickerId,
    activeMessageMenuId,
    theme,
    onExpand,
    onMarkAsRead,
    onToggleReaction,
    setActiveReactionPickerId,
    setActiveMessageMenuId,
    setShowEmojiPicker,
    setInfoModalItem,
    setShowInfoModal,
    setIsLoadingInfo,
    setInfoModalData,
    setEditingMessage,
    setMessageText,
    handleDeleteMessage,
    setForwardingItem,
    setShowForwardModal,
    loadUsers,
    loadDepartments,
    setVideoLightboxUrl,
    handleShowReactionDetails,
    openUserProfile,
    getFileName,
    getFileIcon,
    parseDateSafe,
    api,
    replyTo,
    setReplyTo,
    messagesEndRef,
    searchTerm = '',
    onOpenMediaViewer
}) => {
    const messagesArray = useMemo(() => {
        if (!selectedChatUser) return hubItems;

        return hubItems.filter(item => {
            const otherDisplayId = Number(selectedChatUser.Id);
            const createdBy = Number(item.CreatedBy ?? item.createdBy ?? item.FromUserId ?? item.fromUserId ?? 0);
            const tType = item.TargetType || item.targetType || '';
            const tIdRaw = String(item.TargetId || item.targetId || '0');

            // Category Filtering - VERY IMPORTANT
            let isMatchTab = true;
            const isAnnouncement = (item.Title || item.title || '').includes('[تعميم]') || (item.MessageType || item.messageType) === 'Announcement';
            const isAppointment = (item.Title || item.title || '').includes('[موعد]') || !!(item.CustomerName || item.customerName) || (item.MessageType || item.messageType) === 'Schedule';
            const isQuestion = !isAnnouncement && !isAppointment && ((item.DepartmentId || item.departmentId || 0) > 0 || (item.MessageType || item.messageType) === 'Question');
            const mType = String(item.MessageType || item.messageType || '').toLowerCase();
            const isChat = (!isAnnouncement && !isAppointment && !isQuestion && mType !== 'dev') || mType === 'sticker' || mType === 'location';

            if (activeTab === 'questions' && !isQuestion) isMatchTab = false;
            if (activeTab === 'appointments' && !isAppointment) isMatchTab = false;
            if (activeTab === 'announcements' && !isAnnouncement) isMatchTab = false;
            if (activeTab === 'chat' && !isChat) isMatchTab = false;

            if (!isMatchTab) return false;

            // Handling Selection by Type
            if (selectedChatUser.Type === 'Global') {
                return tType === 'Global';
            }
            if (selectedChatUser.Type === 'Department') {
                return tType === 'Department' && tIdRaw === String(selectedChatUser.WorkId || 0);
            }

            // Standard 1-on-1 logic or Multi-recipient
            const recipientIds = tIdRaw.split(',').map((x: string) => Number(x.trim())).filter(Boolean);
            const iSentToThem = (createdBy === Number(currentUserId) || String(createdBy) === currentDisplayId) && recipientIds.includes(otherDisplayId);
            const theySentToMe = createdBy === otherDisplayId && (recipientIds.includes(Number(currentUserId)) || recipientIds.includes(Number(currentDisplayId)) || Number(item.ToUserId || item.toUserId) === Number(currentUserId));

            if (iSentToThem || theySentToMe) return true;

            // Fallback for older items
            const toUserId = Number(item.ToUserId ?? item.toUserId ?? 0);
            return (createdBy === Number(currentUserId) || String(createdBy) === currentDisplayId) && (toUserId === otherDisplayId || String(item.ToUserId || item.toUserId) === String(otherDisplayId))
                || (createdBy === otherDisplayId && (toUserId === Number(currentUserId) || toUserId === Number(currentDisplayId)));
        }).sort((a: any, b: any) => {
            const tA = typeof a.CreatedDate === 'number' ? a.CreatedDate : (new Date(a.CreatedDate || a.CreatedAt || 0).getTime() / 1000);
            const tB = typeof b.CreatedDate === 'number' ? b.CreatedDate : (new Date(b.CreatedDate || b.CreatedAt || 0).getTime() / 1000);
            if (tA === tB) {
                return (a.Id || a.id || 0) - (b.Id || b.id || 0);
            }
            return tA - tB;
        });
    }, [hubItems, selectedChatUser, activeTab, currentUserId]);

    if (showMediaGallery) {
        const mediaItems = messagesArray.filter(item => item.AttachmentUrl || item.attachmentUrl);
        if (mediaItems.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-500 h-full mt-10">
                    <FaImage className="text-5xl mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium">لا توجد وسائط في هذه المحادثة</p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
                {mediaItems.map((item, idx) => {
                    const url = item.AttachmentUrl || item.attachmentUrl;
                    const ext = getFileExtension(url);
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                    const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(ext);
                    return (
                        <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:ring-2 hover:ring-purple-400 transition-all group flex items-center justify-center"
                        >
                            {isImage ? (
                                <img src={url} alt="Media" className="w-full h-full object-cover" />
                            ) : isVideo ? (
                                <>
                                    <video src={url} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                        <FaPlay className="text-white text-2xl drop-shadow-md" />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4">
                                    <div className="text-4xl mb-2 text-gray-400 group-hover:text-purple-500 transition-colors">
                                        {getFileIcon(url)}
                                    </div>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" dir="ltr">{getFileName(url)}</span>
                                </div>
                            )}
                        </a>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={`flex flex-col min-h-full justify-end w-full animate-chat-fade ${activeTab && selectedChatUser ? "space-y-3" : "space-y-3"}`}>
            <div className="flex-1" /> {/* Spacer to push messages down */}
            {messagesArray.map((item, idx) => (
                <MessageItem
                    key={item.Id || item.id || idx}
                    item={item}
                    idx={idx}
                    activeTab={activeTab}
                    currentUserId={currentUserId}
                    currentDisplayId={currentDisplayId}
                    selectedChatUser={selectedChatUser}
                    expandedItemId={expandedItemId}
                    activeReactionPickerId={activeReactionPickerId}
                    activeMessageMenuId={activeMessageMenuId}
                    theme={theme}
                    onExpand={onExpand}
                    onMarkAsRead={onMarkAsRead}
                    onToggleReaction={onToggleReaction}
                    setActiveReactionPickerId={setActiveReactionPickerId}
                    setActiveMessageMenuId={setActiveMessageMenuId}
                    setReplyTo={setReplyTo}
                    setShowEmojiPicker={setShowEmojiPicker}
                    setInfoModalItem={setInfoModalItem}
                    setShowInfoModal={setShowInfoModal}
                    setIsLoadingInfo={setIsLoadingInfo}
                    setInfoModalData={setInfoModalData}
                    setEditingMessage={setEditingMessage}
                    setMessageText={setMessageText}
                    handleDeleteMessage={handleDeleteMessage}
                    setForwardingItem={setForwardingItem}
                    setShowForwardModal={setShowForwardModal}
                    loadUsers={loadUsers}
                    loadDepartments={loadDepartments}
                    setVideoLightboxUrl={setVideoLightboxUrl}
                    handleShowReactionDetails={handleShowReactionDetails}
                    openUserProfile={openUserProfile}
                    getFileName={getFileName}
                    parseDateSafe={parseDateSafe}
                    api={api}
                    searchTerm={searchTerm}
                    onOpenMediaViewer={onOpenMediaViewer}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};
export default React.memo(MessageList);
