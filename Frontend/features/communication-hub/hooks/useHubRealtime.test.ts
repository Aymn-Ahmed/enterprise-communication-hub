import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useHubRealtime } from './useHubRealtime';

let capturedMessageCallback: ((message: any) => void) | undefined;
let capturedOptions: any;

vi.mock('../../../core/realtime/useSignalRAdapter', () => ({
  useSignalRAdapter: (messageCallback: (message: any) => void, options: any) => {
    capturedMessageCallback = messageCallback;
    capturedOptions = options;
    return {
      isConnected: true,
      isConnecting: false,
      connectionPhase: 'connected',
      notifyTyping: vi.fn(),
      joinRoom: vi.fn(),
      joinGlobalChannel: vi.fn(),
      joinDepartmentChannel: vi.fn(),
      joinDepartmentChat: vi.fn(),
      startConnection: vi.fn()
    };
  }
}));

describe('useHubRealtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    capturedMessageCallback = undefined;
    capturedOptions = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('batches message-triggered reload calls', () => {
    const loadCounts = vi.fn();
    const loadConversations = vi.fn();
    const loadHubItems = vi.fn();

    renderHook(() =>
      useHubRealtime({
        open: true,
        loadCounts,
        loadConversations,
        loadHubItems,
        onStatusUpdate: vi.fn(),
        onReactionUpdate: vi.fn(),
        onInfoModalUpdate: vi.fn()
      })
    );

    act(() => {
      capturedMessageCallback?.({ id: 1 });
      capturedMessageCallback?.({ id: 2 });
      vi.advanceTimersByTime(149);
    });
    expect(loadCounts).toHaveBeenCalledTimes(0);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(loadCounts).toHaveBeenCalledTimes(1);
    expect(loadConversations).toHaveBeenCalledTimes(1);
    expect(loadHubItems).toHaveBeenCalledTimes(1);
  });

  it('tracks typing keys and auto-clears stale typing', () => {
    const onRemoteTyping = vi.fn();
    const { result } = renderHook(() =>
      useHubRealtime({
        open: true,
        loadCounts: vi.fn(),
        loadConversations: vi.fn(),
        loadHubItems: vi.fn(),
        onStatusUpdate: vi.fn(),
        onReactionUpdate: vi.fn(),
        onInfoModalUpdate: vi.fn(),
        onRemoteTyping
      })
    );

    act(() => {
      capturedOptions?.onUserTyping?.('22', '101', true);
    });
    expect(result.current.typingKeys.has('101|22')).toBe(true);
    expect(onRemoteTyping).toHaveBeenCalledWith('22', '101', true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.typingKeys.has('101|22')).toBe(false);
    expect(onRemoteTyping).toHaveBeenCalledWith('22', '101', false);
  });
});
