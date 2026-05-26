import React from 'react';
import { FaTimes, FaSync, FaCamera, FaPlus, FaBriefcase, FaIdCard, FaPhoneAlt, FaCalendarDay, FaComments } from 'react-icons/fa';
import UserAvatar from '../common/UserAvatar';
import type { UserLookUp, HubTab } from '../../types/hub.types';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    isMe: (id: any) => boolean;
    isLoading: boolean;
    isUploadingAvatar: boolean;
    isUploadingCover: boolean;
    onRefresh: (id: any) => void;
    onCoverClick: () => void;
    onAvatarClick: () => void;
    avatarInputRef: React.RefObject<HTMLInputElement | null>;
    coverInputRef: React.RefObject<HTMLInputElement | null>;
    handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStartChat: (user: UserLookUp) => void;
    emojiBtnRef?: React.RefObject<HTMLButtonElement | null>; // Added as optional prop
    messagesEndRef?: React.RefObject<HTMLDivElement | null>; // Added as optional prop
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
    isOpen,
    onClose,
    user,
    isMe,
    isLoading,
    isUploadingAvatar,
    isUploadingCover,
    onRefresh,
    onCoverClick,
    onAvatarClick,
    avatarInputRef,
    coverInputRef,
    handleAvatarUpload,
    handleCoverUpload,
    onStartChat
}) => {
    if (!isOpen) return null;

    const isCurrentUserProfile = user && isMe(user.DisplayId || user.Id);

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="bg-[var(--hub-panel-bg)] w-full max-w-[380px] rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-[var(--hub-border)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 left-6 w-10 h-10 bg-[var(--hub-accent)]/10 text-[var(--hub-text-main)] rounded-full flex items-center justify-center z-20 hover:bg-[var(--hub-accent)]/20 transition-all active:scale-90"
                >
                    <FaTimes />
                </button>

                {/* Refresh Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const idToRefresh = user?.Id || user?.id || user?.DisplayId || user?.displayId;
                        if (idToRefresh) onRefresh(idToRefresh);
                    }}
                    className={`absolute top-6 left-[72px] w-10 h-10 bg-[var(--hub-accent)]/10 text-[var(--hub-text-main)] rounded-full flex items-center justify-center z-20 hover:bg-[var(--hub-accent)]/20 transition-all active:scale-90 tooltip tooltip-right`}
                    data-tip="تحديث البيانات"
                >
                    <FaSync className={isLoading ? "animate-spin" : ""} size={14} />
                </button>

                {/* Header Gradient / Background */}
                <div
                    className="h-32 relative overflow-hidden group/cover cursor-pointer"
                    onClick={onCoverClick}
                >
                    <input
                        type="file"
                        ref={coverInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverUpload}
                    />

                    {user?.CoverUrl || user?.coverUrl ? (
                        <img src={user.CoverUrl || user.coverUrl} alt="Cover" className="w-full h-full object-cover animate-in fade-in duration-500" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#A855F7] via-[#3B82F6] to-[#10B981]"></div>
                    )}

                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

                    {/* Edit Cover Button Overlay */}
                    {isCurrentUserProfile && (
                        <div className="absolute top-4 right-4 z-20 tooltip tooltip-left" data-tip={user?.CoverUrl || user?.coverUrl ? "تعديل الغلاف" : "رفع غلاف"}>
                            <div className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border border-white/10 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCoverClick();
                                }}>
                                {isUploadingCover ? (
                                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : user?.CoverUrl || user?.coverUrl ? <FaCamera /> : <FaPlus />}
                                <span>{user?.CoverUrl || user?.coverUrl ? "تغيير الغلاف" : "إضافة غلاف"}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Content */}
                <div className="px-8 pb-10 -mt-10 relative z-10 flex flex-col items-center">
                    {/* Large Avatar */}
                    <div
                        className="w-32 h-32 rounded-[2rem] bg-[var(--hub-panel-bg)] p-1.5 shadow-2xl mb-4 rotate-3 hover:rotate-0 transition-transform duration-500 relative group cursor-pointer"
                        onClick={onAvatarClick}
                    >
                        <input
                            type="file"
                            ref={avatarInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                        <div
                            className="w-full h-full rounded-[1.7rem] overflow-hidden relative group cursor-pointer"
                            onClick={() => isCurrentUserProfile && onAvatarClick()}
                        >
                            <UserAvatar
                                user={user}
                                size="custom"
                                className="w-full h-full rounded-[1.7rem] transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay for Change Picture */}
                            {isCurrentUserProfile && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center flex-col gap-2 text-white backdrop-blur-[2px] z-10">
                                    {isUploadingAvatar ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FaCamera className="text-2xl" />
                                            <span className="text-[10px] font-bold">
                                                {user?.AvatarUrl || user?.avatarUrl ? "تعديل الصورة" : "رفع صورة"}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Permanent Floating Action Button for Editing (Visually clear) */}
                        {isCurrentUserProfile && !isUploadingAvatar && (
                            <div className="absolute -bottom-2 -right-2 w-11 h-11 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-[var(--hub-panel-bg)] group-hover:scale-110 transition-transform duration-300 z-20 tooltip" data-tip={user?.AvatarUrl || user?.avatarUrl ? "تعديل الصورة" : "رفع صورة"}>
                                {user?.AvatarUrl || user?.avatarUrl ? <FaCamera size={16} /> : <FaPlus size={16} />}
                            </div>
                        )}

                        {/* Loading indicator on the button area if uploading */}
                        {isUploadingAvatar && (
                            <div className="absolute -bottom-2 -right-2 w-11 h-11 bg-[var(--hub-panel-bg)] rounded-2xl flex items-center justify-center shadow-lg border-4 border-[#3B82F6] z-20 animate-pulse">
                                <div className="w-4 h-4 border-2 border-[#3B82F6]/20 border-t-[#3B82F6] rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Name & Department */}
                    <h2 className="text-2xl font-black text-[var(--hub-text-main)] mb-1 tracking-tight text-center">
                        {user?.nameuser || user?.Name || user?.us_name || "---"}
                    </h2>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-black mb-8 border border-blue-500/20">
                        <FaBriefcase />
                        <span>{user?.WorkName || user?.workName || user?.WorkType?.WT_NameAr || "القسم غير محدد"}</span>
                    </div>

                    {/* Details Grid */}
                    <div className="w-full space-y-4 mb-10" dir="rtl">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#3B82F6] group-hover:bg-blue-50 transition-all border border-gray-100 shadow-sm">
                                <FaIdCard size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[var(--hub-text-muted)] uppercase tracking-widest">رقم المستخدم</span>
                                <span className="text-sm font-black text-[var(--hub-text-main)]">#{user?.DisplayId || user?.displayId || user?.Id || user?.id || "---"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--hub-bg)] flex items-center justify-center text-[var(--hub-text-muted)] group-hover:text-[#10B981] group-hover:bg-emerald-500/10 transition-all border border-[var(--hub-border)] shadow-sm">
                                <FaPhoneAlt size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[var(--hub-text-muted)] uppercase tracking-widest">رقم الجوال</span>
                                <span className="text-sm font-black text-[var(--hub-text-main)]" dir="ltr">{user?.Phone || user?.phone || user?.Mobile || user?.mobile || user?.us_phone || "غير متوفر"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--hub-bg)] flex items-center justify-center text-[var(--hub-text-muted)] group-hover:text-[#F59E0B] group-hover:bg-amber-500/10 transition-all border border-[var(--hub-border)] shadow-sm">
                                <FaCalendarDay size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[var(--hub-text-muted)] uppercase tracking-widest">تاريخ الانضمام</span>
                                <span className="text-sm font-black text-[var(--hub-text-main)]">
                                    {(() => {
                                        const d = user?.CreatedDateD || user?.createdDateD || user?.JoinedDate || user?.createdAt;
                                        return d ? new Date(d).toLocaleDateString("ar-SA") : "---";
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    {user && !isMe(user.DisplayId || user.id) && (
                        <button
                            onClick={() => {
                                onStartChat({
                                    Id: user.DisplayId || user.id,
                                    Name: user.Name || user.us_name,
                                    WorkId: user.WorkId || 0
                                });
                            }}
                            className="w-full h-16 rounded-[1.5rem] bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] group"
                        >
                            <FaComments className="text-2xl group-hover:rotate-12 transition-transform" />
                            <span>بدء دردشة خاصة</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
