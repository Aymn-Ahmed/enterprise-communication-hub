import React, { useRef, useState } from 'react';
import { WallpaperProvider } from '../features/communication-hub/context/WallpaperContext';
import { ThemeProvider, useTheme } from '../features/communication-hub/context/ThemeContext';
import CommunicationHub from '../features/communication-hub/CommunicationHub';
import type { CommunicationHubProps } from '../features/communication-hub/types/hub.types';
// استيراد ChatProvider من مساره الصحيح
import { ChatProvider } from '../features/communication-hub/context/ChatContext';

/**
 * CommunicationHubWidget
 * 
 * يعمل كغلاف واجهة لميزة Communication Hub.
 * يتعامل مع تخطيط الشاشة الكاملة/العائمة ومزود الخلفية.
 * يتم تفويض منطق العمل الأساسي وتنسيق الواجهة إلى مكون CommunicationHub.
 */
export function CommunicationHubWidget(props: CommunicationHubProps) {
    return (
        /* وضع ChatProvider هنا يضمن بقاء حالة المحادثات حية حتى لو أُغلق الـ Widget */
        <ChatProvider>
            <ThemeProvider>
                <CommunicationHubWidgetContent {...props} />
            </ThemeProvider>
        </ChatProvider>
    );
}

function CommunicationHubWidgetContent(props: CommunicationHubProps) {
    const { resolvedTheme } = useTheme();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const widgetRef = useRef<HTMLDivElement | null>(null);

    return (
        <WallpaperProvider>
            {/* 
                تم استدعاء المكون مرة واحدة فقط. 
                استخدام الكلاس الشرطي {` !props.open ? 'hidden' : '' `} 
                يضمن أن المكون يظل موجوداً في الـ DOM (لحفظ الحالة) ولكنه يختفي بصرياً فقط.
            */}
            <div
                ref={widgetRef}
                data-theme={resolvedTheme}
                className={`fixed z-[100] bg-[var(--hub-bg)] shadow-2xl border border-[var(--hub-border)] animate-in slide-in-from-bottom-5 fade-in duration-300 flex flex-col overflow-hidden transition-all 
                    ${resolvedTheme === 'dark' ? 'dark' : ''} 
                    ${isFullScreen 
                        ? 'inset-0 rounded-none w-auto h-auto' 
                        : 'bottom-[90px] right-6 w-[450px] h-[600px] rounded-xl'
                    }
                    ${!props.open ? 'hidden' : ''} 
                `}
            >
                <CommunicationHub
                    {...props}
                    isFullScreen={isFullScreen}
                    setIsFullScreen={setIsFullScreen}
                    isPinned={isPinned}
                    setIsPinned={setIsPinned}
                    widgetRef={widgetRef}
                />
            </div>
        </WallpaperProvider>
    );
}

export default CommunicationHubWidget;