import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MemberLayout } from './components/layout/MemberLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminRoute, MemberRoute } from './components/layout/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import Redeem from './pages/Redeem';
import History from './pages/History';
import Support from './pages/Support';
import Research from './pages/Research';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import AdminOverview from './pages/admin/AdminOverview';
import AdminRedemptions from './pages/admin/AdminRedemptions';
import AdminAppeals from './pages/admin/AdminAppeals';
import AdminTickets from './pages/admin/AdminTickets';

const TITLES = {
  '/': 'VELoop Rewards — Transparent rewards platform',
  '/login': 'Sign in · VELoop Rewards',
  '/register': 'Create account · VELoop Rewards',
  '/admin/login': 'Operations sign in · VELoop Rewards',
  '/app/dashboard': 'Dashboard · VELoop Rewards',
  '/app/tasks': 'Activities · VELoop Rewards',
  '/app/wallet': 'Wallet · VELoop Rewards',
  '/app/redeem': 'Redeem VEs · VELoop Rewards',
  '/app/history': 'History · VELoop Rewards',
  '/app/support': 'Support · VELoop Rewards',
  '/app/research': 'Research · VELoop Rewards',
  '/app/privacy': 'Privacy · VELoop Rewards',
  '/research': 'Research · VELoop Rewards',
  '/privacy': 'Privacy · VELoop Rewards',
  '/admin': 'Operations overview · VELoop Rewards',
  '/admin/redemptions': 'Redemption queue · VELoop Rewards',
  '/admin/appeals': 'Appeals · VELoop Rewards',
  '/admin/tickets': 'Tickets · VELoop Rewards',
};

function ScrollAndTitle() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    document.title = TITLES[location.pathname] || 'VELoop Rewards';
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollAndTitle />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<PublicLayout />}>
          <Route path="/research" element={<Research />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        <Route element={<MemberRoute />}>
          <Route path="/app" element={<MemberLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="redeem" element={<Redeem />} />
            <Route path="history" element={<History />} />
            <Route path="support" element={<Support />} />
            <Route path="research" element={<Research />} />
            <Route path="privacy" element={<Privacy />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="redemptions" element={<AdminRedemptions />} />
            <Route path="appeals" element={<AdminAppeals />} />
            <Route path="tickets" element={<AdminTickets />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
