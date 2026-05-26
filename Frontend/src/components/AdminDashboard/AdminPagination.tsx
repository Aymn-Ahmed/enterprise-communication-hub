type AdminPaginationProps = {
  usersPage: number;
  totalPages: number;
  isUsersLoading: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
};

function AdminPagination(props: AdminPaginationProps) {
  const { usersPage, totalPages, isUsersLoading, onPrevPage, onNextPage } = props;

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={onPrevPage}
        disabled={usersPage <= 1 || isUsersLoading}
        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}
      >
        السابق
      </button>
      <span style={{ fontSize: 13, color: '#475569' }}>
        صفحة {usersPage} من {totalPages}
      </span>
      <button
        type="button"
        onClick={onNextPage}
        disabled={usersPage >= totalPages || isUsersLoading}
        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}
      >
        التالي
      </button>
    </div>
  );
}

export default AdminPagination;
