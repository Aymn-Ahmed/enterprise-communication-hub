import React from 'react';
import { FaImage, FaArrowRight, FaSearch, FaTimes } from 'react-icons/fa';
import type { HubTab, UserLookUp } from '../../types/hub.types';
import UserAvatar from '../common/UserAvatar';
import ChatFilterTabs from '../sidebar/ChatFilterTabs';

interface ChatHeaderProps {
    activeTab: HubTab;
    selectedChatUser: UserLookUp | null;
    theme: any;
    isOnline: boolean;
    isTyping: boolean;
    /** e.g. "(محمد) يكتب الآن…" — when set, shown instead of generic typing line */
    typingSubtitle?: string | null;
    formatLastSeen: (date: any) => string;
    currentUserName: string;
    showMediaGallery: boolean;
    onToggleMedia: () => void;
    onCloseChat: () => void;
    onOpenProfile: (id: any) => void;
    userSearchTerm: string;
    onSearchChange: (value: string) => void;
    isFullScreen: boolean;
    activeFilter?: 'all' | 'unread';
    onFilterChange?: (filter: 'all' | 'unread') => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    // Chat search props
    chatSearchTerm?: string;
    onChatSearchChange?: (val: string) => void;
    showChatSearch?: boolean;
    onToggleChatSearch?: () => void;
}

/**
 * Header component for the chat/message area.
 * Displays user info, status, and actions.
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
    activeTab,
    selectedChatUser,
    theme,
    isOnline,
    isTyping,
    typingSubtitle,
    formatLastSeen,
    currentUserName,
    showMediaGallery,
    onToggleMedia,
    onCloseChat,
    onOpenProfile,
    userSearchTerm,
    onSearchChange,
    isFullScreen,
    activeFilter,
    onFilterChange,
    onRefresh,
    isRefreshing,
    chatSearchTerm = '',
    onChatSearchChange,
    showChatSearch = false,
    onToggleChatSearch
}) => {
    return (
        <div className="p-3 border-b border-[var(--hub-border)] bg-[var(--hub-header-bg)] relative z-[30] shadow-sm">
            <div className="flex justify-between items-center mb-2 w-full" dir="rtl">
                {/* Right Side: User Identity */}
                <div className="flex-1 flex items-center gap-3">
                    {(activeTab && selectedChatUser) ? (
                        <>
                            <UserAvatar
                                user={selectedChatUser}
                                size="md"
                                border
                                onClick={() => onOpenProfile(selectedChatUser.Id || selectedChatUser.Name)}
                                className="cursor-pointer transition-transform active:scale-95 shadow-lg"
                            />
                            <div className="flex flex-col text-right min-w-0">
                                <div
                                    className="text-base leading-tight font-bold text-[var(--hub-text-main)] truncate cursor-pointer transition-colors flex items-center gap-1"
                                    style={{ color: theme.color }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenProfile(selectedChatUser.Id || selectedChatUser.Name);
                                    }}
                                >
                                    {selectedChatUser.Name}
                                </div>
                                {isTyping ? (
                                    <div className="text-[11px] text-[#A855F7] font-medium flex items-center gap-1 flex-wrap">
                                        <span>{typingSubtitle?.trim() || 'يكتب الآن'}</span>
                                        <span className="flex gap-[2px] items-center shrink-0">
                                            <span className="w-1 h-1 bg-[#A855F7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1 h-1 bg-[#A855F7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1 h-1 bg-[#A855F7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                    </div>
                                ) : isOnline ? (
                                    <div className="text-[11px] text-green-500 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                                        متصل الآن
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-gray-400 font-medium">
                                        {formatLastSeen(selectedChatUser.LastActiveAt)}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        activeTab && !selectedChatUser && (
                            <h3 className="font-bold text-[var(--hub-text-main)] text-lg flex items-center gap-2">
                                <span>{activeTab === 'questions' ? 'الأسئلة' : activeTab === 'appointments' ? 'المواعيد' : activeTab === 'announcements' ? 'التعاميم' : 'الدردشة'}</span>
                                <span className="text-xs font-bold opacity-60 bg-[var(--hub-bg)] px-2 py-0.5 rounded-md mr-auto">{currentUserName}</span>
                            </h3>
                        )
                    )}
                </div>

                {/* Left Side: Actions */}
                <div className="flex items-center gap-1.5" dir="ltr">
                    {activeTab && selectedChatUser && (
                        <>
                            {onToggleChatSearch && (
                                <button
                                    onClick={onToggleChatSearch}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 tooltip tooltip-bottom
                                        ${showChatSearch 
                                            ? 'bg-[var(--hub-accent)] text-white shadow-lg' 
                                            : 'bg-[var(--hub-bg)] hover:bg-[var(--hub-accent)]/10 text-[var(--hub-text-muted)] hover:text-[var(--hub-accent)]'
                                        }`}
                                    data-tip="بحث في المحادثة"
                                >
                                    <FaSearch size={14} />
                                </button>
                            )}

                            <button
                                onClick={onToggleMedia}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 tooltip tooltip-bottom ${showMediaGallery ? 'bg-purple-500/20 text-[#A855F7]' : 'bg-[var(--hub-bg)] hover:bg-purple-500/10 text-[var(--hub-text-muted)] hover:text-[#A855F7]'}`}
                                data-tip="الوسائط المشتركة"
                            >
                                <FaImage size={14} />
                            </button>

                            <button
                                onClick={onCloseChat}
                                className={`items-center justify-center w-8 h-8 rounded-full bg-[var(--hub-bg)] hover:bg-red-500/20 text-[var(--hub-text-muted)] hover:text-red-500 transition-all active:scale-95 tooltip tooltip-bottom ${isFullScreen && activeTab ? 'hidden' : 'flex'}`}
                                data-tip="رجوع"
                            >
                                <FaArrowRight size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Sub-header Chat Search - History Search */}
            {selectedChatUser && showChatSearch && onChatSearchChange && (
                <div className="relative w-full mt-1 animate-in slide-in-from-top-2 duration-200">
                    <input
                        type="text"
                        placeholder="ابحث عن كلمة في هذه المحادثة..."
                        className="w-full h-9 pl-8 pr-10 text-sm text-right border-2 border-[var(--hub-accent)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--hub-accent)]/20 bg-[var(--hub-bg)] text-[var(--hub-text-main)] shadow-inner"
                        dir="rtl"
                        value={chatSearchTerm}
                        onChange={(e) => onChatSearchChange(e.target.value)}
                        autoFocus
                    />
                    <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hub-accent)] text-sm" />
                    <button 
                        onClick={() => onChatSearchChange('')}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors ${!chatSearchTerm ? 'hidden' : 'block'}`}
                    >
                        <FaTimes size={12} />
                    </button>
                </div>
            )}

            {/* Sub-header User Search - Only shown in widget mode or when no user selected */}
            <div className={`relative w-full mt-1 ${(isFullScreen && activeTab) || selectedChatUser ? 'hidden' : 'block'}`}>
                <input
                    type="text"
                    placeholder="بحث في القائمة..."
                    className="w-full h-9 pl-8 pr-3 text-sm text-right border border-[var(--hub-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--hub-accent)] bg-[var(--hub-input-bg)] text-[var(--hub-text-main)]"
                    dir="rtl"
                    value={userSearchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B82F6] text-sm" />
            </div>

            {/* Filter Tabs - Only shown in widget mode when no user is selected */}
            {!isFullScreen && !selectedChatUser && activeFilter && onFilterChange && (
                <div className="mt-2 flex justify-start">
                    <ChatFilterTabs activeFilter={activeFilter} onChange={onFilterChange} />
                </div>
            )}
        </div>
    );
};

export default React.memo(ChatHeader);
