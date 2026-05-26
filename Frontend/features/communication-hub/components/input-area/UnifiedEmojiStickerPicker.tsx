import React, { useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useTheme } from '../../context/ThemeContext';
import { FaRegSmile, FaRegGrinStars, FaPlus } from 'react-icons/fa';
import { fetchStickers, type StickerData } from '../../../../services/giphyService';
import StickerMakerModal from './StickerMakerModal';
import { getHubStorage } from '../../../../core/integration/moduleHost';

const DEFAULT_STICKERS: StickerData[] = [
    { id: 'laugh', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532840.png', label: 'Laugh' },
    { id: 'love', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532822.png', label: 'Love' },
    { id: 'ok', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532829.png', label: 'OK' },
    { id: 'cool', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532824.png', label: 'Cool' },
    { id: 'angry', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532839.png', label: 'Angry' },
    { id: 'wow', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532819.png', label: 'Wow' },
    { id: 'cry', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532834.png', label: 'Cry' },
    { id: 'party', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532827.png', label: 'Party' },
    { id: 'wink', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532832.png', label: 'Wink' },
    { id: 'sick', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532821.png', label: 'Sick' },
    { id: 'scared', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532820.png', label: 'Scared' },
    { id: 'sleepy', url: 'https://cdn-icons-png.flaticon.com/512/3532/3532826.png', label: 'Sleepy' }
];

interface UnifiedEmojiStickerPickerProps {
    show: boolean;
    onToggle: () => void;
    onEmojiClick: (emojiData: any) => void;
    onStickerSelect: (url: string) => void;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    mini?: boolean;
}

const UnifiedEmojiStickerPicker: React.FC<UnifiedEmojiStickerPickerProps> = ({
    show,
    onToggle,
    onEmojiClick,
    onStickerSelect,
    onClose,
    triggerRef,
    mini = false
}) => {
    const { resolvedTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'emoji' | 'sticker'>('emoji');
    
    // Smart Fetching Logic States
    const [stickers, setStickers] = useState<StickerData[]>(DEFAULT_STICKERS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetched, setFetched] = useState(false);

    // Custom Stickers Logic
    const [showMaker, setShowMaker] = useState(false);
    const [customStickers, setCustomStickers] = useState<string[]>(() => {
        const saved = getHubStorage().getItem('my_custom_stickers');
        return saved ? JSON.parse(saved) : [];
    });

    const handleStickerCreated = (url: string) => {
        const updated = [url, ...customStickers];
        setCustomStickers(updated);
        getHubStorage().setItem('my_custom_stickers', JSON.stringify(updated));
    };

    useEffect(() => {
        // Only fetch when tab is active and not already fetched to save network calls
        if (show && activeTab === 'sticker' && !fetched) {
            const loadStickers = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await fetchStickers(24);
                    // Use API data, or fallback if it comes empty somehow
                    if (data && data.length > 0) {
                        setStickers(data);
                    }
                    setFetched(true);
                } catch (err) {
                    console.error('Failed to load dynamic stickers:', err);
                    setError('خطأ في الاتصال بالسيرفر');
                } finally {
                    setIsLoading(false);
                }
            };

            loadStickers();
        }
    }, [show, activeTab, fetched]);

    return (
        <div className="relative flex items-center justify-center">
            {/* The Unified Trigger Button in ChatInput */}
            <button
                ref={triggerRef}
                type="button"
                title="إيموجي وملصقات"
                onClick={onToggle}
                className={`${mini ? 'w-7 h-7' : 'w-10 h-10'} rounded-full flex items-center justify-center text-[#54656f] dark:text-[#aebac1] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer outline-none`}
            >
                <FaRegSmile size={mini ? 17 : 22} className={show ? "text-emerald-500" : ""} />
            </button>

            {show && (
                <div className="absolute bottom-[56px] right-0 sm:left-auto md:-right-8 z-[99999] w-[350px] shadow-2xl rounded-2xl overflow-hidden bg-[var(--hub-panel-bg)] border border-[var(--hub-border)] animate-in fade-in slide-in-from-bottom-5 duration-200 flex flex-col">
                    <div 
                        className="fixed inset-0 z-[-1]" 
                        onClick={(e) => { e.stopPropagation(); onClose(); }} 
                    />
                    
                    {/* Content Area */}
                    <div className="flex-1 w-full bg-[var(--hub-panel-bg)]" style={{ height: '350px' }}>
                        {activeTab === 'emoji' ? (
                            <EmojiPicker
                                theme={resolvedTheme as any}
                                onEmojiClick={onEmojiClick}
                                searchPlaceholder="ابحث عن إيموجي..."
                                height={350}
                                width="100%"
                            />
                        ) : (
                            <div className="h-full w-full overflow-y-auto custom-scrollbar p-3">
                                <div className="text-[11px] font-black text-[#54656f] dark:text-[#aebac1] mb-3 px-1 uppercase tracking-widest flex justify-between items-center">
                                    <span>الملصقات الذكية</span>
                                    <span className="text-[9px] opacity-50">STICKERS</span>
                                </div>
                                
                                {isLoading ? (
                                    <div className="grid grid-cols-4 gap-4 pb-4 animate-pulse">
                                        {[...Array(16)].map((_, i) => (
                                            <div key={`skel-${i}`} className="w-14 h-14 bg-gray-200 dark:bg-gray-700/50 rounded-xl mx-auto flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {error && (
                                            <div className="text-center text-xs text-red-500 mb-4 opacity-80 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                                                {error} - تم العودة للملصقات الافتراضية
                                            </div>
                                        )}
                                        <div className="grid grid-cols-4 gap-4 pb-4">
                                            {/* Create New Sticker Button */}
                                            <button
                                                onClick={() => setShowMaker(true)}
                                                className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-gray-100 dark:border-white/5 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-300 transition-all group"
                                                title="إنشاء ملصق جديد"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                    <FaPlus size={16} />
                                                </div>
                                                <span className="text-[9px] mt-1 font-black text-emerald-600 dark:text-emerald-400">إنشاء</span>
                                            </button>

                                            {/* Custom User Stickers */}
                                            {customStickers.map((url, i) => (
                                                <button
                                                    key={`custom-${i}`}
                                                    onClick={() => { onStickerSelect(url); onClose(); }}
                                                    className="flex items-center justify-center p-2 rounded-xl hover:bg-[var(--hub-hover)] transition-all active:scale-90 group relative"
                                                >
                                                    <img 
                                                        src={url} 
                                                        alt="Custom" 
                                                        className="w-14 h-14 object-contain group-hover:scale-110 transition-transform" 
                                                        loading="lazy"
                                                    />
                                                </button>
                                            ))}

                                            {/* API Stickers */}
                                            {stickers.map((sticker) => (
                                                <button
                                                    key={sticker.id}
                                                    onClick={() => { onStickerSelect(sticker.url); onClose(); }}
                                                    className="flex items-center justify-center p-2 rounded-xl hover:bg-[var(--hub-hover)] transition-all active:scale-90 group relative"
                                                    title={sticker.label}
                                                >
                                                    <img 
                                                        src={sticker.url} 
                                                        alt={sticker.label} 
                                                        className="w-14 h-14 object-contain group-hover:scale-110 transition-transform" 
                                                        loading="lazy"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabs / Segmented Control Bottom Bar */}
                    <div className="h-12 bg-gray-50 dark:bg-black/20 border-t border-[var(--hub-border)] flex items-center justify-center gap-6 shadow-inner shrink-0">
                        <button
                            onClick={() => setActiveTab('emoji')}
                            className={`p-2 rounded-full transition-all flex items-center justify-center ${activeTab === 'emoji' ? 'bg-gray-200 dark:bg-gray-700 text-emerald-500 scale-110 shadow-sm' : 'text-[#54656f] dark:text-[#aebac1] hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:scale-105'}`}
                            title="إيموجي"
                        >
                            <FaRegSmile size={20} />
                        </button>
                        <button
                            onClick={() => setActiveTab('sticker')}
                            className={`p-2 rounded-full transition-all flex items-center justify-center ${activeTab === 'sticker' ? 'bg-gray-200 dark:bg-gray-700 text-emerald-500 scale-110 shadow-sm' : 'text-[#54656f] dark:text-[#aebac1] hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:scale-105'}`}
                            title="ملصقات"
                        >
                            <FaRegGrinStars size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Sticker Maker Modal */}
            <StickerMakerModal 
                isOpen={showMaker} 
                onClose={() => setShowMaker(false)} 
                onStickerCreated={handleStickerCreated}
            />
        </div>
    );
};

export default UnifiedEmojiStickerPicker;
