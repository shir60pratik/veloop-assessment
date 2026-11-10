import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '../ui';

const POINTS = [
  'Reward, time and conditions before you start',
  'Explicit status for every reward and withdrawal',
  'A reference number on every payout request',
];

export function AuthShell({ children, variant = 'member', eyebrow, title, subtitle }) {
  return (
    <div className={`auth auth--${variant}`}>
      <aside className="auth__panel">
        <Link to="/" className="auth__brand" aria-label="Back to VELoop Rewards home">
          <Logo />
        </Link>
        <div className="auth__panel-copy">
          <span className="hero__badge">
            <Sparkles size={14} />
            {variant === 'admin' ? 'Operations console' : 'Transparent rewards, by design'}
          </span>
          <h1>
            {variant === 'admin'
              ? 'Review the queue the same way the member sees it.'
              : 'Every reward has a reason. Every payout has a receipt.'}
          </h1>
          <p>
            {variant === 'admin'
              ? 'Approve, process or reject requests with a written reason. Members see the same timeline instantly.'
              : 'This demo turns the VELoop platform research assessment into a working product, not a slide deck.'}
          </p>
          <ul>
            {POINTS.map((point) => (
              <li key={point}>
                <CheckCircle2 size={16} />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="auth__panel-foot">
          <ShieldCheck size={15} />
          Demo data stays in this browser. Never enter real payment details.
        </div>
      </aside>

      <main className="auth__main">
        <div className="auth__main-top">
          <Link to="/" className="text-link text-link--muted">
            <ArrowLeft size={15} /> Back to home
          </Link>
        </div>
        <div className="auth-card">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
          {subtitle && <p className="muted auth-card__subtitle">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
