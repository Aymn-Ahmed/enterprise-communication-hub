import React from 'react';
import HubSidebar from '../components/sidebar/HubSidebar';
import { WallpaperSettingsModal } from '../components/settings/WallpaperSettingsModal';

type HubSidebarSectionProps = {
    showWallpaperSettings: boolean;
    isFullScreen: boolean;
    currentChatId: string;
    currentDisplayId: number;
    currentUserName: string;
    activeTab: any;
    counts: any;
    isPinned: boolean;
    onTabChange: (tab: any) => void;
    onClose: () => void;
    onToggleFullScreen: () => void;
    onTogglePinned: () => void;
    onOpenProfile: () => void;
    onOpenWallpaperSettings: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    currentUserAvatar?: string;
    currentUserRawId: number;
    setShowWallpaperSettings: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function HubSidebarSection(props: HubSidebarSectionProps) {
    const {
        showWallpaperSettings,
        isFullScreen,
        currentChatId,
        currentDisplayId,
        currentUserName,
        activeTab,
        counts,
        isPinned,
        onTabChange,
        onClose,
        onToggleFullScreen,
        onTogglePinned,
        onOpenProfile,
        onOpenWallpaperSettings,
        onRefresh,
        isRefreshing,
        currentUserAvatar,
        currentUserRawId,
        setShowWallpaperSettings
    } = props;

    return (
        <div className={`${showWallpaperSettings ? (isFullScreen ? 'w-[320px]' : 'w-[280px]') : 'w-[140px]'} min-w-[140px] shrink-0 border-l border-[var(--hub-border)] bg-[var(--hub-sidebar-bg)] backdrop-blur-md flex flex-col relative overflow-visible transition-all duration-500 ease-in-out`}>
            {showWallpaperSettings ? (
                <WallpaperSettingsModal
                    isOpen={showWallpaperSettings}
                    onClose={() => setShowWallpaperSettings(false)}
                    chatId={currentChatId}
                    userId={String(currentDisplayId)}
                    userName={currentUserName}
                />
            ) : (
                <HubSidebar
                    activeTab={activeTab}
                    counts={counts}
                    isFullScreen={isFullScreen}
                    isPinned={isPinned}
                    onTabChange={onTabChange}
                    onClose={onClose}
                    onToggleFullScreen={onToggleFullScreen}
                    onTogglePinned={onTogglePinned}
                    onOpenProfile={onOpenProfile}
                    onOpenWallpaperSettings={onOpenWallpaperSettings}
                    onRefresh={onRefresh}
                    isRefreshing={isRefreshing}
                    currentUserName={currentUserName}
                    currentUserAvatar={currentUserAvatar}
                    currentUserRawId={currentUserRawId}
                />
            )}
        </div>
    );
}
