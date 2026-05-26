import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

interface ReactionPickerProps {
    id: number | string | null;
    rect: { top: number; left: number; width: number; height: number } | null;
    isSentByMe: boolean;
    onSelect: (emoji: string) => void;
    onClose: () => void;
    onShowEmojiPicker: () => void;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({
    id, rect, isSentByMe, onSelect, onClose, onShowEmojiPicker
}) => {
    const { resolvedTheme } = useTheme();
    if (!id || !rect) return null;

    const isTop = (rect.top) < 160;
    const top = isTop ? (rect.top + rect.height + 8) : (rect.top - 60);
    const left = isSentByMe
        ? (rect.left + rect.width - 300)
        : (rect.left);

    const emojis = ['👍', '❤️', '😂', '😲', '😢', '🙏'];

    return createPortal(
        <>
            {/* Backdrop for closure isolation */}
            <div
                className="fixed inset-0 z-[9998] bg-transparent"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />

            <div
                data-theme={resolvedTheme}
                className={`fixed z-[9999] animate-in fade-in zoom-in duration-200 reaction-picker-popup
                    ${isTop ? 'origin-top' : 'origin-bottom'} ${resolvedTheme === 'dark' ? 'dark' : ''}`}
                style={{
                    top: `${top}px`,
                    left: `${Math.max(16, Math.min(left, window.innerWidth - 320))}px`,
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="bg-[var(--hub-panel-bg)]/95 backdrop-blur-md border border-[var(--hub-border)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl px-2 py-1.5 flex items-center gap-1">
                    {emojis.map((emoji, eIdx) => (
                        <button
                            key={emoji}
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('[ReactionPicker] emoji clicked:', emoji);
                                onSelect(emoji);
                            }}
                            className="text-2xl w-10 h-10 flex items-center justify-center hover:scale-[1.45] transition-all duration-200 hover:drop-shadow-sm active:scale-95 origin-center"
                            style={{ transitionDelay: `${eIdx * 25}ms` }}
                        >
                            {emoji}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-[var(--hub-border)] mx-1"></div>
                    <button
                        className="w-8 h-8 flex items-center justify-center text-[var(--hub-text-muted)] hover:text-[var(--hub-accent)] hover:bg-[var(--hub-accent)]/10 rounded-full transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowEmojiPicker();
                            onClose();
                        }}
                    >
                        <FaPlus size={14} />
                    </button>
                </div>
                {/* Triangle Pointer */}
                <div className={`absolute w-3 h-3 bg-[var(--hub-panel-bg)] transform rotate-45 border-[var(--hub-border)] shadow-sm
                    ${isTop ? '-top-1.5 border-t border-l' : '-bottom-1.5 border-b border-r'} 
                    ${isSentByMe ? 'right-6' : 'left-6'}`}
                />
            </div>
        </>,
        document.body
    );
};

export default ReactionPicker;
