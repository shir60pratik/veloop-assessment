import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthShell } from '../components/layout/AuthShell';
import { DEMO_ACCOUNTS } from '../lib/constants';

export default function AdminLogin() {
  const { admin, loginAdmin, notify } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (admin) navigate('/admin', { replace: true });
  }, [admin, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await loginAdmin(email, password);
      notify('Operations session started.', 'success');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fill = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <AuthShell
      variant="admin"
      eyebrow="Operations sign in"
      title="Review the queue"
      subtitle="Use an operations demo account. Members cannot access this console."
    >
      <div className="demo-fill demo-fill--stack">
        <div className="demo-fill__row">
          <div>
            <strong>Admin</strong>
            <span>{DEMO_ACCOUNTS.admin.email}</span>
          </div>
          <button type="button" className="button button--ghost button--sm" onClick={() => fill(DEMO_ACCOUNTS.admin)}>
            Use admin
          </button>
        </div>
        <div className="demo-fill__row">
          <div>
            <strong>Support</strong>
            <span>{DEMO_ACCOUNTS.support.email}</span>
          </div>
          <button type="button" className="button button--ghost button--sm" onClick={() => fill(DEMO_ACCOUNTS.support)}>
            Use support
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="form" noValidate>
        <label className="field">
          <span>Operations email</span>
          <div className="input-wrap">
            <Mail size={16} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@veloop.demo"
              autoComplete="email"
              required
            />
          </div>
        </label>
        <label className="field">
          <span>Password</span>
          <div className="input-wrap">
            <Lock size={16} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="button button--primary button--block" disabled={busy}>
          {busy ? 'Signing in…' : 'Open operations console'}
          {!busy && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthShell>
  );
}
