import {
  countActiveAdmins,
  getCurrentDisplayId,
  getJwtExpiryMs,
  getRolePermissions,
  isLastActiveAdmin,
  mapAdminApiError,
  normalizeRole
} from './adminSecurity';

describe('adminSecurity helpers', () => {
  it('normalizes roles and permissions', () => {
    expect(normalizeRole('AdMiN')).toBe('admin');
    expect(normalizeRole('manager')).toBe('manager');
    expect(normalizeRole('unknown')).toBe('employee');
    expect(getRolePermissions('admin').canManageRoles).toBe(true);
    expect(getRolePermissions('manager').canManageRoles).toBe(false);
  });

  it('extracts current display id from jwt and storage fallback', () => {
    expect(getCurrentDisplayId({ displayId: 77 }, null)).toBe(77);
    expect(getCurrentDisplayId(null, JSON.stringify({ DisplayId: 8 }))).toBe(8);
  });

  it('protects last active admin checks', () => {
    const users = [
      { displayId: 1, role: 'admin', isActive: true },
      { displayId: 2, role: 'employee', isActive: true }
    ];
    expect(countActiveAdmins(users)).toBe(1);
    expect(isLastActiveAdmin(users, 1)).toBe(true);
  });

  it('parses jwt expiry and api error messages', () => {
    expect(getJwtExpiryMs({ exp: 200 })).toBe(200000);
    expect(
      mapAdminApiError(403, {
        forbiddenMessage: 'forbidden',
        defaultMessage: 'default'
      })
    ).toBe('forbidden');
  });
});
