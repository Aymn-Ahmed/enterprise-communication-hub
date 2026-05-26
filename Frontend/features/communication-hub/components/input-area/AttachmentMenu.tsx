import React from 'react';
import { FaImage, FaFileAlt, FaCamera, FaMusic, FaMapMarkerAlt } from 'react-icons/fa';

interface AttachmentMenuProps {
    show: boolean;
    position: { bottom: number; left: number } | null;
    onClose: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onLocationClick?: () => void;
}

/**
 * Component to display the attachment options menu (Image, Document, Camera)
 * with fixed positioning relative to the attachment toggle button.
 */
const AttachmentMenu: React.FC<AttachmentMenuProps> = ({ show, position, onClose, fileInputRef, onLocationClick }) => {
    if (!show || !position) return null;

    const handleOptionClick = (acceptType: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = acceptType;
            fileInputRef.current.click();
            // Small delay to allow file picker to open before closing menu
            setTimeout(() => {
                onClose();
            }, 100);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: position.bottom,
                left: position.left,
                zIndex: 99999,
                minWidth: 200,
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                padding: '8px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
            dir="rtl"
            className="bg-[var(--hub-panel-bg)] border border-[var(--hub-border)] attachment-menu-popup"
        >
            <button
                onClick={() => handleOptionClick('image/*,video/*')}
                className="flex items-center justify-end gap-3 px-4 py-2.5 hover:bg-[var(--hub-hover)] transition-colors w-full group"
            >
                <span className="text-[15px] font-bold text-blue-600">صورة / فيديو</span>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 text-lg shadow-sm group-hover:scale-105 transition-transform">
                    <FaImage />
                </div>
            </button>

            <button
                onClick={() => handleOptionClick('.pdf,.doc,.docx,.xls,.xlsx,.txt')}
                className="flex items-center justify-end gap-3 px-4 py-2.5 hover:bg-[var(--hub-hover)] transition-colors w-full group"
            >
                <span className="text-[15px] font-bold text-emerald-600">مستند</span>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-lg shadow-sm group-hover:scale-105 transition-transform">
                    <FaFileAlt />
                </div>
            </button>

            <button
                onClick={() => handleOptionClick('audio/*')}
                className="flex items-center justify-end gap-3 px-4 py-2.5 hover:bg-[var(--hub-hover)] transition-colors w-full group"
            >
                <span className="text-[15px] font-bold text-orange-600">ملف صوتي</span>
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 text-lg shadow-sm group-hover:scale-105 transition-transform">
                    <FaMusic />
                </div>
            </button>

            <button
                onClick={() => handleOptionClick('image/*;capture=camera')}
                className="flex items-center justify-end gap-3 px-4 py-2.5 hover:bg-[var(--hub-hover)] transition-colors w-full group"
            >
                <span className="text-[15px] font-bold text-amber-600">كاميرا</span>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 text-lg shadow-sm group-hover:scale-105 transition-transform">
                    <FaCamera />
                </div>
            </button>

            <button
                onClick={() => {
                    onLocationClick?.();
                    onClose();
                }}
                className="flex items-center justify-end gap-3 px-4 py-2.5 hover:bg-[var(--hub-hover)] transition-colors w-full group"
            >
                <span className="text-[15px] font-bold text-red-600">الموقع</span>
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 text-lg shadow-sm group-hover:scale-105 transition-transform">
                    <FaMapMarkerAlt />
                </div>
            </button>
        </div>
    );
};

export default AttachmentMenu;
