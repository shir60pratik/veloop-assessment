import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Banknote,
  FileText,
  Flame,
  History,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  Menu,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, Logo, StatusPill } from '../ui';
import { formatNumber } from '../../lib/format';
import { XP_PER_LEVEL } from '../../lib/constants';

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/app/wallet', label: 'Wallet', icon: Wallet },
  { to: '/app/redeem', label: 'Redeem', icon: Banknote },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/support', label: 'Support', icon: LifeBuoy },
  { to: '/app/research', label: 'Research', icon: FileText },
  { to: '/app/privacy', label: 'Privacy', icon: ShieldCheck },
];

const MOBILE_NAV = NAV.slice(0, 5);

export function MemberLayout() {
  const { member, balance, level, logout, db, notify } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!member) return null;

  const pendingCount = db.submissions.filter(
    (sub) => sub.userId === member.id && ['PENDING', 'APPEALED'].includes(sub.status),
  ).length;

  const handleLogout = () => {
    logout();
    notify('You have been signed out.', 'info');
    navigate('/');
  };

  const sidebar = (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <Link to="/app/dashboard" aria-label="VELoop Rewards dashboard">
          <Logo />
        </Link>
        <button type="button" className="icon-button sidebar__close" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Member navigation">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'History' && pendingCount > 0 && (
              <span className="sidebar__count">{pendingCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__level">
        <div className="sidebar__level-head">
          <span>Level {level.level}</span>
          <span className="muted">{level.into}/{XP_PER_LEVEL} XP</span>
        </div>
        <div className="progress__track progress__track--thin">
          <span className="progress__fill tone-bg--violet" style={{ width: `${level.progress * 100}%` }} />
        </div>
        <p className="sidebar__level-hint">
          {level.nextAt - member.xp} XP to Level {level.level + 1}
        </p>
      </div>

      <div className="sidebar__user">
        <Avatar name={member.name} color={member.avatarColor} />
        <div className="sidebar__user-copy">
          <strong>{member.name}</strong>
          <span>{member.email}</span>
        </div>
        <button type="button" className="icon-button" onClick={handleLogout} aria-label="Sign out">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );

  return (
    <div className="app-shell">
      <div className="sidebar-wrap">{sidebar}</div>
      {open && <button type="button" className="drawer-backdrop" onClick={() => setOpen(false)} aria-label="Close menu" />}

      <div className="app-main">
        <header className="topbar">
          <div className="topbar__left">
            <button type="button" className="icon-button topbar__menu" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <Link to="/app/dashboard" className="topbar__logo">
              <Logo compact />
            </Link>
            <StatusPill tone="mint">Demo account</StatusPill>
          </div>
          <div className="topbar__right">
            <span className="topbar__chip topbar__chip--flame" title={`${member.streak}-day streak`}>
              <Flame size={15} />
              {member.streak}
            </span>
            <Link to="/app/wallet" className="topbar__chip topbar__chip--balance">
              <span className="muted">Balance</span>
              <strong>{formatNumber(balance)} VE</strong>
            </Link>
            <Link to="/app/dashboard" className="topbar__avatar" aria-label="Your profile">
              <Avatar name={member.name} color={member.avatarColor} size="sm" />
            </Link>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>

        <nav className="mobile-nav" aria-label="Quick navigation">
          {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `mobile-nav__link ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
