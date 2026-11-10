import { ArrowRight, CheckCircle2, Clock3, Flame, Lock, Sparkles } from 'lucide-react';
import { REWARD_STATUS } from '../../lib/constants';
import { daysLeft, formatINR, formatVE, vesToInr } from '../../lib/format';
import { taskIcon } from '../../lib/taskIcons';
import { StatusPill } from '../ui';

export function TaskCard({ task, state, onOpen }) {
  const Icon = taskIcon(task.icon);
  const expiry = daysLeft(task.expiresAt);
  const submission = state.submission;

  let tone = 'mint';
  let badge = 'Eligible';
  if (state.locked) {
    tone = 'violet';
    badge = `Level ${task.minLevel} required`;
  } else if (state.expired) {
    tone = 'muted';
    badge = 'Expired';
  } else if (submission) {
    tone = REWARD_STATUS[submission.status]?.tone || 'muted';
    badge = REWARD_STATUS[submission.status]?.label || submission.status;
  }

  return (
    <article className={`task-card ${state.expired ? 'task-card--expired' : ''}`}>
      <div className="task-card__top">
        <span className={`task-card__icon tone-bg--${task.accent}`}>
          <Icon size={19} />
        </span>
        <StatusPill tone={tone}>{badge}</StatusPill>
      </div>

      <p className="task-card__meta">
        <span>{task.category}</span>
        <span>·</span>
        <span>{task.minutes} min</span>
        <span>·</span>
        <span>{task.difficulty}</span>
      </p>

      <h3>{task.title}</h3>
      <p className="task-card__summary">{task.summary}</p>

      <ul className="task-card__conditions">
        {task.conditions.slice(0, 2).map((condition) => (
          <li key={condition}>
            <CheckCircle2 size={13} />
            {condition}
          </li>
        ))}
        {task.conditions.length > 2 && (
          <li className="task-card__more">+{task.conditions.length - 2} more condition{task.conditions.length - 2 === 1 ? '' : 's'}</li>
        )}
      </ul>

      <div className="task-card__footer">
        <div className="task-card__reward">
          <strong>{formatVE(task.rewardVEs)}</strong>
          <span>≈ {formatINR(vesToInr(task.rewardVEs))}</span>
        </div>
        <button type="button" className="button button--ghost button--sm" onClick={() => onOpen(task)}>
          View details <ArrowRight size={14} />
        </button>
      </div>

      <div className="task-card__footnote">
        {state.locked ? (
          <><Lock size={13} /> Unlocks at Level {task.minLevel}</>
        ) : state.expired ? (
          <><Clock3 size={13} /> Closed {Math.abs(expiry)} day{Math.abs(expiry) === 1 ? '' : 's'} ago</>
        ) : expiry !== null && expiry <= 7 ? (
          <><Flame size={13} /> Ends in {expiry} day{expiry === 1 ? '' : 's'}</>
        ) : (
          <><Sparkles size={13} /> Reward validated after completion</>
        )}
      </div>
    </article>
  );
}
