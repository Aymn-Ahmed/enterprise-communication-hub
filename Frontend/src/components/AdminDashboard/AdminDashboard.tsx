import AdminAlerts from './AdminAlerts';
import AdminUsersTable from './AdminUsersTable';
import AdminPagination from './AdminPagination';
import type { AdminDashboardProps } from './admin.types';

function AdminDashboard(props: AdminDashboardProps) {
  const {
    visible,
    usersSearch,
    usersPage,
    usersData,
    isUsersLoading,
    usersLoadError,
    departmentSaveError,
    departmentSaveSuccess,
    roleSaveError,
    roleSaveSuccess,
    statusSaveError,
    statusSaveSuccess,
    savingDepartmentFor,
    savingRoleFor,
    savingStatusFor,
    roleDrafts,
    canManageDepartments,
    canManageRoles,
    canToggleUsers,
    currentViewerRole,
    onDismissUsersError,
    onDismissSaveError,
    onDismissSaveSuccess,
    onDismissRoleError,
    onDismissRoleSuccess,
    onDismissStatusError,
    onDismissStatusSuccess,
    departmentDrafts,
    onSearchChange,
    onRefresh,
    onDepartmentDraftChange,
    onRoleDraftChange,
    onSaveDepartment,
    onSaveRole,
    onToggleUserStatus,
    onPrevPage,
    onNextPage
  } = props;

  if (!visible) return null;

  const totalPages = usersData ? Math.max(1, Math.ceil(usersData.totalCount / usersData.pageSize)) : 1;
  const items = usersData?.items ?? [];
  const isEmpty = !isUsersLoading && !usersLoadError && usersData !== null && items.length === 0;
  const totalUsers = usersData?.totalCount ?? 0;
  const onlineUsers = items.filter((u) => u.isOnline).length;
  const activeAdmins = items.filter((u) => u.role.toLowerCase() === 'admin' && u.isActive !== false).length;
  const activeManagers = items.filter((u) => u.role.toLowerCase() === 'manager' && u.isActive !== false).length;
  const activeConversationsLabel = 'غير متاح (يتطلب endpoint مخصص)';

  return (
    <div style={{ marginBottom: 14, padding: 14, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10 }}>
      <h3 style={{ marginTop: 0, marginBottom: 4 }}>لوحة إدارة الموظفين</h3>
      <p style={{ marginTop: 0, marginBottom: 12, color: '#6b7280', fontSize: 13 }}>
        مستوى الصلاحية الحالي: <strong>{currentViewerRole.toUpperCase()}</strong>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 12 }}>
        <div style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>إجمالي المستخدمين</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{totalUsers}</div>
        </div>
        <div style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>المتصلون الآن (في الصفحة)</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{onlineUsers}</div>
        </div>
        <div style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>مشرفون نشطون (في الصفحة)</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{activeAdmins}</div>
        </div>
        <div style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>مدراء نشطون (في الصفحة)</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{activeManagers}</div>
        </div>
        <div style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>محادثات نشطة</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{activeConversationsLabel}</div>
        </div>
      </div>

      <AdminAlerts
        usersLoadError={usersLoadError}
        departmentSaveError={departmentSaveError}
        departmentSaveSuccess={departmentSaveSuccess}
        roleSaveError={roleSaveError}
        roleSaveSuccess={roleSaveSuccess}
        statusSaveError={statusSaveError}
        statusSaveSuccess={statusSaveSuccess}
        onDismissUsersError={onDismissUsersError}
        onDismissSaveError={onDismissSaveError}
        onDismissSaveSuccess={onDismissSaveSuccess}
        onDismissRoleError={onDismissRoleError}
        onDismissRoleSuccess={onDismissRoleSuccess}
        onDismissStatusError={onDismissStatusError}
        onDismissStatusSuccess={onDismissStatusSuccess}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input
          value={usersSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث باسم المستخدم أو الاسم الكامل"
          style={{ minWidth: 260, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
        />
        <button
          type="button"
          onClick={onRefresh}
          disabled={isUsersLoading}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: isUsersLoading ? '#f3f4f6' : '#fff' }}
        >
          {isUsersLoading ? 'جاري التحديث…' : 'تحديث'}
        </button>
      </div>

      {isUsersLoading && !usersData ? (
        <p style={{ margin: '16px 0', color: '#6b7280', fontSize: 14 }}>جاري تحميل قائمة الموظفين…</p>
      ) : null}

      {isEmpty ? (
        <p style={{ margin: '16px 0', color: '#6b7280', fontSize: 14 }}>لا يوجد موظفون يطابقون البحث الحالي.</p>
      ) : null}

      <AdminUsersTable
        items={items}
        usersDataExists={usersData !== null}
        isUsersLoading={isUsersLoading}
        departmentDrafts={departmentDrafts}
        roleDrafts={roleDrafts}
        canManageDepartments={canManageDepartments}
        canManageRoles={canManageRoles}
        canToggleUsers={canToggleUsers}
        savingDepartmentFor={savingDepartmentFor}
        savingRoleFor={savingRoleFor}
        savingStatusFor={savingStatusFor}
        onDepartmentDraftChange={onDepartmentDraftChange}
        onRoleDraftChange={onRoleDraftChange}
        onSaveDepartment={onSaveDepartment}
        onSaveRole={onSaveRole}
        onToggleUserStatus={onToggleUserStatus}
      />

      <AdminPagination
        usersPage={usersPage}
        totalPages={totalPages}
        isUsersLoading={isUsersLoading}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />
    </div>
  );
}

export default AdminDashboard;
