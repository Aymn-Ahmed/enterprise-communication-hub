import React from 'react';
import {
    FaTimes, FaExpandArrowsAlt, FaCompressArrowsAlt, FaThumbtack,
    FaQuestionCircle, FaCalendarAlt, FaBullhorn, FaCommentDots, FaWhatsapp,
    FaSyncAlt, FaPlus, FaBell, FaUserEdit, FaCog, FaRegCommentDots, FaRegCalendarAlt, FaRegComments,
    FaImage, FaMoon, FaSun, FaDesktop
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import type { HubTab } from '../../types/hub.types';
import UserAvatar from '../common/UserAvatar';
import PortalMenu from '../common/PortalMenu';

interface HubSidebarProps {
    activeTab: HubTab | null;
    counts: {
        questions: number;
        appointments: number;
        announcements: number;
        chat: number;
        total: number;
        [key: string]: number;
    };
    isFullScreen: boolean;
    isPinned: boolean;
    onTabChange: (tab: HubTab) => void;
    onClose: () => void;
    onToggleFullScreen: () => void;
    onTogglePinned: () => void;
    onOpenProfile: () => void;
    onOpenWallpaperSettings: () => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    currentUserName: string;
    currentUserAvatar?: string;
    currentUserRawId: number;
}

/**
 * Main sidebar component for tab navigation and global actions
 */
const HubSidebar: React.FC<HubSidebarProps> = ({
    activeTab,
    counts,
    isFullScreen,
    isPinned,
    onTabChange,
    onClose,
    onToggleFullScreen,
    onTogglePinned,
    onOpenProfile,
    onOpenWallpaperSettings,
    onRefresh,
    isRefreshing,
    currentUserName,
    currentUserAvatar,
    currentUserRawId
}) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [showSettings, setShowSettings] = React.useState(false);
    const settingsBtnRef = React.useRef<HTMLButtonElement>(null);

    return (
        <div className="w-[140px] min-w-[140px] shrink-0 flex flex-col bg-[var(--hub-sidebar-bg)] z-10 border-l border-[var(--hub-border)] shadow-2xl relative">
            {/* Header Control Row */}
            <div className="p-3 pb-0 shrink-0">
                <div className="flex items-center justify-center gap-2 py-3 bg-[var(--hub-header-bg)] rounded-3xl border border-[var(--hub-border)] mb-3">
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                        title="إغلاق"
                    >
                        <FaTimes size={10} />
                    </button>
                    <button
                        onClick={onToggleFullScreen}
                        className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                        title={isFullScreen ? 'تصغير' : 'تكبير'}
                    >
                        {isFullScreen ? <FaCompressArrowsAlt size={10} /> : <FaExpandArrowsAlt size={10} />}
                    </button>
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className={`w-7 h-7 rounded-lg transition-all active:scale-95 flex items-center justify-center 
                            ${isRefreshing 
                                ? 'bg-[#00a884] text-white shadow-lg shadow-[#00a884]/20' 
                                : 'bg-gradient-to-tr from-[#00a884]/10 to-teal-500/10 text-[#00a884] hover:from-[#00a884] hover:to-teal-500 hover:text-white hover:shadow-lg hover:shadow-[#00a884]/30'
                            }`}
                        title="تحديث البيانات"
                    >
                        <FaSyncAlt size={10} className={isRefreshing ? 'animate-spin' : 'transition-transform duration-500 hover:rotate-180'} />
                    </button>
                    <button
                        onClick={onTogglePinned}
                        className={`w-7 h-7 rounded-lg transition-all active:scale-95 flex items-center justify-center ${isPinned ? 'bg-yellow-400 text-gray-900 shadow-lg' : 'bg-[var(--hub-input-bg)] text-[var(--hub-text-muted)] hover:bg-gray-500 hover:text-white'}`}
                        title={isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
                    >
                        <FaThumbtack size={10} className={isPinned ? 'rotate-45' : ''} />
                    </button>
                </div>
            </div>

            {/* Minimalist Unread Indicator */}
            <div className="px-3 py-2 flex items-center justify-center border-b border-[var(--hub-border)]">
                <span className="text-[10px] font-black text-[var(--hub-text-secondary)] uppercase tracking-tight">
                    {activeTab === 'questions' ? `${counts.questions} سؤال` :
                        activeTab === 'appointments' ? `${counts.appointments} موعد` :
                            activeTab === 'announcements' ? `${counts.announcements} تعميم` :
                                activeTab === 'chat' ? `${counts.chat} محادثة` :
                                    `${counts.total} إشعار جديد`}
                </span>
            </div>

            {/* Tabs Container - WhatsApp Style */}
            <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto no-scrollbar">
                {[
                    { id: 'questions', name: 'أسئلة', icon: <FaRegCommentDots size={16} />, activeColor: '#3B82F6' },
                    { id: 'appointments', name: 'مواعيد', icon: <FaRegCalendarAlt size={16} />, activeColor: '#10B981' },
                    { id: 'announcements', name: 'تعميم', icon: <FaBullhorn size={16} />, activeColor: '#F97316' },
                    { id: 'chat', name: 'دردشة', icon: <FaRegComments size={16} />, activeColor: '#25D366' }
                ].map(tab => {
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id as HubTab)}
                            dir="rtl"
                            className={`w-full flex items-center justify-between py-3 px-4 rounded-2xl transition-all duration-200 active:scale-95 border-r-4 border-transparent
                                ${isActive
                                    ? 'bg-[var(--hub-active)] border-r-[var(--hub-accent)]'
                                    : 'hover:bg-[var(--hub-hover)] text-[var(--hub-text-secondary)] hover:text-[var(--hub-text-main)]'
                                }`}
                        >
                            {/* Right Side: Icon & Name Cluster */}
                            <div className="flex items-center gap-3">
                                <div style={{ color: isActive ? 'var(--hub-accent)' : 'inherit' }}>
                                    {tab.icon}
                                </div>
                                <span className={`text-[13px] font-black tracking-wide ${isActive ? 'text-[var(--hub-text-main)]' : 'opacity-70 group-hover:opacity-100'}`}>
                                    {tab.name}
                                </span>
                            </div>

                            {/* Left Side: Notification Badge */}
                            {(() => {
                                const count = counts[tab.id as keyof typeof counts];
                                if (count > 0) {
                                    return (
                                        <span className={`text-[10px] font-[900] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-300 leading-none ${isActive ? 'bg-white text-gray-900 border-none' : 'bg-[#FF2E63] text-white'}`}>
                                            {count > 99 ? '99+' : count}
                                        </span>
                                    );
                                }
                                return null;
                            })()}
                        </button>
                    );
                })}
            </div>

            {/* Profile & Settings (WhatsApp Vibe) */}
            <div className="p-4 border-t border-[var(--hub-border)] bg-[var(--hub-sidebar-bg)] flex flex-col items-center gap-4">
                {/* Profile Button */}
                <button
                    onClick={onOpenProfile}
                    className="w-full group flex flex-col items-center gap-2"
                >
                    <div className="relative">
                        <UserAvatar
                            name={currentUserName}
                            url={currentUserAvatar}
                            userId={currentUserRawId}
                            size="lg"
                            border
                            className="group-hover:scale-110 active:scale-95 transition-all duration-300 ring-2 ring-transparent group-hover:ring-blue-500/30"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white w-6 h-6 rounded-lg flex items-center justify-center border-2 border-[var(--hub-sidebar-bg)] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaUserEdit size={10} />
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-[var(--hub-text-muted)] uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                        الملف الشخصي
                    </span>
                </button>

                {/* Settings & Extra Actions */}
                <div className="flex items-center gap-3 w-full justify-center pt-2 border-t border-[var(--hub-border)]">
                    <button
                        onClick={onOpenWallpaperSettings}
                        className="text-[var(--hub-text-muted)] hover:text-indigo-500 transition-colors tooltip tooltip-top"
                        data-tip="خلفية الدردشة"
                    >
                        <FaImage size={16} />
                    </button>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--hub-border)]"></div>
                    
                    <button 
                        ref={settingsBtnRef}
                        onClick={() => {
                            setShowSettings(!showSettings);
                        }}
                        className={`transition-all p-2 rounded-xl flex items-center justify-center ${showSettings ? 'text-blue-500 bg-blue-500/20 scale-110 shadow-lg' : 'text-[var(--hub-text-muted)] hover:text-blue-500 hover:bg-[var(--hub-hover)]'}`}
                        title="الإعدادات وتغيير الوضع"
                    >
                        <FaCog size={18} className={showSettings ? 'animate-spin-slow' : ''} />
                    </button>

                    {/* Settings Menu Popup via Portal */}
                    {showSettings && (
                        <PortalMenu
                            anchorRef={settingsBtnRef}
                            onClose={() => setShowSettings(false)}
                            minWidth="180px"
                            offset={12}
                        >
                            <div className="text-[10px] font-black text-[var(--hub-text-muted)] uppercase px-3 py-2 border-b border-[var(--hub-border)] mb-1">
                                خيارات العرض
                            </div>
                            <div className="grid grid-cols-3 gap-1 p-2">
                                <button 
                                    onClick={() => { setTheme('light'); setShowSettings(false); }}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${theme === 'light' ? 'bg-blue-500/20 text-blue-600 font-bold' : 'hover:bg-[var(--hub-hover)] text-[var(--hub-text-muted)]'}`}
                                >
                                    <FaSun size={14} />
                                    <span className="text-[9px]">فاتح</span>
                                </button>
                                <button 
                                    onClick={() => { setTheme('dark'); setShowSettings(false); }}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-blue-500/20 text-blue-600 font-bold' : 'hover:bg-[var(--hub-hover)] text-[var(--hub-text-muted)]'}`}
                                >
                                    <FaMoon size={14} />
                                    <span className="text-[9px]">داكن</span>
                                </button>
                                <button 
                                    onClick={() => { setTheme('system'); setShowSettings(false); }}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${theme === 'system' ? 'bg-blue-500/20 text-blue-600 font-bold' : 'hover:bg-[var(--hub-hover)] text-[var(--hub-text-muted)]'}`}
                                >
                                    <FaDesktop size={14} />
                                    <span className="text-[9px]">تلقائي</span>
                                </button>
                            </div>
                            <div className="p-2 pt-0">
                                <button
                                    onClick={onOpenWallpaperSettings}
                                    className="w-full flex items-center gap-2 p-2 px-3 text-xs text-[var(--hub-text-main)] hover:bg-[var(--hub-hover)] rounded-xl transition-colors"
                                >
                                    <FaImage size={12} className="text-indigo-400" />
                                    <span>خلفية الدردشة</span>
                                </button>
                            </div>
                        </PortalMenu>
                    )}

                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--hub-border)]"></div>
                    <button 
                        onClick={onClose}
                        className="text-[var(--hub-text-muted)] hover:text-red-500 transition-colors p-1"
                        title="إغلاق"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(HubSidebar);

