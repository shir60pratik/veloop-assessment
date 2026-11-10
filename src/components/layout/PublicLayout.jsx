import { Link, Outlet } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { Logo } from '../ui';

export function PublicLayout() {
  return (
    <div className="public-shell">
      <header className="public-nav">
        <div className="container public-nav__inner">
          <Link to="/" aria-label="VELoop Rewards home"><Logo /></Link>
          <nav>
            <Link to="/research">Research</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/login">Sign in</Link>
            <Link className="button button--primary button--sm" to="/register">
              Create account <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>
      <main className="container public-content">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="container public-footer__inner">
          <span>VELoop Rewards assessment demo · built with React and Vite</span>
          <span><Lock size={13} /> Data stays in your browser</span>
        </div>
      </footer>
    </div>
  );
}
