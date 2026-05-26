import React from 'react';
import { FaCheck, FaCheckDouble, FaBullhorn } from 'react-icons/fa';
import type { HubTab } from '../../types/hub.types';

interface MessageStatusProps {
    item: any;
    isSentByMe: boolean;
    isGroupMessage?: boolean;
    activeTab: HubTab;
    parseDateSafe: (date: any) => Date;
}

const MessageStatus: React.FC<MessageStatusProps> = ({
    item, isSentByMe, isGroupMessage, activeTab, parseDateSafe
}) => {

    const renderStatusIcons = () => {
        if (!isSentByMe) return null;

        // Unified Read/Delivered Logic: Read status MUST come from recipient actions explicitly
        // We no longer rely on `item.IsRead` or `item.Status === 'Read'` for sent messages because 
        // the sender does not have a delivery record, and basic properties might be generic.
        const isRead =
            item.IsReadByRecipient === true ||
            item.isReadByRecipient === true ||
            (activeTab !== 'chat' && (item.Status === 1 || item.status === 1 || item.Status === '1' || item.status === '1')) ||
            (item.Done === true || item.done === true);

        const isDelivered =
            isRead ||
            item.IsDeliveredByRecipient === true ||
            item.isDeliveredByRecipient === true ||
            item.IsDeliveredStatus === true ||
            item.isDeliveredStatus === true ||
            (item.MyDelivery?.status === "Delivered") ||
            (isGroupMessage && activeTab !== 'chat');

        return (
            <span
                className={`text-[13px] flex items-center ${isRead ? 'text-[#34B7F1]' : 'text-gray-400 dark:text-gray-500'}`}
                title={isRead ? 'قرأها المستلم' : (isDelivered ? 'تم الاستلام' : 'أُرسلت للخادم')}
            >
                {isDelivered ? <FaCheckDouble size={12} /> : <FaCheck size={12} />}
            </span>
        );
    };

    const msgDate = parseDateSafe(item.CreatedAt || item.createdAt || item.CreatedDate || item.createdDate);
    const timeString = msgDate ? msgDate.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : '';

    return (
        <div className="flex items-center gap-1 mt-1 justify-end opacity-70" dir="ltr">
            {isGroupMessage && (
                <FaBullhorn
                    className="text-[10px] text-orange-500 mx-1"
                    title="رسالة جماعية / تعميم"
                />
            )}

            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold whitespace-nowrap">
                {timeString}
            </span>

            {renderStatusIcons()}
        </div>
    );
};

export default MessageStatus;
