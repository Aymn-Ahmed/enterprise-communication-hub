import React from 'react';
import { FaEdit, FaTimes } from 'react-icons/fa';

interface EditingBarProps {
    editingMessage: any;
    onCancel: () => void;
}

/**
 * Component to display the "Editing Mode" bar above the chat input
 */
const EditingBar: React.FC<EditingBarProps> = ({ editingMessage, onCancel }) => {
    if (!editingMessage) return null;

    const messagePreview = editingMessage.Name || editingMessage.name || editingMessage.Message || editingMessage.message || '';

    return (
        <div className="flex items-center justify-between bg-blue-500/10 px-3 py-2 rounded-t-lg rounded-b-sm border border-blue-500/20 w-full shadow-sm relative overflow-hidden" dir="rtl">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            <div className="flex flex-col gap-0.5 pr-2 pl-4 flex-1 min-w-0">
                <div className="font-bold text-xs text-blue-600 flex items-center gap-1">
                    <FaEdit size={12} />
                    تعديل الرسالة
                </div>
                <div className="text-xs text-[var(--hub-text-secondary)] truncate font-medium">
                    {messagePreview}
                </div>
            </div>
            <button
                onClick={onCancel}
                className="p-1.5 hover:bg-[var(--hub-hover)] rounded-full transition-colors shrink-0 text-[var(--hub-text-muted)] hover:text-red-500"
                title="إلغاء التعديل"
            >
                <FaTimes size={14} />
            </button>
        </div>
    );
};

export default EditingBar;
