import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { UserLookUp } from '../types/hub.types';

// --- Types & Interfaces ---

export type ViewMode = 'LIST' | 'CHAT';
export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export interface ChatMessage {
    id: number | string;
    chatId: string;
    senderId: string | number;
    senderName: string;
    content: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
    type: 'text' | 'image' | 'audio' | 'file';
    attachmentUrl?: string;
    replyTo?: {
        id: string | number;
        sender: string;
        text: string;
    } | null;
}

interface ChatState {
    activeChatId: string | null;
    viewMode: ViewMode;
    connectionStatus: ConnectionStatus;
    // Data Normalization: Messages grouped by ChatId
    messagesByChat: Record<string, ChatMessage[]>;
    // Cache for user details/contacts
    contacts: Record<string, UserLookUp>;
    // Recording state
    isRecording: boolean;
    /** chatId (room) -> userIds currently typing (from SignalR). */
    remoteTypingByChat: Record<string, Set<string>>;
}

type ChatAction =
    | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
    | { type: 'SET_VIEW_MODE'; payload: ViewMode }
    | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
    | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: ChatMessage } }
    | { type: 'UPDATE_MESSAGE_STATUS'; payload: { chatId: string; messageId: string | number; status: ChatMessage['status'] } }
    | { type: 'REMOTE_TYPING'; payload: { chatId: string; userId: string; isTyping: boolean } }
    | { type: 'SET_RECORDING'; payload: boolean }
    | { type: 'LOAD_MESSAGE_HISTORY'; payload: { chatId: string; messages: ChatMessage[] } };

// --- Reducer Logic ---

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'SET_ACTIVE_CHAT':
            return { 
                ...state, 
                activeChatId: action.payload,
                // Automatically switch to CHAT view on mobile if a chat is selected
                viewMode: action.payload && window.innerWidth < 768 ? 'CHAT' : state.viewMode
            };
        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload };
        case 'SET_CONNECTION_STATUS':
            return { ...state, connectionStatus: action.payload };
        case 'ADD_MESSAGE': {
            const { chatId, message } = action.payload;
            const existingMessages = state.messagesByChat[chatId] || [];
            // Prevent duplicates
            if (existingMessages.some(m => m.id === message.id)) return state;
            
            return {
                ...state,
                messagesByChat: {
                    ...state.messagesByChat,
                    [chatId]: [...existingMessages, message]
                }
            };
        }
        case 'UPDATE_MESSAGE_STATUS': {
            const { chatId, messageId, status } = action.payload;
            const messages = state.messagesByChat[chatId] || [];
            return {
                ...state,
                messagesByChat: {
                    ...state.messagesByChat,
                    [chatId]: messages.map(m => m.id === messageId ? { ...m, status } : m)
                }
            };
        }
        case 'REMOTE_TYPING': {
            const { chatId, userId, isTyping } = action.payload;
            const next: Record<string, Set<string>> = { ...state.remoteTypingByChat };
            const prevSet = new Set(next[chatId] || []);
            if (isTyping) prevSet.add(userId);
            else prevSet.delete(userId);
            if (prevSet.size === 0) delete next[chatId];
            else next[chatId] = prevSet;
            return { ...state, remoteTypingByChat: next };
        }
        case 'SET_RECORDING':
            return { ...state, isRecording: action.payload };
        case 'LOAD_MESSAGE_HISTORY':
            return {
                ...state,
                messagesByChat: {
                    ...state.messagesByChat,
                    [action.payload.chatId]: action.payload.messages
                }
            };
        default:
            return state;
    }
};

const initialState: ChatState = {
    activeChatId: null,
    viewMode: window.innerWidth < 768 ? 'LIST' : 'CHAT',
    connectionStatus: 'DISCONNECTED',
    messagesByChat: {},
    contacts: {},
    isRecording: false,
    remoteTypingByChat: {},
};

// --- Context & Provider ---

interface ChatContextType extends ChatState {
    dispatch: React.Dispatch<ChatAction>;
    selectChat: (id: string | null) => void;
    closeChat: () => void;
    sendMessage: (content: string, type?: ChatMessage['type']) => void;
    // SignalR Handlers Preparation
    handleReceiveMessage: (msg: ChatMessage) => void;
    handleRemoteTyping: (userId: string, chatId: string, isTyping: boolean) => void;
    handleStatusUpdate: (chatId: string, messageId: string | number, status: ChatMessage['status']) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(chatReducer, initialState);

    // --- Responsive View Controller ---
    useEffect(() => {
        const handleResize = () => {
            const newMode: ViewMode = window.innerWidth < 768 ? 'LIST' : 'CHAT';
            if (state.viewMode !== newMode) {
                dispatch({ type: 'SET_VIEW_MODE', payload: newMode });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [state.viewMode]);

    // --- Action Creators (Business Logic) ---

    const selectChat = useCallback((id: string | null) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: id });
    }, []);

    const closeChat = useCallback(() => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
        if (window.innerWidth < 768) {
            dispatch({ type: 'SET_VIEW_MODE', payload: 'LIST' });
        }
    }, []);

    const sendMessage = useCallback((content: string, type: ChatMessage['type'] = 'text') => {
        if (!state.activeChatId) return;

        const tempId = `temp-${Date.now()}`;
        const newMessage: ChatMessage = {
            id: tempId,
            chatId: state.activeChatId,
            senderId: 'me', // Should get from AuthContext
            senderName: 'Me',
            content,
            timestamp: new Date(),
            status: 'sending',
            type
        };

        dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.activeChatId, message: newMessage } });

        // TODO: Call API / SignalR to send message
        // Example: hubConnection.invoke('SendMessage', ...)
        console.log('Sending message to API...', newMessage);
    }, [state.activeChatId]);

    // --- SignalR Handlers (Layer Integration) ---

    const handleReceiveMessage = useCallback((msg: ChatMessage) => {
        dispatch({ type: 'ADD_MESSAGE', payload: { chatId: msg.chatId, message: msg } });
    }, []);

    const handleRemoteTyping = useCallback((userId: string, chatId: string, isTyping: boolean) => {
        dispatch({ type: 'REMOTE_TYPING', payload: { chatId, userId: String(userId), isTyping } });
    }, []);

    const handleStatusUpdate = useCallback((chatId: string, messageId: string | number, status: ChatMessage['status']) => {
        dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { chatId, messageId, status } });
    }, []);

    const value: ChatContextType = {
        ...state,
        dispatch,
        selectChat,
        closeChat,
        sendMessage,
        handleReceiveMessage,
        handleRemoteTyping,
        handleStatusUpdate
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// --- Hook for consuming context ---

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
