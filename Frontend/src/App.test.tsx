import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { vi } from 'vitest';

vi.mock('../index', () => ({
  CommunicationHubWidget: ({ open }: { open: boolean }) => (
    <div data-testid="hub-widget">{open ? 'open' : 'closed'}</div>
  ),
  configureCommunicationHub: vi.fn()
}));

const makeToken = (payload: Record<string, unknown>) => {
  const encoded = btoa(JSON.stringify(payload));
  return `h.${encoded}.s`;
};

describe('App critical flows', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('handles login success and failure', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: makeToken({ role: 'employee', exp: Math.floor(Date.now() / 1000) + 3600 }),
          displayId: 9,
          role: 'employee',
          username: 'u',
          name: 'n'
        })
      });
    vi.stubGlobal('fetch', fetchMock as any);

    render(<App />);
    const signIn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(signIn);
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });

    fireEvent.click(signIn);
    await waitFor(() => {
      expect(localStorage.getItem('smartdash_token')).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open hub/i })).toBeInTheDocument();
    });
  });

  it('loads users and runs admin department/role/status actions', async () => {
    localStorage.setItem(
      'smartdash_token',
      makeToken({ role: 'admin', displayId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })
    );
    localStorage.setItem('smartdash_user', JSON.stringify({ DisplayId: 1, Role: 'admin' }));

    const usersPayload = {
      items: [
        {
          displayId: 2,
          username: 'emp',
          name: 'Employee',
          role: 'employee',
          workId: 5,
          isOnline: true,
          isActive: true,
          lastActiveAt: null
        }
      ],
      page: 1,
      pageSize: 10,
      totalCount: 1
    };

    const fetchMock = vi.fn()
      // initial users load
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => usersPayload })
      // department
      .mockResolvedValueOnce({ ok: true, status: 200 })
      // role
      .mockResolvedValueOnce({ ok: true, status: 200 })
      // status
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock as any);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open hub/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /open admin dashboard/i }));

    await waitFor(() => {
      expect(screen.getByText('Employee')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /change department|حفظ القسم/i }));
    fireEvent.click(screen.getByRole('button', { name: /save role|حفظ الدور/i }));
    fireEvent.click(screen.getByRole('button', { name: /disable user|تعطيل المستخدم/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users/2/department'),
        expect.any(Object)
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users/2/role'),
        expect.any(Object)
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users/2/status'),
        expect.any(Object)
      );
    });
  });
});
