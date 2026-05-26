type LoginPanelProps = {
  username: string;
  password: string;
  isLoggingIn: boolean;
  authError: string | null;
  role: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
};

function LoginPanel(props: LoginPanelProps) {
  const {
    username,
    password,
    isLoggingIn,
    authError,
    role,
    onUsernameChange,
    onPasswordChange,
    onLogin
  } = props;

  return (
    <div style={{ marginBottom: 14, padding: 14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10 }}>
      <h3 style={{ marginTop: 0, marginBottom: 4, color: '#0f172a' }}>Login</h3>
      <p style={{ marginTop: 0, marginBottom: 12, color: '#64748b', fontSize: 13 }}>
        Use your company credentials to access chat and admin capabilities.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Username"
          style={{ minWidth: 220, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <input
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          type="password"
          placeholder="Password"
          style={{ minWidth: 220, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <button
          type="button"
          onClick={onLogin}
          disabled={isLoggingIn}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: isLoggingIn ? '#f1f5f9' : '#fff' }}
        >
          {isLoggingIn ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
      <p style={{ marginBottom: 0, marginTop: 12, color: '#334155', fontSize: 13 }}>
        Current role: <strong>{role || 'Guest'}</strong>
      </p>
      {authError && (
        <p
          style={{
            marginBottom: 0,
            marginTop: 10,
            color: '#991b1b',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            padding: '8px 10px',
            fontSize: 13
          }}
        >
          {authError}
        </p>
      )}
    </div>
  );
}

export default LoginPanel;
