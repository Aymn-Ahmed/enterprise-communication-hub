import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';

interface Position {
    top: number;
    left: number;
    isUp: boolean;
}

interface PortalMenuProps {
    anchorRef: React.RefObject<HTMLElement | null>;
    children: React.ReactNode;
    onClose: () => void;
    offset?: number;
    minWidth?: string;
    className?: string;
}

const PortalMenu: React.FC<PortalMenuProps> = ({
    anchorRef,
    children,
    onClose,
    offset = 8,
    minWidth = '200px',
    className = ''
}) => {
    const { resolvedTheme } = useTheme();
    const [coords, setCoords] = useState<Position | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (!anchorRef.current) return;

        const rect = anchorRef.current.getBoundingClientRect();
        const menuHeight = menuRef.current?.offsetHeight || 250;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Choose Top if space below is less than 250px and there's more space above
        const shouldOpenUp = spaceBelow < 250 && spaceAbove > spaceBelow;

        let targetTop = shouldOpenUp ? (rect.top - menuHeight - offset) : (rect.bottom + offset);
        let targetLeft = rect.left;

        // Boundary check for horizontal
        const menuWidth = menuRef.current?.offsetWidth || 200;
        if (targetLeft + menuWidth > window.innerWidth - 16) {
            targetLeft = window.innerWidth - menuWidth - 16;
        }
        if (targetLeft < 16) {
            targetLeft = 16;
        }

        setCoords({
            top: targetTop,
            left: targetLeft,
            isUp: shouldOpenUp
        });
    };

    useLayoutEffect(() => {
        updatePosition();

        // Use capture phase for scroll to catch it in any scrolling container
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [anchorRef.current]);

    // Re-calculate after children render to get final height
    useLayoutEffect(() => {
        updatePosition();
    }, [children]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return createPortal(
        <>
            {/* Transparent Backdrop: Captures clicks outside to close only the menu. 
                z-index is lower than the menu itself. 
                This prevents clicks from leaking to the main hub close logic. */}
            <div
                className="fixed inset-0 z-[9998] bg-transparent cursor-default select-none"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />

            <div
                ref={menuRef}
                style={{
                    position: 'fixed',
                    top: coords?.top ?? -9999,
                    left: coords?.left ?? -9999,
                    zIndex: 9999,
                    minWidth,
                    pointerEvents: coords ? 'auto' : 'none',
                    opacity: coords ? 1 : 0
                }}
                data-theme={resolvedTheme}
                className={`bg-[var(--hub-panel-bg)] shadow-[0_8px_32px_rgba(0,0,0,0.22)] rounded-2xl border border-[var(--hub-border)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 portal-menu ${className}`}
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </>,
        document.body
    );
};

export default PortalMenu;
