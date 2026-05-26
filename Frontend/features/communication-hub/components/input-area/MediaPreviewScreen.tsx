import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaSpinner, FaMusic } from 'react-icons/fa';
import { dispatchHubToast } from '../../utils/hubToastEvents';

interface MediaPreviewScreenProps {
    files: File[];
    onClose: () => void;
    onSend: (files: File[], caption: string) => Promise<void>;
    /** 0–100 while uploading; null hides bar */
    uploadProgress?: number | null;
}

const MediaPreviewScreen: React.FC<MediaPreviewScreenProps> = ({ files, onClose, onSend, uploadProgress = null }) => {
    const [caption, setCaption] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Generate blob URLs for previews
        const newPreviews = files.map(f => ({
            url: URL.createObjectURL(f),
            type: f.type
        }));
        setPreviews(newPreviews);

        // Cleanup
        return () => {
            newPreviews.forEach(p => URL.revokeObjectURL(p.url));
        };
    }, [files]);

    const handleSend = async () => {
        if (isSending) return;
        setIsSending(true);
        try {
            await onSend(files, caption);
            // It will be closed by the parent when pending files are cleared
        } catch (error) {
            console.error('Error sending media:', error);
            setIsSending(false);
            dispatchHubToast('حدث خطأ أثناء إرسال الوسائط. حاول مجدداً.', 'error');
        }
    };

    if (previews.length === 0) return null;

    const currentMedia = previews[currentIndex];

    // Auto-resize textarea logic
    const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCaption(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    return (
        <div className="absolute inset-0 z-[100] bg-[var(--hub-panel-bg)] flex flex-col animate-in fade-in zoom-in-95 duration-200" dir="ltr">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-transparent absolute top-0 w-full z-10 pointer-events-none">
                <button 
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors pointer-events-auto shadow-md backdrop-blur-sm"
                >
                    <FaTimes size={18} />
                </button>
            </div>

            {/* Media Area */}
            <div className="flex-1 bg-[#0b141a] dark:bg-black/95 flex items-center justify-center relative overflow-hidden pb-4">
                {currentMedia.type.startsWith('image/') ? (
                    <img src={currentMedia.url} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                ) : currentMedia.type.startsWith('video/') ? (
                    <video src={currentMedia.url} controls className="max-w-full max-h-full drop-shadow-2xl" />
                ) : (
                    <div className="w-full max-w-md p-6 bg-[var(--hub-bg)] rounded-2xl shadow-xl flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-500 shadow-inner">
                            <FaMusic size={32} />
                        </div>
                        <audio src={currentMedia.url} controls className="w-full grayscale opacity-90" />
                        <span className="text-sm font-bold text-[var(--hub-text-main)] truncate max-w-full" dir="auto">{files[currentIndex]?.name || 'ملف صوتي'}</span>
                    </div>
                )}

                {/* Thumbnail list (if multiple) */}
                {previews.length > 1 && (
                    <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 px-4 overflow-x-auto pb-2">
                        {previews.map((p, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-14 h-14 rounded-md overflow-hidden cursor-pointer border-2 transition-all shadow-lg ${idx === currentIndex ? 'border-emerald-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            >
                                {p.type.startsWith('image/') ? (
                                    <img src={p.url} className="w-full h-full object-cover" />
                                ) : p.type.startsWith('video/') ? (
                                    <video src={p.url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-500">
                                        <FaMusic size={20} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[var(--hub-panel-bg)] border-t border-[var(--hub-border)] shrink-0 shadow-lg z-20">
                {uploadProgress !== null && uploadProgress >= 0 ? (
                    <div className="max-w-3xl mx-auto mb-2 h-1.5 w-full rounded-full bg-[var(--hub-border)] overflow-hidden" dir="rtl">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-[width] duration-150"
                            style={{ width: `${Math.min(100, uploadProgress)}%` }}
                        />
                    </div>
                ) : null}
                <div className="max-w-3xl mx-auto flex items-end gap-2" dir="rtl">
                    <div className="flex-1 bg-[var(--hub-input-bg)] rounded-[20px] border border-[var(--hub-border)] shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all overflow-hidden">
                        <textarea
                            placeholder="إضافة تعليق..."
                            value={caption}
                            onChange={handleTextareaInput}
                            className="w-full py-3 px-4 bg-transparent border-none focus:ring-0 text-[15px] text-[var(--hub-text-main)] resize-none outline-none custom-scrollbar"
                            rows={1}
                            dir="rtl"
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className={`w-12 h-12 rounded-full text-white flex items-center justify-center shrink-0 transition-all shadow-md focus:outline-none bg-emerald-500 hover:bg-emerald-600 ${isSending ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 hover:shadow-lg hover:-translate-y-0.5'}`}
                    >
                        {isSending ? (
                            <FaSpinner className="animate-spin" size={20} />
                        ) : (
                            <FaPaperPlane size={18} className="transform -scale-x-100 translate-x-1" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaPreviewScreen;
