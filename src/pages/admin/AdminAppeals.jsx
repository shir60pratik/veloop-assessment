import { useState } from 'react';
import { CheckCircle2, Clock3, Gavel, MessageSquare, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { userById } from '../../lib/store';
import { formatNumber, timeAgo } from '../../lib/format';
import { EmptyState, StatusPill } from '../../components/ui';

export default function AdminAppeals() {
  const { db, admin, resolveAppeal, notify } = useApp();
  const [notes, setNotes] = useState({});
  const [errors, setErrors] = useState({});
  const [busyId, setBusyId] = useState(null);

  const queue = db.submissions
    .filter((sub) => sub.status === 'APPEALED')
    .sort((a, b) => new Date(a.appealAt) - new Date(b.appealAt));

  const resolved = db.submissions
    .filter((sub) => sub.appealMessage && sub.status !== 'APPEALED' && sub.appealAt)
    .sort((a, b) => new Date(b.reviewedAt || b.appealAt) - new Date(a.reviewedAt || a.appealAt))
    .slice(0, 6);

  const decide = (submission, decision) => {
    setBusyId(submission.id);
    setErrors((current) => ({ ...current, [submission.id]: '' }));
    try {
      resolveAppeal(submission.id, admin.id, decision, notes[submission.id] || '');
      notify(
        decision === 'approve'
          ? `${formatNumber(submission.rewardVEs)} VE credited to ${userById(db, submission.userId)?.name}.`
          : 'Appeal reviewed and the original decision was confirmed.',
        decision === 'approve' ? 'success' : 'info',
      );
      setNotes((current) => ({ ...current, [submission.id]: '' }));
    } catch (err) {
      setErrors((current) => ({ ...current, [submission.id]: err.message }));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Operations · Appeals</p>
          <h1>Reward appeals</h1>
          <p className="muted">
            One human review per rejected reward. Credit it or confirm the decision — both need a written note.
          </p>
        </div>
        <StatusPill tone={queue.length ? 'violet' : 'mint'}>
          {queue.length} open appeal{queue.length === 1 ? '' : 's'}
        </StatusPill>
      </div>

      {queue.length ? (
        <div className="appeal-list">
          {queue.map((submission) => {
            const member = userById(db, submission.userId);
            const note = notes[submission.id] || '';
            return (
              <article className="appeal-card" key={submission.id}>
                <div className="appeal-card__head">
                  <span className="appeal-card__icon"><Gavel size={19} /></span>
                  <div>
                    <h2>{submission.taskTitle}</h2>
                    <p>{member?.name} · {member?.email} · appealed {timeAgo(submission.appealAt)}</p>
                  </div>
                  <span className="appeal-card__reward">+{formatNumber(submission.rewardVEs)} VE</span>
                </div>

                <div className="appeal-card__grid">
                  <div className="appeal-quote is-reason">
                    <span><XCircle size={14} /> Recorded rejection reason</span>
                    <p>{submission.reason}</p>
                  </div>
                  <div className="appeal-quote is-appeal">
                    <span><MessageSquare size={14} /> Member&apos;s appeal</span>
                    <p>{submission.appealMessage}</p>
                  </div>
                </div>

                <div className="appeal-card__meta">
                  <span><Clock3 size={13} /> Submitted {timeAgo(submission.submittedAt)}</span>
                  <span><Clock3 size={13} /> Appeal opened {timeAgo(submission.appealAt)}</span>
                  <code>SUB-{submission.id.slice(-4).toUpperCase()}</code>
                </div>

                <div className="appeal-card__decision">
                  <label className="field">
                    <span>Reviewer note (shown to the member)</span>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [submission.id]: event.target.value }))
                      }
                      placeholder="Explain what you checked and why you reached this decision."
                    />
                  </label>
                  {errors[submission.id] && <p className="form-error" role="alert">{errors[submission.id]}</p>}
                  <div className="appeal-card__actions">
                    <button
                      type="button"
                      className="button button--danger-ghost"
                      disabled={busyId === submission.id || note.trim().length < 5}
                      onClick={() => decide(submission, 'reject')}
                    >
                      <XCircle size={15} /> Confirm rejection
                    </button>
                    <button
                      type="button"
                      className="button button--primary"
                      disabled={busyId === submission.id || note.trim().length < 5}
                      onClick={() => decide(submission, 'approve')}
                    >
                      <CheckCircle2 size={15} /> Uphold appeal and credit
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No open appeals"
          description="Every appeal has a recorded outcome. The most recent decisions are listed below."
        />
      )}

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>Recently resolved</h2>
            <p className="muted">Outcomes stay attached to the original submission.</p>
          </div>
        </div>
        {resolved.length ? (
          <ul className="resolved-list">
            {resolved.map((submission) => {
              const member = userById(db, submission.userId);
              return (
                <li key={submission.id}>
                  <span className={`resolved-list__icon ${submission.status === 'CREDITED' ? 'is-ok' : 'is-no'}`}>
                    {submission.status === 'CREDITED' ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                  </span>
                  <div className="resolved-list__copy">
                    <strong>{submission.taskTitle} · {member?.name}</strong>
                    <span>{submission.resolutionNote || 'No note recorded.'}</span>
                  </div>
                  <StatusPill tone={submission.status === 'CREDITED' ? 'mint' : 'rose'}>
                    {submission.status === 'CREDITED' ? 'Credited' : 'Confirmed rejected'}
                  </StatusPill>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted">No appeals have been resolved yet in this demo.</p>
        )}
      </section>
    </div>
  );
}
