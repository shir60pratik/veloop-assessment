import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  MessagesSquare,
  Search,
  Send,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { userById } from '../../lib/store';
import { TICKET_STATUS } from '../../lib/constants';
import { cx, dateTime, timeAgo } from '../../lib/format';
import { EmptyState, StatusPill } from '../../components/ui';

const FILTERS = ['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED'];

export default function AdminTickets() {
  const { db, admin, replyAsOperations, setTicketStatus, notify } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [replies, setReplies] = useState({});
  const [busyId, setBusyId] = useState(null);

  const tickets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return db.tickets
      .filter((ticket) => (filter === 'ALL' ? true : ticket.status === filter))
      .filter((ticket) => {
        if (!needle) return true;
        const member = userById(db, ticket.userId);
        return (
          ticket.subject.toLowerCase().includes(needle) ||
          ticket.message.toLowerCase().includes(needle) ||
          (member?.name || '').toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [db, filter, query]);

  const sendReply = (ticket, resolve) => {
    const message = replies[ticket.id] || '';
    setBusyId(ticket.id);
    try {
      replyAsOperations(admin.id, ticket.id, message, resolve);
      notify(resolve ? 'Reply sent and ticket resolved.' : 'Reply sent. Member can see it now.', 'success');
      setReplies((current) => ({ ...current, [ticket.id]: '' }));
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const markResolved = (ticket) => {
    try {
      setTicketStatus(ticket.id, 'RESOLVED');
      notify('Ticket marked as resolved.', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Operations · Support</p>
          <h1>Member tickets</h1>
          <p className="muted">Reply with context, then resolve. The member sees the same status you do.</p>
        </div>
        <StatusPill tone="amber">
          {db.tickets.filter((ticket) => ticket.status !== 'RESOLVED').length} open
        </StatusPill>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subject, message or member…"
            aria-label="Search tickets"
          />
        </div>
        <div className="chip-row chip-row--compact">
          {FILTERS.map((item) => {
            const count = item === 'ALL' ? db.tickets.length : db.tickets.filter((ticket) => ticket.status === item).length;
            return (
              <button
                key={item}
                type="button"
                className={cx('chip', filter === item && 'is-active')}
                onClick={() => setFilter(item)}
              >
                {item === 'ALL' ? 'All' : TICKET_STATUS[item].label}
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tickets.length ? (
        <div className="admin-ticket-list">
          {tickets.map((ticket) => {
            const member = userById(db, ticket.userId);
            const status = TICKET_STATUS[ticket.status];
            const expanded = openId === ticket.id;
            return (
              <article className={cx('admin-ticket', expanded && 'is-open')} key={ticket.id}>
                <button
                  type="button"
                  className="admin-ticket__head"
                  onClick={() => setOpenId(expanded ? null : ticket.id)}
                  aria-expanded={expanded}
                >
                  <span className={`admin-ticket__icon tone-bg--${status.tone}`}><MessagesSquare size={18} /></span>
                  <span className="admin-ticket__copy">
                    <strong>{ticket.subject}</strong>
                    <span>
                      <User size={12} /> {member?.name} · {member?.email} · {ticket.category} · updated {timeAgo(ticket.updatedAt)}
                    </span>
                  </span>
                  <span className="admin-ticket__count">{ticket.replies.length} repl{ticket.replies.length === 1 ? 'y' : 'ies'}</span>
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                  <ChevronDown size={17} className="accordion__chevron" />
                </button>

                {expanded && (
                  <div className="admin-ticket__body">
                    <div className="ticket-thread">
                      <div className="ticket-message">
                        <span className="ticket-message__author">Original message · {member?.name}</span>
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
                    </div>

                    <div className="admin-ticket__reply">
                      <textarea
                        rows={3}
                        value={replies[ticket.id] || ''}
                        onChange={(event) =>
                          setReplies((current) => ({ ...current, [ticket.id]: event.target.value }))
                        }
                        placeholder="Write a reply the member will see…"
                      />
                      <div className="admin-ticket__actions">
                        {ticket.status !== 'RESOLVED' && (
                          <button
                            type="button"
                            className="button button--ghost button--sm"
                            onClick={() => markResolved(ticket)}
                          >
                            <CheckCircle2 size={14} /> Mark resolved
                          </button>
                        )}
                        <button
                          type="button"
                          className="button button--ghost button--sm"
                          disabled={busyId === ticket.id || (replies[ticket.id] || '').trim().length < 2}
                          onClick={() => sendReply(ticket, false)}
                        >
                          <Send size={14} /> Reply
                        </button>
                        <button
                          type="button"
                          className="button button--primary button--sm"
                          disabled={busyId === ticket.id || (replies[ticket.id] || '').trim().length < 2}
                          onClick={() => sendReply(ticket, true)}
                        >
                          <CheckCircle2 size={14} /> Reply & resolve
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={MessagesSquare} title="No tickets in this view" description="Try another filter or clear the search." />
      )}
    </div>
  );
}
