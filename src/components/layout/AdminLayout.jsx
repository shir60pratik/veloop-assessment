import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Banknote,
  Gavel,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, Logo, StatusPill } from '../ui';

const NAV = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/redemptions', label: 'Redemptions', icon: Banknote },
  { to: '/admin/appeals', label: 'Appeals', icon: Gavel },
  { to: '/admin/tickets', label: 'Tickets', icon: MessagesSquare },
];

export function AdminLayout() {
  const { db, admin, logoutAdmin, notify } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!admin) return null;

  const reviewCount = db.redemptions.filter((request) => request.status === 'UNDER_REVIEW').length;
  const appealCount = db.submissions.filter((sub) => sub.status === 'APPEALED').length;
  const openTickets = db.tickets.filter((ticket) => ticket.status !== 'RESOLVED').length;

  const badgeFor = (label) => {
    if (label === 'Redemptions') return reviewCount;
    if (label === 'Appeals') return appealCount;
    if (label === 'Tickets') return openTickets;
    return 0;
  };

  return (
    <div className="app-shell app-shell--admin">
      <div className="sidebar-wrap">
        <aside className={`sidebar sidebar--admin ${open ? 'sidebar--open' : ''}`}>
          <div className="sidebar__brand">
            <Link to="/admin" aria-label="Operations overview">
              <Logo />
            </Link>
            <button type="button" className="icon-button sidebar__close" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={18} />
            </button>
          </div>

          <div className="sidebar__role">
            <StatusPill tone="amber">Operations console</StatusPill>
            <p className="muted">Review requests, appeals and support tickets.</p>
          </div>

          <nav className="sidebar__nav" aria-label="Operations navigation">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {badgeFor(label) > 0 && <span className="sidebar__count">{badgeFor(label)}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar__foot">
            <Link to="/" className="sidebar__back">
              <ArrowLeft size={15} />
              Back to member site
            </Link>
            <div className="sidebar__user">
              <Avatar name={admin.name} color={admin.avatarColor} />
              <div className="sidebar__user-copy">
                <strong>{admin.name}</strong>
                <span>{admin.role === 'admin' ? 'Operations admin' : 'Support agent'}</span>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  logoutAdmin();
                  notify('Operations session ended.', 'info');
                  navigate('/admin/login');
                }}
                aria-label="Sign out of operations"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </aside>
      </div>
      {open && <button type="button" className="drawer-backdrop" onClick={() => setOpen(false)} aria-label="Close menu" />}

      <div className="app-main">
        <header className="topbar topbar--admin">
          <div className="topbar__left">
            <button type="button" className="icon-button topbar__menu" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <Link to="/admin" className="topbar__logo">
              <Logo compact />
            </Link>
            <StatusPill tone="violet">{admin.role === 'admin' ? 'Admin' : 'Support'}</StatusPill>
          </div>
          <div className="topbar__right">
            <span className="topbar__chip">
              <span className="muted">Queue</span>
              <strong>{reviewCount + appealCount}</strong>
            </span>
            <Avatar name={admin.name} color={admin.avatarColor} size="sm" />
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
