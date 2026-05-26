import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommunicationHubWidget, configureCommunicationHub } from '../../index';
import AdminDashboard from '../components/AdminDashboard';
import { runtimeConfig } from '../../core/config/runtimeConfig';
import {
  getCurrentDisplayId,
  getJwtExpiryMs,
  getRolePermissions,
  isLastActiveAdmin,
  mapAdminApiError,
  normalizeRole
} from '../utils/adminSecurity';

type AdminUserItem = {
  displayId: number;
  username: string;
  name: string;
  role: string;
  workId: number;
  isOnline: boolean;
  isActive?: boolean;
  lastActiveAt?: string | null;
};

type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};

const parseJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return null;
    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

function DashboardPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize] = useState(10);
  const [usersSearchInput, setUsersSearchInput] = useState('');
  const [usersSearch, setUsersSearch] = useState('');
  const [usersData, setUsersData] = useState<PagedResult<AdminUserItem> | null>(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);
  const [departmentSaveError, setDepartmentSaveError] = useState<string | null>(null);
  const [departmentSaveSuccess, setDepartmentSaveSuccess] = useState<string | null>(null);
  const [savingDepartmentFor, setSavingDepartmentFor] = useState<number | null>(null);
  const [roleSaveError, setRoleSaveError] = useState<string | null>(null);
  const [roleSaveSuccess, setRoleSaveSuccess] = useState<string | null>(null);
  const [statusSaveError, setStatusSaveError] = useState<string | null>(null);
  const [statusSaveSuccess, setStatusSaveSuccess] = useState<string | null>(null);
  const [savingRoleFor, setSavingRoleFor] = useState<number | null>(null);
  const [savingStatusFor, setSavingStatusFor] = useState<number | null>(null);
  const [departmentDrafts, setDepartmentDrafts] = useState<Record<number, number>>({});
  const [roleDrafts, setRoleDrafts] = useState<Record<number, string>>({});
  const hasHandledSessionRef = useRef(false);
  const isMountedRef = useRef(true);

  const token = localStorage.getItem('smartdash_token') ?? '';
  const jwtPayload = useMemo(() => parseJwtPayload(token), [token]);
  const role = (jwtPayload?.role ||
    jwtPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    '').toString();
  const normalizedRole = normalizeRole(role);
  const permissions = getRolePermissions(normalizedRole);
  const currentDisplayId = useMemo(
    () => getCurrentDisplayId(jwtPayload, localStorage.getItem('smartdash_user')),
    [jwtPayload]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('hub_api_base_url', runtimeConfig.apiBaseUrl);
    configureCommunicationHub({});
  }, []);

  const clearSession = useCallback((reason: string) => {
    if (!isMountedRef.current) return;
    localStorage.removeItem('smartdash_token');
    localStorage.removeItem('smartdash_user');
    setShowAdminDashboard(false);
    setUsersData(null);
    setDepartmentDrafts({});
    setRoleDrafts({});
    setOpen(false);
    navigate('/login', { replace: true, state: { reason } });
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsersSearch(usersSearchInput.trim());
    }, 280);
    return () => clearTimeout(timer);
  }, [usersSearchInput]);

  useEffect(() => {
    if (permissions.canAccessAdminDashboard) return;
    setShowAdminDashboard(false);
  }, [permissions.canAccessAdminDashboard]);

  useEffect(() => {
    if (runtimeConfig.enableAdminDashboard) return;
    setShowAdminDashboard(false);
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      if (hasHandledSessionRef.current) return;
      hasHandledSessionRef.current = true;
      clearSession('انتهت الجلسة. الرجاء تسجيل الدخول مرة أخرى.');
      setTimeout(() => {
        hasHandledSessionRef.current = false;
      }, 500);
    };
    window.addEventListener('hub:session-expired', onSessionExpired);
    return () => window.removeEventListener('hub:session-expired', onSessionExpired);
  }, [clearSession]);

  useEffect(() => {
    const expiryMs = getJwtExpiryMs(jwtPayload);
    if (!expiryMs) return;
    const now = Date.now();
    if (expiryMs <= now) {
      clearSession('انتهت صلاحية الجلسة. الرجاء تسجيل الدخول.');
      return;
    }
    const timeout = setTimeout(() => {
      clearSession('انتهت صلاحية الجلسة. الرجاء تسجيل الدخول.');
    }, Math.max(0, expiryMs - now));
    return () => clearTimeout(timeout);
  }, [jwtPayload, clearSession]);

  const authFetch = async (path: string, init?: RequestInit) => {
    const currentToken = localStorage.getItem('smartdash_token') ?? '';
    let response: Response;
    try {
      response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          ...(init?.headers ?? {})
        }
      });
    } catch {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hub:network-error', { detail: { path } }));
      }
      throw new Error('network');
    }
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hub:session-expired', { detail: { path } }));
    }
    return response;
  };

  const loadAdminUsers = async () => {
    if (!permissions.canAccessAdminDashboard) return;
    setIsUsersLoading(true);
    setUsersLoadError(null);
    try {
      const query = new URLSearchParams({
        page: usersPage.toString(),
        pageSize: usersPageSize.toString(),
        search: usersSearch
      });
      const response = await authFetch(`/api/admin/users?${query.toString()}`, { method: 'GET' });
      const errorMessage = mapAdminApiError(response.status, {
        forbiddenMessage: 'ليس لديك صلاحية عرض قائمة المستخدمين.',
        defaultMessage: 'تعذر تحميل قائمة الموظفين. تحقق من الخادم أو حاول لاحقاً.'
      });
      if (errorMessage) {
        setUsersLoadError(errorMessage);
        return;
      }
      const data: PagedResult<AdminUserItem> = await response.json();
      if (!isMountedRef.current) return;
      setUsersData(data);
      const nextDrafts: Record<number, number> = {};
      const nextRoleDrafts: Record<number, string> = {};
      data.items.forEach((u) => {
        nextDrafts[u.displayId] = u.workId;
        nextRoleDrafts[u.displayId] = u.role;
      });
      setDepartmentDrafts(nextDrafts);
      setRoleDrafts(nextRoleDrafts);
    } catch (e) {
      if (!isMountedRef.current) return;
      if ((e as Error)?.message === 'network') {
        setUsersLoadError('لا يوجد اتصال بالخادم. تحقق من الشبكة.');
      } else {
        setUsersLoadError('حدث خطأ غير متوقع أثناء التحميل.');
      }
    } finally {
      if (!isMountedRef.current) return;
      setIsUsersLoading(false);
    }
  };

  const updateUserInPage = (displayId: number, updater: (user: AdminUserItem) => AdminUserItem) => {
    setUsersData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((u) => (u.displayId === displayId ? updater(u) : u))
      };
    });
  };

  const saveDepartment = async (displayId: number) => {
    if (!permissions.canManageDepartments) {
      setDepartmentSaveError('لا تملك صلاحية تعديل الأقسام.');
      return;
    }
    if (savingDepartmentFor === displayId) return;
    setSavingDepartmentFor(displayId);
    setDepartmentSaveError(null);
    setDepartmentSaveSuccess(null);
    const workId = departmentDrafts[displayId] ?? 0;
    if (!window.confirm(`تأكيد تعديل قسم المستخدم ${displayId} إلى ${workId}؟`)) return;
    try {
      const response = await authFetch(`/api/admin/users/${displayId}/department`, {
        method: 'PUT',
        body: JSON.stringify({ workId })
      });
      const errorMessage = mapAdminApiError(response.status, {
        forbiddenMessage: 'ليس لديك صلاحية تعديل الأقسام.',
        defaultMessage: 'تعذر حفظ القسم. تحقق من القيمة أو حاول لاحقاً.'
      });
      if (errorMessage) {
        setDepartmentSaveError(errorMessage);
        return;
      }
      updateUserInPage(displayId, (u) => ({ ...u, workId }));
      setDepartmentSaveSuccess(`تم تحديث قسم المستخدم ${displayId} بنجاح.`);
    } catch (e) {
      if ((e as Error)?.message === 'network') {
        setDepartmentSaveError('لا يوجد اتصال بالخادم.');
      } else {
        setDepartmentSaveError('تعذر حفظ التغيير.');
      }
    } finally {
      setSavingDepartmentFor(null);
    }
  };

  const saveRole = async (displayId: number) => {
    if (!permissions.canManageRoles) {
      setRoleSaveError('لا تملك صلاحية تعديل الدور.');
      return;
    }
    if (savingRoleFor === displayId) return;
    const nextRole = (roleDrafts[displayId] || '').trim();
    if (!nextRole) {
      setRoleSaveError('اختر دورًا صحيحًا أولاً.');
      return;
    }
    if (!window.confirm(`تأكيد تغيير دور المستخدم ${displayId} إلى ${nextRole}؟`)) return;
    if (currentDisplayId !== null && displayId === currentDisplayId && nextRole.toLowerCase() !== 'admin') {
      setRoleSaveError('لا يمكن للأدمن تخفيض صلاحية حسابه الحالي.');
      return;
    }
    if (usersData && isLastActiveAdmin(usersData.items, displayId) && nextRole.toLowerCase() !== 'admin') {
      setRoleSaveError('لا يمكن تخفيض صلاحية آخر أدمن نشط في النظام.');
      return;
    }

    setSavingRoleFor(displayId);
    setRoleSaveError(null);
    setRoleSaveSuccess(null);
    try {
      const response = await authFetch(`/api/admin/users/${displayId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: nextRole })
      });
      const errorMessage = mapAdminApiError(response.status, {
        forbiddenMessage: 'ليس لديك صلاحية تعديل الأدوار.',
        unsupportedMessage: 'الخادم الحالي لا يدعم تعديل الدور عبر هذا المسار.',
        defaultMessage: 'تعذر حفظ الدور. حاول لاحقاً.'
      });
      if (errorMessage) {
        setRoleSaveError(errorMessage);
        return;
      }
      updateUserInPage(displayId, (u) => ({ ...u, role: nextRole }));
      setRoleSaveSuccess(`تم تحديث دور المستخدم ${displayId} إلى ${nextRole}.`);
    } catch (e) {
      if ((e as Error)?.message === 'network') {
        setRoleSaveError('لا يوجد اتصال بالخادم.');
      } else {
        setRoleSaveError('حدث خطأ أثناء تعديل الدور.');
      }
    } finally {
      setSavingRoleFor(null);
    }
  };

  const toggleUserStatus = async (displayId: number, isActive: boolean) => {
    if (!permissions.canToggleUsers) {
      setStatusSaveError('لا تملك صلاحية تفعيل/تعطيل المستخدمين.');
      return;
    }
    if (savingStatusFor === displayId) return;
    if (currentDisplayId !== null && displayId === currentDisplayId && isActive) {
      setStatusSaveError('لا يمكن للأدمن تعطيل حسابه الحالي.');
      return;
    }
    if (usersData && isLastActiveAdmin(usersData.items, displayId) && isActive) {
      setStatusSaveError('لا يمكن تعطيل آخر أدمن نشط في النظام.');
      return;
    }
    const nextActive = !isActive;
    if (!window.confirm(nextActive ? `تفعيل المستخدم ${displayId}؟` : `تعطيل المستخدم ${displayId}؟`)) return;

    setSavingStatusFor(displayId);
    setStatusSaveError(null);
    setStatusSaveSuccess(null);
    try {
      const response = await authFetch(`/api/admin/users/${displayId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: nextActive })
      });
      const errorMessage = mapAdminApiError(response.status, {
        forbiddenMessage: 'ليس لديك صلاحية تعديل حالة المستخدم.',
        unsupportedMessage: 'الخادم الحالي لا يدعم تفعيل/تعطيل المستخدم عبر هذا المسار.',
        defaultMessage: 'تعذر تحديث حالة المستخدم.'
      });
      if (errorMessage) {
        setStatusSaveError(errorMessage);
        return;
      }
      updateUserInPage(displayId, (u) => ({ ...u, isActive: nextActive }));
      setStatusSaveSuccess(nextActive
        ? `تم تفعيل المستخدم ${displayId}.`
        : `تم تعطيل المستخدم ${displayId}.`);
    } catch (e) {
      if ((e as Error)?.message === 'network') {
        setStatusSaveError('لا يوجد اتصال بالخادم.');
      } else {
        setStatusSaveError('حدث خطأ أثناء تحديث الحالة.');
      }
    } finally {
      setSavingStatusFor(null);
    }
  };

  useEffect(() => {
    loadAdminUsers();
  }, [usersPage, usersPageSize, usersSearch, permissions.canAccessAdminDashboard]);

  return (
    <>
      <div style={{ marginBottom: 14, padding: '14px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Communication Hub | Operations Messaging</h2>
        <p style={{ margin: '6px 0 0', color: '#475569', fontSize: 13 }}>
          Internal messaging infrastructure and admin operations host.
        </p>
        <p style={{ margin: '8px 0 0', color: '#0f172a', fontWeight: 600, fontSize: 13 }}>Unread total: {count}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}
        >
          {open ? 'Close' : 'Open'} Hub
        </button>
        {runtimeConfig.enableAdminDashboard && permissions.canAccessAdminDashboard && (
          <button
            type="button"
            onClick={() => setShowAdminDashboard((v) => !v)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}
          >
            {showAdminDashboard ? 'Hide' : 'Open'} Admin Dashboard
          </button>
        )}
      </div>

      <AdminDashboard
        visible={runtimeConfig.enableAdminDashboard && permissions.canAccessAdminDashboard && showAdminDashboard}
        usersSearch={usersSearchInput}
        usersPage={usersPage}
        usersData={usersData}
        isUsersLoading={isUsersLoading}
        usersLoadError={usersLoadError}
        departmentSaveError={departmentSaveError}
        departmentSaveSuccess={departmentSaveSuccess}
        roleSaveError={roleSaveError}
        roleSaveSuccess={roleSaveSuccess}
        statusSaveError={statusSaveError}
        statusSaveSuccess={statusSaveSuccess}
        savingDepartmentFor={savingDepartmentFor}
        savingRoleFor={savingRoleFor}
        savingStatusFor={savingStatusFor}
        roleDrafts={roleDrafts}
        canManageDepartments={permissions.canManageDepartments}
        canManageRoles={permissions.canManageRoles}
        canToggleUsers={permissions.canToggleUsers}
        currentViewerRole={normalizedRole}
        onDismissUsersError={() => setUsersLoadError(null)}
        onDismissSaveError={() => setDepartmentSaveError(null)}
        onDismissSaveSuccess={() => setDepartmentSaveSuccess(null)}
        onDismissRoleError={() => setRoleSaveError(null)}
        onDismissRoleSuccess={() => setRoleSaveSuccess(null)}
        onDismissStatusError={() => setStatusSaveError(null)}
        onDismissStatusSuccess={() => setStatusSaveSuccess(null)}
        departmentDrafts={departmentDrafts}
        onSearchChange={(value) => {
          setUsersPage(1);
          setUsersSearchInput(value);
        }}
        onRefresh={loadAdminUsers}
        onDepartmentDraftChange={(displayId, workId) =>
          setDepartmentDrafts((prev) => ({ ...prev, [displayId]: workId }))
        }
        onRoleDraftChange={(displayId, nextRole) =>
          setRoleDrafts((prev) => ({ ...prev, [displayId]: nextRole }))
        }
        onSaveDepartment={saveDepartment}
        onSaveRole={saveRole}
        onToggleUserStatus={toggleUserStatus}
        onPrevPage={() => setUsersPage((p) => Math.max(1, p - 1))}
        onNextPage={() => {
          const totalPages = usersData ? Math.max(1, Math.ceil(usersData.totalCount / usersData.pageSize)) : 1;
          setUsersPage((p) => Math.min(totalPages, p + 1));
        }}
      />

      <CommunicationHubWidget
        open={open}
        onClose={() => setOpen(false)}
        onCountsUpdate={setCount}
      />
    </>
  );
}

export default DashboardPage;
