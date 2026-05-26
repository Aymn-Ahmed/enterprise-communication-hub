import React from 'react';
import { FaTimes, FaRegSmile } from 'react-icons/fa';
import UserAvatar from '../common/UserAvatar';

interface ReactionDetail {
    userId?: number;
    UserId?: number;
    userName?: string;
    UserName?: string;
    userAvatarUrl?: string;
    UserAvatarUrl?: string;
    reactionType?: string;
    ReactionType?: string;
    timestamp?: string;
    Timestamp?: string;
}

interface MessageReactionDetailsProps {
    open: boolean;
    onClose: () => void;
    reactions: ReactionDetail[];
    isLoading: boolean;
    selectedTab: string;
    onTabChange: (tab: string) => void;
    currentUserId?: number | string;
    popupPos?: { top: number; left: number } | null;
}

const MessageReactionDetails: React.FC<MessageReactionDetailsProps> = ({
    open,
    onClose,
    reactions,
    isLoading,
    selectedTab,
    onTabChange,
    currentUserId,
    popupPos
}) => {
    if (!open) return null;

    const reactionTypes = Array.from(new Set(reactions.map(r => r.reactionType || r.ReactionType)));
    const filteredData = selectedTab === 'all'
        ? reactions
        : reactions.filter(r => (r.reactionType || r.ReactionType) === selectedTab);

    // Adjust position to stay within reasonable bounds
    const style: React.CSSProperties = popupPos ? {
        position: 'absolute',
        top: Math.max(80, Math.min(popupPos.top, 350)),
        left: '50%',
        transform: 'translateX(-50%)',
        width: '320px',
        maxHeight: '400px',
        zIndex: 1000
    } : {
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '320px',
        maxHeight: '400px',
        zIndex: 1000
    };

    return (
        <div
            className={`absolute inset-0 z-[120] pointer-events-none transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
            dir="rtl"
        >
            <div
                style={style}
                className="reaction-details-popup pointer-events-auto bg-white dark:bg-[#233138] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Compact Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-black/20">
                    <h4 className="text-sm font-black text-gray-700 dark:text-gray-200">التفاعلات</h4>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <FaTimes size={12} />
                    </button>
                </div>

                {/* Emoji Tabs - Compact Pilled Style */}
                <div className="flex items-center px-2 py-2 gap-1.5 overflow-x-auto no-scrollbar border-b border-gray-100/50 dark:border-gray-800/50">
                    <button
                        onClick={() => onTabChange('all')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap ${selectedTab === 'all'
                            ? 'bg-[#00a884] text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/30'}`}
                    >
                        الكل {reactions.length}
                    </button>
                    {reactionTypes.map((type) => {
                        if (!type) return null;
                        const count = reactions.filter(r => (r.reactionType || r.ReactionType) === type).length;
                        return (
                            <button
                                key={type}
                                onClick={() => onTabChange(type)}
                                className={`px-3 py-1.5 flex items-center gap-1.5 transition-all rounded-full ${selectedTab === type
                                    ? 'bg-green-100 dark:bg-green-900/40 text-[#00a884] ring-1 ring-[#00a884]/30 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/30 grayscale opacity-70'}`}
                            >
                                <span className="text-lg leading-none">{type}</span>
                                <span className="text-[10px] font-black">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* User List with WhatsApp Vibe */}
                <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar bg-white dark:bg-[#233138]">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                            <div className="w-7 h-7 border-2 border-[#00a884]/20 border-t-[#00a884] rounded-full animate-spin"></div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Loading</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="py-12 text-center">
                            <FaRegSmile size={32} className="mx-auto text-gray-200 mb-2" />
                            <span className="text-gray-400 text-xs font-medium">لا توجد تفاعلات</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/20">
                            {filteredData.map((reaction, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group">
                                    <div className="relative shrink-0">
                                        <UserAvatar
                                            user={reaction}
                                            size="sm"
                                            border
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#111b21] rounded-full p-0.5 shadow-md border border-gray-100 dark:border-gray-800">
                                            <span className="text-xs leading-none">{reaction.reactionType || reaction.ReactionType}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-[#00a884] transition-colors">
                                                {reaction.userName || reaction.UserName || 'مستخدم'}
                                            </span>
                                            {Number(reaction.userId || reaction.UserId) === Number(currentUserId) && (
                                                <span className="text-[9px] font-black text-[#00a884] bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full">أنت</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {new Date(reaction.timestamp || reaction.Timestamp || Date.now()).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageReactionDetails;
