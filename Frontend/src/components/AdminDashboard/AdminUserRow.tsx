import type { AdminUserItem } from './admin.types';

type AdminUserRowProps = {
  user: AdminUserItem;
  departmentDraft: number;
  roleDraft: string;
  canManageDepartments: boolean;
  canManageRoles: boolean;
  canToggleUsers: boolean;
  savingDepartmentFor: number | null;
  savingRoleFor: number | null;
  savingStatusFor: number | null;
  formatLastActive: (lastActiveAt?: string | null) => string;
  onDepartmentDraftChange: (displayId: number, workId: number) => void;
  onRoleDraftChange: (displayId: number, role: string) => void;
  onSaveDepartment: (displayId: number) => void;
  onSaveRole: (displayId: number) => void;
  onToggleUserStatus: (displayId: number, isActive: boolean) => void;
};

function AdminUserRow(props: AdminUserRowProps) {
  const {
    user,
    departmentDraft,
    roleDraft,
    canManageDepartments,
    canManageRoles,
    canToggleUsers,
    savingDepartmentFor,
    savingRoleFor,
    savingStatusFor,
    formatLastActive,
    onDepartmentDraftChange,
    onRoleDraftChange,
    onSaveDepartment,
    onSaveRole,
    onToggleUserStatus
  } = props;

  return (
    <tr key={user.displayId} style={{ borderTop: '1px solid #f1f5f9' }}>
      <td style={{ padding: '10px 8px', fontSize: 13 }}>{user.displayId}</td>
      <td style={{ padding: '10px 8px', fontSize: 13 }}>{user.username}</td>
      <td style={{ padding: '10px 8px', fontSize: 13 }}>{user.name}</td>
      <td style={{ padding: '10px 8px', fontSize: 13 }}>{user.role}</td>
      <td style={{ padding: '10px 8px', fontSize: 13 }}>{formatLastActive(user.lastActiveAt)}</td>
      <td style={{ padding: '10px 8px', fontSize: 13 }}>{user.isOnline ? 'Online' : 'Offline'}</td>
      <td style={{ padding: '10px 8px', fontSize: 13 }}>{user.isActive === false ? 'Disabled' : 'Active'}</td>
      <td style={{ padding: '10px 8px' }}>
        <input
          type="number"
          value={departmentDraft}
          onChange={(e) => onDepartmentDraftChange(user.displayId, Number(e.target.value || 0))}
          style={{ width: 90, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6 }}
          disabled={!canManageDepartments || savingDepartmentFor === user.displayId}
        />
      </td>
      <td style={{ padding: '10px 8px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0' }}>
          <button
            type="button"
            onClick={() => onSaveDepartment(user.displayId)}
            disabled={!canManageDepartments || savingDepartmentFor === user.displayId}
            title={!canManageDepartments ? 'غير مسموح لهذا الدور' : ''}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}
          >
            {savingDepartmentFor === user.displayId ? 'جاري الحفظ…' : 'حفظ القسم'}
          </button>

          {canManageRoles ? (
            <>
              <select
                value={roleDraft.toLowerCase()}
                onChange={(e) => onRoleDraftChange(user.displayId, e.target.value)}
                disabled={savingRoleFor === user.displayId}
                style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}
              >
                <option value="admin">admin</option>
                <option value="manager">manager</option>
                <option value="employee">employee</option>
              </select>
              <button
                type="button"
                onClick={() => onSaveRole(user.displayId)}
                disabled={savingRoleFor === user.displayId}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}
              >
                {savingRoleFor === user.displayId ? 'جاري الحفظ…' : 'حفظ الدور'}
              </button>
            </>
          ) : null}

          {canToggleUsers ? (
            <button
              type="button"
              onClick={() => onToggleUserStatus(user.displayId, user.isActive !== false)}
              disabled={savingStatusFor === user.displayId}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}
            >
              {savingStatusFor === user.displayId
                ? 'جاري الحفظ…'
                : (user.isActive === false ? 'تفعيل المستخدم' : 'تعطيل المستخدم')}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export default AdminUserRow;
