import React from 'react';
import type { HubTab } from '../../types/hub.types';
import UserAvatar from '../common/UserAvatar';

interface UserListItemProps {
    user: any;
    isSelected: boolean;
    isOnline: boolean;
    isTyping: boolean;
    unreadCount: number;
    activeTab: HubTab | null;
    theme: any;
    onSelect: (user: any) => void;
    formatLastSeen: (date: any) => string;
}

/**
 * Individual item in the user/conversation list sidebar
 * Refined with safe styling and proper types
 */
const UserListItem: React.FC<UserListItemProps> = ({
    user,
    isSelected,
    isOnline,
    isTyping,
    unreadCount,
    activeTab,
    theme,
    onSelect,
    formatLastSeen
}) => {
    return (
        <div
            onClick={() => onSelect({ ...user, Type: user.Type || 'User' })}
            className={`w-full flex items-center justify-between p-3 transition-all group cursor-pointer border-r-4 border-transparent ${isSelected ? 'bg-[var(--hub-active-item)] border-r-[var(--hub-accent)] sticky top-0 z-10' : 'hover:bg-[var(--hub-hover)]'}`}
        >
            <div className="flex flex-1 items-center gap-3 relative">
                {/* Avatar area */}
                <div className="relative shrink-0">
                    <UserAvatar
                        user={user}
                        size="md"
                        className="group-hover:scale-110"
                    />
                    {isOnline && (
                        <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--hub-panel-bg)] rounded-full shadow-sm z-30 animate-in zoom-in duration-300"
                            title="متصل"
                        ></span>
                    )}
                </div>

                {/* Info area */}
                <div className="text-right flex-1 flex justify-between items-center">
                    <div className="min-w-0">
                        <div
                            className={`font-black text-[15px] transition-colors uppercase tracking-tight truncate mb-0.5 ${isSelected ? 'text-[var(--hub-accent)]' : 'text-[var(--hub-text-main)]'}`}
                        >
                            {user.Name}
                        </div>
                        <div className={`text-[12px] truncate ${unreadCount > 0 && !isTyping ? 'text-[#EF4444] font-black' : (isTyping ? 'text-[#00A884] font-bold italic' : 'text-[var(--hub-text-secondary)]')}`}>
                            {isTyping ? 'يكتب الآن...' : (
                                user.lastMessage?.text ? (
                                    <span className="flex items-center gap-1">
                                        {user.lastMessage.isMe && (
                                            <span className="opacity-50 text-[10px]">
                                                {user.lastMessage.status === 'Read' ? '✓✓' : '✓'} أنت:
                                            </span>
                                        )}
                                        <span className="truncate">{user.lastMessage.text}</span>
                                    </span>
                                ) : (
                                    unreadCount > 0
                                        ? (activeTab === 'questions' ? 'استفسار جديد' : (activeTab === 'appointments' ? 'موعد جديد' : 'مراسلة جديدة'))
                                        : (isOnline ? 'نشط الآن' : formatLastSeen(user.LastActiveAt))
                                )
                            )}
                        </div>
                    </div>

                    {/* Unread badge */}
                    {unreadCount > 0 && (
                        <div className="flex flex-col items-center gap-1 shrink-0 ml-1">
                            <span className="bg-[#EF4444] text-white text-[12px] min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center font-black shadow-sm">
                                {unreadCount}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListItem;
