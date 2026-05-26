import { useState, useRef, useCallback } from 'react';
import { hubService } from '../services/hubService';
import type { UserLookUp } from '../types/hub.types';
import { getStoredSmartdashUser, setStoredSmartdashUser } from '../../../core/integration/moduleHost';

interface UseHubProfileProps {
    refreshUser: () => void;
    currentDisplayId: string;
    setAllUsers: React.Dispatch<React.SetStateAction<UserLookUp[]>>;
    isMe: (id: any) => boolean;
}

export const useHubProfile = ({
    refreshUser,
    currentDisplayId,
    setAllUsers,
    isMe
}: UseHubProfileProps) => {
    const [showUserProfileModal, setShowUserProfileModal] = useState(false);
    const [userProfileData, setUserProfileData] = useState<any>(null);
    const [userProfileError, setUserProfileError] = useState<string | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const coverInputRef = useRef<HTMLInputElement | null>(null);

    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    const [profileCropData, setProfileCropData] = useState<{
        src: string;
        type: 'circle' | 'rect';
        target: 'avatar' | 'cover';
        title: string;
        aspectRatio?: number;
    } | null>(null);

    const openUserProfile = useCallback(async (userId: string | number) => {
        if (!userId) return;
        setIsLoadingProfile(true);
        setShowUserProfileModal(true);
        setUserProfileData(null);
        setUserProfileError(null);
        try {
            const res = await hubService.getUserDetails(userId);
            setUserProfileData(res.data);
        } catch (error: any) {
            const msg = error.response?.data || error.message || 'فشل الاتصال بالخادم';
            setUserProfileError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsLoadingProfile(false);
        }
    }, []);

    const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setProfileCropData({
                    src: event.target.result as string,
                    type: 'circle',
                    target: 'avatar',
                    title: 'تعديل الصورة الشخصية'
                });
                if (avatarInputRef.current) avatarInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    }, []);

    const handleCoverUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setProfileCropData({
                    src: event.target.result as string,
                    type: 'rect',
                    target: 'cover',
                    title: 'تعديل غلاف الصفحة الشخصية',
                    aspectRatio: 2.8
                });
                if (coverInputRef.current) coverInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    }, []);

    const handleProfileCropConfirm = useCallback(async (croppedBlob: Blob) => {
        if (!profileCropData) return;

        const isAvatar = profileCropData.target === 'avatar';
        if (isAvatar) setIsUploadingAvatar(true);
        else setIsUploadingCover(true);

        const modalRef = profileCropData.target;
        setProfileCropData(null);

        try {
            const formData = new FormData();
            formData.append('file', croppedBlob, `${modalRef}.jpg`);

            const response = await (isAvatar ? hubService.uploadAvatar(formData) : hubService.uploadCover(formData));

            if (response.data.status === 'success') {
                const newUrl = isAvatar ? response.data.avatarUrl : response.data.coverUrl;

                setUserProfileData((prev: any) => {
                    if (!prev) return null;
                    return isAvatar ? { ...prev, AvatarUrl: newUrl } : { ...prev, CoverUrl: newUrl };
                });

                // Persistence & Syncing with AuthContext
                const u = getStoredSmartdashUser();
                if (u) {
                    // Merge with userProfileData to ensure we have full details (names, etc)
                    const updatedUser = { 
                        ...u, 
                        ...(userProfileData || {}),
                        AvatarUrl: isAvatar ? newUrl : (u.AvatarUrl || userProfileData?.AvatarUrl),
                        CoverUrl: !isAvatar ? newUrl : (u.CoverUrl || userProfileData?.CoverUrl),
                        profilePictureUrl: isAvatar ? newUrl : (u.profilePictureUrl || userProfileData?.profilePictureUrl)
                    };
                    setStoredSmartdashUser(updatedUser);
                }

                if (isAvatar) {
                    setAllUsers((prev: UserLookUp[]) => prev.map(u =>
                        isMe(u.Id) ? { ...u, AvatarUrl: newUrl } : u
                    ));
                }

                refreshUser();
            }
        } catch (error) {
            console.error(`${modalRef} upload failed:`, error);
        } finally {
            if (isAvatar) setIsUploadingAvatar(false);
            else setIsUploadingCover(false);
        }
    }, [profileCropData, refreshUser, isMe, setAllUsers]);

    return {
        showUserProfileModal, setShowUserProfileModal,
        userProfileData, setUserProfileData,
        userProfileError,
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
    };
};
