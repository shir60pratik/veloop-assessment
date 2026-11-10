import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock3,
  FileText,
  Gavel,
  Gift,
  History as HistoryIcon,
  MessageSquare,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { redemptionsOf, submissionsOf } from '../lib/store';
import { REWARD_STATUS, REDEMPTION_STATUS } from '../lib/constants';
import {
  cx,
  dateTime,
  formatINR,
  formatNumber,
  formatVE,
  timeAgo,
} from '../lib/format';
import { EmptyState, Modal, StatusPill } from '../components/ui';

const REDEMPTION_FILTERS = [
  { id: 'all', label: 'All requests' },
  { id: 'active', label: 'In flight' },
  { id: 'completed', label: 'Completed' },
  { id: 'closed', label: 'Rejected / cancelled' },
];

export default function History() {
  const { db, member, cancelRedemption, appeal, notify } = useApp();
  const [tab, setTab] = useState('redemptions');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [appealTarget, setAppealTarget] = useState(null);
  const [appealText, setAppealText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const requests = member ? redemptionsOf(db, member.id) : [];
  const submissions = member ? submissionsOf(db, member.id) : [];

  const filteredRequests = useMemo(() => {
    if (filter === 'active') {
      return requests.filter((request) => ['UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(request.status));
    }
    if (filter === 'completed') return requests.filter((request) => request.status === 'COMPLETED');
    if (filter === 'closed') return requests.filter((request) => ['REJECTED', 'CANCELLED'].includes(request.status));
    return requests;
  }, [requests, filter]);

  if (!member) return null;

  const pendingCount = requests.filter((request) => ['UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(request.status)).length;
  const completedValue = requests
    .filter((request) => request.status === 'COMPLETED')
    .reduce((sum, request) => sum + request.inr, 0);
  const credited = submissions.filter((sub) => sub.status === 'CREDITED').length;
  const rejected = submissions.filter((sub) => sub.status === 'REJECTED').length;

  const openAppeal = (submission) => {
    setAppealTarget(submission);
    setAppealText('');
    setError('');
  };

  const submitAppeal = (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      appeal(member.id, appealTarget.id, appealText);
      notify('Appeal submitted. A human reviewer will look at it.', 'success');
      setAppealTarget(null);
      setAppealText('');
      setTab('rewards');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = () => {
    try {
      cancelRedemption(member.id, cancelTarget.id);
      notify(`Request ${cancelTarget.reference} cancelled. ${formatVE(cancelTarget.ves)} refunded.`, 'success');
      setCancelTarget(null);
      setDetail(null);
    } catch (err) {
      notify(err.message, 'error');
      setCancelTarget(null);
    }
  };

  return (
    <div className="page history-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">History</p>
          <h1>Every request, every status change</h1>
          <p className="muted">Withdrawal timelines and reward outcomes, with references you can quote.</p>
        </div>
        <Link className="button button--ghost" to="/app/redeem">
          New request <ArrowRight size={15} />
        </Link>
      </div>

      <section className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__icon tone-bg--amber"><Clock3 size={18} /></span>
          <div><p className="stat-card__label">Requests in flight</p><p className="stat-card__value">{pendingCount}</p><p className="stat-card__hint">Under review, approved or processing</p></div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon tone-bg--mint"><Banknote size={18} /></span>
          <div><p className="stat-card__label">Completed value</p><p className="stat-card__value">{formatINR(completedValue)}</p><p className="stat-card__hint">Across {requests.length} request{requests.length === 1 ? '' : 's'}</p></div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon tone-bg--violet"><BadgeCheck size={18} /></span>
          <div><p className="stat-card__label">Rewards credited</p><p className="stat-card__value">{credited}</p><p className="stat-card__hint">Validated activities</p></div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon tone-bg--rose"><XCircle size={18} /></span>
          <div><p className="stat-card__label">Not approved</p><p className="stat-card__value">{rejected}</p><p className="stat-card__hint">Appeal available where eligible</p></div>
        </div>
      </section>

      <div className="tabs" role="tablist" aria-label="History sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'redemptions'}
          className={cx('tab', tab === 'redemptions' && 'is-active')}
          onClick={() => setTab('redemptions')}
        >
          <Banknote size={16} /> Withdrawals <span>{requests.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'rewards'}
          className={cx('tab', tab === 'rewards' && 'is-active')}
          onClick={() => setTab('rewards')}
        >
          <Gift size={16} /> Reward activity <span>{submissions.length}</span>
        </button>
      </div>

      {tab === 'redemptions' ? (
        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Withdrawal requests</h2>
              <p className="muted">Select a request to see its full timeline and reference.</p>
            </div>
            <div className="chip-row chip-row--compact">
              {REDEMPTION_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cx('chip', filter === item.id && 'is-active')}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length ? (
            <ul className="request-list">
              {filteredRequests.map((request) => {
                const status = REDEMPTION_STATUS[request.status];
                return (
                  <li key={request.id} className="request-item">
                    <span className={cx('request-item__icon', `tone-bg--${status.tone}`)}>
                      {request.method === 'upi' || request.method === 'paypal' ? <Banknote size={18} /> : <Gift size={18} />}
                    </span>
                    <div className="request-item__main">
                      <div className="request-item__title">
                        <strong>{request.methodLabel}</strong>
                        <StatusPill tone={status.tone}>{status.label}</StatusPill>
                      </div>
                      <p className="muted">
                        {formatINR(request.inr)} · {formatNumber(request.ves)} VE ·{' '}
                        {dateTime(request.createdAt)}
                      </p>
                      <div className="request-item__ref">
                        <code>{request.reference}</code>
                        <span>{request.maskedDestination}</span>
                      </div>
                    </div>
                    <div className="request-item__actions">
                      <button type="button" className="button button--ghost button--sm" onClick={() => setDetail(request)}>
                        View timeline
                      </button>
                      {request.status === 'UNDER_REVIEW' && (
                        <button type="button" className="button button--danger-ghost button--sm" onClick={() => setCancelTarget(request)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={HistoryIcon}
              title="No requests in this view"
              description="Try another filter, or create a withdrawal request."
              action={<Link className="button button--primary button--sm" to="/app/redeem">Redeem VEs</Link>}
            />
          )}
        </section>
      ) : (
        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Reward activity</h2>
              <p className="muted">Pending, credited and rejected rewards, with reasons where available.</p>
            </div>
            <Link className="text-link" to="/app/wallet">Open ledger</Link>
          </div>

          {submissions.length ? (
            <ul className="submission-list">
              {submissions.map((sub) => {
                const status = REWARD_STATUS[sub.status];
                return (
                  <li key={sub.id} className="submission-item">
                    <span className={cx('submission-item__icon', `tone-bg--${status.tone}`)}>
                      {sub.status === 'CREDITED' ? <CheckCircle2 size={18} /> : sub.status === 'REJECTED' ? <XCircle size={18} /> : <Clock3 size={18} />}
                    </span>
                    <div className="submission-item__main">
                      <div className="submission-item__title">
                        <strong>{sub.taskTitle}</strong>
                        <StatusPill tone={status.tone}>{status.label}</StatusPill>
                      </div>
                      <p className="muted">
                        Submitted {timeAgo(sub.submittedAt)} · Reference SUB-{sub.id.slice(-4).toUpperCase()}
                      </p>
                      {sub.reason && <p className="submission-item__reason">{sub.reason}</p>}
                      {sub.resolutionNote && <p className="submission-item__resolution">{sub.resolutionNote}</p>}
                      {sub.appealMessage && (
                        <p className="submission-item__appeal">
                          <MessageSquare size={13} /> Your appeal: {sub.appealMessage}
                        </p>
                      )}
                    </div>
                    <div className="submission-item__side">
                      <span className={cx('submission-item__amount', sub.status === 'CREDITED' ? 'is-credit' : '')}>
                        {sub.status === 'CREDITED' ? '+' : ''}{formatNumber(sub.rewardVEs)} VE
                      </span>
                      {sub.status === 'REJECTED' && (
                        <button type="button" className="button button--ghost button--sm" onClick={() => openAppeal(sub)}>
                          <Gavel size={14} /> Appeal
                        </button>
                      )}
                      {sub.status === 'APPEALED' && (
                        <Link className="text-link" to="/app/support">
                          Contact support
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={Gift}
              title="No reward activity yet"
              description="Complete an activity and it will appear here with its status."
              action={<Link className="button button--primary button--sm" to="/app/tasks">Browse activities</Link>}
            />
          )}
        </section>
      )}

      <div className="info-strip">
        <FileText size={17} />
        <p>
          <strong>Keep your reference number.</strong> Every withdrawal has one, and support can see the
          same timeline you can. You never need to resend payment details in a ticket.
        </p>
      </div>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.methodLabel} · ${formatINR(detail.inr)}` : ''}
        subtitle={detail ? `Reference ${detail.reference}` : ''}
        size="md"
        footer={
          detail && (
            <>
              {detail.status === 'UNDER_REVIEW' && (
                <button type="button" className="button button--danger-ghost" onClick={() => setCancelTarget(detail)}>
                  Cancel request
                </button>
              )}
              <button type="button" className="button button--ghost" onClick={() => setDetail(null)}>
                Close
              </button>
            </>
          )
        }
      >
        {detail && (
          <div className="request-detail">
            <div className="request-detail__summary">
              <div><span>Status</span><StatusPill tone={REDEMPTION_STATUS[detail.status].tone}>{REDEMPTION_STATUS[detail.status].label}</StatusPill></div>
              <div><span>VEs held</span><strong>{formatNumber(detail.ves)} VE</strong></div>
              <div><span>Destination</span><strong>{detail.maskedDestination}</strong></div>
              <div><span>Created</span><strong>{dateTime(detail.createdAt)}</strong></div>
            </div>
            <p className="muted">{REDEMPTION_STATUS[detail.status].description}</p>

            <h3 className="mini-heading"><Clock3 size={15} /> Timeline</h3>
            <ol className="timeline">
              {detail.timeline.map((event, index) => (
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

            {detail.adminNote && (
              <div className="callout callout--rose">
                <AlertTriangle size={16} />
                <div><strong>Operations note</strong><p>{detail.adminNote}</p></div>
              </div>
            )}

            <div className="callout callout--muted">
              <Wallet size={16} />
              <div>
                <strong>Refunds</strong>
                <p>If this request is rejected or cancelled, the VEs return to your wallet and a refund row is added to the ledger.</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel this request?"
        subtitle={cancelTarget ? `Reference ${cancelTarget.reference}` : ''}
        size="sm"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setCancelTarget(null)}>
              Keep request
            </button>
            <button type="button" className="button button--danger" onClick={confirmCancel}>
              Cancel and refund
            </button>
          </>
        }
      >
        {cancelTarget && (
          <p className="muted">
            {formatVE(cancelTarget.ves)} will be refunded to your wallet immediately. This cannot be undone,
            but you can submit a new request afterwards.
          </p>
        )}
      </Modal>

      <Modal
        open={Boolean(appealTarget)}
        onClose={() => setAppealTarget(null)}
        title="Appeal this decision"
        subtitle={appealTarget ? appealTarget.taskTitle : ''}
        size="md"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setAppealTarget(null)}>
              Cancel
            </button>
            <button type="submit" form="appeal-form" className="button button--primary" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit appeal'}
            </button>
          </>
        }
      >
        {appealTarget && (
          <form id="appeal-form" className="form" onSubmit={submitAppeal}>
            <div className="callout callout--rose">
              <XCircle size={16} />
              <div>
                <strong>Recorded reason</strong>
                <p>{appealTarget.reason}</p>
              </div>
            </div>
            <label className="field">
              <span>What happened?</span>
              <textarea
                rows={5}
                value={appealText}
                onChange={(event) => setAppealText(event.target.value)}
                placeholder="Describe what you did and anything that helps the reviewer, such as the time you completed the activity."
              />
              <span className="field__hint">Each reward can be appealed once. The outcome is written on the submission.</span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
        )}
      </Modal>
    </div>
  );
}
