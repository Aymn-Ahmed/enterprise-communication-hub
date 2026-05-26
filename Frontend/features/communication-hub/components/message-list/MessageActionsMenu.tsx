import React from 'react';
import { FaInfoCircle, FaEdit, FaTrash, FaShare, FaReply } from 'react-icons/fa';

interface MessageActionsMenuProps {
    item: any;
    isSentByMe: boolean;
    api: any;
    onClose: () => void;
    // Actions from parent
    setInfoModalItem: (item: any) => void;
    setShowInfoModal: (show: boolean) => void;
    setIsLoadingInfo: (loading: boolean) => void;
    setInfoModalData: (data: any[]) => void;
    setEditingMessage: (item: any) => void;
    setMessageText: (text: string) => void;
    handleDeleteMessage: (item: any) => void;
    setForwardingItem: (item: any) => void;
    setShowForwardModal: (show: boolean) => void;
    setReplyTo: (item: any | null) => void;
    loadUsers: () => void;
    loadDepartments: () => void;
}

const MessageActionsMenu: React.FC<MessageActionsMenuProps> = ({
    item, isSentByMe, api, onClose,
    setInfoModalItem, setShowInfoModal, setIsLoadingInfo, setInfoModalData,
    setEditingMessage, setMessageText, handleDeleteMessage, setForwardingItem,
    setShowForwardModal, setReplyTo, loadUsers, loadDepartments
}) => {

    const handleInfoClick = (e: React.MouseEvent) => {
        try {
            e.stopPropagation();
            setInfoModalItem?.(item);
            setShowInfoModal?.(true);
            setIsLoadingInfo?.(true);
            const mId = item?.Id || item?.id;
            if (mId && api?.get) {
                api.get(`/api/messages/info/${mId}`)
                    .then((res: any) => setInfoModalData?.(res.data || []))
                    .catch((err: any) => console.error(err))
                    .finally(() => setIsLoadingInfo?.(false));
            } else {
                setIsLoadingInfo?.(false);
            }
        } catch (err) {
            console.error('InfoClick Error:', err);
        } finally {
            setTimeout(() => onClose?.(), 10);
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        try {
            e.stopPropagation();
            setEditingMessage?.(item);
            const textToEdit = item?.Name || item?.name || item?.Message || item?.message || item?.Notes || item?.notes || '';
            setMessageText?.(textToEdit);
        } catch (err) {
            console.error('EditClick Error:', err);
        } finally {
            setTimeout(() => onClose?.(), 10);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        try {
            e.stopPropagation();
            handleDeleteMessage?.(item);
        } catch (err) {
            console.error('DeleteClick Error:', err);
        } finally {
            setTimeout(() => onClose?.(), 10);
        }
    };

    const handleReplyClick = (e: React.MouseEvent) => {
        try {
            e.stopPropagation();
            setReplyTo?.(item);
        } catch (err) {
            console.error('ReplyClick Error:', err);
        } finally {
            setTimeout(() => onClose?.(), 10);
        }
    };

    const handleForwardClick = (e: React.MouseEvent) => {
        try {
            e.stopPropagation();
            setForwardingItem?.(item);
            setShowForwardModal?.(true);
            loadUsers?.();
            loadDepartments?.();
        } catch (err) {
            console.error('ForwardClick Error:', err);
        } finally {
            setTimeout(() => onClose?.(), 10);
        }
    };

    return (
        <div className="flex flex-col py-1.5 w-44 bg-white dark:bg-[#233138]" dir="rtl">
            {isSentByMe && (
                <>
                    <button
                        onClick={handleInfoClick}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-gray-700 dark:text-gray-200 transition-colors w-full text-right group"
                    >
                        <FaInfoCircle className="text-blue-500 shrink-0 opacity-70 group-hover:opacity-100" />
                        <span className="font-medium">معلومات الرسالة</span>
                    </button>
                    <button
                        onClick={handleEditClick}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-gray-700 dark:text-gray-200 transition-colors w-full text-right group"
                    >
                        <FaEdit className="text-emerald-500 shrink-0 opacity-70 group-hover:opacity-100" />
                        <span className="font-medium">تعديل الرسالة</span>
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-red-600 dark:text-red-400 transition-colors w-full text-right group"
                    >
                        <FaTrash className="shrink-0 text-red-500 opacity-70 group-hover:opacity-100" />
                        <span className="font-medium">حذف الرسالة</span>
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700/50 my-1 mx-2"></div>
                </>
            )}
            <button
                onClick={handleReplyClick}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-gray-700 dark:text-gray-200 transition-colors w-full text-right group"
            >
                <FaReply className="text-purple-500 shrink-0 opacity-70 group-hover:opacity-100" />
                <span className="font-medium">رد على الرسالة</span>
            </button>
            <button
                onClick={handleForwardClick}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-gray-700 dark:text-gray-200 transition-colors w-full text-right group"
            >
                <FaShare className="text-orange-500 shrink-0 opacity-70 group-hover:opacity-100" />
                <span className="font-medium">توجيه الرسالة</span>
            </button>
        </div>
    );
};

export default MessageActionsMenu;
