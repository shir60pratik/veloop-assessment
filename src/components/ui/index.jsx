import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, X } from 'lucide-react';
import { cx, initials } from '../../lib/format';

export function Logo({ compact = false }) {
  return (
    <span className={cx('logo', compact && 'logo--compact')} aria-label="VELoop Rewards">
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="100%" height="100%">
          <defs>
            <linearGradient id="veloop-logo-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8b6cff" />
              <stop offset="1" stopColor="#38e0b0" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="17" fill="#171a31" />
          <path d="M15 19h9l8 21 8-21h9L36 49h-8L15 19z" fill="url(#veloop-logo-gradient)" />
        </svg>
      </span>
      {!compact && (
        <span className="logo__words">
          <strong>VELOOP</strong>
          <em>REWARDS</em>
        </span>
      )}
    </span>
  );
}

export function Avatar({ name, color = 'violet', size = 'md' }) {
  return (
    <span className={cx('avatar', `avatar--${color}`, `avatar--${size}`)} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function StatusPill({ tone = 'muted', children, dot = true }) {
  return (
    <span className={cx('pill', `pill--${tone}`)}>
      {dot && <span className="pill__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'violet' }) {
  return (
    <div className="stat-card">
      {Icon && (
        <span className={cx('stat-card__icon', `tone-bg--${tone}`)}>
          <Icon size={18} />
        </span>
      )}
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </div>
  );
}

export function ProgressBar({ value = 0, tone = 'violet', label, compact = false }) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className={cx('progress', compact && 'progress--compact')}>
      {label && (
        <div className="progress__meta">
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div
        className="progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label || 'Progress'}
      >
        <span className={cx('progress__fill', `tone-bg--${tone}`)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="muted">{description}</p>}
      </div>
      {action && <div className="section-heading__action">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <span className="empty-state__icon">
          <Icon size={22} />
        </span>
      )}
      <h3>{title}</h3>
      {description && <p className="muted">{description}</p>}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={cx('modal', `modal--${size}`)} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal__head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function CopyButton({ value, label = 'Copy', className }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={cx('button button--ghost button--sm', className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? 'Copied' : label}
    </button>
  );
}
