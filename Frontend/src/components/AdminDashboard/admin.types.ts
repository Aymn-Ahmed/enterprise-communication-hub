export type AdminUserItem = {
  displayId: number;
  username: string;
  name: string;
  role: string;
  workId: number;
  isOnline: boolean;
  isActive?: boolean;
  lastActiveAt?: string | null;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export type AdminDashboardProps = {
  visible: boolean;
  usersSearch: string;
  usersPage: number;
  usersData: PagedResult<AdminUserItem> | null;
  isUsersLoading: boolean;
  usersLoadError: string | null;
  departmentSaveError: string | null;
  departmentSaveSuccess: string | null;
  roleSaveError: string | null;
  roleSaveSuccess: string | null;
  statusSaveError: string | null;
  statusSaveSuccess: string | null;
  savingDepartmentFor: number | null;
  savingRoleFor: number | null;
  savingStatusFor: number | null;
  roleDrafts: Record<number, string>;
  canManageDepartments: boolean;
  canManageRoles: boolean;
  canToggleUsers: boolean;
  currentViewerRole: 'admin' | 'manager' | 'employee';
  onDismissUsersError: () => void;
  onDismissSaveError: () => void;
  onDismissSaveSuccess: () => void;
  onDismissRoleError: () => void;
  onDismissRoleSuccess: () => void;
  onDismissStatusError: () => void;
  onDismissStatusSuccess: () => void;
  departmentDrafts: Record<number, number>;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onDepartmentDraftChange: (displayId: number, workId: number) => void;
  onRoleDraftChange: (displayId: number, role: string) => void;
  onSaveDepartment: (displayId: number) => void;
  onSaveRole: (displayId: number) => void;
  onToggleUserStatus: (displayId: number, isActive: boolean) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};
