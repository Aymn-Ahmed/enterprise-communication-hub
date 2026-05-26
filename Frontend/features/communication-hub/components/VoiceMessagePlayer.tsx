import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaMicrophone } from 'react-icons/fa';

interface Props {
    url: string;
    isSentByMe: boolean;
}

const VoiceMessagePlayer: React.FC<Props> = ({ url, isSentByMe }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const onTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const onEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div 
            className={`flex items-center gap-3 p-2 rounded-2xl min-w-[220px] max-w-[300px] ${
                isSentByMe 
                ? 'bg-emerald-600/10 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-100' 
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100'
            }`}
            onClick={(e) => e.stopPropagation()}
            dir="ltr"
        >
            <audio 
                ref={audioRef}
                src={url}
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                preload="metadata"
            />
            
            <button 
                onClick={togglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 shadow-sm ${
                    isSentByMe ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100'
                }`}
            >
                {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} className="ml-0.5" />}
            </button>

            <div className="flex-1 flex flex-col gap-1">
                {/* Simple Progress Bar */}
                <div className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden relative">
                    <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-100 ${
                            isSentByMe ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                
                <div className="flex justify-between items-center px-0.5">
                    <span className="text-[10px] opacity-70 font-mono">
                        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
                    </span>
                    <FaMicrophone size={10} className="opacity-40" />
                </div>
            </div>

            {/* Avatar/Icon Indicator */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 opacity-80 ${
                isSentByMe ? 'bg-white/50 dark:bg-black/20' : 'bg-white/80 dark:bg-gray-800'
            }`}>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </div>
        </div>
    );
};

export default VoiceMessagePlayer;
