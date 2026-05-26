import React, { useState } from 'react';
import type { HubTab, LookUp, UserLookUp, ConversationSummary } from '../../types/hub.types';
import UserListItem from './UserListItem';
import UserAvatar from '../common/UserAvatar';
import { resolveTabSpecificActivity } from '../../utils/hubSelectors';

interface ConversationListProps {
    hubItems: any[];
    unreadDeliveries: any[];
    departments: LookUp[];
    allUsers: UserLookUp[];
    conversations?: ConversationSummary[];
    isLoadingConversations?: boolean;
    activeTab: HubTab | null;
    selectedChatUser: any;
    userSearchTerm: string;
    currentUserRawId: number;
    currentDisplayId: number;
    currentUserWorkId: number;
    onlineUsers: Set<string>;
    /** Keys `chatId|userId` from SignalR typing events (legacy: Set of userId only). */
    typingUsers: Set<string> | Map<string, any>;
    theme: any;
    onSelectChat: (user: any) => void;
    formatLastSeen: (date: any) => string;
    activeFilter?: 'all' | 'unread';
}

/**
 * List of departments and users for the sidebar.
 * Encapsulates search and unread count filtering.
 */
const ConversationList: React.FC<ConversationListProps> = ({
    hubItems,
    unreadDeliveries = [],
    departments,
    allUsers,
    conversations = [],
    isLoadingConversations = false,
    activeTab,
    selectedChatUser,
    userSearchTerm,
    currentUserRawId,
    currentDisplayId,
    currentUserWorkId,
    onlineUsers,
    typingUsers,
    theme,
    onSelectChat,
    formatLastSeen,
    activeFilter = 'all'
}) => {
    const [selectedDeptId, setSelectedDeptId] = useState<number | 'all'>('all');

    const isTyping = (userId: string | number) => {
        const uid = userId.toString();
        if (typingUsers instanceof Set) {
            for (const k of typingUsers) {
                if (typeof k !== 'string') continue;
                const pipe = k.indexOf('|');
                if (pipe === -1) {
                    if (k === uid) return true;
                    continue;
                }
                const roomId = k.slice(0, pipe);
                const typerId = k.slice(pipe + 1);
                if (typerId === uid && roomId === uid) return true;
            }
            return false;
        }
        return (typingUsers as Map<string, any>).has(uid);
    };

    /**
     * ✅ Unified activity, unread, and preview data resolved via selector architecture
     * This ensures the sidebar is in-sync and tab-isolated.
     */
    const { messageMap, unreadMap, activityMap } = React.useMemo(() => {
        return resolveTabSpecificActivity(
            hubItems,
            conversations,
            unreadDeliveries,
            currentDisplayId,
            activeTab
        );
    }, [hubItems, conversations, unreadDeliveries, currentDisplayId, activeTab]);

    /**
     * ✅ Unified list of main entries (Global + Departments)
     */
    const visibleEntries = React.useMemo(() => {
        if (activeTab === 'chat' || !activeTab) return [];

        let entries: any[] = [];


        // 2. Global Entry (Announcements only)
        if (activeTab === 'announcements') {
            const gUnreads = unreadMap['global'] || 0;
            if (activeFilter === 'all' || gUnreads > 0) {
                entries.push({ 
                    Id: 'global', id: 'global', 
                    Name: 'تعميمات عامة (للجميع)', name: 'تعميمات عامة (للجميع)', 
                    type: 'Global', 
                    unreadCount: gUnreads 
                });
            }
        }

        // 3. Departments
        departments
            .filter(d => selectedDeptId === 'all' || Number(d.Id) === Number(selectedDeptId))
            .forEach(dept => {
                const deptKey = `dept-${dept.Id}`;
                const deptUnreadsCount = unreadMap[deptKey] || 0;

                const deptUsers = allUsers.filter(u => Number(u.WorkId) === Number(dept.Id) && Number(u.Id) !== Number(currentDisplayId))
                    .map(u => {
                        const userKey = `user-${u.Id}`;
                        const unreadCount = unreadMap[userKey] || 0;
                        const lastMessage = messageMap.get(userKey) || null;

                        return { 
                            ...u, 
                            Id: u.Id, id: u.Id,
                            Name: u.Name, name: u.Name,
                            unreadCount,
                            lastMessage,
                            LastActiveAt: activityMap[userKey] || 0 // Use unified activity map
                        };
                    })
                    .filter(u => {
                        const matchesSearch = !userSearchTerm || (u.Name || '').toLowerCase().includes(userSearchTerm.toLowerCase());
                        const matchesFilter = activeFilter === 'all' || u.unreadCount > 0;
                        return matchesSearch && matchesFilter;
                    })
                    .sort((a, b) => {
                        const diff = Number(b.LastActiveAt) - Number(a.LastActiveAt);
                        if (diff !== 0) return diff;
                        return (a.Name || '').localeCompare(b.Name || '');
                    });

                if (activeFilter === 'all' || deptUnreadsCount > 0 || deptUsers.length > 0) {
                    // Determine dept activity: max of its relevant messages or its users' relevant messages
                    const deptLocalMax = activityMap[deptKey] || 0;
                    entries.push({ 
                        ...dept, 
                        Id: dept.Id, id: dept.Id, 
                        Name: dept.Name, name: dept.Name, 
                        type: 'Department', 
                        unreadCount: deptUnreadsCount, 
                        lastMessage: messageMap.get(deptKey) || null, // Capture dept-level preview
                        users: deptUsers,
                        localActivity: deptLocalMax
                    });
                }
            });

        // 4. Handle users with NO department (General list)
        if (selectedDeptId === 'all') {
            const noDeptUsers = allUsers.filter(u => (!u.WorkId || Number(u.WorkId) === 0) && Number(u.Id) !== Number(currentDisplayId))
                .map(u => {
                    const userKey = `user-${u.Id}`;
                    const unreadCount = unreadMap[userKey] || 0;
                    const lastMessage = messageMap.get(userKey) || null;
                    return {
                        ...u,
                        Id: u.Id, id: u.Id, Name: u.Name, name: u.Name,
                        unreadCount, lastMessage,
                        LastActiveAt: activityMap[userKey] || 0
                    };
                })
                .filter(u => {
                    const matchesSearch = !userSearchTerm || (u.Name || '').toLowerCase().includes(userSearchTerm.toLowerCase());
                    const matchesFilter = activeFilter === 'all' || u.unreadCount > 0;
                    return matchesSearch && matchesFilter;
                })
                .sort((a, b) => {
                    const diff = Number(b.LastActiveAt) - Number(a.LastActiveAt);
                    if (diff !== 0) return diff;
                    return (a.Name || '').localeCompare(b.Name || '');
                });

            if (noDeptUsers.length > 0) {
                const totalUnreads = noDeptUsers.reduce((sum, u) => sum + (u.unreadCount || 0), 0);
                entries.push({
                    Id: 'no-dept', id: 'no-dept', 
                    Name: 'مستخدمون آخرون (بدون قسم)', name: 'مستخدمون آخرون (بدون قسم)',
                    type: 'NoDepartment',
                    users: noDeptUsers,
                    unreadCount: totalUnreads,
                    localActivity: 0
                });
            }
        }

        // Final sort: Stable order for departments (e.g., by Name), local activity only for sorting within departments
        return entries.sort((a, b) => {
            if (a.type === 'Global') return -1;
            if (b.type === 'Global') return 1;
            return (a.Name || '').localeCompare(b.Name || '');
        });
    }, [departments, allUsers, activeTab, activeFilter, userSearchTerm, currentDisplayId, messageMap, unreadMap, activityMap, hubItems, selectedDeptId]);

    /**
     * ✅ Chat Conversations (WhatsApp-style Flat List)
     */
    const chatEntries = React.useMemo(() => {
        if (activeTab !== 'chat') return [];
        
        const entries = allUsers
            .filter(u => Number(u.Id) !== Number(currentDisplayId))
            .map(u => {
                const userKey = `user-${u.Id}`;
                const unreadCount = unreadMap[userKey] || 0;
                const lastMessage = messageMap.get(userKey) || null;

                return {
                    ...u,
                    Id: u.Id, id: u.Id,
                    Name: u.Name, name: u.Name,
                    unreadCount,
                    lastMessage,
                    LastActiveAt: activityMap[userKey] || 0
                };
            })
            .filter(u => {
                const matchesSearch = !userSearchTerm || (u.Name || '').toLowerCase().includes(userSearchTerm.toLowerCase());
                const matchesFilter = activeFilter === 'all' || u.unreadCount > 0;
                return matchesSearch && matchesFilter;
            })
            .sort((a, b) => {
                // Strictly time-based sorting (WhatsApp Style: Newest on Top)
                const diff = Number(b.LastActiveAt) - Number(a.LastActiveAt);
                if (diff !== 0) return diff;
                // Fallback to alphabetical for empty conversations
                return (a.Name || '').localeCompare(b.Name || '');
            });


        return entries;
    }, [allUsers, activeTab, userSearchTerm, activeFilter, currentDisplayId, messageMap, unreadMap, activityMap, visibleEntries]);

    const listRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (listRef.current) {
            const scrollContainer = listRef.current.closest('.overflow-y-auto');
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeTab]);

    console.log('[RUNTIME DEBUG] ConversationList:', {
        activeTab,
        activeFilter,
        chatEntriesCount: chatEntries.length,
        visibleEntriesCount: visibleEntries.length,
        first10Users: (activeTab === 'chat' ? chatEntries : (visibleEntries.flatMap(e => e.users || []))).slice(0, 10).map((u: any) => ({
            userKey: `user-${u.Id}`,
            unreadCount: u.unreadCount,
            lastMsgType: u.lastMessage?.type,
            LastActiveAt: u.LastActiveAt
        }))
    });

    return (
        <div ref={listRef} className="space-y-4" dir="rtl">
            {/* 1. Chat Tab - Modern Logic */}
            {activeTab === 'chat' && (
                <div className="bg-[var(--hub-panel-bg)] rounded-xl border border-[var(--hub-border)] overflow-hidden shadow-sm">
                    <div className="divide-y divide-[var(--hub-border)]">
                        {chatEntries.map((u: any) => (
                            <UserListItem
                                key={u.Id}
                                user={u}
                                isSelected={selectedChatUser?.Id === u.Id}
                                isOnline={onlineUsers.has(u.Id.toString())}
                                isTyping={isTyping(u.Id)}
                                unreadCount={u.unreadCount}
                                activeTab={activeTab}
                                theme={theme}
                                onSelect={onSelectChat}
                                formatLastSeen={formatLastSeen}
                            />
                        ))}
                    </div>
                    {chatEntries.length === 0 && !isLoadingConversations && (
                        <div className="p-8 text-center text-[var(--hub-text-secondary)] opacity-60">
                            لا توجد محادثات نشطة
                        </div>
                    )}
                </div>
            )}

            {/* 2. Other Tabs - Legacy Logic (Maintain Stability) */}
            {activeTab !== 'chat' && (
                <div className="px-1 mb-2">
                    <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full bg-[var(--hub-input-bg)] border border-[var(--hub-border)] text-[var(--hub-text-main)] text-sm rounded-lg p-2.5 focus:ring-[var(--hub-accent)] focus:border-[var(--hub-accent)] outline-none cursor-pointer"
                        dir="rtl"
                    >
                        <option value="all">كل الأقسام</option>
                        {departments.map(d => (
                            <option key={d.Id} value={d.Id}>{d.Name}</option>
                        ))}
                    </select>
                </div>
            )}

            {activeTab !== 'chat' && visibleEntries.map(entry => {
                if (entry.type === 'Global') {
                    const globalUnreads = entry.unreadCount;
                    return (
                        <div key="global" onClick={() => onSelectChat({ Id: 'global', Name: 'تعميمات عامة (للجميع)', Type: 'Global' } as any)}
                            className={`p-4 rounded-xl border border-[var(--hub-border)] flex items-center gap-3 cursor-pointer transition-colors shadow-sm ${selectedChatUser?.Id === 'global' ? 'bg-[var(--hub-active-item)] ring-1 ring-[var(--hub-accent)]' : 'bg-[var(--hub-panel-bg)] hover:bg-[var(--hub-hover)]' }`}
                        >
                            <UserAvatar type="Global" size="lg" className="shadow-lg" />
                            <div className="flex-1 text-right">
                                <div className="flex justify-between items-center">
                                    <div className="font-black text-[16px] text-[var(--hub-text-main)]">المركز العام</div>
                                    {globalUnreads > 0 && <span className="bg-[#EF4444] text-white text-[12px] px-2.5 py-1 rounded-full font-black shadow-sm">{globalUnreads} {globalUnreads === 1 ? 'تعميم' : 'تعميمات'}</span>}
                                </div>
                                <div className="text-[10px] text-[var(--hub-text-secondary)]">إشعارات النظام</div>
                            </div>
                        </div>
                    );
                }

                const dept = entry;
                const deptUsers = entry.users || [];
                const deptUnreads = entry.unreadCount;
                const deptLastMsg = entry.lastMessage;
                const sender = allUsers.find(u => Number(u.Id) === deptLastMsg?.senderId);
                const isNoDept = entry.type === 'NoDepartment';

                return (
                    <div key={dept.Id} className="bg-[var(--hub-panel-bg)] rounded-xl border border-[var(--hub-border)] overflow-hidden shadow-sm">
                        <div onClick={() => onSelectChat({ Id: isNoDept ? 'no-dept' : `dept-${dept.Id}`, Name: isNoDept ? dept.Name : `مجموعة ${dept.Name}`, WorkId: isNoDept ? 0 : dept.Id, Type: isNoDept ? 'User' : 'Department' } as any)}
                            className={`px-4 py-3 border-b border-[var(--hub-border)] flex justify-between items-center group cursor-pointer transition-all ${selectedChatUser?.Id === (isNoDept ? 'no-dept' : `dept-${dept.Id}`) ? 'bg-[var(--hub-active-item)]' : 'hover:bg-[var(--hub-hover)]'}`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <UserAvatar type={isNoDept ? 'User' : 'Department'} size="md" className="shadow-sm" />
                                <div className="min-w-0">
                                    <div className="font-black text-[16px] text-[var(--hub-text-main)]">{isNoDept ? '' : 'مجموعة '}{dept.Name}</div>
                                    {deptLastMsg && (
                                        <div className="text-[11px] text-[var(--hub-text-secondary)] truncate mt-0.5 opacity-80">
                                            <span className="font-bold">{deptLastMsg.isMe ? 'أنت' : (sender?.Name || 'موظف')}:</span> {deptLastMsg.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {deptUnreads > 0 && <span className="bg-[#EF4444] text-white text-[12px] px-2.5 py-1 rounded-full font-black animate-pulse">{deptUnreads} جديد</span>}
                                {deptUsers.length > 0 && <span className="bg-[var(--hub-input-bg)] text-[12px] px-2 py-0.5 rounded-full text-[var(--hub-text-secondary)] font-bold border border-[var(--hub-border)]">{deptUsers.length}</span>}
                            </div>
                        </div>
                        <div className="divide-y divide-[var(--hub-border)]">
                            {deptUsers.map((u: any) => (
                                <UserListItem
                                    key={u.Id}
                                    user={u}
                                    isSelected={selectedChatUser?.Id === u.Id}
                                    isOnline={onlineUsers.has(u.Id.toString())}
                                    isTyping={isTyping(u.Id)}
                                    unreadCount={u.unreadCount}
                                    activeTab={activeTab}
                                    theme={theme}
                                    onSelect={onSelectChat}
                                    formatLastSeen={formatLastSeen}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {(isLoadingConversations || (activeTab !== 'chat' && allUsers.length === 0)) && (
                <div className="flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-500">
                    <div className="w-8 h-8 border-4 border-gray-100 border-t-gray-400 rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-bold">جاري تحميل القائمة...</p>
                </div>
            )}
        </div>
    );
};

export default React.memo(ConversationList);
