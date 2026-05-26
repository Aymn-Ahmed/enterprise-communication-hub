import React from 'react';

const STICKERS = [
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

interface StickerPickerProps {
    show: boolean;
    onSelect: (url: string) => void;
    onClose: () => void;
}

const StickerPicker: React.FC<StickerPickerProps> = ({ show, onSelect, onClose }) => {
    if (!show) return null;

    return (
        <>
            <div className="fixed inset-0 z-[1001]" onClick={onClose} />
            <div className="absolute bottom-full mb-3 left-0 z-[1002] w-72 bg-[var(--hub-panel-bg)] rounded-2xl shadow-2xl border border-[var(--hub-border)] p-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="text-[11px] font-black text-blue-500 dark:text-blue-400 mb-3 px-1 uppercase tracking-widest flex justify-between items-center">
                    <span>الملصقات الذكية</span>
                    <span className="text-[9px] opacity-50">STIKCERS</span>
                </div>
                <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto custom-scrollbar p-1">
                    {STICKERS.map((sticker) => (
                        <button
                            key={sticker.id}
                            onClick={() => onSelect(sticker.url)}
                            className="flex items-center justify-center p-2 rounded-xl hover:bg-[var(--hub-hover)] transition-all active:scale-90 group"
                            title="إرسال ملصق"
                        >
                            <img 
                                src={sticker.url} 
                                alt="sticker" 
                                className="w-16 h-16 object-contain group-hover:scale-110 transition-transform" 
                            />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default StickerPicker;
