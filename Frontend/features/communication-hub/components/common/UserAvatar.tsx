import React, { useMemo, useState, useEffect } from 'react';
import { FaUsers, FaBullhorn } from 'react-icons/fa';

interface UserAvatarProps {
    user?: any;
    userId?: string | number;
    name?: string;
    url?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
    type?: 'User' | 'Department' | 'Global';
    className?: string;
    border?: boolean;
    onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    user,
    userId,
    name,
    url,
    size = 'md',
    type = 'User',
    className = '',
    border = false,
    onClick
}) => {
    const finalUserId = userId || user?.Id || user?.id || user?.UserId || user?.userId;
    const finalName = name || user?.Name || user?.name || user?.UserName || user?.userName || '?';

    const rawUrl =
        url ||
        user?.profilePictureUrl ||
        user?.ProfilePictureUrl ||
        user?.AvatarUrl ||
        user?.avatarUrl ||
        user?.UrlProfile ||
        user?.urlProfile ||
        user?.Url ||
        user?.url ||
        user?.userAvatarUrl ||
        user?.UserAvatarUrl;

    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [rawUrl]);

    const imgSrc = useMemo(() => {
        if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') return null;

        if (rawUrl.startsWith('http') || rawUrl.startsWith('data:')) {
            return rawUrl;
        }

        const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
        let cleanPath = rawUrl.trim();
        
        // Ensure path starts with / if it's not a full URL
        if (!cleanPath.startsWith('/') && !cleanPath.includes('://')) {
            // If it doesn't have /uploads/ or /Uploads/, check if we should add it
            if (!cleanPath.toLowerCase().startsWith('uploads/') && !cleanPath.toLowerCase().startsWith('downloads/')) {
                // Heuristic: if it looks like just a filename, it might be in avatars
                if (cleanPath.includes('.') && !cleanPath.includes('/')) {
                    cleanPath = `/uploads/avatars/${cleanPath}`;
                } else {
                    cleanPath = `/${cleanPath}`;
                }
            } else {
                cleanPath = `/${cleanPath}`;
            }
        }
        
        return `${baseUrl}${cleanPath}`;
    }, [rawUrl]);

    const getAvatarColor = (str: string) => {
        const colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'
        ];
        const seed = finalUserId ? String(finalUserId) : str;
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const sizeClasses: Record<string, string> = {
        xs: 'w-5 h-5 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-32 h-32 text-4xl',
        custom: ''
    };

    const iconSize: Record<string, number> = {
        xs: 10,
        sm: 14,
        md: 18,
        lg: 22,
        xl: 60,
        custom: 24
    };

    const avatarColor = getAvatarColor(finalName);
    const firstLetter = finalName.trim().charAt(0).toUpperCase() || '?';

    const renderContent = () => {
        if (type === 'Department') {
            return (
                <div className="flex items-center justify-center bg-[var(--hub-input-bg)] text-[var(--hub-text-secondary)] w-full h-full">
                    <FaUsers size={iconSize[size]} />
                </div>
            );
        }

        if (type === 'Global') {
            return (
                <div className="flex items-center justify-center bg-blue-500 text-white w-full h-full">
                    <FaBullhorn size={iconSize[size]} />
                </div>
            );
        }

        if (imgSrc && !imageError) {
            return (
                <img
                    key={imgSrc}
                    src={imgSrc}
                    alt={finalName}
                    onError={() => setImageError(true)}
                    loading="lazy"
                    className="w-full h-full object-cover animate-in fade-in duration-500"
                />
            );
        }

        return (
            <div
                className="w-full h-full flex items-center justify-center text-white font-black uppercase animate-in zoom-in duration-300"
                style={{ backgroundColor: avatarColor }}
            >
                <span
                    style={{
                        fontSize:
                            size === 'xs' ? '10px' :
                            size === 'sm' ? '12px' :
                            size === 'md' ? '16px' :
                            size === 'lg' ? '24px' : '32px'
                    }}
                >
                    {firstLetter}
                </span>
            </div>
        );
    };

    return (
        <div
            onClick={onClick}
            className={`
                relative shrink-0 rounded-full flex items-center justify-center
                overflow-hidden shadow-sm transition-transform duration-300
                ${sizeClasses[size]}
                ${border ? 'border-2 border-[var(--hub-sidebar-bg)]' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {renderContent()}

            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-full" />
            {imgSrc && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-full" />
            )}
        </div>
    );
};

export default UserAvatar;
