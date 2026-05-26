import { useState, useRef, useCallback, useEffect } from 'react';
import { dispatchHubToast } from '../utils/hubToastEvents';

export interface UseVoiceRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    audioBlob: Blob | null;
    startRecording: () => Promise<void>;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => void;
    stopAndSend: () => void; // Added
    cancelRecording: () => void;
    setAudioBlob: (blob: Blob | null) => void;
    setDuration: (duration: number | ((prev: number) => number)) => void;
}

interface UseVoiceRecorderProps {
    onSend?: (blob: Blob) => void;
}

export const useVoiceRecorder = (props?: UseVoiceRecorderProps): UseVoiceRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const isSendingOnStopRef = useRef(false); // Added

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null); // Changed type to NodeJS.Timeout
    const isCancelledRef = useRef(false);

    const startRecording = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                dispatchHubToast('عذراً، متصفحك لا يدعم تسجيل الصوت أو يحتاج لاتصال آمن (HTTPS).', 'error');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
            const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            isCancelledRef.current = false;
            isSendingOnStopRef.current = false; // Added

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = isCancelledRef.current ? null : new Blob(audioChunksRef.current, { type: supportedType });
                
                if (blob) {
                    console.log(`VoiceRecorder: Recording stopped. Blob size: ${blob.size} bytes, type: ${supportedType}`);
                    setAudioBlob(blob);
                    if (isSendingOnStopRef.current && props?.onSend) { // Added
                        props.onSend(blob);
                    }
                }
                
                setIsRecording(false);
                setIsPaused(false);
                audioChunksRef.current = [];
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                setIsRecording(false);
                setIsPaused(false);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            };

            mediaRecorder.start(1000); // 🚀 Add 1s timeslice for better reliability
            setIsRecording(true);
            setIsPaused(false);
            setDuration(0);
            setAudioBlob(null);

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (error: any) {
            console.error('Error accessing microphone:', error);
            setIsRecording(false);
            dispatchHubToast('تعذر الوصول إلى الميكروفون. تحقق من صلاحيات المتصفح.', 'error');
        }
    }, [setAudioBlob, setIsRecording, setDuration, props]); // Added props to dependency array

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            
            // Generate a blob of the current recorded parts
            if (audioChunksRef.current.length > 0) {
                const currentType = mediaRecorderRef.current.mimeType;
                const tempBlob = new Blob(audioChunksRef.current, { type: currentType });
                setAudioBlob(tempBlob);
            }
        }
    }, [setAudioBlob]);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            isCancelledRef.current = false; 
            isSendingOnStopRef.current = false; // Added
            mediaRecorderRef.current.stop();
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, []);

    const stopAndSend = useCallback(() => { // Added
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            isCancelledRef.current = false; 
            isSendingOnStopRef.current = true; // Set to true for sending
            mediaRecorderRef.current.stop();
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, []);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            isCancelledRef.current = true; // رفع علم الإلغاء
            isSendingOnStopRef.current = false; // Added
            mediaRecorderRef.current.stop();
        }
        // These states are typically reset by onstop, but explicitly setting them here
        // ensures immediate UI feedback even if onstop is delayed or not fully triggered.
        setIsRecording(false);
        setIsPaused(false);
        setDuration(0);
        setAudioBlob(null);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [setAudioBlob, setIsRecording, setDuration]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return {
        isRecording,
        isPaused,
        duration,
        audioBlob,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        stopAndSend,
        cancelRecording,
        setAudioBlob,
        setDuration
    };
};
