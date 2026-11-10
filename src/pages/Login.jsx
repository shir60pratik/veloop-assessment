import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthShell } from '../components/layout/AuthShell';
import { DEMO_ACCOUNTS } from '../lib/constants';

export default function Login() {
  const { member, login, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (member) navigate('/app/dashboard', { replace: true });
  }, [member, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      notify('Welcome back. Your wallet is up to date.', 'success');
      const from = location.state?.from;
      navigate(from && from.startsWith('/app') ? from : '/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_ACCOUNTS.member.email);
    setPassword(DEMO_ACCOUNTS.member.password);
    setError('');
  };

  return (
    <AuthShell
      eyebrow="Member sign in"
      title="Welcome back"
      subtitle="Use the demo member account or create your own local account."
    >
      <div className="demo-fill">
        <div>
          <strong>Demo member</strong>
          <span>{DEMO_ACCOUNTS.member.email}</span>
        </div>
        <button type="button" className="button button--ghost button--sm" onClick={fillDemo}>
          Use demo account
        </button>
      </div>

      <form onSubmit={submit} className="form" noValidate>
        <label className="field">
          <span>Email</span>
          <div className="input-wrap">
            <Mail size={16} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
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
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="input-wrap__action"
              onClick={() => setShow((current) => !current)}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="button button--primary button--block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
          {!busy && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="auth-card__switch">
        New here? <Link to="/register">Create a local account</Link>
      </p>
      <p className="auth-card__switch auth-card__switch--muted">
        Operations staff: <Link to="/admin/login">open the operations console</Link>
      </p>
    </AuthShell>
  );
}
