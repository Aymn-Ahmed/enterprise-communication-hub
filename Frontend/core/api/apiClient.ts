import { defaultApiClient } from './defaultApiClient';
import { getCommunicationHubAdapters } from '../integration/moduleHost';

export const getApiClient = () => getCommunicationHubAdapters().apiClient ?? defaultApiClient;
