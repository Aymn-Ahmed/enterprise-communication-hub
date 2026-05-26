import React, { useState, useRef } from 'react';
import { FaTimes, FaPlus, FaCloudUploadAlt, FaCheck, FaTrashAlt } from 'react-icons/fa';
import { dispatchHubToast } from '../../utils/hubToastEvents';

interface StickerMakerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStickerCreated: (url: string) => void;
}

const StickerMakerModal: React.FC<StickerMakerModalProps> = ({ isOpen, onClose, onStickerCreated }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const processAndUpload = async () => {
        if (!selectedImage || !canvasRef.current) return;
        setIsUploading(true);

        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = selectedImage;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            // Crop to square and potentially circle
            const size = Math.min(img.width, img.height);
            canvas.width = 512;
            canvas.height = 512;

            if (ctx) {
                // Clear and draw as circle
                ctx.clearRect(0, 0, 512, 512);
                ctx.beginPath();
                ctx.arc(256, 256, 256, 0, Math.PI * 2);
                ctx.clip();
                
                const startX = (img.width - size) / 2;
                const startY = (img.height - size) / 2;
                ctx.drawImage(img, startX, startY, size, size, 0, 0, 512, 512);
            }

            // Convert to blob
            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const formData = new FormData();
                formData.append('file', blob, 'mysticker.png');

                const response = await fetch('/api/Stickers/upload', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    onStickerCreated(data.url);
                    resetAndClose();
                } else {
                    dispatchHubToast('خطأ في رفع الملصق. حاول مرة أخرى.', 'error');
                }
                setIsUploading(false);
            }, 'image/png');

        } catch (error) {
            console.error('Error creating sticker:', error);
            setIsUploading(false);
        }
    };

    const resetAndClose = () => {
        setSelectedImage(null);
        setIsUploading(false);
        onClose();
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#111b21] w-full max-w-[450px] rounded-[28px] shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-white/5" dir="rtl">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FaPlus className="text-emerald-500" size={18} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-gray-800 dark:text-white leading-tight">صانع الملصقات</h3>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">تحويل صورة إلى ملصق دائري</p>
                        </div>
                    </div>
                    <button 
                        onClick={resetAndClose}
                        className="w-9 h-9 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col items-center justify-center min-h-[350px]">
                    {!selectedImage ? (
                        <div 
                            onClick={triggerFileInput}
                            className="w-full h-[280px] border-4 border-dashed border-gray-100 dark:border-white/5 rounded-[40px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group active:scale-[0.98]"
                        >
                            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                                <FaCloudUploadAlt size={40} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-700 dark:text-gray-300">اضغط لاختيار صورة</p>
                                <p className="text-xs text-gray-400 mt-1 uppercase font-black">JPG, PNG, WEBP</p>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>
                    ) : (
                        <div className="relative group animate-in zoom-in-95 duration-500">
                            <div className="w-[280px] h-[280px] rounded-full overflow-hidden border-8 border-white dark:border-[#202c33] shadow-2xl relative">
                                <img 
                                    src={selectedImage} 
                                    className="w-full h-full object-cover" 
                                    alt="Selected preview" 
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button 
                                        onClick={() => setSelectedImage(null)}
                                        className="w-14 h-14 rounded-full bg-red-500 text-white shadow-xl hover:bg-red-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                                        title="حذف واختيار أخرى"
                                    >
                                        <FaTrashAlt size={20} />
                                    </button>
                                </div>
                            </div>
                            {/* Animated Decoration */}
                            <div className="absolute -z-10 -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute -z-10 -bottom-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 dark:bg-black/30 border-t border-gray-100 dark:border-white/5 flex gap-3">
                    <button 
                        onClick={resetAndClose}
                        className="flex-1 py-4.5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 transition-all active:scale-95"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={processAndUpload}
                        disabled={!selectedImage || isUploading}
                        className={`flex-[2] py-4.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${(!selectedImage || isUploading) ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'}`}
                    >
                        {isUploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <FaCheck size={16} />
                                حفظ كملصق
                            </>
                        )}
                    </button>
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
        </div>
    );
};

export default StickerMakerModal;
