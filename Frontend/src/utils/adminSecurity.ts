export type UserRole = 'admin' | 'manager' | 'employee';

export type RolePermissions = {
  canAccessAdminDashboard: boolean;
  canManageDepartments: boolean;
  canManageRoles: boolean;
  canToggleUsers: boolean;
};

export type AdminUserLike = {
  displayId: number;
  role: string;
  isActive?: boolean;
};

export const normalizeRole = (value: string): UserRole => {
  const v = value.toLowerCase();
  if (v === 'admin') return 'admin';
  if (v === 'manager') return 'manager';
  return 'employee';
};

export const getRolePermissions = (role: UserRole): RolePermissions => {
  if (role === 'admin') {
    return {
      canAccessAdminDashboard: true,
      canManageDepartments: true,
      canManageRoles: true,
      canToggleUsers: true
    };
  }
  if (role === 'manager') {
    return {
      canAccessAdminDashboard: true,
      canManageDepartments: true,
      canManageRoles: false,
      canToggleUsers: false
    };
  }
  return {
    canAccessAdminDashboard: false,
    canManageDepartments: false,
    canManageRoles: false,
    canToggleUsers: false
  };
};

export const getCurrentDisplayId = (
  jwtPayload: Record<string, any> | null,
  smartdashUserJson: string | null
): number | null => {
  const directClaims = [
    jwtPayload?.displayId,
    jwtPayload?.DisplayId,
    jwtPayload?.id,
    jwtPayload?.Id,
    jwtPayload?.sub,
    jwtPayload?.nameid,
    jwtPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
  ];
  for (const raw of directClaims) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  }

  if (!smartdashUserJson) return null;
  try {
    const parsed = JSON.parse(smartdashUserJson);
    const n = Number(parsed?.DisplayId ?? parsed?.displayId ?? parsed?.Id ?? parsed?.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
};

export const countActiveAdmins = (users: AdminUserLike[]): number =>
  users.filter((u) => u.role.toLowerCase() === 'admin' && u.isActive !== false).length;

export const isLastActiveAdmin = (users: AdminUserLike[], displayId: number): boolean => {
  const target = users.find((u) => u.displayId === displayId);
  if (!target) return false;
  if (target.role.toLowerCase() !== 'admin' || target.isActive === false) return false;
  return countActiveAdmins(users) <= 1;
};

export const getJwtExpiryMs = (jwtPayload: Record<string, any> | null): number | null => {
  const expRaw = jwtPayload?.exp;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= 0) return null;
  return exp * 1000;
};

export const mapAdminApiError = (
  status: number,
  options: { forbiddenMessage: string; unsupportedMessage?: string; defaultMessage: string }
): string | null => {
  if (status === 401) return 'انتهت الجلسة. سجّل الدخول من جديد.';
  if (status === 403) return options.forbiddenMessage;
  if ((status === 404 || status === 405) && options.unsupportedMessage) return options.unsupportedMessage;
  if (!status || status >= 400) return options.defaultMessage;
  return null;
};
