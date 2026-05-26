import React, { useState, useRef } from 'react';
import { FaImage, FaTimes, FaTrash, FaCheckCircle, FaCloudUploadAlt, FaMagic } from 'react-icons/fa';
import { useWallpaper } from '../../context/WallpaperContext';
import { compressImage } from '../../../../utils/imageCompression';

interface WallpaperSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string | null;
    userId: string;
    userName: string;
}

const PRESET_WALLPAPERS = [
    'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png', // Doodle
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80', // Gradient
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80', // Dark Blue
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', // Abstract
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', // Beach
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80'  // Forest
];

const SOLID_COLORS = [
    { name: 'Default', value: null },
    { name: 'Sky Blue', value: '#e1f5fe' },
    { name: 'Soft Mint', value: '#f1f8e9' },
    { name: 'Peach', value: '#fff3e0' },
    { name: 'Lavender', value: '#f3e5f5' },
    { name: 'Rose', value: '#fce4ec' },
    { name: 'Cream', value: '#fffde7' },
    { name: 'Soft Gray', value: '#f5f5f5' },
    { name: 'WhatsApp Green', value: '#e1ebd1' },
    { name: 'Midnight', value: '#0f172a' },
    { name: 'Slate', value: '#1e293b' },
    { name: 'Deep Teal', value: '#0d2d3a' },
    { name: 'Royal Purple', value: '#1a1c2c' },
    { name: 'Classic Dark', value: '#0b141a' }
];

const BUBBLE_PRESET_COLORS = [
    { name: 'Default', value: null },
    { name: 'WhatsApp Green', value: '#D9FDD3' },
    { name: 'WhatsApp Dark', value: '#005C4B' },
    { name: 'Sky', value: '#E3F2FD' },
    { name: 'Lavender', value: '#F3E5F5' },
    { name: 'Slate', value: '#334155' },
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Soft Peach', value: '#FFF3E0' }
];

const TEXT_COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Dark Gray', value: '#1F2937' },
    { name: 'Deep Indigo', value: '#3730A3' },
    { name: 'Forest', value: '#065F46' }
];

export const WallpaperSettingsModal: React.FC<WallpaperSettingsModalProps> = ({
    onClose,
    chatId,
    userId,
    userName
}) => {
    const { 
        wallpaperUrl, 
        opacity, 
        backgroundColor, 
        bubbleColor, 
        textColor, 
        peerBubbleColor, 
        peerTextColor,
        setWallpaper, 
        setOpacity, 
        setBackgroundColor,
        setBubbleTheme
    } = useWallpaper(chatId, userId);
    
    const [isRefreshing, setIsRefreshing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isGlobal = !chatId || chatId === 'null';

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsRefreshing(true);
            const blob = await compressImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setWallpaper(base64);
                setOpacity(1);
                setBackgroundColor(null);
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Failed to upload image:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSelectPreset = (url: string) => {
        setWallpaper(url);
        setBackgroundColor(null);
        if (opacity < 0.1) setOpacity(0.06);
    };

    const handleSelectChatColor = (color: string | null) => {
        setBackgroundColor(color);
    };

    const toggleDoodle = () => {
        const doodleUrl = 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png';
        if (wallpaperUrl?.includes('28719144-86dc0f70')) {
            setWallpaper(null);
        } else {
            setWallpaper(doodleUrl);
            setOpacity(0.06);
        }
    };

    const handleClearAll = () => {
        setWallpaper(null);
        setBackgroundColor(null);
        setOpacity(0.06);
        setBubbleTheme({
            bubbleColor: null,
            textColor: null,
            peerBubbleColor: null,
            peerTextColor: null
        });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[var(--hub-sidebar-bg)] border-r border-[var(--hub-border)] animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-[var(--hub-border)] bg-[var(--hub-header-bg)]">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                        <FaTimes className="text-[var(--hub-text-secondary)]" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-[var(--hub-text-main)] flex items-center gap-2">
                             {isGlobal ? 'الخلفية الافتراضية' : 'تخصيص الواجهة'}
                             <FaMagic className="text-purple-500 text-sm" />
                        </h2>
                        <p className="text-[10px] text-[var(--hub-text-secondary)]">نظّم نمط محادثاتك بلمسة واحدة</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 relative">
                {/* Live Preview - Sticky Header style */}
                <div className="sticky top-[-20px] z-30 pt-4 pb-6 bg-[var(--hub-sidebar-bg)] -mx-5 px-5 shadow-sm border-b border-[var(--hub-border)]/50 backdrop-blur-md bg-opacity-95">
                    <label className="text-xs font-bold text-[var(--hub-text-secondary)] uppercase tracking-wider mb-3 block">المعاينة الحية</label>
                    <div 
                        className="relative h-[220px] rounded-3xl overflow-hidden shadow-xl border-4 border-white/10 group bg-[var(--hub-bg)]"
                        style={{ backgroundColor: backgroundColor || 'var(--hub-bg)' }}
                    >
                        {wallpaperUrl && (
                            <div 
                                className="absolute inset-0 transition-opacity duration-500"
                                style={{ 
                                    backgroundImage: `url("${wallpaperUrl}")`,
                                    backgroundRepeat: wallpaperUrl.includes('28719144-86dc0f70') ? 'repeat' : 'no-repeat',
                                    backgroundSize: wallpaperUrl.includes('28719144-86dc0f70') ? '200px' : 'cover',
                                    backgroundPosition: 'center',
                                    opacity: opacity
                                }}
                            />
                        )}
                        <div className="absolute inset-0 flex flex-col p-4 space-y-4 z-10">
                            {/* Peer Bubble Preview */}
                            <div 
                                className="w-3/4 p-3 rounded-2xl rounded-tl-none self-start shadow-sm border border-black/5 transition-all text-right"
                                style={{ backgroundColor: peerBubbleColor || '#ffffff', color: peerTextColor || 'inherit' }}
                            >
                                <div className="text-[14px] font-medium leading-tight">مرحباً! كيف تبدو الألوان الجديدة؟</div>
                                <div className="text-[9px] text-left mt-1 opacity-60">11:42 AM</div>
                            </div>

                            {/* Self Bubble Preview */}
                            <div 
                                className="w-3/4 p-3 rounded-2xl rounded-tr-none self-end shadow-sm border border-black/5 transition-all text-right"
                                style={{ backgroundColor: bubbleColor || '#D9FDD3', color: textColor || '#1F2937' }}
                            >
                                <div className="text-[14px] font-medium leading-tight">تبدو مذهلة جداً! 🚀</div>
                                <div className="text-[left] mt-1 opacity-60 text-[9px]">11:43 AM</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Upload & Clear */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:scale-[1.02] transition-all">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mb-2 shadow-lg">
                            <FaCloudUploadAlt className="text-white text-xl" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">رفع صورة</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                    <button onClick={handleClearAll} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:scale-[1.02] transition-all">
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center mb-2 shadow-lg">
                            <FaTrash className="text-white text-sm" />
                        </div>
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400">إعادة افتراضي</span>
                    </button>
                </div>

                {/* Message Theme Section */}
                <div className="space-y-6 pt-4 border-t border-[var(--hub-border)]">
                    <label className="text-xs font-black text-[var(--hub-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded-full" />
                        تنسيق الرسائل
                    </label>

                    {/* Self Bubbles */}
                    <div className="space-y-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                        <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">تنسيق رسائلك (المرسل)</p>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] mb-2 text-[var(--hub-text-secondary)]">لون الفقاعة</p>
                                <div className="flex flex-wrap gap-2">
                                    {BUBBLE_PRESET_COLORS.map(c => (
                                        <button key={c.name} onClick={() => setBubbleTheme({ bubbleColor: c.value })} className={`w-6 h-6 rounded-full border-2 ${bubbleColor === c.value ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c.value || '#D9FDD3' }} title={c.name} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] mb-2 text-[var(--hub-text-secondary)]">لون الخط</p>
                                <div className="flex flex-wrap gap-2">
                                    {TEXT_COLORS.map(c => (
                                        <button key={c.name} onClick={() => setBubbleTheme({ textColor: c.value })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${textColor === c.value ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c.value }} title={c.name}>
                                            <span className="text-[10px]" style={{ color: c.value === '#FFFFFF' ? '#000000' : '#FFFFFF' }}>A</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Peer Bubbles */}
                    <div className="space-y-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-700/30">
                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">تنسيق رسائل الطرف الآخر (المستلم)</p>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] mb-2 text-[var(--hub-text-secondary)]">لون الفقاعة</p>
                                <div className="flex flex-wrap gap-2">
                                    {BUBBLE_PRESET_COLORS.map(c => (
                                        <button key={c.name} onClick={() => setBubbleTheme({ peerBubbleColor: c.value })} className={`w-6 h-6 rounded-full border-2 ${peerBubbleColor === c.value ? 'border-gray-500 scale-110 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c.value || '#ffffff' }} title={c.name} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] mb-2 text-[var(--hub-text-secondary)]">لون الخط</p>
                                <div className="flex flex-wrap gap-2">
                                    {TEXT_COLORS.map(c => (
                                        <button key={c.name} onClick={() => setBubbleTheme({ peerTextColor: c.value })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${peerTextColor === c.value ? 'border-gray-500 scale-110 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c.value }} title={c.name}>
                                            <span className="text-[10px]" style={{ color: c.value === '#FFFFFF' ? '#000000' : '#FFFFFF' }}>A</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-[var(--hub-border)]">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--hub-text-secondary)]">وضوح الخلفية</span>
                        <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full font-black text-[10px]">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="1" step="0.01" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>

                {/* Doodle Toggle */}
                <button 
                    onClick={toggleDoodle}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${wallpaperUrl?.includes('28719144-86dc0f70') ? 'bg-purple-500/10 border-purple-500/30' : 'bg-gray-50 dark:bg-white/5 border-[var(--hub-border)]'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${wallpaperUrl?.includes('28719144-86dc0f70') ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                            <FaImage />
                        </div>
                        <p className="text-xs font-bold text-[var(--hub-text-main)]">نقوش واتساب (Doodle)</p>
                    </div>
                    {wallpaperUrl?.includes('28719144-86dc0f70') && <FaCheckCircle className="text-purple-500" />}
                </button>

                {/* Solid Colors */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-[var(--hub-text-secondary)] uppercase tracking-wider">ألوان الدردشة</label>
                    <div className="grid grid-cols-7 gap-2">
                        {SOLID_COLORS.map((clr) => (
                            <button
                                key={clr.name}
                                onClick={() => handleSelectChatColor(clr.value)}
                                title={clr.name}
                                className={`aspect-square rounded-full border-2 transition-all hover:scale-110 relative ${backgroundColor === clr.value ? 'border-purple-500 shadow-md scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: clr.value || '#ffffff' }}
                            >
                                {backgroundColor === clr.value && <FaCheckCircle className="absolute inset-0 m-auto text-purple-600 bg-white rounded-full p-[1px]" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preset Patterns */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-[var(--hub-text-secondary)] uppercase tracking-wider">خلفيات مقترحة</label>
                    <div className="grid grid-cols-3 gap-3">
                        {PRESET_WALLPAPERS.slice(1).map((url, i) => (
                            <button key={i} onClick={() => handleSelectPreset(url)} className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${wallpaperUrl === url ? 'border-purple-500 shadow-lg' : 'border-transparent'}`}>
                                <img src={url} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};
