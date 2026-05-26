import React from 'react';
import {
  FaTrash,
  FaPlay,
  FaPause,
  FaSpinner,
  FaPaperPlane,
  FaClock,
} from 'react-icons/fa';
import { formatTime } from '../../utils/hubUtils';

interface RecordingUIProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  recordingBlob: Blob | null;
  isUploadingFile: boolean;
  cancelRecording: () => void;
  resumeRecording: () => void;
  pauseRecording: () => void;
  stopRecording: () => void;
  uploadRecording: (blob: Blob) => void;
  colorHex?: string;
  borderColorClass?: string;
  bgColorClass?: string;
  btnHoverClass?: string;
}

// --- SUB-COMPONENT: RecordingWaveform --- 
// Dynamic bars that react to recording/pause/preview states
const RecordingWaveform: React.FC<{
  isRecording: boolean;
  isPaused: boolean;
  isPlayingPreview: boolean;
  previewProgress: number;
  count?: number;
  type: 'live' | 'preview';
}> = ({ isPaused, isPlayingPreview, previewProgress, count = 24, type }) => {
  return (
    <div className="flex items-center justify-center gap-[3px] h-6 overflow-hidden w-full">
      {Array.from({ length: count }).map((_, i) => {
        const heights = [6, 10, 14, 9, 16, 8, 13, 7, 15, 10, 12, 6];
        const barHeight = heights[i % heights.length];
        const isPlayed = type === 'preview' && (i / count) * 100 <= previewProgress;

        return (
          <span
            key={i}
            className={`block w-[3px] rounded-full transition-all duration-200 ${
              type === 'live'
                ? (isPaused ? 'bg-gray-300 dark:bg-gray-600' : 'bg-red-400 animate-recording-wave')
                : (isPlayed ? 'bg-emerald-500 animate-preview-wave' : 'bg-gray-300 dark:bg-gray-600')
            } ${isPlayingPreview ? 'animate-preview-wave' : ''}`}
            style={{
              height: `${barHeight}px`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        );
      })}
    </div>
  );
};

// --- SUB-COMPONENT: RecordingTopRow --- 
// Responsible for Waveform, Timer, and Preview Playback
const RecordingTopRow: React.FC<{
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  recordingBlob: Blob | null;
  isPlayingPreview: boolean;
  onTogglePreview: () => void;
  previewProgress: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioUrl: string | null;
  isUploadingFile: boolean;
}> = ({ 
  isRecording, isPaused, recordingTime, recordingBlob, 
  isPlayingPreview, onTogglePreview, previewProgress, audioRef, audioUrl, isUploadingFile 
}) => {
  // Show play button if we have a blob and (we are not recording OR we are paused)
  const showPlayButton = recordingBlob && (!isRecording || (isRecording && isPaused));

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--hub-input-bg)] rounded-xl border border-[var(--hub-border)]/50 mb-2 min-h-[44px]">
      {/* Left: Play/Pause Button (WhatsApp Style) */}
      <div className="shrink-0 w-9 h-9 flex items-center justify-center">
        {showPlayButton ? (
          <button
            type="button"
            onClick={onTogglePreview}
            disabled={isUploadingFile}
            className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm hover:bg-emerald-600 transition-all active:scale-90 disabled:opacity-50"
            title={isPlayingPreview ? 'إيقاف' : 'تشغيل'}
          >
            {isPlayingPreview ? <FaPause size={10} /> : <FaPlay size={10} className="ml-0.5" />}
          </button>
        ) : (
          <div className="text-[var(--hub-text-muted)] opacity-50">
            <FaClock size={12} />
          </div>
        )}
      </div>

      {/* Waveform Area (Center) */}
      <div className="flex-1 min-w-0 flex items-center justify-center">
        <RecordingWaveform 
          isRecording={isRecording} 
          isPaused={isPaused} 
          isPlayingPreview={isPlayingPreview}
          previewProgress={previewProgress}
          type={isRecording ? 'live' : 'preview'}
          count={isRecording ? 18 : 36}
        />
      </div>

      {/* Timer Display */}
      <div className={`shrink-0 font-mono font-bold text-base tracking-wider whitespace-nowrap px-1 ${
        isRecording ? (isPaused ? 'text-gray-400' : 'text-red-500') : 'text-emerald-600'
      }`}>
        {formatTime(recordingTime)}
      </div>

      {/* Hidden Audio */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} className="hidden" />
      )}
    </div>
  );
};

// --- SUB-COMPONENT: RecordingBottomRow --- 
// Responsible for Delete, Pause/Resume, and Send Actions
const RecordingBottomRow: React.FC<{
  isRecording: boolean;
  isPaused: boolean;
  onCancel: () => void;
  onTogglePause: () => void;
  onSend: () => void;
  isUploadingFile: boolean;
  hasBlob: boolean;
}> = ({ isRecording, isPaused, onCancel, onTogglePause, onSend, isUploadingFile, hasBlob }) => (
  <div className="flex items-center justify-between gap-3 px-1">
    {/* Delete Button */}
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={onCancel}
        disabled={isUploadingFile}
        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
        title="حذف"
      >
        <FaTrash size={16} />
      </button>
    </div>

    {/* Pause/Resume (Only while recording) */}
    <div className="flex-1 flex items-center justify-center">
      {isRecording && (
        <button
          type="button"
          onClick={onTogglePause}
          disabled={isUploadingFile}
          className={`px-4 py-1.5 rounded-full font-black text-[11px] shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
            isPaused
              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
          }`}
          title={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
        >
          {isPaused ? <><FaPlay size={10} /> </> : <><FaPause size={10} /> 
          </>}
        </button>
      )}
    </div>

    {/* Send / Stop Button */}
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={onSend}
        disabled={isUploadingFile || (!isRecording && !hasBlob)}
        className="w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white flex items-center justify-center shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        title={isRecording ? 'إيقاف التسجيل' : 'إرسال'}
      >
        {isUploadingFile ? (
          <FaSpinner className="animate-spin" size={16} />
        ) : (
          <FaPaperPlane size={16} className="transform -scale-x-100" />
        )}
      </button>
    </div>
  </div>
);

// --- MAIN COMPONENT: RecordingUI --- 
// Container and State Manager
export const RecordingUI: React.FC<RecordingUIProps> = ({
  isRecording,
  isPaused,
  recordingTime,
  recordingBlob,
  isUploadingFile,
  cancelRecording,
  resumeRecording,
  pauseRecording,
  stopRecording,
  uploadRecording,
  colorHex,
  borderColorClass,
  bgColorClass,
  btnHoverClass
}) => {
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = React.useState(false);
  const [previewProgress, setPreviewProgress] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Sync Audio Blob to URL
  React.useEffect(() => {
    if (!recordingBlob) {
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(recordingBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [recordingBlob]);

  // Handle Audio Events
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlayingPreview(true);
    const onPause = () => setIsPlayingPreview(false);
    const onEnded = () => { setIsPlayingPreview(false); setPreviewProgress(0); audio.currentTime = 0; };
    const onTimeUpdate = () => { if (audio.duration) setPreviewProgress((audio.currentTime / audio.duration) * 100); };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audioUrl]);

  const handleSendClick = () => {
    if (isUploadingFile) return;
    if (isRecording) {
      stopRecording();
      return;
    }
    if (recordingBlob) {
      uploadRecording(recordingBlob);
    }
  };

  const handlePreviewPlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingPreview) audio.pause();
    else void audio.play();
  };

  return (
    <div
      className="w-full rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-sidebar-bg)] shadow-xl p-3 relative overflow-hidden animate-in slide-in-from-bottom-2 duration-300"
      dir="rtl"
    >
      {/* Upload Overlay */}
      {isUploadingFile && (
        <div className="absolute inset-0 z-30 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-white dark:bg-neutral-900 border border-[var(--hub-border)] px-4 py-2 shadow-2xl">
            <FaSpinner className="animate-spin text-emerald-500" size={14} />
            <span className="text-xs font-black text-gray-700 dark:text-gray-200">جاري الرفع...</span>
          </div>
        </div>
      )}

      {/* ROW 1: Content/Progress Area */}
      <RecordingTopRow 
        isRecording={isRecording}
        isPaused={isPaused}
        recordingTime={recordingTime}
        recordingBlob={recordingBlob}
        isPlayingPreview={isPlayingPreview}
        onTogglePreview={handlePreviewPlayPause}
        previewProgress={previewProgress}
        audioRef={audioRef}
        audioUrl={audioUrl}
        isUploadingFile={isUploadingFile}
      />

      {/* ROW 2: Control Actions Area */}
      <RecordingBottomRow 
        isRecording={isRecording}
        isPaused={isPaused}
        onCancel={cancelRecording}
        onTogglePause={isPaused ? resumeRecording : pauseRecording}
        onSend={handleSendClick}
        isUploadingFile={isUploadingFile}
        hasBlob={!!recordingBlob}
      />

      <style>{`
        @keyframes recordingWave {
          0%, 100% { transform: scaleY(0.6); opacity: 0.8; }
          50% { transform: scaleY(1.4); opacity: 1; }
        }

        @keyframes previewWave {
          0%, 100% { transform: scaleY(0.9); }
          50% { transform: scaleY(1.1); }
        }

        .animate-recording-wave {
          transform-origin: center;
          animation: recordingWave 0.8s ease-in-out infinite;
        }

        .animate-preview-wave {
          transform-origin: center;
          animation: previewWave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};