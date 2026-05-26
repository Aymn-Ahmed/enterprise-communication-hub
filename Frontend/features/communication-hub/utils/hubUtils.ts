import React from 'react';
import type { HubTab } from '../types/hub.types';
import { FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFileArchive, FaFileVideo, FaFileAlt } from 'react-icons/fa';

/**
 * ? Helper for robust date parsing. 
 * If the string has no timezone, we treat it as UTC (per system rules).
 */
export const parseDateSafe = (dateVal: any): Date => {
    if (!dateVal) return new Date(0);
    if (dateVal instanceof Date) return dateVal;

    let dStr = String(dateVal);
    // If ISO but missing Z or offset, append Z to force UTC interpretation
    if (dStr.includes('T') && !dStr.includes('Z') && !dStr.includes('+') && !dStr.match(/-\d{2}:\d{2}$/)) {
        dStr += 'Z';
    }
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
};

export const formatLastSeen = (date: string | Date | null | undefined) => {
    if (!date) return 'غير متصل';
    try {
        const d = parseDateSafe(date);
        if (!d) return 'غير متصل';
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);

        if (diffInMinutes < 1) return 'غير متصل (منذ ثوان)';
        if (diffInMinutes < 60) return `آخر ظهور منذ ${diffInMinutes} دقيقة`;
        if (diffInMinutes < 1440) return `آخر ظهور منذ ${Math.floor(diffInMinutes / 60)} ساعة`;

        return `آخر ظهور ${d.toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' })}`;
    } catch {
        return 'غير متصل';
    }
};

export const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

export const getTabTheme = (activeTab?: HubTab) => {
    switch (activeTab) {
        case 'questions':
            return { color: '#3B82F6', textBase: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/20', darkText: 'dark:text-blue-300', border: 'border-blue-100', darkBorder: 'dark:border-blue-800', hover: 'hover:bg-blue-100', accent: 'bg-blue-500', iconColor: 'text-blue-500', ring: 'ring-blue-400' };
        case 'appointments':
            return { color: '#10B981', textBase: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/20', darkText: 'dark:text-emerald-300', border: 'border-emerald-100', darkBorder: 'dark:border-emerald-800', hover: 'hover:bg-emerald-100', accent: 'bg-emerald-500', iconColor: 'text-emerald-500', ring: 'ring-emerald-400' };
        case 'announcements':
            return { color: '#F97316', textBase: '#F97316', bg: 'bg-orange-50', text: 'text-orange-700', darkBg: 'dark:bg-orange-900/20', darkText: 'dark:text-orange-300', border: 'border-orange-100', darkBorder: 'dark:border-orange-800', hover: 'hover:bg-orange-100', accent: 'bg-orange-500', iconColor: 'text-orange-500', ring: 'ring-orange-400' };
        default:
            return { color: '#25D366', textBase: '#25D366', bg: 'bg-green-50', text: 'text-green-700', darkBg: 'dark:bg-green-900/20', darkText: 'dark:text-green-300', border: 'border-green-100', darkBorder: 'dark:border-green-800', hover: 'hover:bg-green-100', accent: 'bg-[#25D366]', iconColor: 'text-green-500', ring: 'ring-green-400' };
    }
};

export const getFileName = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1].split('?')[0];
    // Remove the timestamp prefix if it exists (yyyyMMddHHmmssfff_)
    return lastPart.replace(/^\d{17}_/, '');
};

export const getFileExtension = (url: string): string => {
    if (!url) return '';
    const cleanUrl = url.split('?')[0];
    return cleanUrl.split('.').pop()?.toLowerCase() || '';
};

export const getFileIcon = (url: string) => {
    const ext = getFileExtension(url);
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return React.createElement(FaImage, { className: "text-blue-500" });
    if (ext === 'pdf') return React.createElement(FaFilePdf, { className: "text-red-500" });
    if (['doc', 'docx'].includes(ext || '')) return React.createElement(FaFileWord, { className: "text-blue-600" });
    if (['xls', 'xlsx'].includes(ext || '')) return React.createElement(FaFileExcel, { className: "text-green-600" });
    if (['zip', 'rar', '7z'].includes(ext || '')) return React.createElement(FaFileArchive, { className: "text-yellow-600" });
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return React.createElement(FaFileVideo, { className: "text-purple-500" });
    return React.createElement(FaFileAlt, { className: "text-gray-500" });
};
