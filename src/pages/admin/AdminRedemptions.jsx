import { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Gift,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { userById } from '../../lib/store';
import { REDEMPTION_STATUS } from '../../lib/constants';
import { cx, dateTime, formatINR, formatNumber, timeAgo } from '../../lib/format';
import { EmptyState, Modal, StatusPill } from '../../components/ui';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'UNDER_REVIEW', label: 'Under review' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CLOSED', label: 'Rejected / cancelled' },
];

const NEXT_LABEL = {
  UNDER_REVIEW: 'Approve request',
  APPROVED: 'Mark as processing',
  PROCESSING: 'Mark as completed',
};

export default function AdminRedemptions() {
  const { db, admin, advanceRedemption, rejectRedemption, notify } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = db.redemptions.find((request) => request.id === selectedId) || null;
  const selectedMember = selected ? userById(db, selected.userId) : null;

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return db.redemptions
      .filter((request) => {
        if (filter === 'ALL') return true;
        if (filter === 'CLOSED') return ['REJECTED', 'CANCELLED'].includes(request.status);
        return request.status === filter;
      })
      .filter((request) => {
        if (!needle) return true;
        const member = userById(db, request.userId);
        return (
          request.reference.toLowerCase().includes(needle) ||
          request.methodLabel.toLowerCase().includes(needle) ||
          (member?.name || '').toLowerCase().includes(needle) ||
          (member?.email || '').toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [db, filter, query]);

  const openRow = (request) => {
    setSelectedId(request.id);
    setRevealed(false);
    setNote('');
    setError('');
  };

  const close = () => {
    setSelectedId(null);
    setRevealed(false);
    setNote('');
    setError('');
  };

  const advance = () => {
    setBusy(true);
    try {
      const updated = advanceRedemption(selected.id, admin.id);
      notify(`${updated.reference} moved to ${REDEMPTION_STATUS[updated.status].label}.`, 'success');
      setNote('');
      setError('');
    } catch (err) {
      setError(err.message);
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const reject = () => {
    setBusy(true);
    try {
      const updated = rejectRedemption(selected.id, admin.id, note);
      notify(`${updated.reference} rejected and refunded.`, 'info');
      setNote('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const canAct = selected && ['UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(selected.status);

  return (
    <div className="page admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Operations · Withdrawals</p>
          <h1>Redemption queue</h1>
          <p className="muted">
            Review the destination, then approve, process, complete or reject. Rejections refund automatically.
          </p>
        </div>
        <StatusPill tone="amber">
          {db.redemptions.filter((request) => request.status === 'UNDER_REVIEW').length} awaiting review
        </StatusPill>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference, member or method…"
            aria-label="Search withdrawals"
          />
        </div>
        <div className="chip-row chip-row--compact">
          {FILTERS.map((item) => {
            const count =
              item.id === 'ALL'
                ? db.redemptions.length
                : item.id === 'CLOSED'
                  ? db.redemptions.filter((request) => ['REJECTED', 'CANCELLED'].includes(request.status)).length
                  : db.redemptions.filter((request) => request.status === item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                className={cx('chip', filter === item.id && 'is-active')}
                onClick={() => setFilter(item.id)}
              >
                {item.label}<span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="panel panel--flush">
        {rows.length ? (
          <div className="table-wrap">
            <table className="data-table data-table--admin">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Member</th>
                  <th>Method</th>
                  <th className="is-right">Amount</th>
                  <th>Destination</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((request) => {
                  const member = userById(db, request.userId);
                  const status = REDEMPTION_STATUS[request.status];
                  return (
                    <tr key={request.id}>
                      <td><code className="ref-code">{request.reference}</code></td>
                      <td>
                        <strong>{member?.name || 'Unknown'}</strong>
                        <span className="table-sub">{member?.email}</span>
                      </td>
                      <td>
                        <span className="method-inline">
                          {request.method === 'upi' || request.method === 'paypal' ? <Banknote size={14} /> : <Gift size={14} />}
                          {request.methodLabel}
                        </span>
                      </td>
                      <td className="is-right">
                        <strong>{formatINR(request.inr)}</strong>
                        <span className="table-sub">{formatNumber(request.ves)} VE</span>
                      </td>
                      <td><code className="ref-code">{request.maskedDestination}</code></td>
                      <td className="is-nowrap">{timeAgo(request.createdAt)}</td>
                      <td><StatusPill tone={status.tone}>{status.label}</StatusPill></td>
                      <td>
                        <button type="button" className="button button--ghost button--sm" onClick={() => openRow(request)}>
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Search} title="No requests match" description="Try another filter or clear the search." />
        )}
      </section>

      <Modal
        open={Boolean(selected)}
        onClose={close}
        title={selected ? `${selected.methodLabel} · ${formatINR(selected.inr)}` : ''}
        subtitle={selected ? `${selected.reference} · ${formatNumber(selected.ves)} VE` : ''}
        size="lg"
        footer={
          selected && (
            <>
              <button type="button" className="button button--ghost" onClick={close}>Close</button>
              {canAct && (
                <button type="button" className="button button--primary" onClick={advance} disabled={busy}>
                  {NEXT_LABEL[selected.status]} <CheckCircle2 size={15} />
                </button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="admin-detail">
            <div className="admin-detail__grid">
              <div><span>Member</span><strong>{selectedMember?.name}</strong><small>{selectedMember?.email}</small></div>
              <div><span>Status</span><StatusPill tone={REDEMPTION_STATUS[selected.status].tone}>{REDEMPTION_STATUS[selected.status].label}</StatusPill></div>
              <div><span>Requested</span><strong>{dateTime(selected.createdAt)}</strong></div>
              <div><span>VEs held</span><strong>{formatNumber(selected.ves)} VE</strong></div>
            </div>

            <div className="destination-box">
              <div>
                <span className="muted">Destination</span>
                <code>{revealed ? selected.destination : selected.maskedDestination}</code>
              </div>
              <button type="button" className="button button--ghost button--sm" onClick={() => setRevealed((value) => !value)}>
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                {revealed ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <p className="destination-note">
              <ShieldCheck size={13} /> In production, revealing a destination would require the
              <code> redemptions:reveal </code> permission and write an audit-log entry.
            </p>

            <h3 className="mini-heading"><Clock3 size={15} /> Timeline</h3>
            <ol className="timeline">
              {selected.timeline.map((event, index) => (
                <li key={`${event.status}-${index}`} className="timeline__item is-done">
                  <span className="timeline__dot" />
                  <div>
                    <strong>{event.label}</strong>
                    <p>{event.note}</p>
                    <span>{dateTime(event.at)}{event.by ? ` · ${event.by}` : ''}</span>
                  </div>
                </li>
              ))}
            </ol>

            {selected.adminNote && (
              <div className="callout callout--rose">
                <XCircle size={16} />
                <div><strong>Recorded decision</strong><p>{selected.adminNote}</p></div>
              </div>
            )}

            {canAct && (
              <div className="reject-box">
                <h3 className="mini-heading"><XCircle size={15} /> Reject and refund</h3>
                <p className="muted">
                  Rejecting returns the full {formatNumber(selected.ves)} VE to the member and writes a
                  refund ledger row. A reason is required.
                </p>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Reason shown to the member, e.g. destination did not match the account name."
                />
                {error && <p className="form-error" role="alert">{error}</p>}
                <button
                  type="button"
                  className="button button--danger"
                  onClick={reject}
                  disabled={busy || note.trim().length < 5}
                >
                  Reject request and refund
                </button>
              </div>
            )}

            {!canAct && selected.status === 'CANCELLED' && (
              <div className="callout callout--muted">
                <ShieldCheck size={16} />
                <div><strong>Refunded</strong><p>The member cancelled this request and the VEs were returned automatically.</p></div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
