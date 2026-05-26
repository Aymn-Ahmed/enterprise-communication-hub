import React, { useRef } from 'react';
import {
    FaReply, FaTrashAlt, FaForward, FaRegSmile, FaCheck, FaCheckDouble,
    FaRegClock, FaCalendarAlt, FaChevronDown, FaMapMarkerAlt
} from 'react-icons/fa';
import type { HubTab } from '../../types/hub.types';
import MessageAttachments from './MessageAttachments';
import MessageStatus from './MessageStatus';
import MessageActionsMenu from './MessageActionsMenu';
import MessageReactions from './MessageReactions';
import PortalMenu from '../common/PortalMenu';
import UserAvatar from '../common/UserAvatar';
import { getNormalizedMessageType } from '../../utils/hubSelectors';

interface MessageItemProps {
    item: any;
    idx: number;
    activeTab: HubTab;
    currentUserId: string | number;
    currentDisplayId: string;
    selectedChatUser: any;
    expandedItemId: number | null;
    activeReactionPickerId: number | string | null;
    activeMessageMenuId: number | null;
    theme: any;
    // Actions
    onExpand: (idx: number | null) => void;
    onMarkAsRead: (item: any) => void;
    onToggleReaction: (id: any, emoji: string) => void;
    setActiveReactionPickerId: (id: any, rect?: { top: number; left: number; width: number; height: number } | null, isSentByMe?: boolean, item?: any) => void;
    setActiveMessageMenuId: (id: number | null) => void;
    setShowEmojiPicker: (show: boolean) => void;
    setInfoModalItem: (item: any) => void;
    setShowInfoModal: (show: boolean) => void;
    setIsLoadingInfo: (loading: boolean) => void;
    setInfoModalData: (data: any[]) => void;
    setEditingMessage: (item: any) => void;
    setMessageText: (text: string) => void;
    handleDeleteMessage: (item: any) => void;
    setForwardingItem: (item: any) => void;
    setShowForwardModal: (show: boolean) => void;
    loadUsers: () => void;
    loadDepartments: () => void;
    setVideoLightboxUrl: (url: string) => void;
    handleShowReactionDetails: (item: any, e?: React.MouseEvent) => void;
    openUserProfile: (id: any) => void;
    // Helpers
    getFileName: (url: string) => string;
    parseDateSafe: (date: any) => Date;
    api: any;
    setReplyTo: (item: any | null) => void;
    searchTerm?: string;
    onOpenMediaViewer?: (data: any) => void;
}

import { useWallpaper } from '../../context/WallpaperContext';

const MessageItem: React.FC<MessageItemProps> = (props) => {
    const {
        item, idx, activeTab, currentUserId, currentDisplayId, selectedChatUser,
        expandedItemId, activeReactionPickerId, activeMessageMenuId, theme,
        onExpand, onMarkAsRead, onToggleReaction, setActiveReactionPickerId,
        setActiveMessageMenuId, setShowEmojiPicker, setInfoModalItem,
        setShowInfoModal, setIsLoadingInfo, setInfoModalData, setEditingMessage,
        setMessageText, handleDeleteMessage, setForwardingItem, setShowForwardModal,
        loadUsers, loadDepartments, setVideoLightboxUrl, handleShowReactionDetails,
        openUserProfile, getFileName, parseDateSafe, api, setReplyTo,
        searchTerm = '',
        onOpenMediaViewer
    } = props;

    // Fetch dynamic theme colors
    const { bubbleColor, textColor, peerBubbleColor, peerTextColor } = useWallpaper(
        selectedChatUser ? String(selectedChatUser.Id) : '',
        String(currentDisplayId)
    );

    const isExpanded = expandedItemId === idx;
    const bubbleRef = React.useRef<HTMLDivElement>(null);
    const optionsBtnRef = useRef<HTMLButtonElement>(null);

    const normalizedType = getNormalizedMessageType(item);
    const isAnnouncement = normalizedType === 'Announcement';
    const isAppointment = normalizedType === 'Schedule';
    const isQuestion = normalizedType === 'Question';
    const isSticker = normalizedType === 'Sticker';
    const isLocation = normalizedType === 'Location';

    const tid = String(item.TargetId || item.targetId || '').trim();
    const rawTidCount = (tid && tid !== 'null' && tid !== 'undefined') ? tid.split(',').filter(x => x && x !== 'null').length : 0;
    const actualRecipients = Number(item.RecipientsCount || 0) || rawTidCount;
    const isGlobal = (item.TargetType === 'Global' || item.targetType === 'Global');
    const isDept = (item.TargetType === 'Department' || item.targetType === 'Department');
    const isGroupMessage = (actualRecipients > 1) || isGlobal || isDept;

    const createdBy = item.CreatedBy ?? item.createdBy ?? item.FromUserId ?? item.fromUserId ?? 0;
    const isSentByMe = (Number(currentUserId) > 0 && Number(createdBy) === Number(currentUserId)) ||
        (String(createdBy) === currentDisplayId);

    const highlightContent = (text: string, term: string) => {
        if (!term.trim()) return text;
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) => 
            part.toLowerCase() === term.toLowerCase() 
                ? <span key={i} className="bg-yellow-300 dark:bg-yellow-600 text-black px-0.5 rounded font-bold">{part}</span> 
                : part
        );
    };

    // Dynamic Style Overrides
    const customStyle: React.CSSProperties = {};
    const textStyle: React.CSSProperties = {};
    
    if (isSentByMe) {
        if (bubbleColor) customStyle.backgroundColor = bubbleColor;
        if (textColor) textStyle.color = textColor;
    } else {
        if (peerBubbleColor) customStyle.backgroundColor = peerBubbleColor;
        if (peerTextColor) textStyle.color = peerTextColor;
    }

    let bubbleBg = isSentByMe ? 'bg-[#D9FDD3] dark:bg-[#005C4B] border-[#CDEFC6] dark:border-[#004A3C]' : 'bg-[var(--hub-panel-bg)] border-[var(--hub-border)]';
    
    if (isAnnouncement || activeTab === 'announcements') {
        bubbleBg = 'bg-[var(--hub-announcement-bg)] border-[var(--hub-announcement-border)]';
    } else if (isAppointment || activeTab === 'appointments') {
        bubbleBg = 'bg-[var(--hub-schedule-bg)] border-[var(--hub-schedule-border)]';
    } else if (isQuestion || activeTab === 'questions') {
        bubbleBg = 'bg-[var(--hub-question-bg)] border-[var(--hub-question-border)]';
    } else if (isGroupMessage && !isSentByMe) {
        bubbleBg = 'bg-[#FDF4E3] dark:bg-[#3E2B15] border-[#FDEAC1] dark:border-[#5C4524]';
    }

    const reactionsArray = (item.Reactions || item.reactions || []);
    const hasMsgReactions = Array.isArray(reactionsArray) && reactionsArray.length > 0;
    const bMargin = hasMsgReactions ? 'mb-4' : 'mb-1';

    let bubbleClass = `relative p-3 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer text-right flex flex-col items-start ${isExpanded ? 'bg-blue-50/30' : bubbleBg} ${bMargin}`;

    // Unified Bubble Logic: All tabs now use the bubble layout when a chat user is selected
    if (selectedChatUser) {
        if (isGroupMessage && isSentByMe) {
            bubbleClass = `relative p-2 pb-1 rounded-2xl rounded-tl-sm shadow-[0_1px_1px_rgba(0,0,0,0.1)] transition-all cursor-pointer text-right flex flex-col bg-[var(--msg-sent-bg)] border border-[var(--hub-border)] self-end max-w-[85%] min-w-[100px] ${bMargin}`;
        } else if (isGroupMessage && !isSentByMe) {
            bubbleClass = `relative p-2 pb-1 rounded-2xl rounded-tr-sm shadow-[0_1px_1px_rgba(0,0,0,0.1)] transition-all cursor-pointer text-right flex flex-col bg-[var(--msg-received-bg)] border border-[var(--hub-border)] self-start max-w-[85%] min-w-[100px] ${bMargin}`;
        } else if (isSentByMe) {
            bubbleClass = `relative p-2 pb-1 rounded-2xl rounded-tl-sm shadow-[0_1px_1px_rgba(0,0,0,0.1)] transition-all cursor-pointer text-right flex flex-col bg-[var(--msg-sent-bg)] border border-[var(--hub-border)] self-end max-w-[85%] min-w-[100px] ${bMargin}`;
        } else {
            bubbleClass = `relative p-2 pb-1 rounded-2xl rounded-tr-sm shadow-[0_1px_1px_rgba(0,0,0,0.1)] transition-all cursor-pointer text-right flex flex-col bg-[var(--msg-received-bg)] border border-[var(--hub-border)] self-start max-w-[85%] min-w-[100px] ${bMargin}`;
        }

        // Apply distinct tints for special types to maintain visual context in unified chat
        if (isAnnouncement) {
            bubbleClass = bubbleClass.replace('bg-[var(--msg-sent-bg)]', 'bg-[var(--hub-announcement-bg)]').replace('bg-[var(--msg-received-bg)]', 'bg-[var(--hub-announcement-bg)]');
            bubbleClass = bubbleClass.replace('border-[var(--hub-border)]', 'border-[var(--hub-announcement-border)]');
        } else if (isAppointment) {
            bubbleClass = bubbleClass.replace('bg-[var(--msg-sent-bg)]', 'bg-[var(--hub-schedule-bg)]').replace('bg-[var(--msg-received-bg)]', 'bg-[var(--hub-schedule-bg)]');
            bubbleClass = bubbleClass.replace('border-[var(--hub-border)]', 'border-[var(--hub-schedule-border)]');
        } else if (isQuestion) {
            bubbleClass = bubbleClass.replace('bg-[var(--msg-sent-bg)]', 'bg-[var(--hub-question-bg)]').replace('bg-[var(--msg-received-bg)]', 'bg-[var(--hub-question-bg)]');
            bubbleClass = bubbleClass.replace('border-[var(--hub-border)]', 'border-[var(--hub-question-border)]');
        }

        if (isSticker) {
            bubbleClass = `relative p-2 transition-all cursor-pointer flex flex-col items-center self-${isSentByMe ? 'end' : 'start'} max-w-[220px] ${bMargin} bg-transparent border-none shadow-none hover:bg-black/5 dark:hover:bg-white/5 rounded-3xl`;
        }

        if (isExpanded) bubbleClass += ' brightness-95';
    } else {
        bubbleClass = `relative p-4 rounded-xl border shadow-md transition-all cursor-pointer text-right flex flex-col items-start ${isExpanded ? 'bg-blue-50/50' : bubbleBg} max-w-[650px] mx-auto w-full ${bMargin}`;
    }


    // Long press and interaction logic
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [isLongPress, setIsLongPress] = React.useState(false);

    const handleStart = () => {
        timerRef.current = setTimeout(() => {
            setIsLongPress(true);
            const mId = Number(item.Id || item.id);
            const rect = bubbleRef.current?.getBoundingClientRect();
            if (rect) {
                setActiveReactionPickerId(mId, rect, isSentByMe, item);
            }
        }, 600);
    };

    const handleEnd = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleClick = (e: React.MouseEvent) => {
        if (isLongPress) {
            setIsLongPress(false);
            return;
        }

        const mId = Number(item.Id || item.id);
        const isExpandedNow = expandedItemId === idx;

        // If the picker is open, close it. Otherwise handle expand
        if (Number(activeReactionPickerId) === mId) {
            setActiveReactionPickerId(null);
        } else {
            onExpand(isExpandedNow ? null : idx);
            if (!isExpandedNow) {
                onMarkAsRead(item);
            }
        }
    };

    const handleReactionTrigger = (e: React.MouseEvent) => {
        e.stopPropagation();
        const mId = Number(item.Id || item.id);
        const rect = bubbleRef.current?.getBoundingClientRect();
        if (rect) {
            setActiveReactionPickerId(Number(activeReactionPickerId) === mId ? null : mId, rect, isSentByMe, item);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const mId = Number(item.Id || item.id);
        const rect = bubbleRef.current?.getBoundingClientRect();
        if (rect) {
            setActiveReactionPickerId(mId, rect, isSentByMe, item);
        }
    };

    const entranceAnim = isSentByMe 
        ? "animate-message-sent"
        : "animate-message-received";

    return (
        <div className={`flex w-full ${isSentByMe ? 'justify-end' : 'justify-start'} items-end gap-2 px-1 ${entranceAnim}`}>
            {!isSentByMe && selectedChatUser && (
                <UserAvatar
                    name={item.FromUserName}
                    url={item.FromUserAvatarUrl}
                    userId={createdBy}
                    size="xs"
                    className="mb-1 cursor-pointer hover:scale-110"
                    onClick={() => openUserProfile(createdBy)}
                />
            )}
            <div
                ref={bubbleRef}
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                onContextMenu={handleContextMenu}
                onClick={handleClick}
                className={`${bubbleClass} ${bubbleBg}`}
                style={customStyle}
            >

                {selectedChatUser ? (
                    <div className="relative pb-3 w-full group/msg">
                        {/* Header Info for Groups or Types */}
                        {!isSticker && (
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5 order-first">
                                    {isQuestion && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded-lg flex items-center gap-1 font-bold">❓ سؤال</span>}
                                    {isAnnouncement && <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 px-1.5 py-0.5 rounded-lg flex items-center gap-1 font-bold">📢 تعميم</span>}
                                    {isAppointment && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.5 rounded-lg flex items-center gap-1 font-bold">📅 موعد</span>}
                                </div>

                                {!isSentByMe && (isGroupMessage || isQuestion || isAnnouncement) && (
                                    <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 mr-1 hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); openUserProfile(createdBy); }}>
                                        {item.FromUserName || 'مستخدم'}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Unified Actions Menu Trigger - WhatsApp Style side positioning */}
                        <div className={`msg-options-wrapper absolute top-2 ${isSentByMe ? 'right-[-45px]' : 'left-[-45px]'} z-10 flex flex-col items-center gap-1 transition-all duration-200 ${activeMessageMenuId === idx || Number(activeReactionPickerId) === Number(item.Id || item.id) ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100 translate-y-1 group-hover/msg:translate-y-0'}`}>
                            <button
                                onClick={handleReactionTrigger}
                                className={`p-1.5 rounded-full transition-all shadow-sm bg-white/60 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 ${Number(activeReactionPickerId) === Number(item.Id || item.id) ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/40' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white hover:scale-110 active:scale-95'}`}
                                title="تفاعل"
                            >
                                <FaRegSmile size={14} />
                            </button>
                            <button
                                ref={optionsBtnRef}
                                onClick={(e) => { e.stopPropagation(); setActiveMessageMenuId(idx); }}
                                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all shadow-sm bg-white/60 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 hover:scale-110 active:scale-95"
                                title="خيارات"
                            >
                                <FaChevronDown size={12} />
                            </button>
                            {activeMessageMenuId === idx && (
                                <PortalMenu
                                    anchorRef={optionsBtnRef}
                                    onClose={() => setActiveMessageMenuId(null)}
                                    minWidth="176px"
                                >
                                    <MessageActionsMenu
                                        item={item}
                                        isSentByMe={isSentByMe}
                                        api={api}
                                        onClose={() => setActiveMessageMenuId(null)}
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
                                        setReplyTo={setReplyTo}
                                    />
                                </PortalMenu>
                            )}
                        </div>

                        <MessageAttachments
                            attachmentUrl={item.AttachmentUrl || item.attachmentUrl}
                            theme={theme}
                            isSentByMe={isSentByMe}
                            setVideoLightboxUrl={setVideoLightboxUrl}
                            getFileName={getFileName}
                            onOpenMediaViewer={onOpenMediaViewer}
                        />


                        {/* Quoted Message (Reply) */}
                        {item.replyTo && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const targetId = item.replyTo.id;
                                    const element = document.getElementById(`msg-${targetId}`);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
                                        setTimeout(() => element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'), 2000);
                                    }
                                }}
                                className="mb-2 p-2 bg-[var(--hub-hover)] border-r-4 border-[var(--hub-accent)] rounded-lg text-right cursor-pointer hover:bg-[var(--hub-active)] transition-colors"
                                dir="rtl"
                            >
                                <div className="text-[11px] font-black text-[var(--hub-accent)] mb-0.5">
                                    {item.replyTo.sender}
                                </div>
                                <div className="text-xs text-[var(--hub-text-secondary)] truncate">
                                    {item.replyTo.text || (item.replyTo.attachments ? "مرفق" : "رسالة")}
                                </div>
                            </div>
                        )}

                        <div id={`msg-${item.Id || item.id}`} className="text-[15px] leading-relaxed text-[var(--hub-text-main)] whitespace-pre-wrap break-words text-right relative pb-0.5 pr-1" dir="auto" style={{ wordBreak: "break-word", ...textStyle }}>
                            {isAppointment ? (
                                <div className="flex flex-col min-w-[200px] mt-1 pt-0.5">
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded cursor-default border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                                            <FaCalendarAlt size={16} className="text-emerald-700 dark:text-emerald-400 opacity-90" />
                                        </div>
                                        <span className="font-black text-base text-[var(--hub-text-main)] leading-tight">
                                            {highlightContent(item.Name || item.name || item.Message || item.message || item.Title || item.title || "تفاصيل الموعد", searchTerm)}
                                        </span>
                                    </div>
                                    <div className="bg-[var(--hub-hover)] dark:bg-black/20 rounded-xl p-3 border border-[var(--hub-border)] flex flex-col gap-2.5 shadow-sm">
                                        {(item.date || item.Date) && (
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-[11px] font-bold text-[var(--hub-text-secondary)] uppercase tracking-wider">التاريخ</span>
                                                <div className="flex items-center gap-1.5 bg-[var(--hub-bg)] px-2 py-0.5 rounded text-[15px] font-black text-[var(--hub-text-main)]" dir="ltr">
                                                    <FaCalendarAlt size={12} className="text-emerald-500/70" />
                                                    {item.date || item.Date}
                                                </div>
                                            </div>
                                        )}
                                        {(item.date || item.Date) && (item.time || item.Time) && (
                                            <div className="h-px w-full bg-[var(--hub-border)] opacity-60"></div>
                                        )}
                                        {(item.time || item.Time) && (
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-[11px] font-bold text-[var(--hub-text-secondary)] uppercase tracking-wider">الوقت</span>
                                                <div className="flex items-center gap-1.5 bg-[var(--hub-bg)] px-2 py-0.5 rounded text-[15px] font-black text-[var(--hub-text-main)]" dir="ltr">
                                                    <FaRegClock size={12} className="text-emerald-500/70" />
                                                    {item.time || item.Time}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : !isSticker ? (
                                <>{highlightContent(item.Name || item.name || item.Message || item.message || item.Notes || item.notes || "", searchTerm)}</>
                            ) : null}
                            {isSticker && (
                                <div className="sticker-container animate-in zoom-in duration-300 py-2">
                                    {(() => {
                                        let stickerUrl = item.AttachmentUrl || item.attachmentUrl;
                                        if (!stickerUrl && item.Payload) {
                                            try {
                                                const p = typeof item.Payload === 'string' ? JSON.parse(item.Payload) : item.Payload;
                                                stickerUrl = p?.attachments || p?.file;
                                            } catch (e) {}
                                        }
                                        return (
                                            <img 
                                                src={stickerUrl} 
                                                alt="Sticker" 
                                                className="w-[180px] h-[180px] object-contain drop-shadow-2xl"
                                            />
                                        );
                                    })()}
                                </div>
                            )}
                            {isLocation && (
                                <div className="location-container mt-2 rounded-[18px] border border-[var(--msg-received-bg)] dark:border-white/5 bg-white dark:bg-black/20 overflow-hidden shadow-sm transition-all hover:shadow-md max-w-[280px]">
                                    {/* Map Preview Image */}
                                    <div className="relative h-[140px] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const lat = (item.Payload as any)?.latitude || (item.payload as any)?.latitude;
                                            const lng = (item.Payload as any)?.longitude || (item.payload as any)?.longitude;
                                            if (lat != null && lng != null && onOpenMediaViewer) {
                                                onOpenMediaViewer({
                                                    type: 'location',
                                                    lat,
                                                    lng,
                                                    senderName: isSentByMe ? 'أنت' : (item.FromUserName || item.fromUserName || selectedChatUser?.Name),
                                                    timestamp: parseDateSafe(item.CreatedAt || item.createdAt)?.toLocaleTimeString()
                                                });
                                            }
                                        }}
                                    >
                                        <img 
                                            src={`https://static-maps.yandex.ru/1.x/?ll=${(item.Payload as any)?.longitude || (item.payload as any)?.longitude},${(item.Payload as any)?.latitude || (item.payload as any)?.latitude}&z=13&l=map&size=450,250&pt=${(item.Payload as any)?.longitude || (item.payload as any)?.longitude},${(item.Payload as any)?.latitude || (item.payload as any)?.latitude},pm2rdm`} 
                                            alt="Map Preview" 
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
                                        {/* Pin Animation Effect */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping opacity-75"></div>
                                        </div>
                                    </div>

                                    {/* Location Info */}
                                    <div className="p-3 bg-white dark:bg-[#111b21] flex items-center justify-between gap-2">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[13.5px] font-bold text-[#111b21] dark:text-[#e9edef] truncate">موقعي الحالي</span>
                                            <span className="text-[11px] text-[#667781] dark:text-[#8696a0] font-mono">
                                                {((item.Payload as any)?.latitude || (item.payload as any)?.latitude)?.toFixed(5)}, {((item.Payload as any)?.longitude || (item.payload as any)?.longitude)?.toFixed(5)}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const lat = (item.Payload as any)?.latitude || (item.payload as any)?.latitude;
                                                const lng = (item.Payload as any)?.longitude || (item.payload as any)?.longitude;
                                                if (lat != null && lng != null) {
                                                    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                                                }
                                            }}
                                            className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all active:scale-90 flex-shrink-0"
                                            title="فتح في الخرائط"
                                        >
                                            <FaMapMarkerAlt size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Container - Clean Layout */}
                        <div className={`flex items-center gap-1 mt-1 justify-end opacity-60 ${isSticker ? 'absolute bottom-2 ' + (isSentByMe ? 'right-2' : 'left-2') + ' bg-black/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-white' : ''}`} dir="ltr">
                            <MessageStatus
                                item={item}
                                isSentByMe={isSentByMe}
                                isGroupMessage={isGroupMessage}
                                activeTab={activeTab}
                                parseDateSafe={parseDateSafe}
                            />
                        </div>

                        {/* Optimized Global Reaction Badge */}
                        <MessageReactions
                            reactions={reactionsArray}
                            isSentByMe={isSentByMe}
                            onShowDetails={(e) => handleShowReactionDetails(item, e)}
                        />
                    </div>
                ) : (
                    <div className="w-full">
                        <div className={`p-4 rounded-xl border shadow-md ${bubbleBg} text-right w-full`}>
                            <div className="flex justify-between items-start mb-2">
                                {parseDateSafe(item.CreatedAt || item.createdAt || item.CreatedDate || item.createdDate) && (
                                    <span className="text-gray-400 text-[10px]">
                                        {parseDateSafe(item.CreatedAt || item.createdAt || item.CreatedDate || item.createdDate)?.toLocaleString()}
                                    </span>
                                )}
                                <div className="flex items-center gap-1.5">
                                    {isQuestion && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded-lg font-bold">❓ سؤال</span>}
                                    {isAnnouncement && <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 px-1.5 py-0.5 rounded-lg font-bold">📢 تعميم</span>}
                                    {isAppointment && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.5 rounded-lg font-bold">📅 موعد</span>}
                                </div>
                            </div>
                            
                            {!isAppointment && (
                                <div className="font-bold text-base mb-1">{item.Title || item.title || 'رسالة'}</div>
                            )}

                            <div className="text-[15px] opacity-90 leading-relaxed">
                                {isAppointment ? (
                                    <div className="flex flex-col min-w-[200px] mt-1 pt-0.5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 shadow-sm cursor-default">
                                                <FaCalendarAlt size={20} className="text-emerald-700 dark:text-emerald-400 opacity-90" />
                                            </div>
                                            <span className="font-black text-lg text-[var(--hub-text-main)] leading-tight">
                                                {item.Name || item.name || item.Message || item.message || item.Title || item.title || "تفاصيل الموعد"}
                                            </span>
                                        </div>
                                        <div className="bg-[var(--hub-hover)] dark:bg-black/20 rounded-2xl p-4 border border-[var(--hub-border)] flex flex-col gap-3 shadow-sm mx-1">
                                            {(item.date || item.Date) && (
                                                <div className="flex items-center justify-between gap-6">
                                                    <span className="text-xs font-bold text-[var(--hub-text-secondary)] uppercase tracking-wider">التاريخ</span>
                                                    <div className="flex items-center gap-2 bg-[var(--hub-bg)] px-3 py-1 rounded-md text-base font-black text-[var(--hub-text-main)]" dir="ltr">
                                                        <FaCalendarAlt size={14} className="text-emerald-500/70" />
                                                        {item.date || item.Date}
                                                    </div>
                                                </div>
                                            )}
                                            {(item.date || item.Date) && (item.time || item.Time) && (
                                                <div className="h-px w-full bg-[var(--hub-border)] opacity-60"></div>
                                            )}
                                            {(item.time || item.Time) && (
                                                <div className="flex items-center justify-between gap-6">
                                                    <span className="text-xs font-bold text-[var(--hub-text-secondary)] uppercase tracking-wider">الوقت</span>
                                                    <div className="flex items-center gap-2 bg-[var(--hub-bg)] px-3 py-1 rounded-md text-base font-black text-[var(--hub-text-main)]" dir="ltr">
                                                        <FaRegClock size={14} className="text-emerald-500/70" />
                                                        {item.time || item.Time}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>{item.Name || item.name || item.Message || item.message || ""}</>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MessageItem);
