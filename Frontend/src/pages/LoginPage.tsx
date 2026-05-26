import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginPanel from '../components/LoginPanel';
import { runtimeConfig } from '../../core/config/runtimeConfig';

type LoginResponse = {
  token: string;
  expiresAtUtc: string;
  displayId: number;
  role: string;
  username: string;
  name: string;
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

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [authError, setAuthError] = useState<string | null>((location.state as any)?.reason ?? null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const token = localStorage.getItem('smartdash_token') ?? '';
  const jwtPayload = useMemo(() => parseJwtPayload(token), [token]);
  const role = (jwtPayload?.role ||
    jwtPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    '').toString();

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, token]);

  const login = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const response = await fetch(`${runtimeConfig.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        setAuthError('Login failed. Check username/password.');
        return;
      }

      const data: LoginResponse = await response.json();
      localStorage.setItem('smartdash_token', data.token);
      localStorage.setItem(
        'smartdash_user',
        JSON.stringify({
          Id: data.displayId,
          DisplayId: data.displayId,
          Name: data.name,
          Username: data.username,
          Role: data.role,
          WorkId: 0
        })
      );
      navigate('/dashboard', { replace: true });
    } catch {
      setAuthError('Unable to login to backend.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)', padding: 20 }}>
      <div style={{ maxWidth: 700, margin: '32px auto 0' }}>
        <div style={{ marginBottom: 14, padding: '14px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Communication Hub | Operations Messaging</h2>
          <p style={{ margin: '6px 0 0', color: '#475569', fontSize: 13 }}>
            Sign in to continue to dashboard and hub operations.
          </p>
        </div>
        <LoginPanel
          username={username}
          password={password}
          isLoggingIn={isLoggingIn}
          authError={authError}
          role={role}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onLogin={login}
        />
      </div>
    </div>
  );
}

export default LoginPage;
