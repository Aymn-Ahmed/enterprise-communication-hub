import { useState } from 'react';
import type { MediaViewerData } from '../components/common/FullScreenMediaViewer';

export function useHubUiState() {
    const [showWallpaperSettings, setShowWallpaperSettings] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [locationPreview, setLocationPreview] = useState<{ lat: number; lng: number } | null>(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [pendingMediaFiles, setPendingMediaFiles] = useState<File[]>([]);
    const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
    const [activeViewerMedia, setActiveViewerMedia] = useState<MediaViewerData | null>(null);
    const [activeMessageMenuId, setActiveMessageMenuId] = useState<number | null>(null);
    const [showMediaGallery, setShowMediaGallery] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [chatSearchTerm, setChatSearchTerm] = useState('');
    const [showChatSearch, setShowChatSearch] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoModalItem, setInfoModalItem] = useState<any>(null);
    const [infoModalData, setInfoModalData] = useState<any[]>([]);
    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [forwardingItem, setForwardingItem] = useState<any>(null);
    const [isForwarding, setIsForwarding] = useState(false);
    const [reactionPickerData, setReactionPickerData] = useState<{
        id: number | null;
        rect: { top: number; left: number; width: number; height: number } | null;
        isSentByMe: boolean;
        item?: any;
    }>({ id: null, rect: null, isSentByMe: false });
    const [showReactionDetailsModal, setShowReactionDetailsModal] = useState(false);
    const [reactionDetailsItem, setReactionDetailsItem] = useState<any>(null);
    const [reactionDetailsData, setReactionDetailsData] = useState<any[]>([]);
    const [isLoadingReactionDetails, setIsLoadingReactionDetails] = useState(false);
    const [selectedReactionTab, setSelectedReactionTab] = useState<string>('all');
    const [reactionDetailsPopupPos, setReactionDetailsPopupPos] = useState<{ top: number; left: number } | null>(null);
    const [popupPos, setPopupPos] = useState<{ bottom: number; left: number } | null>(null);

    return {
        showWallpaperSettings, setShowWallpaperSettings,
        activeFilter, setActiveFilter,
        selectedDepartment, setSelectedDepartment,
        showAttachmentMenu, setShowAttachmentMenu,
        showEmojiPicker, setShowEmojiPicker,
        appointmentDate, setAppointmentDate,
        appointmentTime, setAppointmentTime,
        locationPreview, setLocationPreview,
        showLocationPicker, setShowLocationPicker,
        isUploadingFile, setIsUploadingFile,
        pendingMediaFiles, setPendingMediaFiles,
        expandedItemId, setExpandedItemId,
        activeViewerMedia, setActiveViewerMedia,
        activeMessageMenuId, setActiveMessageMenuId,
        showMediaGallery, setShowMediaGallery,
        userSearchTerm, setUserSearchTerm,
        chatSearchTerm, setChatSearchTerm,
        showChatSearch, setShowChatSearch,
        showInfoModal, setShowInfoModal,
        infoModalItem, setInfoModalItem,
        infoModalData, setInfoModalData,
        isLoadingInfo, setIsLoadingInfo,
        showForwardModal, setShowForwardModal,
        forwardingItem, setForwardingItem,
        isForwarding, setIsForwarding,
        reactionPickerData, setReactionPickerData,
        showReactionDetailsModal, setShowReactionDetailsModal,
        reactionDetailsItem, setReactionDetailsItem,
        reactionDetailsData, setReactionDetailsData,
        isLoadingReactionDetails, setIsLoadingReactionDetails,
        selectedReactionTab, setSelectedReactionTab,
        reactionDetailsPopupPos, setReactionDetailsPopupPos,
        popupPos, setPopupPos
    };
}
