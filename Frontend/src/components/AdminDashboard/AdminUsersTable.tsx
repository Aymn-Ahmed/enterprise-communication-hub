import type { AdminUserItem } from './admin.types';
import AdminUserRow from './AdminUserRow';

type AdminUsersTableProps = {
  items: AdminUserItem[];
  usersDataExists: boolean;
  isUsersLoading: boolean;
  departmentDrafts: Record<number, number>;
  roleDrafts: Record<number, string>;
  canManageDepartments: boolean;
  canManageRoles: boolean;
  canToggleUsers: boolean;
  savingDepartmentFor: number | null;
  savingRoleFor: number | null;
  savingStatusFor: number | null;
  onDepartmentDraftChange: (displayId: number, workId: number) => void;
  onRoleDraftChange: (displayId: number, role: string) => void;
  onSaveDepartment: (displayId: number) => void;
  onSaveRole: (displayId: number) => void;
  onToggleUserStatus: (displayId: number, isActive: boolean) => void;
};

function AdminUsersTable(props: AdminUsersTableProps) {
  const {
    items,
    usersDataExists,
    isUsersLoading,
    departmentDrafts,
    roleDrafts,
    canManageDepartments,
    canManageRoles,
    canToggleUsers,
    savingDepartmentFor,
    savingRoleFor,
    savingStatusFor,
    onDepartmentDraftChange,
    onRoleDraftChange,
    onSaveDepartment,
    onSaveRole,
    onToggleUserStatus
  } = props;

  const formatLastActive = (lastActiveAt?: string | null) => {
    if (!lastActiveAt) return '—';
    const d = new Date(lastActiveAt);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  };

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <table style={{ width: '100%', minWidth: 980, borderCollapse: 'collapse', opacity: isUsersLoading && usersDataExists ? 0.65 : 1 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#475569' }}>DisplayId</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#475569' }}>Username</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#475569' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#475569' }}>Role</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#475569' }}>Last Active</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#475569' }}>Online</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#475569' }}>Account</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#475569' }}>Department</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 12, color: '#475569' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <AdminUserRow
              key={u.displayId}
              user={u}
              departmentDraft={departmentDrafts[u.displayId] ?? u.workId}
              roleDraft={roleDrafts[u.displayId] || u.role}
              canManageDepartments={canManageDepartments}
              canManageRoles={canManageRoles}
              canToggleUsers={canToggleUsers}
              savingDepartmentFor={savingDepartmentFor}
              savingRoleFor={savingRoleFor}
              savingStatusFor={savingStatusFor}
              formatLastActive={formatLastActive}
              onDepartmentDraftChange={onDepartmentDraftChange}
              onRoleDraftChange={onRoleDraftChange}
              onSaveDepartment={onSaveDepartment}
              onSaveRole={onSaveRole}
              onToggleUserStatus={onToggleUserStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsersTable;
