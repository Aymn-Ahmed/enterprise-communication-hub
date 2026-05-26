import { act, renderHook } from '@testing-library/react';
import { useHubComposer } from './useHubComposer';

describe('useHubComposer', () => {
  it('sends inline message to selected user target', async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const loadCounts = vi.fn();
    const cancelRecording = vi.fn();
    const setPendingMediaFiles = vi.fn();

    const { result } = renderHook(() =>
      useHubComposer({
        activeTab: 'chat',
        selectedChatUser: { Id: 22, Type: 'User' } as any,
        selectedDepartment: '',
        sendMessage,
        loadCounts,
        cancelRecording,
        setPendingMediaFiles
      })
    );

    await act(async () => {
      await result.current.handleInlineSubmit({
        messageText: 'hello',
        attachmentUrls: [],
        audioBlob: null,
        recordingBlob: null,
        appointmentDate: '',
        appointmentTime: '',
        locationPreview: null,
        setAppointmentDate: vi.fn(),
        setAppointmentTime: vi.fn(),
        setLocationPreview: vi.fn()
      });
    });

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        targets: [{ type: 'User', id: '22' }],
        messageCategory: 'chat'
      })
    );
  });
});
