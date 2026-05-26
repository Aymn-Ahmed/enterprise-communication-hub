import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)', padding: 20 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
