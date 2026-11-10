import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="not-found">
      <span className="not-found__icon"><Compass size={30} /></span>
      <p className="eyebrow">404</p>
      <h1>That page is not part of the demo</h1>
      <p className="muted">
        The link may be old, or the route may belong to a different build. Everything else is one click away.
      </p>
      <div className="not-found__actions">
        <Link className="button button--primary" to="/">Back to home</Link>
        <Link className="button button--ghost" to="/app/dashboard">
          <ArrowLeft size={15} /> Member dashboard
        </Link>
      </div>
    </div>
  );
}
