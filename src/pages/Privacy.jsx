import { Link } from 'react-router-dom';
import { ArrowRight, Database, EyeOff, Lock, Server, ShieldCheck, Trash2, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STORED = [
  {
    icon: UserCheck,
    title: 'Demo account',
    body: 'Name, email, a SHA-256 hash of your demo password, level, XP and streak. No phone number and no KYC data.',
    retention: 'Until you reset the demo',
  },
  {
    icon: Database,
    title: 'Reward activity',
    body: 'Task submissions, statuses, rejection reasons, appeal text and the resulting ledger rows.',
    retention: 'Until you reset the demo',
  },
  {
    icon: Lock,
    title: 'Withdrawal requests',
    body: 'Method, amount, reference, timeline and the destination you typed. Destinations are masked in the interface.',
    retention: 'Until you reset the demo',
  },
  {
    icon: EyeOff,
    title: 'Support tickets',
    body: 'Subject, category, messages and replies. Do not include real payment details or passwords in a ticket.',
    retention: 'Until you reset the demo',
  },
];

const PRODUCTION = [
  'Passwords hashed with Argon2id or bcrypt on the server; never stored in a browser.',
  'TLS everywhere, HTTP-only session cookies and CSRF protection.',
  'UPI IDs and delivery emails encrypted at rest with AES-256-GCM, masked in lists.',
  'Role-based access for operations, with every reveal written to an append-only audit log.',
  'A documented retention schedule and a process for access, correction and deletion requests.',
  'Alignment with India’s Digital Personal Data Protection Act, 2023 before launch.',
];

export default function Privacy() {
  const { member } = useApp();

  return (
    <div className="page privacy-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Privacy summary</p>
          <h1>What this demo knows about you</h1>
          <p className="muted">
            A short, plain-language version of what is stored, where it lives and what would change in a
            production build.
          </p>
        </div>
        <span className="privacy-badge"><ShieldCheck size={16} /> No server, no tracking</span>
      </div>

      <section className="privacy-hero">
        <div>
          <h2>All of it stays in this browser</h2>
          <p>
            This assessment build has no backend. Everything you create is written to your browser&apos;s
            localStorage under one key: <code>veloop.rewards.db.v1</code>. Nothing is transmitted, sold or
            shared, and there are no analytics scripts, advertising pixels or third-party cookies.
          </p>
        </div>
        <div className="privacy-hero__stats">
          <div><strong>0</strong><span>network requests with your data</span></div>
          <div><strong>1</strong><span>local storage key</span></div>
          <div><strong>You</strong><span>control the reset</span></div>
        </div>
      </section>

      <section>
        <h2 className="section-title">What is stored, and why</h2>
        <div className="privacy-grid">
          {STORED.map(({ icon: Icon, title, body, retention }) => (
            <article className="privacy-card" key={title}>
              <span className="privacy-card__icon"><Icon size={18} /></span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="privacy-card__retention">{retention}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>What would change in production</h2>
            <p className="muted">The demo is deliberately simple; a live rewards platform needs more controls.</p>
          </div>
          <span className="privacy-badge"><Server size={15} /> Production checklist</span>
        </div>
        <ul className="check-list check-list--two">
          {PRODUCTION.map((item) => (
            <li key={item}><ShieldCheck size={14} /> {item}</li>
          ))}
        </ul>
      </section>

      <div className="privacy-columns">
        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Your controls</h2>
              <p className="muted">You can remove everything in two clicks.</p>
            </div>
          </div>
          <ul className="privacy-controls">
            <li>
              <span><Trash2 size={16} /></span>
              <div>
                <strong>Delete all demo data</strong>
                <p>Support → Reset demo data clears accounts, rewards, requests and tickets, then reseeds the sample data.</p>
                {member && <Link className="text-link" to="/app/support">Open the support page <ArrowRight size={14} /></Link>}
              </div>
            </li>
            <li>
              <span><EyeOff size={16} /></span>
              <div>
                <strong>Use invented details</strong>
                <p>Use the demo accounts and sample UPI or email values. Never enter a real bank account or password.</p>
              </div>
            </li>
            <li>
              <span><Lock size={16} /></span>
              <div>
                <strong>Keep the tab to yourself</strong>
                <p>Anyone with access to this browser profile can read the local demo database.</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Scope and official policy</h2>
              <p className="muted">This is an independent assessment build, not the live VELoop service.</p>
            </div>
          </div>
          <p className="muted">
            For the real platform&apos;s data practices, read the official privacy policy and disclaimer.
          </p>
          <div className="source-list">
            <a href="https://www.velooprewards.in/privacy-policy" target="_blank" rel="noreferrer">
              Official privacy policy <ArrowRight size={14} />
            </a>
            <a href="https://www.velooprewards.in/disclaimer" target="_blank" rel="noreferrer">
              Official disclaimer <ArrowRight size={14} />
            </a>
            <Link to="/research">Read the research report <ArrowRight size={14} /></Link>
          </div>
          <p className="privacy-fineprint">
            Note: the internship notice mentions a possible certificate processing fee. This demo does not
            collect payments and is not part of that process.
          </p>
        </section>
      </div>
    </div>
  );
}
