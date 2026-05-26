import React from 'react';
import {
    FaPaperclip, FaCamera, FaPaperPlane, FaMicrophone,
    FaCalendarAlt, FaTimes, FaSpinner, FaClock, FaMapMarkerAlt
} from 'react-icons/fa';
import type { HubTab } from '../../types/hub.types';
import EditingBar from './EditingBar';
import AttachmentPreviews from './AttachmentPreviews';
import AttachmentMenu from './AttachmentMenu';
import UnifiedEmojiStickerPicker from './UnifiedEmojiStickerPicker';
import VoiceRecordingPreview from './VoiceRecordingPreview';
import LocationPickerModal from './LocationPickerModal';

interface ChatInputProps {
    // Basic states
    activeTab: HubTab;
    selectedChatUser: any;
    showMediaGallery: boolean;
    theme: any;

    // Text state
    messageText: string;
    setMessageText: (text: string) => void;
    isSubmitting: boolean;
    handleInlineSubmit: () => void;
    replyTo: any | null;
    setReplyTo: (item: any | null) => void;

    // Editing state
    editingMessage: any;
    setEditingMessage: (item: any) => void;
    setActiveMessageMenuId: (id: number | null) => void;

    // Attachments state
    attachmentUrls: string[];
    removeAttachment: (idx: number) => void;
    getFileName: (url: string) => string;
    showAttachmentMenu: boolean;
    setShowAttachmentMenu: (show: boolean) => void;
    popupPos: { bottom: number; left: number } | null;
    setPopupPos: (pos: { bottom: number; left: number } | null) => void;

    // Emojis state
    showEmojiPicker: boolean;
    setShowEmojiPicker: (show: boolean) => void;
    handleEmojiClick: (emojiData: any) => void;

    // Stickers state
    handleStickerSelect: (url: string) => void;

    // Location state
    onSendLocationDirect?: (loc: { lat: number; lng: number }) => void;
    onOpenLocationPicker?: () => void;

    // Recording state
    isRecording: boolean;
    recordingBlob: any;
    startRecording: () => void;
    renderRecordingUI: (color: string, border: string, bg: string, hover: string) => React.ReactNode;

    // Location preview
    locationPreview: { lat: number; lng: number } | null;
    setLocationPreview: (loc: { lat: number; lng: number } | null) => void;

    // Refs (Passed as props for now)
    messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    attachBtnRef: React.RefObject<HTMLButtonElement | null>;
    emojiBtnRef: React.RefObject<HTMLButtonElement | null>;
    typingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null | any>;

    // Logic functions
    notifyTyping: (chatId: string, isTyping: boolean) => void;

    // Appointment state
    appointmentDate: string;
    setAppointmentDate: (date: string) => void;
    appointmentTime: string;
    setAppointmentTime: (time: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = (props) => {
    const {
        activeTab, selectedChatUser, showMediaGallery, theme,
        messageText, setMessageText, isSubmitting, handleInlineSubmit,
        editingMessage, setEditingMessage, setActiveMessageMenuId,
        attachmentUrls, removeAttachment, getFileName, showAttachmentMenu,
        setShowAttachmentMenu, popupPos, setPopupPos,
        showEmojiPicker, setShowEmojiPicker, handleEmojiClick,
        handleStickerSelect,
        isRecording, recordingBlob, startRecording, renderRecordingUI,
        messageInputRef, fileInputRef, attachBtnRef, emojiBtnRef, typingTimeoutRef,
        notifyTyping,
        onSendLocationDirect, onOpenLocationPicker,
        appointmentDate, setAppointmentDate, appointmentTime, setAppointmentTime,
        replyTo, setReplyTo,
        locationPreview, setLocationPreview
    } = props;

    const [showLocationPicker, setShowLocationPicker] = React.useState(false);

    // Auto-resize effect for the textarea
    React.useLayoutEffect(() => {
        const textarea = messageInputRef.current;
        if (textarea) {
            textarea.style.height = '5px';
            const scrollHeight = textarea.scrollHeight;
            const newHeight = Math.min(Math.max(scrollHeight, 32), 150);
            textarea.style.height = `${newHeight}px`;

            if (scrollHeight > 150) {
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.overflowY = 'hidden';
            }
        }
    }, [messageText, messageInputRef]);

    // Don't render if not in appropriate tab/user
    if (!activeTab || !selectedChatUser || showMediaGallery) return null;

    return (
        <div className="p-1.5 px-3 bg-[var(--hub-panel-bg)]/80 backdrop-blur-lg border-t border-[var(--hub-border)]/40 w-full animate-in slide-in-from-bottom-2 fade-in duration-300 z-[50]" dir="ltr">
            <VoiceRecordingPreview
                isRecording={isRecording}
                recordingBlob={recordingBlob}
                renderRecordingUI={renderRecordingUI}
            />

            {!(isRecording || recordingBlob) && (
                <div className="flex flex-col gap-2 relative">
                    {/* Reply Bar */}
                    {replyTo && (
                        <div className="mb-1 p-2 bg-gray-50 dark:bg-[#111b21] border-r-4 border-blue-500 rounded-lg relative animate-in slide-in-from-bottom-2 duration-300" dir="rtl">
                            <button
                                onClick={() => setReplyTo(null)}
                                className="absolute top-1.5 left-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <FaTimes size={10} />
                            </button>
                            <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 mb-0.5">
                                رد على: {replyTo.FromUserName || replyTo.fromUserName || 'مستخدم'}
                            </div>
                            <div className="text-[11px] text-gray-600 dark:text-gray-400 truncate max-w-[90%]">
                                {replyTo.Name || replyTo.text || replyTo.Message || 'رسالة'}
                            </div>
                        </div>
                    )}
                    <EditingBar
                        editingMessage={editingMessage}
                        onCancel={() => {
                            setEditingMessage(null);
                            setMessageText('');
                            setActiveMessageMenuId(null);
                        }}
                    />

                    <AttachmentPreviews
                        attachmentUrls={attachmentUrls}
                        onRemove={removeAttachment}
                        getFileName={getFileName}
                    />



                    {activeTab === 'appointments' && !replyTo ? (
                        <div className="p-2 bg-[var(--hub-bg)] backdrop-blur-md rounded-[24px] border border-[var(--hub-border)] animate-in slide-in-from-bottom-2 duration-500 shadow-xl" dir="rtl">
                            <div className="flex items-center justify-between mb-1.5 px-2">
                                <div className="flex items-center gap-1.5 opacity-80">
                                    <FaCalendarAlt size={10} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">موعد جديد</span>
                                </div>
                                <button
                                    onClick={() => { setAppointmentDate(''); setAppointmentTime(''); setMessageText(''); }}
                                    className="w-5 h-5 flex items-center justify-center rounded-full text-[var(--hub-text-muted)] hover:bg-[var(--hub-active)] hover:text-red-500 transition-all shadow-sm"
                                >
                                    <FaTimes size={10} />
                                </button>
                            </div>

                            <div className="flex gap-1.5 mb-1.5 px-1">
                                <div className="flex-1 flex gap-1 bg-[var(--hub-input-bg)] p-0.5 rounded-xl border border-[var(--hub-border)] focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
                                    <div className="flex-1 relative flex items-center bg-transparent group">
                                        <input
                                            type="text"
                                            placeholder="تاريخ الموعد"
                                            value={appointmentDate ? appointmentDate.split('-').reverse().join('-') : ''}
                                            readOnly
                                            className="w-full h-7 pr-6 pl-1 bg-transparent border-none text-[10px] font-bold text-emerald-900 dark:text-emerald-50 outline-none pointer-events-none"
                                        />
                                        <input
                                            type="date"
                                            id="chatAppointmentDatePicker"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={appointmentDate}
                                            onChange={e => setAppointmentDate(e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            title="اختيار تاريخ الموعد"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const dateInput = document.getElementById('chatAppointmentDatePicker') as HTMLInputElement;
                                                dateInput?.showPicker?.();
                                            }}
                                            className="absolute right-1 text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 z-20 transition-transform hover:scale-110 active:scale-90"
                                        >
                                            <FaCalendarAlt size={11} />
                                        </button>
                                    </div>
                                    <div className="w-px h-3 bg-emerald-100 dark:bg-emerald-800 self-center"></div>
                                    <div className="flex-1 relative flex items-center">
                                        <FaClock size={11} className="absolute right-2 text-emerald-400 pointer-events-none" />
                                        <input
                                            type="time"
                                            value={appointmentTime}
                                            onChange={e => setAppointmentTime(e.target.value)}
                                            className="w-full h-7 pr-6 pl-1 bg-transparent border-none text-[10px] font-bold text-emerald-900 dark:text-emerald-50 outline-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end gap-1.5 px-1">
                                <div className="flex flex-col gap-1 pb-0.5 shrink-0">
                                    <button
                                        type="button"
                                        ref={attachBtnRef}
                                        onClick={() => {
                                            if (showAttachmentMenu) {
                                                setShowAttachmentMenu(false);
                                                setPopupPos(null);
                                            } else {
                                                const rect = attachBtnRef.current?.getBoundingClientRect();
                                                if (rect) {
                                                    setPopupPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
                                                }
                                                setShowAttachmentMenu(true);
                                            }
                                        }}
                                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--hub-input-bg)] text-emerald-500 shadow-sm border border-[var(--hub-border)] hover:scale-110 transition-transform"
                                    >
                                        <FaPaperclip size={11} className={`transform transition-transform ${showAttachmentMenu ? 'rotate-45' : '-rotate-45'}`} />
                                    </button>
                                    <button
                                        onClick={handleInlineSubmit}
                                        disabled={isSubmitting || !appointmentDate || !appointmentTime || (!messageText.trim() && attachmentUrls.length === 0)}
                                        className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-white rounded-[10px] shadow-lg shadow-emerald-500/20 flex items-center justify-center transition-all active:scale-90 disabled:shadow-none"
                                    >
                                        {isSubmitting ? <FaSpinner className="animate-spin" size={10} /> : <FaPaperPlane size={13} className="transform -scale-x-100" />}
                                    </button>
                                </div>

                                <div className="flex-1 bg-[var(--hub-input-bg)] rounded-[12px] border border-[var(--hub-border)] focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
                                    <textarea
                                        ref={messageInputRef}
                                        placeholder="اكتب تفاصيل الموعد..."
                                        value={messageText}
                                        onChange={e => setMessageText(e.target.value)}
                                        className="w-full p-2 px-3 rounded-[12px] bg-transparent border-none text-right text-[14px] font-medium text-[var(--hub-text-main)] placeholder-[var(--hub-text-muted)] outline-none resize-none overflow-y-auto custom-scrollbar"
                                        rows={1}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-end gap-2 w-full mt-1.5" dir="rtl">
                            {/* Main Pill Container (WhatsApp Style) - Miniature Version */}
                            <div className="flex-1 min-w-0 bg-white dark:bg-[#202c33] rounded-[24px] flex items-end min-h-[40px] h-auto transition-all shadow-sm px-1.5 py-1 gap-1 border border-transparent dark:border-white/5">
                                
                                {/* Right Side (Tools & Emojis) */}
                                <div className="flex items-center shrink-0 mb-1 pl-1">
                                    <UnifiedEmojiStickerPicker
                                        show={showEmojiPicker}
                                        onToggle={() => {
                                            if (showEmojiPicker) {
                                                setShowEmojiPicker(false);
                                            } else {
                                                setShowAttachmentMenu(false);
                                                setShowEmojiPicker(true);
                                            }
                                        }}
                                        onEmojiClick={handleEmojiClick}
                                        onStickerSelect={handleStickerSelect}
                                        onClose={() => setShowEmojiPicker(false)}
                                        triggerRef={emojiBtnRef}
                                        mini={true}
                                    />
                                </div>

                                {/* Center (Text Input) */}
                                <textarea
                                    ref={messageInputRef}
                                    placeholder="اكتب رسالة"
                                    className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-[14.5px] font-normal text-[#111b21] dark:text-[#e9edef] placeholder-[#687782] dark:placeholder-[#8696a0] outline-none resize-none py-1.5 px-1 focus:outline-none custom-scrollbar"
                                    dir="rtl"
                                    rows={1}
                                    style={{ minHeight: '32px' }}
                                    value={messageText}
                                    onChange={e => {
                                        const newVal = e.target.value;
                                        setMessageText(newVal);

                                        if (selectedChatUser) {
                                            const chatId = selectedChatUser.Id.toString();
                                            if (!typingTimeoutRef.current) {
                                                notifyTyping(chatId, true);
                                            }
                                            if (typingTimeoutRef.current) {
                                                clearTimeout(typingTimeoutRef.current);
                                            }
                                            typingTimeoutRef.current = setTimeout(() => {
                                                notifyTyping(chatId, false);
                                                typingTimeoutRef.current = null;
                                            }, 2000);
                                        }
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey && (messageText.trim() || attachmentUrls.length > 0) && !isSubmitting) {
                                            e.preventDefault();
                                            if (selectedChatUser && typingTimeoutRef.current) {
                                                clearTimeout(typingTimeoutRef.current);
                                                notifyTyping(selectedChatUser.Id.toString(), false);
                                                typingTimeoutRef.current = null;
                                            }
                                            handleInlineSubmit();
                                        }
                                    }}
                                />

                                {/* Left Side (Attachments & Camera) */}
                                <div className="flex items-center shrink-0 mb-1 pr-1">
                                    <button
                                        type="button"
                                        ref={attachBtnRef}
                                        title="إرفاق ملف"
                                        onClick={() => {
                                            if (showAttachmentMenu) {
                                                setShowAttachmentMenu(false);
                                                setPopupPos(null);
                                            } else {
                                                const rect = attachBtnRef.current?.getBoundingClientRect();
                                                if (rect) {
                                                    setPopupPos({ bottom: window.innerHeight - rect.top + 8, right: window.innerWidth - rect.right });
                                                }
                                                setShowAttachmentMenu(true);
                                            }
                                        }}
                                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${showAttachmentMenu ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                    >
                                        <FaPaperclip size={16} className={`transform transition-transform text-[#54656f] dark:text-[#aebac1] ${showAttachmentMenu ? 'rotate-45 !text-emerald-500' : '-rotate-45'} origin-center`} />
                                    </button>
                                    {!messageText.trim() && (
                                        <button
                                            type="button"
                                            title="كاميرا"
                                            onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = 'image/*;capture=camera'; fileInputRef.current.click(); } }}
                                            className="w-7 h-7 flex items-center justify-center rounded-full text-[#54656f] dark:text-[#aebac1] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <FaCamera size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Mic/Send Button (Outside - Independent Action) */}
                            <button
                                type="button"
                                className="w-[42px] h-[42px] rounded-full cursor-pointer active:scale-95 text-white flex items-center justify-center shrink-0 transition-transform shadow-sm focus:outline-none bg-[#00a884] hover:bg-[#008f6f]"
                                onClick={(messageText.trim() || attachmentUrls.length > 0 || locationPreview != null) ? handleInlineSubmit : startRecording}
                                disabled={isSubmitting}
                            >
                                {messageText.trim() || attachmentUrls.length > 0 ? (
                                    isSubmitting
                                        ? <div className="w-5 h-5 border-[2px] border-white border-t-transparent rounded-full animate-spin"></div>
                                        : <FaPaperPlane size={18} className="transform -scale-x-100 -translate-x-0.5" />
                                ) : <FaMicrophone size={19} />}
                            </button>
                        </div>
                    )}

                    <AttachmentMenu
                        show={showAttachmentMenu}
                        position={popupPos}
                        onClose={() => {
                            setShowAttachmentMenu(false);
                            setPopupPos(null);
                        }}
                        fileInputRef={fileInputRef}
                        onLocationClick={() => onOpenLocationPicker?.()}
                    />
                </div>
            )}

            <LocationPickerModal
                isOpen={showLocationPicker}
                initialLocation={locationPreview}
                onClose={() => setShowLocationPicker(false)}
                onConfirm={(location) => {
                    if (onSendLocationDirect) {
                        onSendLocationDirect(location);
                    } else if (setLocationPreview) {
                        setLocationPreview(location);
                    }
                    setShowLocationPicker(false);
                }}
            />
        </div>
    );
};

export default React.memo(ChatInput);
