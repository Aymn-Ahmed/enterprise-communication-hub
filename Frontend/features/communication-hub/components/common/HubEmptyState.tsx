import React from 'react';
import { FaQuestionCircle, FaCalendarAlt, FaBullhorn, FaCommentDots } from 'react-icons/fa';
import type { HubTab } from '../../types/hub.types';
import { getTabTheme } from '../../utils/hubUtils';

interface HubEmptyStateProps {
    activeTab: HubTab;
}

export const HubEmptyState: React.FC<HubEmptyStateProps> = ({ activeTab }) => {
    const theme = getTabTheme(activeTab);
    const content = {
        questions: { icon: <FaQuestionCircle size={70} />, title: "مركز الأسئلة والاستفسارات", desc: "تواصل مع الأقسام المختلفة، اطرح أسئلتك وتابع استفساراتك في مكان واحد" },
        appointments: { icon: <FaCalendarAlt size={70} />, title: "نظام المواعيد", desc: "تابع جدول مواعيدك، استقبل إشعارات الحجز وقم بتنظيم وقتك بفعالية" },
        announcements: { icon: <FaBullhorn size={70} />, title: "لوحة التعاميم والقرارات", desc: "ابقَ على اطلاع بأحدث القرارات الإدارية والتعاميم الرسمية للمركز" },
        default: { icon: <FaCommentDots size={70} />, title: "مركز التواصل الذكي", desc: "اختر جهة اتصال أو قسم لبدء المحادثة ومتابعة آخر المستجدات" }
    };
    const activeContent = content[activeTab as keyof typeof content] || content.default;

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-transparent px-6 text-center animate-in fade-in zoom-in duration-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e71a7a3139087.png')] bg-repeat"></div>

            <div className={`mb-8 p-10 rounded-full ${theme.bg} dark:bg-opacity-20 flex items-center justify-center relative shadow-inner`}>
                <div className={`absolute inset-0 rounded-full ${theme.accent} opacity-5 animate-ping`}></div>
                <div className={`${theme.iconColor || theme.text} drop-shadow-md relative z-10 scale-110`}>
                    {activeContent.icon}
                </div>
            </div>

            <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-3 tracking-tight relative z-10">
                {activeContent.title}
            </h2>
            <div className={`w-24 h-1.5 ${theme.accent} rounded-full mb-6 opacity-80 relative z-10`}></div>
            <p className="text-gray-500 dark:text-gray-400 max-w-md leading-relaxed font-medium text-lg relative z-10">
                {activeContent.desc}
            </p>

            <div className="mt-12 flex gap-4 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 relative z-10">
                <div className={`w-2 h-2 rounded-full ${theme.accent}`}></div>
                <div className={`w-2 h-2 rounded-full ${theme.accent} opacity-50`}></div>
                <div className="w-2 h-2 rounded-full ${theme.accent} opacity-25"></div>
            </div>
        </div>
    );
};
