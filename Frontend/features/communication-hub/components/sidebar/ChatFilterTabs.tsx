import React from 'react';

type FilterType = 'all' | 'unread';

interface ChatFilterTabsProps {
    activeFilter: FilterType;
    onChange: (filter: FilterType) => void;
    className?: string;
}

/**
 * Segmented Filter Tabs for the chat list.
 * Capsule style with active pill indicator.
 */
const ChatFilterTabs: React.FC<ChatFilterTabsProps> = ({ activeFilter, onChange, className }) => {
    const tabs = [
        { id: 'all', label: 'الكل' },
        { id: 'unread', label: 'غير مقروء' }
    ];

    return (
        <div className={`flex p-1 bg-[var(--hub-input-bg)] rounded-full w-fit ${className || ''}`} dir="rtl">
            {tabs.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id as FilterType)}
                        className={`
                            px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300
                            ${isActive
                                ? 'bg-[var(--hub-accent)] text-white shadow-sm'
                                : 'text-[var(--hub-text-secondary)] hover:text-[var(--hub-text-main)] hover:bg-[var(--hub-hover)]'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default ChatFilterTabs;
