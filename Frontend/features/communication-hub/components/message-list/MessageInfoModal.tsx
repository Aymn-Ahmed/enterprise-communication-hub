import React from 'react';
import { FaTimes, FaCommentDots, FaPaperclip, FaUsersSlash, FaCheckDouble, FaCheck } from 'react-icons/fa';

interface MessageInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    data: any[];
    isLoading: boolean;
    getFileName: (url: string) => string;
}

export const MessageInfoModal: React.FC<MessageInfoModalProps> = ({
    isOpen,
    onClose,
    item,
    data,
    isLoading,
    getFileName
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-black/30 dark:bg-black/50 backdrop-blur-[3px] animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="bg-[#F8FAFC] dark:bg-[#0B141A] w-[92%] max-w-[360px] max-h-[85%] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.4)] rounded-[2.5rem] border border-white dark:border-gray-800 relative"
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Windows-style Header */}
                <div className="p-5 bg-white dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="text-gray-800 dark:text-white font-black text-lg tracking-tight">معلومات الرسالة</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">تحديثات القراءة الفورية</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all active:scale-90 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    {/* Message Preview Section */}
                    {item && (
                        <div className="bg-white dark:bg-gray-800/40 rounded-3xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
                            <div className="flex items-center gap-2 mb-3 opacity-60">
                                <FaCommentDots className="text-blue-500 text-xs" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">معاينة المحتوى</span>
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-relaxed mb-3">
                                {item.Name || item.name || item.Message || item.message || "بدون نص"}
                            </p>
                            {(item.AttachmentUrl || item.attachmentUrl) && (
                                <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-dashed border-blue-200 dark:border-blue-800/50 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                        <FaPaperclip size={14} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black text-blue-700 dark:text-blue-300">ملف مرفق</span>
                                        <span className="text-[8px] text-gray-400 truncate max-w-[150px]" dir="ltr">{getFileName(item.AttachmentUrl || item.attachmentUrl)}</span>
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-700/30">
                                <span className="text-[9px] font-bold text-gray-400">تم الإرسال:</span>
                                <span className="text-[9px] font-black text-gray-500">{new Date(item.CreatedDate || item.CreatedAt || Date.now()).toLocaleString('ar-SA')}</span>
                            </div>
                        </div>
                    )}

                    {/* Delivery Status List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <FaCheckDouble className="text-green-600 text-[10px]" />
                                </div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">حالة الوصول</h4>
                            </div>
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-lg text-[9px] font-black">{data.length} مستلم</span>
                        </div>

                        {isLoading ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-4">
                                <div className="w-10 h-10 border-[3px] border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black text-gray-400 animate-pulse tracking-widest">جاري الجلب...</span>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="py-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem] bg-gray-50/30 dark:bg-black/10">
                                <FaUsersSlash size={36} className="mx-auto text-gray-200 mb-3" />
                                <p className="text-gray-400 font-bold text-xs">لا يوجد مستلمين</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.map((d: any, idx: number) => {
                                    const isRead = d.status === 'Read' || d.isRead || d.IsRead;
                                    const isDelivered = d.status === 'Delivered' || d.isDelivered || d.IsDeliveredStatus;
                                    const userName = d.UserName || d.userName || d.User?.nameuser || d.User?.Us_Name || 'مستلم';

                                    return (
                                        <div key={idx} className="bg-white dark:bg-gray-800/60 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all animate-in slide-in-from-top-2 duration-300" style={{ animationDelay: `${idx * 40}ms` }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-xl font-black text-blue-500 group-hover:scale-105 transition-transform shadow-sm">
                                                    {userName.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{userName}</span>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        {isRead ? (
                                                            <span className="text-[9px] font-black text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                                <FaCheckDouble size={10} /> مقروءة
                                                            </span>
                                                        ) : isDelivered ? (
                                                            <span className="text-[9px] font-black text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                                <FaCheckDouble size={10} /> مستلمة
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-gray-300 flex items-center gap-1">
                                                                <FaCheck size={10} /> مرسلة
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-left flex flex-col items-end gap-1">
                                                {isRead && d.ReadAt && (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">وقت القراءة</span>
                                                        <span className="text-[10px] font-black text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded-md border border-gray-100 dark:border-gray-700">{new Date(d.ReadAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                                {!isRead && isDelivered && d.DeliveredAt && (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">وقت الوصول</span>
                                                        <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">{new Date(d.DeliveredAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer Info */}
                <div className="p-4 bg-gray-50/80 dark:bg-black/40 text-center border-t border-gray-100 dark:border-gray-700/50">
                    <p className="text-[9px] text-gray-400 font-black tracking-widest leading-loose">
                        تستخدم هذه النافذة للتأكد من وصول الرسائل الهامة<br />
                        <span className="text-blue-500 opacity-60">Smart Dashboard Communication Hub</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
