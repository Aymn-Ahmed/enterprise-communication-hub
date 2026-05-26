import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHubStorage } from '../../../core/integration/moduleHost';

interface WallpaperConfig {
    url: string | null;
    opacity: number;
    color: string | null;
    bubbleColor?: string | null;
    textColor?: string | null;
    peerBubbleColor?: string | null;
    peerTextColor?: string | null;
}

interface WallpaperContextType {
    activeConfig: WallpaperConfig;
    setChatWallpaper: (userId: string, chatId: string, url: string | null) => void;
    setChatOpacity: (userId: string, chatId: string, opacity: number) => void;
    setChatColor: (userId: string, chatId: string, color: string | null) => void;
    setChatBubbleTheme: (userId: string, chatId: string, theme: Partial<Pick<WallpaperConfig, 'bubbleColor' | 'textColor' | 'peerBubbleColor' | 'peerTextColor'>>) => void;
    getChatConfig: (userId: string, chatId: string) => WallpaperConfig;
}

const DEFAULT_WALLPAPER = 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png';
const DEFAULT_OPACITY = 0.06;
const DEFAULT_COLOR = null;

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export const WallpaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userWallpapers, setUserWallpapers] = useState<Record<string, Record<string, WallpaperConfig>>>(() => {
        const saved = getHubStorage().getItem('user_chat_wallpapers_map');
        return saved ? JSON.parse(saved) : {};
    });

    const [globalConfig, setGlobalConfig] = useState<WallpaperConfig>(() => {
        const url = getHubStorage().getItem('chat_wallpaper_url');
        const opacityStr = getHubStorage().getItem('chat_wallpaper_opacity');
        const color = getHubStorage().getItem('chat_wallpaper_color');
        return {
            url: url || DEFAULT_WALLPAPER,
            opacity: opacityStr ? parseFloat(opacityStr) : DEFAULT_OPACITY,
            color: color || DEFAULT_COLOR
        };
    });

    useEffect(() => {
        getHubStorage().setItem('user_chat_wallpapers_map', JSON.stringify(userWallpapers));
    }, [userWallpapers]);

    const getChatConfig = (userId: string, chatId: string): WallpaperConfig => {
        if (!userId) return globalConfig;
        const userMap = userWallpapers[userId];
        if (!userMap) return globalConfig;
        const target = (!chatId || chatId === 'null' || chatId === 'undefined' || chatId === '') ? 'default' : chatId;
        return userMap[target] || userMap['default'] || globalConfig;
    };

    const setChatWallpaper = (userId: string, chatId: string, url: string | null) => {
        if (!userId) return;
        const isDefault = !chatId || chatId === 'null' || chatId === 'undefined' || chatId === '';
        
        setUserWallpapers(prev => {
            const userMap = prev[userId] || {};
            if (isDefault) {
                // Master Override: Clear all specific chat settings and set new default
                return { 
                    ...prev, 
                    [userId]: { 
                        'default': { ...(userMap['default'] || globalConfig), url } 
                    } 
                };
            }
            return { 
                ...prev, 
                [userId]: { 
                    ...userMap, 
                    [chatId]: { ...(userMap[chatId] || userMap['default'] || globalConfig), url } 
                } 
            };
        });
    };

    const setChatOpacity = (userId: string, chatId: string, opacity: number) => {
        if (!userId) return;
        const isDefault = !chatId || chatId === 'null' || chatId === 'undefined' || chatId === '';

        setUserWallpapers(prev => {
            const userMap = prev[userId] || {};
            if (isDefault) {
                return { 
                    ...prev, 
                    [userId]: { 
                        'default': { ...(userMap['default'] || globalConfig), opacity } 
                    } 
                };
            }
            return { 
                ...prev, 
                [userId]: { 
                    ...userMap, 
                    [chatId]: { ...(userMap[chatId] || userMap['default'] || globalConfig), opacity } 
                } 
            };
        });
    };

    const setChatColor = (userId: string, chatId: string, color: string | null) => {
        if (!userId) return;
        const isDefault = !chatId || chatId === 'null' || chatId === 'undefined' || chatId === '';

        setUserWallpapers(prev => {
            const userMap = prev[userId] || {};
            if (isDefault) {
                return { 
                    ...prev, 
                    [userId]: { 
                        'default': { ...(userMap['default'] || globalConfig), color } 
                    } 
                };
            }
            return { 
                ...prev, 
                [userId]: { 
                    ...userMap, 
                    [chatId]: { ...(userMap[chatId] || userMap['default'] || globalConfig), color } 
                } 
            };
        });
    };

    const setChatBubbleTheme = (userId: string, chatId: string, theme: Partial<Pick<WallpaperConfig, 'bubbleColor' | 'textColor' | 'peerBubbleColor' | 'peerTextColor'>>) => {
        if (!userId) return;
        const isDefault = !chatId || chatId === 'null' || chatId === 'undefined' || chatId === '';

        setUserWallpapers(prev => {
            const userMap = prev[userId] || {};
            if (isDefault) {
                return { 
                    ...prev, 
                    [userId]: { 
                        'default': { ...(userMap['default'] || globalConfig), ...theme } 
                    } 
                };
            }
            return { 
                ...prev, 
                [userId]: { 
                    ...userMap, 
                    [chatId]: { ...(userMap[chatId] || userMap['default'] || globalConfig), ...theme } 
                } 
            };
        });
    };

    return (
        <WallpaperContext.Provider value={{
            activeConfig: globalConfig,
            setChatWallpaper,
            setChatOpacity,
            setChatColor,
            setChatBubbleTheme,
            getChatConfig
        }}>
            {children}
        </WallpaperContext.Provider>
    );
};

export const useWallpaper = (chatId?: string, userId?: string) => {
    const context = useContext(WallpaperContext);
    if (!context) throw new Error('useWallpaper must be used within a WallpaperProvider');

    const uid = userId || '';
    const cid = chatId || '';
    const config = context.getChatConfig(uid, cid);

    return {
        wallpaperUrl: config.url,
        opacity: config.opacity,
        backgroundColor: config.color,
        bubbleColor: config.bubbleColor,
        textColor: config.textColor,
        peerBubbleColor: config.peerBubbleColor,
        peerTextColor: config.peerTextColor,
        setWallpaper: (url: string | null) => context.setChatWallpaper(uid, cid, url),
        setOpacity: (value: number) => context.setChatOpacity(uid, cid, value),
        setBackgroundColor: (color: string | null) => context.setChatColor(uid, cid, color),
        setBubbleTheme: (theme: Partial<Pick<WallpaperConfig, 'bubbleColor' | 'textColor' | 'peerBubbleColor' | 'peerTextColor'>>) => context.setChatBubbleTheme(uid, cid, theme)
    };
};
