import { useState, useCallback } from 'react';

/**
 * Hook to manage the core chat state and SignalR interactions.
 */
export function useChatLogic() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Logic for loadHubItems, loadCounts, etc., will be moved here.

    return {
        messages,
        isLoading
    };
}
