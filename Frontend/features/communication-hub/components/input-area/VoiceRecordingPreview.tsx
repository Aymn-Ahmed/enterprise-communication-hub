import React from 'react';

interface VoiceRecordingPreviewProps {
    isRecording: boolean;
    recordingBlob: any;
    renderRecordingUI: (color: string, border: string, bg: string, hover: string) => React.ReactNode;
}

/**
 * Component to handle the visual representation of voice recording state in the chat input area
 */
const VoiceRecordingPreview: React.FC<VoiceRecordingPreviewProps> = ({
    isRecording,
    recordingBlob,
    renderRecordingUI
}) => {
    // Only render if recording is active or a blob exists
    if (!isRecording && !recordingBlob) return null;

    return (
        <div dir="rtl">
            {renderRecordingUI('#10B981', 'border-transparent', 'bg-transparent', 'hover:bg-green-600')}
        </div>
    );
};

export default VoiceRecordingPreview;
