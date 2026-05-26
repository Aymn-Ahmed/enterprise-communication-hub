import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { HubEmptyState } from '../components/common/HubEmptyState';

type HubChatSectionProps = {
    isFullScreen: boolean;
    activeTab: any;
    selectedChatUser: any;
    showScrollToBottom: boolean;
    scrollToBottom: (behavior?: ScrollBehavior) => void;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    handleScroll: () => void;
    fullscreenSidebar: React.ReactNode;
    header: React.ReactNode;
    messageArea: React.ReactNode;
    composer: React.ReactNode;
    mediaPreview: React.ReactNode;
};

export default function HubChatSection({
    isFullScreen,
    activeTab,
    selectedChatUser,
    showScrollToBottom,
    scrollToBottom,
    scrollContainerRef,
    handleScroll,
    fullscreenSidebar,
    header,
    messageArea,
    composer,
    mediaPreview
}: HubChatSectionProps) {
    return (
        <div className={`flex-1 min-w-0 flex ${isFullScreen && activeTab ? 'flex-row' : 'flex-col'} bg-transparent relative`}>
            {isFullScreen && activeTab && fullscreenSidebar}

            <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-transparent">
                {isFullScreen && activeTab && !selectedChatUser ? (
                    <HubEmptyState activeTab={activeTab} />
                ) : (
                    <>
                        <div className="z-20 relative shadow-sm shrink-0">{header}</div>
                        <div className="flex-1 relative overflow-hidden">
                            <div ref={scrollContainerRef} onScroll={handleScroll} className="absolute inset-0 z-10 overflow-y-auto p-4 custom-scrollbar flex flex-col">
                                {messageArea}
                            </div>
                            {selectedChatUser && showScrollToBottom && (
                                <button onClick={() => scrollToBottom('smooth')} className="absolute bottom-4 left-4 w-10 h-10 bg-[var(--hub-panel-bg)] border border-[var(--hub-border)] text-[var(--hub-text-main)] rounded-full shadow-lg flex items-center justify-center z-[60]">
                                    <FaChevronDown size={14} />
                                </button>
                            )}
                        </div>
                        <div className="shrink-0 z-20 bg-transparent">{composer}</div>
                    </>
                )}

                {mediaPreview}
            </div>
        </div>
    );
}
