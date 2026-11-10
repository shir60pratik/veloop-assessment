import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  Sparkles,
  Timer,
  Trophy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { submissionsOf, taskState } from '../lib/store';
import { REWARD_STATUS } from '../lib/constants';
import {
  cx,
  dateShort,
  daysLeft,
  formatINR,
  formatVE,
  timeAgo,
  vesToInr,
} from '../lib/format';
import { taskIcon } from '../lib/taskIcons';
import { EmptyState, Modal, StatusPill } from '../components/ui';
import { TaskCard } from '../components/rewards/TaskCard';

const CATEGORIES = ['All', 'Surveys', 'Ads', 'Games', 'Referrals', 'Content'];

export default function Tasks() {
  const { db, member, startTask, notify } = useApp();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('reward');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [busy, setBusy] = useState(false);

  const tasks = useMemo(() => {
    if (!member) return [];
    const list = db.tasks
      .map((task) => ({ task, state: taskState(db, member.id, task) }))
      .filter(({ task }) => (category === 'All' ? true : task.category === category))
      .filter(({ task }) => {
        const needle = query.trim().toLowerCase();
        if (!needle) return true;
        return (
          task.title.toLowerCase().includes(needle) ||
          task.summary.toLowerCase().includes(needle) ||
          task.category.toLowerCase().includes(needle)
        );
      });

    return list.sort((a, b) => {
      if (sort === 'time') return a.task.minutes - b.task.minutes;
      if (sort === 'expiry') return new Date(a.task.expiresAt) - new Date(b.task.expiresAt);
      return b.task.rewardVEs - a.task.rewardVEs;
    });
  }, [db, member, category, query, sort]);

  if (!member) return null;

  const selectedId = params.get('task');
  const selected = db.tasks.find((task) => task.id === selectedId) || null;
  const selectedState = selected ? taskState(db, member.id, selected) : null;

  const submissions = submissionsOf(db, member.id);
  const eligibleCount = db.tasks.filter((task) => taskState(db, member.id, task).canStart).length;
  const inProgress = submissions.filter((sub) => ['PENDING', 'APPEALED'].includes(sub.status)).length;
  const openTasks = db.tasks.filter((task) => !taskState(db, member.id, task).expired).length;

  const openTask = (task) => {
    setSubmitted(null);
    setParams({ task: task.id });
  };

  const closeTask = () => {
    setParams({});
    setSubmitted(null);
  };

  const handleStart = (task) => {
    setBusy(true);
    try {
      const submission = startTask(member.id, task.id);
      setSubmitted(submission);
      notify('Activity submitted. It is now pending validation.', 'success');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page tasks-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Activities</p>
          <h1>Choose what you do, and know what it pays</h1>
          <p className="muted">
            {openTasks} open activities · {eligibleCount} you can start now · {inProgress} waiting on validation
          </p>
        </div>
        <Link className="button button--ghost" to="/app/history">
          My submissions <ArrowRight size={15} />
        </Link>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search activities, categories or rewards…"
            aria-label="Search activities"
          />
        </div>
        <div className="sort-select">
          <Filter size={15} />
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort activities">
            <option value="reward">Highest reward</option>
            <option value="time">Quickest first</option>
            <option value="expiry">Ending soonest</option>
          </select>
        </div>
      </div>

      <div className="chip-row" role="tablist" aria-label="Activity categories">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            className={cx('chip', category === item && 'is-active')}
            onClick={() => setCategory(item)}
          >
            {item}
            <span>
              {item === 'All'
                ? db.tasks.length
                : db.tasks.filter((task) => task.category === item).length}
            </span>
          </button>
        ))}
      </div>

      {tasks.length ? (
        <div className="task-grid">
          {tasks.map(({ task, state }) => (
            <TaskCard key={task.id} task={task} state={state} onOpen={openTask} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No activities match that filter"
          description="Try a different category or clear the search."
          action={
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={() => {
                setQuery('');
                setCategory('All');
              }}
            >
              Clear filters
            </button>
          }
        />
      )}

      <div className="info-strip">
        <Sparkles size={17} />
        <p>
          <strong>Why rewards are not instant:</strong> a campaign partner or automated check validates
          every activity. You always see whether it is pending, credited, rejected or under appeal.
        </p>
      </div>

      <TaskModal
        task={selected}
        state={selectedState}
        submitted={submitted}
        busy={busy}
        onClose={closeTask}
        onStart={handleStart}
        level={member}
      />
    </div>
  );
}

function TaskModal({ task, state, submitted, busy, onClose, onStart }) {
  if (!task) return null;
  const Icon = taskIcon(task.icon);
  const expiry = daysLeft(task.expiresAt);
  const latest = submitted || state?.submission;
  const isFresh = Boolean(submitted);
  const activeSubmission = latest && ['PENDING', 'CREDITED', 'APPEALED'].includes(latest.status);

  const footer = (() => {
    if (!state) return null;
    if (isFresh || activeSubmission) {
      return (
        <>
          <Link className="button button--primary" to="/app/history" onClick={onClose}>
            View in history <ArrowRight size={15} />
          </Link>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Done
          </button>
        </>
      );
    }
    return (
      <>
        <button type="button" className="button button--ghost" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => onStart(task)}
          disabled={busy || !state.canStart}
        >
          {busy ? 'Submitting…' : state.canStart ? 'Start & submit for validation' : state.reason || 'Unavailable'}
          {state.canStart && !busy && <ArrowRight size={15} />}
        </button>
      </>
    );
  })();

  return (
    <Modal
      open={Boolean(task)}
      onClose={onClose}
      size="lg"
      title={task.title}
      subtitle={`${task.category} · ${task.minutes} min · ${task.difficulty}`}
      footer={footer}
    >
      <div className="task-detail">
        <div className="task-detail__banner">
          <span className={`task-detail__icon tone-bg--${task.accent}`}>
            <Icon size={24} />
          </span>
          <div>
            <p className="task-detail__reward">{formatVE(task.rewardVEs)}</p>
            <p className="muted">≈ {formatINR(vesToInr(task.rewardVEs))} when credited · 10 VE = ₹1</p>
          </div>
          <StatusPill tone={latest ? REWARD_STATUS[latest.status]?.tone : state?.locked ? 'violet' : state?.expired ? 'muted' : 'mint'}>
            {latest
              ? REWARD_STATUS[latest.status]?.label
              : state?.locked
                ? `Level ${task.minLevel} required`
                : state?.expired
                  ? 'Expired'
                  : 'Eligible'}
          </StatusPill>
        </div>

        <p className="task-detail__brief">{task.brief}</p>

        <div className="task-detail__grid">
          <div>
            <h3 className="mini-heading"><CheckCircle2 size={15} /> Conditions</h3>
            <ul className="check-list">
              {task.conditions.map((condition) => (
                <li key={condition}><CheckCircle2 size={14} /> {condition}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mini-heading"><Timer size={15} /> At a glance</h3>
            <dl className="fact-list">
              <div><dt>Reward</dt><dd>{formatVE(task.rewardVEs)}</dd></div>
              <div><dt>Effort</dt><dd>{task.minutes} minutes</dd></div>
              <div><dt>Expires</dt><dd>{dateShort(task.expiresAt)}</dd></div>
              <div><dt>Validation</dt><dd>Partner or automated check</dd></div>
            </dl>
          </div>
        </div>

        <div className="callout callout--amber">
          <AlertTriangle size={16} />
          <div>
            <strong>Why a reward might not be approved</strong>
            <p>{task.denialHint}</p>
          </div>
        </div>

        {state?.locked && (
          <div className="callout callout--violet">
            <Trophy size={16} />
            <div>
              <strong>Unlocks at Level {task.minLevel}</strong>
              <p>Keep completing activities to earn XP and raise your level.</p>
            </div>
          </div>
        )}

        {state?.expired && (
          <div className="callout callout--muted">
            <CalendarClock size={16} />
            <div>
              <strong>This campaign has closed</strong>
              <p>It ended {dateShort(task.expiresAt)} and no longer accepts submissions.</p>
            </div>
          </div>
        )}

        {latest && !isFresh && (
          <div className={cx('callout', latest.status === 'CREDITED' ? 'callout--mint' : latest.status === 'REJECTED' ? 'callout--rose' : 'callout--violet')}>
            <Clock3 size={16} />
            <div>
              <strong>{REWARD_STATUS[latest.status]?.label}</strong>
              <p>{REWARD_STATUS[latest.status]?.description}</p>
              <p className="callout__meta">
                Submitted {timeAgo(latest.submittedAt)}
                {latest.reason ? ` · Reason: ${latest.reason}` : ''}
              </p>
            </div>
          </div>
        )}

        {isFresh && (
          <div className="callout callout--violet">
            <BadgeCheck size={16} />
            <div>
              <strong>Submitted for validation</strong>
              <p>
                This demo resolves validation in about 20 seconds. In production the partner window is
                shown on the task. Your reference is{' '}
                <code>SUB-{submitted.id.slice(-4).toUpperCase()}</code>.
              </p>
              <p className="callout__meta">
                {formatVE(submitted.rewardVEs)} is pending and does not count toward your balance yet.
              </p>
            </div>
          </div>
        )}

        {!isFresh && !latest && state?.canStart && (
          <p className="task-detail__fineprint">
            Starting will submit the activity for validation. In this demo the validation step is
            compressed to about 20 seconds so you can see the full lifecycle.
          </p>
        )}

        {expiry !== null && expiry >= 0 && (
          <p className="task-detail__fineprint">
            <CalendarClock size={13} /> Ends {dateShort(task.expiresAt)}
            {expiry <= 7 ? ` · ${expiry} day${expiry === 1 ? '' : 's'} left` : ''}
          </p>
        )}
      </div>
    </Modal>
  );
}
