const readEnv = (key: string): string | undefined => {
  const v = (import.meta as any)?.env?.[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
};

/**
 * Runtime configuration with safe defaults that preserve current behavior.
 */
export const runtimeConfig = {
  apiBaseUrl: readEnv('VITE_HUB_API_BASE_URL') ?? 'http://localhost:5270',
  signalRHubUrl: readEnv('VITE_HUB_SIGNALR_URL') ?? 'http://localhost:5270/chatHub',
  enableAdminDashboard: (readEnv('VITE_HUB_ENABLE_ADMIN_DASHBOARD') ?? 'true').toLowerCase() !== 'false'
};

