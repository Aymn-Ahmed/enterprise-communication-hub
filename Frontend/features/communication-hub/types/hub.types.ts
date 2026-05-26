/**
 * Types and Interfaces for Communication Hub Feature
 */
export const HUB_TYPES_VERSION = '1.0.0';

export type HubTab = 'questions' | 'appointments' | 'announcements' | 'chat' | null;

export type MessageCategory = 'questions' | 'appointments' | 'announcements' | 'chat';

export interface LookUp {
    Id: number;
    Name: string;
}

export interface UserLookUp {
    Id: number;
    RawId?: number;
    DisplayId?: number;
    Name: string;
    WorkId: number;
    LastActiveAt?: string | Date | null;
    Type?: 'User' | 'Global' | 'Department';
    AvatarUrl?: string;
    CoverUrl?: string;
    unreadCount?: number;
}

export interface CommunicationHubProps {
    open: boolean;
    onClose: () => void;
    onCountsUpdate?: (total: number) => void;
}
export interface HubCounts {
    [key: string]: number;
    questions: number;
    appointments: number;
    announcements: number;
    chat: number;
    total: number;
}

export interface LastMessagePreview {
    text: string;
    timestamp: string;
    status: string;
    type: string;
    isMe: boolean;
    senderId: number;
    targetType?: string;
    targetId?: string | number;
}

export interface ConversationSummary {
    id: number;
    displayId: number;
    name: string;
    workId: number;
    type: 'User' | 'Department' | 'Global';
    avatarUrl?: string;
    coverUrl?: string;
    lastMessage: LastMessagePreview;
    unreadCount: number;
    unreadChatCount: number;
    unreadQuestionCount: number;
    unreadScheduleCount: number;
    unreadAnnouncementCount: number;
    lastActiveAt?: string | Date | null;
}
