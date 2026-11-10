import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Logo } from '../ui';

export function Splash() {
  return (
    <div className="splash">
      <div className="splash__logo">
        <Logo />
      </div>
      <p className="muted">Loading your VELoop workspace…</p>
    </div>
  );
}

export function MemberRoute() {
  const { ready, member } = useApp();
  const location = useLocation();
  if (!ready) return <Splash />;
  if (!member) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function AdminRoute() {
  const { ready, admin } = useApp();
  if (!ready) return <Splash />;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
