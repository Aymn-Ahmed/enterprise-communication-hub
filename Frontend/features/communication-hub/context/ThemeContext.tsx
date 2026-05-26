import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getHubStorage } from '../../../core/integration/moduleHost';

// --- Types ---

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeMode;
    resolvedTheme: 'light' | 'dark'; // The actual theme being applied
    setTheme: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- Logic Layer ---

const THEME_STORAGE_KEY = 'hub-theme-preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Initial State from Storage
    const [theme, setThemeState] = useState<ThemeMode>(() => {
        return (getHubStorage().getItem(THEME_STORAGE_KEY) as ThemeMode) || 'system';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // 2. DOM Synchronization & Resolution Logic
    const applyTheme = useCallback((mode: ThemeMode) => {
        let targetTheme: 'light' | 'dark';

        if (mode === 'system') {
            targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            targetTheme = mode;
        }

        // Removed global document root mutations to isolate the theme
        setResolvedTheme(targetTheme);
    }, []);

    // 3. Persistence Handler
    const setTheme = useCallback((mode: ThemeMode) => {
        setThemeState(mode);
        getHubStorage().setItem(THEME_STORAGE_KEY, mode);
        applyTheme(mode);
    }, [applyTheme]);

    // 4. Quick Toggle (Light <-> Dark)
    const toggleTheme = useCallback(() => {
        const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
    }, [resolvedTheme, setTheme]);

    // 5. Detect System Changes in Real-time
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        // Apply immediately on mount
        applyTheme(theme);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, applyTheme]);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- Hook for Components ---

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
