export interface HubHttpResponse<T = any> {
    data: T;
    status: number;
}

export interface HubApiClient {
    get<T = any>(url: string): Promise<HubHttpResponse<T>>;
    post<T = any>(url: string, body?: any, config?: { headers?: Record<string, string> }): Promise<HubHttpResponse<T>>;
    put<T = any>(url: string, body?: any, config?: { headers?: Record<string, string> }): Promise<HubHttpResponse<T>>;
    delete<T = any>(url: string): Promise<HubHttpResponse<T>>;
}

export interface HubUserShape {
    [key: string]: any;
}

export interface HubAuthAdapter {
    useAuthUserHook?: () => { user: HubUserShape | null; refreshUser: () => void };
}

export interface HubStorageAdapter {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem?: (key: string) => void;
}

export interface HubSignalROptions {
    [key: string]: any;
}

export type HubRealtimeConnectionPhase = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface HubSignalRReturn {
    isConnected: boolean;
    isConnecting?: boolean;
    connectionPhase?: HubRealtimeConnectionPhase;
    joinRoom: (chatId: string) => Promise<void>;
    leaveRoom?: (chatId: string) => Promise<void>;
    joinGlobalChannel: () => Promise<void>;
    joinDepartmentChannel: (deptId: number) => Promise<void>;
    joinDepartmentChat: (deptId: number) => Promise<void>;
    startConnection?: () => Promise<void>;
    stopConnection?: () => Promise<void>;
    notifyTyping: (chatId: string, isTyping: boolean) => Promise<void>;
}

export type HubSignalRHook = (
    onMessageReceived?: (message: any) => void,
    options?: HubSignalROptions
) => HubSignalRReturn;

export interface HubModuleAdapters {
    apiClient?: HubApiClient;
    auth?: HubAuthAdapter;
    storage?: HubStorageAdapter;
    useSignalRHook?: HubSignalRHook;
}
