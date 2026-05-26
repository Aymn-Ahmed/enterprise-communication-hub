import React, { useState, useMemo } from 'react';
import { 
    FaShare, FaTimes, FaSearch, FaUsers, FaBullhorn, 
    FaCheck, FaPaperPlane, FaImage, FaFileAlt, FaMicrophone, FaPaperclip 
} from 'react-icons/fa';
import UserAvatar from './UserAvatar';
import type { UserLookUp, LookUp } from '../../types/hub.types';

interface ForwardMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    messageItem: any;
    allUsers: UserLookUp[];
    departments: LookUp[];
    onForward: (targets: { type: 'User' | 'Department' | 'Global'; id: string }[]) => Promise<void>;
    isForwarding: boolean;
}

const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
    isOpen,
    onClose,
    messageItem,
    allUsers,
    departments,
    onForward,
    isForwarding
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTargets, setSelectedTargets] = useState<{ type: 'User' | 'Department' | 'Global', id: string, name: string }[]>([]);

    const filteredRecipients = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        
        const filteredDepts = departments
            .filter(d => d.Name.toLowerCase().includes(term))
            .map(d => ({ ...d, type: 'Department' as const }));

        const filteredUsers = allUsers
            .filter(u => u.Name.toLowerCase().includes(term))
            .map(u => ({ ...u, type: 'User' as const }));

        return [...filteredDepts, ...filteredUsers];
    }, [searchTerm, allUsers, departments]);

    const toggleTarget = (target: { type: 'User' | 'Department' | 'Global', id: any, name: string }) => {
        const targetId = String(target.id);
        const exists = selectedTargets.find(t => t.type === target.type && t.id === targetId);
        
        if (exists) {
            setSelectedTargets(prev => prev.filter(t => !(t.type === target.type && t.id === targetId)));
        } else {
            setSelectedTargets(prev => [...prev, { type: target.type, id: targetId, name: target.name }]);
        }
    };

    const handleForward = async () => {
        if (selectedTargets.length === 0) return;
        await onForward(selectedTargets.map(t => ({ type: t.type, id: t.id })));
    };

    if (!isOpen || !messageItem) return null;

    const payload = typeof messageItem.Payload === 'string' ? JSON.parse(messageItem.Payload) : messageItem.Payload;
    const messageText = messageItem.Name || messageItem.name || messageItem.Message || messageItem.message || payload?.text || "";
    const hasAttachments = !!(messageItem.AttachmentUrl || messageItem.attachmentUrl || payload?.attachments);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>
{/* Modal Content */}
<div className="bg-[var(--hub-panel-bg)] w-full max-w-md max-h-[80vh] rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-[var(--hub-border)]">
                {/* Header */}
                <div className="p-5 border-b border-[var(--hub-border)] bg-[var(--hub-header-bg)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <FaShare className="text-lg" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[var(--hub-text-main)]">توجيه الرسالة</h3>
                            <p className="text-[10px] text-[var(--hub-text-secondary)] opacity-70 uppercase tracking-widest font-bold">Forward Message</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl hover:bg-red-500/10 text-[var(--hub-text-secondary)] hover:text-red-500 transition-all flex items-center justify-center active:scale-90"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Message Preview */}
                <div className="px-5 py-3 bg-[var(--hub-bg)] border-b border-[var(--hub-border)]">
                    <div className="bg-[var(--hub-panel-bg)]/50 p-3 rounded-2xl border border-dashed border-[var(--hub-border)] flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-orange-500 block mb-0.5">رسالة من: {messageItem.FromUserName || 'مستخدم'}</span>
                            <p className="text-xs text-[var(--hub-text-main)] truncate opacity-80" dir="auto">
                                {messageText || (hasAttachments ? 'مرفق' : '...')}
                            </p>
                        </div>
                        {hasAttachments && (
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <FaPaperclip size={12} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-[var(--hub-panel-bg)]">
                    <div className="relative group">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                            <FaSearch size={14} />
                        </div>
                        <input 
                            type="text"
                            placeholder="ابحث عن اسم أو قسم..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pr-11 pl-4 rounded-2xl bg-[var(--hub-input-bg)] border-2 border-transparent focus:border-orange-500/50 outline-none text-sm transition-all text-right font-medium text-[var(--hub-text-main)]"
                            dir="rtl"
                        />
                    </div>
                </div>

                {/* Selected Chips */}
                {selectedTargets.length > 0 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto no-scrollbar" dir="rtl">
                        {selectedTargets.map(t => (
                            <div 
                                key={`${t.type}-${t.id}`}
                                className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-[11px] font-bold animate-in zoom-in-90 duration-300"
                            >
                                <span>{t.name}</span>
                                <button onClick={() => toggleTarget({ type: t.type, id: t.id, name: t.name })} className="hover:scale-110">
                                    <FaTimes size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recipients List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-[300px]" dir="rtl">
                    {filteredRecipients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[var(--hub-text-secondary)] opacity-50">
                            <FaSearch size={32} className="mb-3" />
                            <p className="text-sm font-bold">لم يتم العثور على أي نتائج</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredRecipients.map((r: any) => {
                                const isSelected = selectedTargets.some(t => t.type === r.type && t.id === String(r.Id || r.id));
                                return (
                                    <div 
                                        key={`${r.type}-${r.Id || r.id}`}
                                        onClick={() => toggleTarget({ type: r.type, id: r.Id || r.id, name: r.Name || r.name })}
                                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? 'bg-orange-500/5 border-orange-500/30' : 'hover:bg-[var(--hub-hover)] border-transparent'}`}
                                    >
                                        <div className="relative">
                                            {r.type === 'User' ? (
                                                <UserAvatar user={r} size="sm" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                                    <FaUsers size={14} />
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center ring-2 ring-[var(--hub-panel-bg)] animate-in zoom-in duration-300">
                                                    <FaCheck size={8} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-black truncate ${isSelected ? 'text-orange-500' : 'text-[var(--hub-text-main)]'}`}>{r.Name || r.name}</h4>
                                            <p className="text-[10px] text-[var(--hub-text-secondary)] opacity-70 font-bold uppercase tracking-tight">
                                                {r.type === 'User' ? 'مستخدم' : 'قسم'}
                                            </p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isSelected && <FaCheck size={10} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--hub-border)] bg-[var(--hub-bg)]/50">
                    <button
                        onClick={handleForward}
                        disabled={selectedTargets.length === 0 || isForwarding}
                        className={`w-full h-12 rounded-2xl flex items-center justify-center gap-3 font-black text-sm transition-all shadow-lg active:scale-95 ${
                            selectedTargets.length > 0 
                            ? 'bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600' 
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {isForwarding ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>إعادة توجيه</span>
                                {selectedTargets.length > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">{selectedTargets.length}</span>}
                                <FaPaperPlane className={`text-xs ${selectedTargets.length > 0 ? 'animate-pulse' : ''}`} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForwardMessageModal;
