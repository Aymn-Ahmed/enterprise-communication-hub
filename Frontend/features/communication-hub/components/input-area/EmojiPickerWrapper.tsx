import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useTheme } from '../../context/ThemeContext';

interface EmojiPickerWrapperProps {
    show: boolean;
    onToggle: () => void;
    onEmojiClick: (emojiData: any) => void;
    onClose: () => void;
    emojiBtnRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Component to handle the Emoji button and the EmojiPicker popup
 */
const EmojiPickerWrapper: React.FC<EmojiPickerWrapperProps> = ({
    show,
    onToggle,
    onEmojiClick,
    onClose,
    emojiBtnRef
}) => {
    const { resolvedTheme } = useTheme();
    return (
        <div className="relative flex items-center justify-center">
            <button
                ref={emojiBtnRef}
                type="button"
                title="إيموجي"
                onClick={onToggle}
                className="shrink-0 text-gray-400 hover:text-yellow-500 transition-colors outline-none emoji-btn-ref"
            >
                <span className="text-[22px] leading-none">😊</span>
            </button>

            {show && (
                <div className="absolute bottom-[56px] left-[0px] z-[99999] emoji-picker-popup">
                    <div
                        className="fixed inset-0 z-[-1]"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                    />
                    <div className="shadow-2xl rounded-xl overflow-hidden border border-[var(--hub-border)]">
                        <EmojiPicker
                            theme={resolvedTheme as any}
                            onEmojiClick={onEmojiClick}
                            searchPlaceholder="ابحث عن إيموجي..."
                            height={350}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmojiPickerWrapper;
