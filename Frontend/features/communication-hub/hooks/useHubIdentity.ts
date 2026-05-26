import { useMemo } from 'react';
import { getCommunicationHubAdapters, getHubStorage, getStoredSmartdashUser } from '../../../core/integration/moduleHost';

export const useHubIdentity = () => {
    const authState = getCommunicationHubAdapters().auth?.useAuthUserHook?.();
    const user = authState?.user ?? getStoredSmartdashUser();
    const refreshUser = authState?.refreshUser ?? (() => { });
    const storage = getHubStorage();

    const currentDisplayId = useMemo(() => 
        String(user?.DisplayId || user?.displayId || user?.Id || user?.id || storage.getItem('displayId') || '0'),
        [user]
    );

    const currentUserRawId = useMemo(() => 
        Number(user?.Id || user?.id || getStoredSmartdashUser()?.Id || 0),
        [user]
    );

    const currentUserWorkId = useMemo(() => 
        Number(user?.WorkId || user?.workId || getStoredSmartdashUser()?.WorkId || 0),
        [user]
    );

    const currentUserName = useMemo(() => 
        user?.nameuser || user?.us_name || user?.Name || user?.name || user?.UserName || user?.displayName || 'مستخدم',
        [user]
    );
    
    const rawAvatar = user?.AvatarUrl || user?.avatarUrl || user?.profilePictureUrl || user?.ProfilePictureUrl || user?.UrlProfile || user?.Url || user?.userAvatarUrl;
    
    // Add a simple cache buster using a timestamp if the URL doesn't have one
    const currentUserAvatar = useMemo(() => 
        rawAvatar ? (rawAvatar.includes('?') ? rawAvatar : `${rawAvatar}?v=${new Date().getTime()}`) : null,
        [rawAvatar]
    );

    /**
     * تحديد ما إذا كان المعرف الممرر يخص المستخدم الحالي (بأي من هويتيه)
     */
    const isMe = (id: string | number | null | undefined): boolean => {
        if (!id) return false;
        const sId = String(id);
        return sId === currentDisplayId || sId === String(currentUserRawId);
    };

    /**
     * الحصول على المعرف الصحيح بناءً على نوع العملية
     * @param operation 'messaging' (Default) | 'reaction' | 'profile'
     */
    const resolveIdentityId = (operation: 'messaging' | 'reaction' | 'profile' = 'messaging'): string | number => {
        switch (operation) {
            case 'messaging':
                return currentDisplayId;
            case 'reaction':
            case 'profile':
                return currentUserRawId;
            default:
                return currentDisplayId;
        }
    };

    return {
        // IDs
        currentDisplayId,
        currentUserRawId,
        currentUserWorkId,

        // Profile Info (Basic)
        currentUserName,
        currentUserAvatar,
        refreshUser,

        // Helpers
        isMe,
        resolveIdentityId
    };
};
