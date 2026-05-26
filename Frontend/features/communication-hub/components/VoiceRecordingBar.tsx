import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaTrash, FaStop, FaPlay, FaPause, FaPaperPlane } from 'react-icons/fa';

interface VoiceRecordingBarProps {
    duration: number;
    isRecording: boolean;
    isPaused: boolean;
    isUploading?: boolean;
    uploadProgress?: number;
    audioBlob?: Blob | null;
    onCancel: () => void;
    onStop: () => void;
    onPause: () => void;
    onResume: () => void;
    onSend?: () => void;
}

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Waveform: React.FC<{ isActive: boolean; count?: number; color?: string; className?: string }> = ({ isActive, count = 25, color = 'bg-red-400', className = "" }) => {
    const [heights, setHeights] = useState<number[]>(new Array(count).fill(25));
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setHeights(prev => prev.map(() => Math.floor(Math.random() * 70) + 15));
            }, 100);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    return (
        <div className={`flex items-center gap-[2px] h-8 ${className}`}>
            {heights.map((h, i) => (
                <div 
                    key={i} 
                    className={`w-[2px] rounded-full transition-all duration-100 ${color}`}
                    style={{ height: `${isActive ? h : (20 + (Math.sin(i * 0.5) * 10))}%` }}
                />
            ))}
        </div>
    );
};

const VoiceRecordingBar: React.FC<VoiceRecordingBarProps> = ({ 
    duration, 
    isRecording,
    isPaused,
    isUploading = false,
    uploadProgress = 0,
    audioBlob, 
    onCancel, 
    onStop, 
    onPause,
    onResume,
    onSend 
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // Create/Revoke URL for playback
    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            return () => {
                URL.revokeObjectURL(url);
                setAudioUrl(null);
            };
        }
    }, [audioBlob]);

    const togglePlayback = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    // If we have a blob and we're not recording, show Preview
    const isPreview = !!audioBlob && !isRecording;

    if (isPreview) {
        return (
            <div className="flex items-center gap-2 w-full px-1 animate-in fade-in zoom-in-95 duration-200" dir="ltr">
                <audio 
                    ref={audioRef} 
                    src={audioUrl || ''} 
                    onEnded={handleEnded}
                    onTimeUpdate={handleTimeUpdate}
                    className="hidden" 
                />

                {/* Delete/Cancel Button */}
                <button
                    type="button"
                    disabled={isUploading}
                    onClick={(e) => { e.preventDefault(); onCancel(); }}
                    className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${isUploading ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title="حذف التسجيل"
                >
                    <FaTrash size={16} />
                </button>

                {/* Preview Player Bar */}
                <div className="flex-1 flex items-center gap-3 h-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full px-4 shadow-sm relative overflow-hidden">
                    {isUploading && (
                        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] flex items-center justify-center z-20 animate-pulse">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                جاري الرفع... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
                            </span>
                        </div>
                    )}
                    
                    <button
                        type="button"
                        disabled={isUploading}
                        onClick={togglePlayback}
                        className={`text-blue-500 hover:text-blue-600 transition-colors z-10 ${isUploading ? 'opacity-30' : ''}`}
                    >
                        {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                    </button>

                    <div className="flex-1 h-8 flex items-center relative gap-1 px-1">
                        {/* Static Waveform Background */}
                        <Waveform isActive={isPlaying} count={40} color={isPlaying ? "bg-blue-400" : "bg-blue-200 dark:bg-blue-800"} className="absolute inset-0 opacity-40 justify-center" />
                        
                        {/* Progress Bar (Overlay) */}
                        <div className="absolute left-0 bottom-0 h-1 bg-blue-500 rounded-full transition-all duration-100 z-10" 
                             style={{ width: `${(currentTime / duration) * 100}%` }} />
                    </div>

                    <span className="font-mono text-[11px] font-bold text-blue-600 tabular-nums select-none z-10">
                        {formatTime(Math.ceil(currentTime))} / {formatTime(duration)}
                    </span>
                </div>

                {/* Send Button */}
                <button
                    type="button"
                    disabled={isUploading}
                    onClick={(e) => { e.preventDefault(); onSend?.(); }}
                    className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full transition-all shadow-md group ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 active:scale-95'}`}
                    title="إرسال المقطع"
                >
                    <FaPaperPlane size={16} className={`transform -scale-x-100 ${isUploading ? 'opacity-50' : 'group-hover:translate-x-1'} transition-transform`} />
                </button>
            </div>
        );
    }

    // Default Recording UI (with Pause/Resume support)
    return (
        <div className="flex items-center gap-2 w-full px-1" dir="ltr">
            {/* Cancel Button */}
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); onCancel(); }}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                title="إلغاء التسجيل"
            >
                <FaTrash size={16} />
            </button>

            {/* Recording Bar */}
            <div className="flex-1 flex items-center gap-3 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 shadow-sm overflow-hidden">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0 z-10">
                    {!isPaused && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPaused ? 'bg-gray-400' : 'bg-red-500'}`} />
                </span>

                <span className={`font-mono text-sm font-semibold tabular-nums select-none min-w-[38px] z-10 ${isPaused ? 'text-gray-500' : 'text-red-500'}`}>
                    {formatTime(duration)}
                </span>

                {/* Animated Waveform */}
                <div className="flex-1 flex justify-center items-center h-full">
                    <Waveform isActive={!isPaused} count={35} color={isPaused ? "bg-gray-300 dark:bg-gray-600" : "bg-red-400"} />
                </div>

                {/* Pause/Resume Button */}
                <button
                    type="button"
                    onClick={(e) => { 
                        e.preventDefault(); 
                        isPaused ? onResume() : onPause(); 
                    }}
                    className={`z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all ${isPaused ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    title={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
                >
                    {isPaused ? <FaMicrophone size={12} /> : <FaPause size={12} />}
                </button>
            </div>

            {/* Stop Button */}
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); onStop(); }}
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-md transition-all"
                title="إنهاء ومعاينة"
            >
                <FaStop size={14} />
            </button>
        </div>
    );
};

export default VoiceRecordingBar;
