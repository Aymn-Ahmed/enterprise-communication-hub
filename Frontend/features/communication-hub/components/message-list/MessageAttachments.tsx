import React, { useState, useRef, useEffect } from 'react';
import {
    FaPlay, FaPause, FaDownload, FaFileAlt, FaMicrophone, FaFilePdf, FaFileWord, FaFileExcel, 
    FaFileArchive, FaFileVideo, FaVolumeUp
} from 'react-icons/fa';
import { getFileExtension } from '../../utils/hubUtils';

interface MessageAttachmentsProps {
    attachmentUrl: string;
    theme: any;
    isSentByMe: boolean;
    setVideoLightboxUrl: (url: string) => void;
    getFileName: (url: string) => string;
    onOpenMediaViewer?: (data: any) => void;
}
/**
 * Simple WhatsApp-like Audio Player
 */
const AudioPill: React.FC<{ url: string; getFileName: (url: string) => string }> = ({ url }) => {
    console.log('[RENDERER] AudioPill rendering with URL:', url);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current) return;

        try {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                await audioRef.current.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error("Playback failed:", error);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
        }
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time) || !isFinite(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleProgressJump = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!audioRef.current || duration <= 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const nextTime = (x / rect.width) * duration;
        audioRef.current.currentTime = nextTime;
        setProgress(nextTime);
    };

    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

    return (
        <div
            className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-[#dcf8c6] dark:bg-[#1f2c34] w-full max-w-[260px] shadow-sm relative"
            dir="ltr"
            onClick={(e) => e.stopPropagation()}
        >
            <audio
                ref={audioRef}
                src={url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                    setIsPlaying(false);
                    setProgress(0);
                }}
                className="hidden"
            />

            {/* Play Button */}
            <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#25d366] hover:bg-[#20ba5a] text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
            >
                {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} className="ml-[2px]" />}
            </button>

            {/* Waveform/Progress area */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div
                    className="relative h-6 flex items-center cursor-pointer group"
                    onClick={handleProgressJump}
                >
                    {/* Background line */}
                    <div className="absolute inset-x-0 h-[2px] bg-black/10 dark:bg-white/10 rounded-full" />
                    
                    {/* Active progress line */}
                    <div 
                        className="absolute left-0 h-[2px] bg-[#34b7f1] rounded-full transition-all duration-75"
                        style={{ width: `${progressPercent}%` }}
                    />

                    {/* Fake Waveform Bars */}
                    <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-0.5 opacity-40">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div 
                                key={i}
                                className="w-[1.5px] rounded-full bg-gray-500 dark:bg-gray-400"
                                style={{ height: `${40 + Math.sin(i * 0.8) * 30}%` }}
                            />
                        ))}
                    </div>

                    {/* Drag Knob (only visible on progress) */}
                    <div 
                        className="absolute w-3 h-3 rounded-full bg-[#34b7f1] shadow-md border border-white dark:border-gray-800 -translate-y-1/2 top-1/2"
                        style={{ left: `calc(${progressPercent}% - 6px)` }}
                    />
                </div>

                {/* Time & Mic */}
                <div className="flex items-center justify-between mt-0.5 px-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        {formatTime(isPlaying ? progress : duration || 0)}
                    </span>
                    <FaMicrophone size={10} className="text-[#34b7f1] opacity-70" />
                </div>
            </div>

            {/* Side Static Icon (Orange-ish) */}
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 ml-1">
                <FaVolumeUp size={14} className="text-orange-500" />
            </div>
        </div>
    );
};

const MessageAttachments: React.FC<MessageAttachmentsProps> = ({
    attachmentUrl, theme, isSentByMe, setVideoLightboxUrl, getFileName, onOpenMediaViewer
}) => {
    console.log('[RENDERER] MessageAttachments for URL:', attachmentUrl);
    if (!attachmentUrl) return null;

    const urls = attachmentUrl.split('|').filter(Boolean);

    const getFileIcon = (url: string) => {
        const ext = getFileExtension(url);
        if (['pdf'].includes(ext)) return <FaFilePdf className="text-red-500" />;
        if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-600" />;
        if (['xls', 'xlsx'].includes(ext)) return <FaFileExcel className="text-emerald-600" />;
        if (['zip', 'rar', '7z'].includes(ext)) return <FaFileArchive className="text-orange-500" />;
        if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return <FaFileVideo className="text-purple-500" />;
        return <FaFileAlt className="text-gray-400" />;
    };

    return (
        <>
            {urls.map((url, idx) => {
                const ext = getFileExtension(url);
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                const isVideo = ['mp4', 'mov', 'avi'].includes(ext);
                const isAudio = ['weba', 'webm', 'mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext);

                return (
                    <div key={idx} className="w-full mb-3 overflow-hidden rounded-lg" onClick={(e) => e.stopPropagation()}>
                        {isImage ? (
                            <div className="relative group border border-gray-100 dark:border-gray-600 rounded-lg overflow-hidden">
                                <img
                                    src={url}
                                    alt="Attachment"
                                    className="w-full max-h-60 object-cover cursor-pointer hover:brightness-90 transition-all"
                                    onClick={() => {
                                        if (onOpenMediaViewer) {
                                            onOpenMediaViewer({
                                                type: 'image',
                                                url,
                                                senderName: isSentByMe ? 'أنت' : 'المرسل'
                                            });
                                        } else {
                                            window.open(url, '_blank');
                                        }
                                    }}
                                />
                                <a
                                    href={url}
                                    download={getFileName(url)}
                                    className="absolute bottom-2 left-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                    title="تحميل"
                                >
                                    <FaDownload size={12} />
                                </a>
                            </div>
                        ) : isVideo ? (
                            <div className="relative group bg-black flex flex-col items-center cursor-pointer border border-gray-100 dark:border-gray-600 rounded-lg overflow-hidden" onClick={() => setVideoLightboxUrl(url)}>
                                <video src={url} className="w-full max-h-80" preload="metadata" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                        <FaPlay className="text-gray-800 text-xl ml-1" />
                                    </div>
                                </div>
                                <div className="w-full p-2 bg-gray-900/80 flex items-center justify-between text-white border-t border-gray-700">
                                    <span className="text-[10px] truncate max-w-[200px] opacity-70" dir="ltr">{getFileName(url)}</span>
                                    <a
                                        href={url}
                                        download={getFileName(url)}
                                        className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FaDownload size={10} />
                                    </a>
                                </div>
                            </div>
                        ) : isAudio ? (
                            <AudioPill url={url} getFileName={getFileName} />
                        ) : (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[var(--hub-panel-bg)] rounded-xl border border-[var(--hub-border)] hover:bg-[var(--hub-hover)] transition-all group shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-[var(--hub-bg)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    {getFileIcon(url)}
                                </div>
                                <div className="flex-1 min-w-0 text-right">
                                    <div className="text-sm font-bold text-[var(--hub-text-main)] truncate" dir="ltr">{getFileName(url)}</div>
                                    <div className="text-[10px] text-[var(--hub-text-muted)] uppercase mt-0.5">مستند</div>
                                </div>
                                <div className="shrink-0 p-2 text-[var(--hub-text-muted)] group-hover:text-[var(--hub-accent)] transition-colors">
                                    <FaDownload size={14} />
                                </div>
                            </a>
                        )}
                    </div>
                );
            })}
        </>
    );
};

export default MessageAttachments;

