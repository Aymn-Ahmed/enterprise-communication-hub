import React from 'react';
import ForwardMessageModal from '../components/common/ForwardMessageModal';
import { UserProfileModal } from '../components/settings/UserProfileModal';
import { MessageInfoModal } from '../components/message-list/MessageInfoModal';
import MessageReactionDetails from '../components/message-list/MessageReactionDetails';
import DynamicCropModal from '../components/settings/DynamicCropModal';
import FullScreenMediaViewer from '../components/common/FullScreenMediaViewer';
import LocationPickerModal from '../components/input-area/LocationPickerModal';

type HubModalsProps = {
    showInfoModal: boolean;
    setShowInfoModal: React.Dispatch<React.SetStateAction<boolean>>;
    infoModalItem: any;
    infoModalData: any[];
    isLoadingInfo: boolean;
    getFileName: (url: string) => string;
    showUserProfileModal: boolean;
    setShowUserProfileModal: React.Dispatch<React.SetStateAction<boolean>>;
    userProfileData: any;
    isMe: (id: number | string | undefined | null) => boolean;
    isLoadingProfile: boolean;
    isUploadingAvatar: boolean;
    isUploadingCover: boolean;
    openUserProfile: (displayId: number) => Promise<void>;
    coverInputRef: React.RefObject<HTMLInputElement | null>;
    avatarInputRef: React.RefObject<HTMLInputElement | null>;
    handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
    handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
    handleSelectChat: (user: any) => Promise<void>;
    showForwardModal: boolean;
    setShowForwardModal: React.Dispatch<React.SetStateAction<boolean>>;
    forwardingItem: any;
    allUsers: any[];
    departments: any[];
    onForwardMessage: (targets: { type: string; id: string }[]) => Promise<void>;
    isForwarding: boolean;
    showReactionDetailsModal: boolean;
    setShowReactionDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
    setReactionDetailsPopupPos: React.Dispatch<React.SetStateAction<{ top: number; left: number } | null>>;
    reactionDetailsData: any[];
    isLoadingReactionDetails: boolean;
    selectedReactionTab: string;
    setSelectedReactionTab: React.Dispatch<React.SetStateAction<string>>;
    currentUserRawId: number;
    reactionDetailsPopupPos: { top: number; left: number } | null;
    profileCropData: any;
    handleProfileCropConfirm: (croppedFile: File) => Promise<void>;
    setProfileCropData: React.Dispatch<any>;
    activeViewerMedia: any;
    setActiveViewerMedia: React.Dispatch<any>;
    showLocationPicker: boolean;
    locationPreview: { lat: number; lng: number } | null;
    setShowLocationPicker: React.Dispatch<React.SetStateAction<boolean>>;
    handleSendLocationDirect: (loc: { lat: number; lng: number }) => Promise<void>;
};

export default function HubModals(props: HubModalsProps) {
    return (
        <>
            {props.showInfoModal && (
                <MessageInfoModal
                    isOpen={props.showInfoModal}
                    onClose={() => props.setShowInfoModal(false)}
                    item={props.infoModalItem}
                    data={props.infoModalData}
                    isLoading={props.isLoadingInfo}
                    getFileName={props.getFileName}
                />
            )}

            {props.showUserProfileModal && (
                <UserProfileModal
                    isOpen={props.showUserProfileModal}
                    onClose={() => props.setShowUserProfileModal(false)}
                    user={props.userProfileData}
                    isMe={props.isMe}
                    isLoading={props.isLoadingProfile}
                    isUploadingAvatar={props.isUploadingAvatar}
                    isUploadingCover={props.isUploadingCover}
                    onRefresh={props.openUserProfile}
                    onCoverClick={() => props.coverInputRef.current?.click()}
                    onAvatarClick={() => props.avatarInputRef.current?.click()}
                    avatarInputRef={props.avatarInputRef}
                    coverInputRef={props.coverInputRef}
                    handleAvatarUpload={props.handleAvatarUpload}
                    handleCoverUpload={props.handleCoverUpload}
                    onStartChat={props.handleSelectChat}
                />
            )}

            {props.showForwardModal && (
                <ForwardMessageModal
                    isOpen={props.showForwardModal}
                    onClose={() => props.setShowForwardModal(false)}
                    messageItem={props.forwardingItem}
                    allUsers={props.allUsers}
                    departments={props.departments}
                    onForward={props.onForwardMessage}
                    isForwarding={props.isForwarding}
                />
            )}

            {props.showReactionDetailsModal && (
                <MessageReactionDetails
                    open={props.showReactionDetailsModal}
                    onClose={() => { props.setShowReactionDetailsModal(false); props.setReactionDetailsPopupPos(null); }}
                    reactions={props.reactionDetailsData}
                    isLoading={props.isLoadingReactionDetails}
                    selectedTab={props.selectedReactionTab}
                    onTabChange={props.setSelectedReactionTab}
                    currentUserId={props.currentUserRawId}
                    popupPos={props.reactionDetailsPopupPos}
                />
            )}

            {props.profileCropData && (
                <DynamicCropModal
                    imageSrc={props.profileCropData.src}
                    cropType={props.profileCropData.type}
                    aspectRatio={props.profileCropData.aspectRatio}
                    title={props.profileCropData.title}
                    onConfirm={props.handleProfileCropConfirm}
                    onCancel={() => props.setProfileCropData(null)}
                />
            )}

            {props.activeViewerMedia && (
                <FullScreenMediaViewer
                    data={props.activeViewerMedia}
                    onClose={() => props.setActiveViewerMedia(null)}
                />
            )}

            <LocationPickerModal
                isOpen={props.showLocationPicker}
                initialLocation={props.locationPreview}
                onClose={() => props.setShowLocationPicker(false)}
                onConfirm={(location) => {
                    props.handleSendLocationDirect(location);
                    props.setShowLocationPicker(false);
                }}
            />
        </>
    );
}
