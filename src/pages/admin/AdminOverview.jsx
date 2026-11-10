import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Gavel,
  MessagesSquare,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { balanceOf, userById } from '../../lib/store';
import { REDEMPTION_STATUS, TICKET_STATUS } from '../../lib/constants';
import { dateTime, formatINR, formatNumber, timeAgo } from '../../lib/format';
import { SectionHeading, StatCard, StatusPill } from '../../components/ui';

export default function AdminOverview() {
  const { db, admin } = useApp();

  const members = db.users.filter((user) => user.role === 'member');
  const queue = db.redemptions.filter((request) => request.status === 'UNDER_REVIEW');
  const appeals = db.submissions.filter((sub) => sub.status === 'APPEALED');
  const openTickets = db.tickets.filter((ticket) => ticket.status !== 'RESOLVED');
  const liability = members.reduce((sum, user) => sum + balanceOf(db, user.id), 0);
  const completed = db.redemptions.filter((request) => request.status === 'COMPLETED');
  const paidValue = completed.reduce((sum, request) => sum + request.inr, 0);

  return (
    <div className="page admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Operations · {admin.role === 'admin' ? 'Admin' : 'Support'}</p>
          <h1>Queue at a glance</h1>
          <p className="muted">
            Everything that needs a human decision, with the same timeline the member sees.
          </p>
        </div>
        <StatusPill tone={queue.length + appeals.length > 0 ? 'amber' : 'mint'}>
          {queue.length + appeals.length} decision{queue.length + appeals.length === 1 ? '' : 's'} waiting
        </StatusPill>
      </div>

      <section className="stat-grid">
        <StatCard icon={Banknote} label="Redemptions to review" value={queue.length} hint="Awaiting a decision" tone="amber" />
        <StatCard icon={Gavel} label="Appeals to review" value={appeals.length} hint="Reward disputes" tone="violet" />
        <StatCard icon={MessagesSquare} label="Open tickets" value={openTickets.length} hint="Not yet resolved" tone="sky" />
        <StatCard icon={Wallet} label="VE liability" value={`${formatNumber(liability)} VE`} hint={`${members.length} member wallets`} tone="mint" />
      </section>

      <div className="admin-columns">
        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Redemption queue</h2>
              <p className="muted">Oldest requests first. Every action writes a timeline entry.</p>
            </div>
            <Link className="text-link" to="/admin/redemptions">Open queue <ArrowRight size={14} /></Link>
          </div>
          {queue.length ? (
            <ul className="queue-list">
              {queue.map((request) => {
                const member = userById(db, request.userId);
                return (
                  <li key={request.id}>
                    <span className="queue-list__icon tone-bg--amber"><Banknote size={17} /></span>
                    <div className="queue-list__copy">
                      <strong>{formatINR(request.inr)} · {request.methodLabel}</strong>
                      <span>{member?.name} · {request.reference} · {timeAgo(request.createdAt)}</span>
                    </div>
                    <StatusPill tone="amber">Under review</StatusPill>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="admin-empty">
              <CheckCircle2 size={20} />
              <p><strong>Queue clear.</strong> No withdrawals are waiting for review.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Appeals</h2>
              <p className="muted">Rejected rewards where the member asked for a second look.</p>
            </div>
            <Link className="text-link" to="/admin/appeals">Open appeals <ArrowRight size={14} /></Link>
          </div>
          {appeals.length ? (
            <ul className="queue-list">
              {appeals.map((sub) => {
                const member = userById(db, sub.userId);
                return (
                  <li key={sub.id}>
                    <span className="queue-list__icon tone-bg--violet"><Gavel size={17} /></span>
                    <div className="queue-list__copy">
                      <strong>{sub.taskTitle} · {formatNumber(sub.rewardVEs)} VE</strong>
                      <span>{member?.name} · appealed {timeAgo(sub.appealAt)}</span>
                    </div>
                    <StatusPill tone="violet">Under appeal</StatusPill>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="admin-empty">
              <CheckCircle2 size={20} />
              <p><strong>No appeals.</strong> Every reward decision is settled.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Support tickets</h2>
              <p className="muted">Members can see the status of every ticket.</p>
            </div>
            <Link className="text-link" to="/admin/tickets">Open tickets <ArrowRight size={14} /></Link>
          </div>
          {openTickets.length ? (
            <ul className="queue-list">
              {openTickets.slice(0, 4).map((ticket) => {
                const member = userById(db, ticket.userId);
                const status = TICKET_STATUS[ticket.status];
                return (
                  <li key={ticket.id}>
                    <span className={`queue-list__icon tone-bg--${status.tone}`}><MessagesSquare size={17} /></span>
                    <div className="queue-list__copy">
                      <strong>{ticket.subject}</strong>
                      <span>{member?.name} · {ticket.category} · {timeAgo(ticket.updatedAt)}</span>
                    </div>
                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="admin-empty">
              <CheckCircle2 size={20} />
              <p><strong>Inbox clear.</strong> No open support tickets.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Payout history</h2>
              <p className="muted">Completed requests only. Refunds are excluded from this figure.</p>
            </div>
          </div>
          <div className="admin-totals">
            <div><span>Completed requests</span><strong>{completed.length}</strong></div>
            <div><span>Value paid out</span><strong>{formatINR(paidValue)}</strong></div>
            <div><span>Members</span><strong>{members.length}</strong></div>
            <div><span>Avg. request</span><strong>{completed.length ? formatINR(paidValue / completed.length) : '—'}</strong></div>
          </div>
          <div className="admin-footnote">
            <ShieldCheck size={15} />
            <p>Destinations are masked in lists. A production build would audit every reveal.</p>
          </div>
        </section>
      </div>

      <SectionHeading
        eyebrow="Reference"
        title="Recent withdrawals"
        description="Click through to the full request list for filters, search and actions."
        action={<Link className="text-link" to="/admin/redemptions">All withdrawals <ArrowRight size={14} /></Link>}
      />
      <section className="panel panel--flush">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Member</th>
                <th>Method</th>
                <th className="is-right">Amount</th>
                <th>Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {db.redemptions.slice(0, 6).map((request) => {
                const member = userById(db, request.userId);
                const status = REDEMPTION_STATUS[request.status];
                return (
                  <tr key={request.id}>
                    <td><code className="ref-code">{request.reference}</code></td>
                    <td>{member?.name}</td>
                    <td>{request.methodLabel}</td>
                    <td className="is-right">{formatINR(request.inr)}</td>
                    <td className="is-nowrap">{dateTime(request.createdAt)}</td>
                    <td><StatusPill tone={status.tone}>{status.label}</StatusPill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
