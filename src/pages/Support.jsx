import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Gavel,
  MessageSquare,
  MessageSquarePlus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { submissionsOf, ticketsOf } from '../lib/store';
import { HELP_ARTICLES, TICKET_STATUS } from '../lib/constants';
import { cx, dateTime, timeAgo } from '../lib/format';
import { EmptyState, Modal, StatusPill } from '../components/ui';

const CATEGORIES = ['All', 'Rewards', 'Withdrawals', 'Appeals', 'Privacy & safety'];

export default function Support() {
  const { db, member, createTicket, replyToTicket, resetAll, notify } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [openArticle, setOpenArticle] = useState(HELP_ARTICLES[0].id);
  const [form, setForm] = useState({ subject: '', category: 'Rewards', message: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [openTicket, setOpenTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [resetOpen, setResetOpen] = useState(false);

  const tickets = member ? ticketsOf(db, member.id) : [];
  const submissions = member ? submissionsOf(db, member.id) : [];
  const rejected = submissions.filter((sub) => sub.status === 'REJECTED');

  const articles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return HELP_ARTICLES.filter((article) => (category === 'All' ? true : article.category === category)).filter(
      (article) =>
        !needle ||
        article.title.toLowerCase().includes(needle) ||
        article.summary.toLowerCase().includes(needle) ||
        article.body.join(' ').toLowerCase().includes(needle),
    );
  }, [category, query]);

  if (!member) return null;

  const submitTicket = (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      createTicket(member.id, form);
      notify('Ticket created. You can track its status below.', 'success');
      setForm({ subject: '', category: 'Rewards', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitReply = (event, ticket) => {
    event.preventDefault();
    try {
      replyToTicket(member.id, ticket.id, reply);
      setReply('');
      notify('Reply added to the ticket.', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const doReset = async () => {
    setResetOpen(false);
    await resetAll();
    navigate('/login', { replace: true });
  };

  return (
    <div className="page support-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Support</p>
          <h1>Answers first, a human second</h1>
          <p className="muted">Search the guides, appeal a decision, or open a ticket that keeps its history.</p>
        </div>
        <StatusPill tone="mint">Typical reply: under 24 hours</StatusPill>
      </div>

      {rejected.length > 0 && (
        <div className="callout callout--rose">
          <Gavel size={17} />
          <div>
            <strong>You have {rejected.length} reward{rejected.length === 1 ? '' : 's'} that can be appealed</strong>
            <p>Open History → Reward activity, choose Appeal and add what happened. Each reward can be appealed once.</p>
            <Link className="text-link" to="/app/history">Go to reward activity <ArrowRight size={14} /></Link>
          </div>
        </div>
      )}

      <div className="support-layout">
        <section className="panel support-help">
          <div className="panel__head">
            <div>
              <h2>Help centre</h2>
              <p className="muted">{HELP_ARTICLES.length} guides, grouped by the problem you are trying to solve.</p>
            </div>
          </div>

          <div className="search-input">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rewards, withdrawals, privacy…"
              aria-label="Search help articles"
            />
          </div>

          <div className="chip-row chip-row--compact">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                className={cx('chip', category === item && 'is-active')}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {articles.length ? (
            <div className="accordion">
              {articles.map((article) => {
                const open = openArticle === article.id;
                return (
                  <article key={article.id} className={cx('accordion__item', open && 'is-open')}>
                    <button
                      type="button"
                      className="accordion__trigger"
                      onClick={() => setOpenArticle(open ? null : article.id)}
                      aria-expanded={open}
                    >
                      <span>
                        <strong>{article.title}</strong>
                        <span className="accordion__summary">{article.summary}</span>
                      </span>
                      <ChevronDown size={18} className="accordion__chevron" />
                    </button>
                    {open && (
                      <div className="accordion__body">
                        <span className="accordion__category">{article.category}</span>
                        {article.body.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Search} title="No guide matches that search" description="Try a broader word, or open a ticket." />
          )}
        </section>

        <aside className="support-side">
          <section className="panel">
            <div className="panel__head">
              <div>
                <h2>Open a ticket</h2>
                <p className="muted">Include a reference number if you have one.</p>
              </div>
            </div>
            <form className="form" onSubmit={submitTicket}>
              <label className="field">
                <span>Subject</span>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })}
                  placeholder="Short summary of the issue"
                />
              </label>
              <label className="field">
                <span>Category</span>
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  <option>Rewards</option>
                  <option>Withdrawals</option>
                  <option>Appeals</option>
                  <option>Privacy & safety</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="field">
                <span>What happened?</span>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  placeholder="Tell us what you expected and what actually happened."
                />
              </label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="button button--primary button--block" disabled={busy}>
                {busy ? 'Opening ticket…' : 'Create ticket'} <Send size={15} />
              </button>
            </form>
          </section>

          <section className="panel support-note">
            <ShieldCheck size={20} />
            <div>
              <h3>Privacy by default</h3>
              <p>
                Never share a password or one-time code. Support can see your reference numbers and
                timeline; they never need your full payment details.
              </p>
              <Link className="text-link" to="/app/privacy">Read the privacy summary <ArrowRight size={14} /></Link>
            </div>
          </section>
        </aside>
      </div>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>Your tickets</h2>
            <p className="muted">{tickets.length} ticket{tickets.length === 1 ? '' : 's'} · status is visible to you at every stage.</p>
          </div>
        </div>

        {tickets.length ? (
          <ul className="ticket-list">
            {tickets.map((ticket) => {
              const status = TICKET_STATUS[ticket.status];
              const expanded = openTicket === ticket.id;
              return (
                <li key={ticket.id} className={cx('ticket-item', expanded && 'is-open')}>
                  <button
                    type="button"
                    className="ticket-item__head"
                    onClick={() => {
                      setOpenTicket(expanded ? null : ticket.id);
                      setReply('');
                    }}
                    aria-expanded={expanded}
                  >
                    <span className="ticket-item__icon"><MessageSquare size={17} /></span>
                    <span className="ticket-item__copy">
                      <strong>{ticket.subject}</strong>
                      <span>{ticket.category} · opened {timeAgo(ticket.createdAt)} · {ticket.replies.length} repl{ticket.replies.length === 1 ? 'y' : 'ies'}</span>
                    </span>
                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                    <ChevronDown size={17} className="accordion__chevron" />
                  </button>

                  {expanded && (
                    <div className="ticket-item__body">
                      <div className="ticket-message">
                        <span className="ticket-message__author">You</span>
                        <p>{ticket.message}</p>
                        <span className="ticket-message__time">{dateTime(ticket.createdAt)}</span>
                      </div>
                      {ticket.replies.map((item) => (
                        <div key={item.id} className={cx('ticket-message', item.role !== 'member' && 'is-staff')}>
                          <span className="ticket-message__author">
                            {item.author} {item.role !== 'member' && <em>· {item.role === 'admin' ? 'Operations' : 'Support'}</em>}
                          </span>
                          <p>{item.message}</p>
                          <span className="ticket-message__time">{dateTime(item.at)}</span>
                        </div>
                      ))}

                      {ticket.status !== 'RESOLVED' ? (
                        <form className="ticket-reply" onSubmit={(event) => submitReply(event, ticket)}>
                          <input
                            type="text"
                            value={reply}
                            onChange={(event) => setReply(event.target.value)}
                            placeholder="Add a reply…"
                            aria-label="Reply to ticket"
                          />
                          <button type="submit" className="button button--primary button--sm">
                            Send <Send size={14} />
                          </button>
                        </form>
                      ) : (
                        <p className="ticket-resolved"><CheckCircle2 size={15} /> This ticket is resolved. Open a new one if you need more help.</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={MessageSquarePlus}
            title="No tickets yet"
            description="If a guide does not answer your question, open a ticket above."
          />
        )}
      </section>

      <section className="danger-zone">
        <div>
          <h3><RotateCcw size={16} /> Reset the demo</h3>
          <p className="muted">
            Clears every local account, reward, request and ticket, then restores the two sample accounts.
          </p>
        </div>
        <button type="button" className="button button--danger-ghost" onClick={() => setResetOpen(true)}>
          Reset demo data
        </button>
      </section>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset all demo data?"
        size="sm"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setResetOpen(false)}>Keep my data</button>
            <button type="button" className="button button--danger" onClick={doReset}>Reset everything</button>
          </>
        }
      >
        <p className="muted">
          This clears the browser database, including any accounts you created. You will be signed out and
          the original sample data will be restored.
        </p>
      </Modal>
    </div>
  );
}
