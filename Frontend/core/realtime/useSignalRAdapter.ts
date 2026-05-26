import { useMemo } from 'react';
import { getCommunicationHubAdapters } from '../integration/moduleHost';
import type { HubSignalRHook, HubSignalRReturn } from '../integration/types';
import { useSignalRInternal } from './useSignalRInternal';

const noopAsync = async () => { };

const useNoopSignalR: HubSignalRHook = () => {
    return useMemo<HubSignalRReturn>(() => ({
        isConnected: false,
        isConnecting: false,
        connectionPhase: 'disconnected',
        joinRoom: noopAsync,
        leaveRoom: noopAsync,
        joinGlobalChannel: noopAsync,
        joinDepartmentChannel: noopAsync,
        joinDepartmentChat: noopAsync,
        startConnection: noopAsync,
        stopConnection: noopAsync,
        notifyTyping: noopAsync
    }), []);
};

export const useSignalRAdapter: HubSignalRHook = (onMessageReceived, options) => {
    const hook = getCommunicationHubAdapters().useSignalRHook ?? useSignalRInternal ?? useNoopSignalR;
    return hook(onMessageReceived, options);
};
