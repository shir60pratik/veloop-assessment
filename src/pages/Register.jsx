import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthShell } from '../components/layout/AuthShell';
import { DEMO_ACCOUNTS } from '../lib/constants';

function strengthOf(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function Register() {
  const { member, register, notify } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (member) navigate('/app/dashboard', { replace: true });
  }, [member, navigate]);

  const set = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]: field === 'terms' ? event.target.checked : event.target.value,
    }));

  const strength = strengthOf(form.password);
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.');
      return;
    }
    if (!form.terms) {
      setError('Please confirm that you understand this is a demo.');
      return;
    }
    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      notify('Your account is ready. A 100 VE welcome bonus was added.', 'success');
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Start with a clean wallet"
      subtitle="This creates a local demo account in your browser. No email is sent."
    >
      <form onSubmit={submit} className="form" noValidate>
        <label className="field">
          <span>Name</span>
          <div className="input-wrap">
            <User size={16} />
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>
        </label>

        <label className="field">
          <span>Email</span>
          <div className="input-wrap">
            <Mail size={16} />
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
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
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
          </div>
          {form.password && (
            <span className={`strength strength--${strength}`}>
              <span className="strength__bars">
                {[1, 2, 3, 4].map((level) => (
                  <i key={level} className={strength >= level ? 'is-on' : ''} />
                ))}
              </span>
              {strengthLabel}
            </span>
          )}
        </label>

        <label className="field">
          <span>Confirm password</span>
          <div className="input-wrap">
            <Lock size={16} />
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repeat the password"
              autoComplete="new-password"
              required
            />
          </div>
        </label>

        <label className="checkbox">
          <input type="checkbox" checked={form.terms} onChange={set('terms')} />
          <span>
            I understand this is an assessment demo. All data stays in this browser and no real
            payment details should be entered.
          </span>
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="button button--primary button--block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
          {!busy && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="auth-card__switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
      <p className="auth-card__switch auth-card__switch--muted">
        Or sign in with <Link to="/login">{DEMO_ACCOUNTS.member.email}</Link>
      </p>
    </AuthShell>
  );
}
