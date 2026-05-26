export { CommunicationHubWidget } from './components/CommunicationHubWidget';
export { default as CommunicationHubWidgetDefault } from './components/CommunicationHubWidget';

export { ThemeProvider } from './features/communication-hub/context/ThemeContext';
export { WallpaperProvider } from './features/communication-hub/context/WallpaperContext';

export { configureCommunicationHub } from './core/integration/moduleHost';
export type {
    HubApiClient,
    HubAuthAdapter,
    HubModuleAdapters,
    HubSignalRHook,
    HubStorageAdapter,
    HubUserShape,
    HubHttpResponse
} from './core/integration/types';
