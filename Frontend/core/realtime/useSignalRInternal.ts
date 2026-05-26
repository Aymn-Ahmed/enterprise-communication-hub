import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import type { HubRealtimeConnectionPhase } from '../integration/types';
import { runtimeConfig } from '../config/runtimeConfig';

interface UseSignalROptions {
    url?: string;
    enabled?: boolean;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: Error) => void;
    onUserOnline?: (userId: string) => void;
    onUserOffline?: (userId: string) => void;
    onUserTyping?: (userId: string, chatId: string, isTyping: boolean) => void;
    onInitialOnlineUsers?: (userIds: string[]) => void;
    onMessageDelivered?: (data: any) => void;
    onMessageRead?: (data: any) => void;
    onMessagesRead?: (data: any) => void;
    onMessagesDelivered?: (data: any) => void;
    onReactionUpdated?: (data: any) => void;
}

export function useSignalRInternal(onMessageReceived?: (message: any) => void, options: UseSignalROptions = {}) {
    const { url = runtimeConfig.signalRHubUrl, enabled = true } = options;
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const manualRetryAttemptRef = useRef(0);
    const authFailedRef = useRef(false);
    const isStoppingRef = useRef(false);
    const lastStartAttemptRef = useRef(0);
    const isStartingRef = useRef(false);
    const startConnectionRef = useRef<() => Promise<void>>(async () => { });
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionPhase, setConnectionPhase] = useState<HubRealtimeConnectionPhase>('idle');

    const createConnection = useCallback(() => {
        const token = window.localStorage.getItem('smartdash_token');

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(url, {
                accessTokenFactory: () => token || '',
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Warning)
            .withServerTimeout(60000)
            .withKeepAliveInterval(15000)
            .build();

        connection.on('ReceiveMessage', (message: any) => onMessageReceived?.(message));
        connection.on('ReceiveNotification', (notification: any) => onMessageReceived?.(notification));
        connection.on('UserOnline', (userId: string) => options.onUserOnline?.(userId));
        connection.on('UserOffline', (userId: string) => options.onUserOffline?.(userId));
        connection.on('UserTyping', (userId: string, chatId: string, isTyping: boolean) => options.onUserTyping?.(userId, chatId, isTyping));
        connection.on('InitialOnlineUsers', (userIds: string[]) => options.onInitialOnlineUsers?.(userIds));
        connection.on('MessageDelivered', (data: any) => options.onMessageDelivered?.(data));
        connection.on('MessageRead', (data: any) => options.onMessageRead?.(data));
        connection.on('MessagesDelivered', (data: any) => options.onMessagesDelivered?.(data));
        connection.on('MessagesRead', (data: any) => options.onMessagesRead?.(data));
        connection.on('ReactionUpdated', (data: any) => options.onReactionUpdated?.(data));

        connection.onreconnecting(() => {
            setIsConnected(false);
            setConnectionPhase('reconnecting');
        });
        connection.onreconnected(() => {
            setIsConnected(true);
            setConnectionPhase('connected');
            manualRetryAttemptRef.current = 0;
            options.onConnected?.();
        });
        connection.onclose(() => {
            setIsConnected(false);
            setConnectionPhase('disconnected');
            options.onDisconnected?.();
            if (!enabled || isStoppingRef.current || authFailedRef.current) return;
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
            }
            const attempt = Math.min(manualRetryAttemptRef.current, 6);
            const delay = Math.min(30000, 1000 * Math.pow(2, attempt));
            manualRetryAttemptRef.current += 1;
            retryTimerRef.current = setTimeout(() => {
                retryTimerRef.current = null;
                void startConnectionRef.current();
            }, delay);
        });

        return connection;
    }, [enabled, onMessageReceived, options, url]);

    const startConnection = useCallback(async () => {
        if (!enabled || isStoppingRef.current) return;
        if (isStartingRef.current) return;
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) return;
        const currentToken = window.localStorage.getItem('smartdash_token') ?? '';
        if (!currentToken) {
            setIsConnected(false);
            setIsConnecting(false);
            setConnectionPhase('idle');
            return;
        }
        const now = Date.now();
        if (now - lastStartAttemptRef.current < 1200) return;
        lastStartAttemptRef.current = now;

        isStartingRef.current = true;
        authFailedRef.current = false;
        setIsConnecting(true);
        setConnectionPhase('connecting');
        if (connectionRef.current) {
            try {
                await connectionRef.current.stop();
            } catch {
                // ignore stale connection stop errors
            } finally {
                connectionRef.current = null;
            }
        }
        const connection = createConnection();
        connectionRef.current = connection;
        try {
            await connection.start();
            setIsConnected(true);
            setConnectionPhase('connected');
            options.onConnected?.();
        } catch (error: any) {
            const message = String(error?.message ?? error ?? '').toLowerCase();
            if (message.includes('stopped during negotiation')) {
                setIsConnected(false);
                setConnectionPhase('idle');
                return;
            }
            setIsConnected(false);
            setConnectionPhase('disconnected');
            if (message.includes('401') || message.includes('unauthorized')) {
                authFailedRef.current = true;
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('hub:session-expired', { detail: { source: 'signalr' } }));
                }
            }
            options.onError?.(error);
        } finally {
            setIsConnecting(false);
            isStartingRef.current = false;
        }
    }, [createConnection, enabled, options]);

    useEffect(() => {
        startConnectionRef.current = startConnection;
    }, [startConnection]);

    const stopConnection = useCallback(async () => {
        isStoppingRef.current = true;
        if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }
        manualRetryAttemptRef.current = 0;
        authFailedRef.current = false;
        if (!connectionRef.current) return;
        try {
            await connectionRef.current.stop();
        } catch {
            // Ignore on teardown.
        }
        connectionRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionPhase('disconnected');
    }, []);

    useEffect(() => {
        isStoppingRef.current = !enabled;
        if (enabled) {
            void startConnection();
        }
        return () => {
            void stopConnection();
        };
    }, [enabled, startConnection, stopConnection]);

    const joinRoom = useCallback(async (chatId: string) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current.invoke('JoinChatRoom', chatId);
        }
    }, []);

    const leaveRoom = useCallback(async (chatId: string) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current.invoke('LeaveChatRoom', chatId);
        }
    }, []);

    const joinGlobalChannel = useCallback(async () => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current.invoke('JoinGlobalChannel');
        }
    }, []);

    const joinDepartmentChannel = useCallback(async (deptId: number) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current.invoke('JoinDepartmentChannel', deptId);
        }
    }, []);

    const joinDepartmentChat = useCallback(async (deptId: number) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current.invoke('JoinDepartmentChat', deptId);
        }
    }, []);

    const notifyTyping = useCallback(async (chatId: string, isTyping: boolean) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current.invoke('NotifyTyping', chatId, isTyping);
        }
    }, []);

    return {
        isConnected,
        isConnecting,
        connectionPhase,
        joinRoom,
        leaveRoom,
        joinGlobalChannel,
        joinDepartmentChannel,
        joinDepartmentChat,
        startConnection,
        stopConnection,
        notifyTyping
    };
}
