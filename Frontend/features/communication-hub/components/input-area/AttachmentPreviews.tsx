import React from 'react';
import { FaFileAlt, FaTimes } from 'react-icons/fa';

interface AttachmentPreviewsProps {
    attachmentUrls: string[];
    onRemove: (idx: number) => void;
    getFileName: (url: string) => string;
}

/**
 * Component to display selected attachment pills above the chat input
 */
const AttachmentPreviews: React.FC<AttachmentPreviewsProps> = ({ attachmentUrls, onRemove, getFileName }) => {
    if (attachmentUrls.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 justify-end mb-1" dir="rtl">
            {attachmentUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full text-[10px] text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 w-max shadow-sm" dir="rtl">
                    <FaFileAlt size={10} />
                    <span className="truncate max-w-[100px]">{getFileName(url)}</span>
                    <button
                        onClick={() => onRemove(idx)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="حذف المرفق"
                    >
                        <FaTimes size={10} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default AttachmentPreviews;
