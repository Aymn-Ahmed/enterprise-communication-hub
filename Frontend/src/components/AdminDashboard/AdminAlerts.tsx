type AlertTone = 'warn' | 'error' | 'success';

type AdminAlertsProps = {
  usersLoadError: string | null;
  departmentSaveError: string | null;
  departmentSaveSuccess: string | null;
  roleSaveError: string | null;
  roleSaveSuccess: string | null;
  statusSaveError: string | null;
  statusSaveSuccess: string | null;
  onDismissUsersError: () => void;
  onDismissSaveError: () => void;
  onDismissSaveSuccess: () => void;
  onDismissRoleError: () => void;
  onDismissRoleSuccess: () => void;
  onDismissStatusError: () => void;
  onDismissStatusSuccess: () => void;
};

const toneStyle: Record<AlertTone, { background: string; border: string; color: string }> = {
  warn: {
    background: '#fef3c7',
    border: '#fcd34d',
    color: '#92400e'
  },
  error: {
    background: '#fee2e2',
    border: '#fecaca',
    color: '#991b1b'
  },
  success: {
    background: '#dcfce7',
    border: '#86efac',
    color: '#166534'
  }
};

function AlertBox(props: {
  message: string;
  tone: AlertTone;
  role: 'alert' | 'status';
  onDismiss: () => void;
}) {
  const { message, tone, role, onDismiss } = props;
  const style = toneStyle[tone];
  return (
    <div
      role={role}
      style={{
        marginBottom: 10,
        padding: '10px 12px',
        background: style.background,
        border: `1px solid ${style.border}`,
        borderRadius: 6,
        color: style.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap'
      }}
    >
      <span>{message}</span>
      <button type="button" onClick={onDismiss} style={{ fontSize: 12 }}>
        إخفاء
      </button>
    </div>
  );
}

function AdminAlerts(props: AdminAlertsProps) {
  const {
    usersLoadError,
    departmentSaveError,
    departmentSaveSuccess,
    roleSaveError,
    roleSaveSuccess,
    statusSaveError,
    statusSaveSuccess,
    onDismissUsersError,
    onDismissSaveError,
    onDismissSaveSuccess,
    onDismissRoleError,
    onDismissRoleSuccess,
    onDismissStatusError,
    onDismissStatusSuccess
  } = props;

  return (
    <>
      {usersLoadError ? (
        <AlertBox message={usersLoadError} tone="warn" role="alert" onDismiss={onDismissUsersError} />
      ) : null}

      {departmentSaveSuccess ? (
        <AlertBox message={departmentSaveSuccess} tone="success" role="status" onDismiss={onDismissSaveSuccess} />
      ) : null}

      {departmentSaveError ? (
        <AlertBox message={departmentSaveError} tone="error" role="alert" onDismiss={onDismissSaveError} />
      ) : null}

      {roleSaveSuccess ? (
        <AlertBox message={roleSaveSuccess} tone="success" role="status" onDismiss={onDismissRoleSuccess} />
      ) : null}

      {roleSaveError ? (
        <AlertBox message={roleSaveError} tone="error" role="alert" onDismiss={onDismissRoleError} />
      ) : null}

      {statusSaveSuccess ? (
        <AlertBox message={statusSaveSuccess} tone="success" role="status" onDismiss={onDismissStatusSuccess} />
      ) : null}

      {statusSaveError ? (
        <AlertBox message={statusSaveError} tone="error" role="alert" onDismiss={onDismissStatusError} />
      ) : null}
    </>
  );
}

export default AdminAlerts;
