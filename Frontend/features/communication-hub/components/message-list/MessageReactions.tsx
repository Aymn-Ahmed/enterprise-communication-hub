import React from 'react';

interface Reaction {
    userId?: number;
    userName?: string;
    emoji: string;
}

interface MessageReactionsProps {
    reactions: any[] | undefined | null;
    isSentByMe: boolean;
    onShowDetails: (e: React.MouseEvent) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({ reactions, isSentByMe, onShowDetails }) => {
    if (!reactions || !Array.isArray(reactions) || reactions.length === 0) return null;

    // Group unique emojis and count them
    const emojiGroups = reactions.reduce((acc: Record<string, number>, r) => {
        const char = r.ReactionType || r.reactionType || r.emoji || r.Emoji;
        if (char) {
            acc[char] = (acc[char] || 0) + 1;
        } else {
            console.error('❌ [MessageReactions] تعذر العثور على الإيموجي في كائن التفاعل:', r);
        }
        return acc;
    }, {});

    const uniqueEmojis = Object.keys(emojiGroups);
    const totalCount = reactions.length;

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onShowDetails(e); }}
            className={`absolute -bottom-4 ${isSentByMe ? 'right-2' : 'left-2'} z-[5] flex items-center animate-in zoom-in-50 duration-200 cursor-pointer select-none group/reactions`}
        >
            <div className="flex items-center gap-0.5 bg-white dark:bg-[#202c33] border border-gray-100 dark:border-gray-700/50 rounded-full px-1.5 py-0.5 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                <div className="flex -space-x-1">
                    {uniqueEmojis.slice(0, 3).map((emoji, idx) => (
                        <span key={idx} className="text-sm drop-shadow-sm">{emoji}</span>
                    ))}
                </div>
                {totalCount > 0 && (
                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 min-w-[12px] text-center ml-0.5 group-hover/reactions:text-blue-500 transition-colors">
                        {totalCount}
                    </span>
                )}
            </div>
        </div>
    );
};

export default MessageReactions;
