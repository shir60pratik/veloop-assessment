import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Flame,
  Gift,
  ListChecks,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  redemptionsOf,
  submissionsOf,
  taskState,
  transactionsOf,
} from '../lib/store';
import {
  formatINR,
  formatNumber,
  formatVE,
  timeAgo,
  todayKey,
  vesToInr,
} from '../lib/format';
import { REWARD_STATUS, XP_PER_LEVEL } from '../lib/constants';
import { EmptyState, ProgressBar, SectionHeading, StatCard, StatusPill } from '../components/ui';
import { TaskCard } from '../components/rewards/TaskCard';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { db, member, balance, pending, level, claimDaily, notify } = useApp();
  const navigate = useNavigate();

  if (!member) return null;

  const submissions = submissionsOf(db, member.id);
  const transactions = transactionsOf(db, member.id);
  const redemptions = redemptionsOf(db, member.id);
  const waiting = submissions.filter((sub) => ['PENDING', 'APPEALED'].includes(sub.status));
  const credited = submissions.filter((sub) => sub.status === 'CREDITED');
  const lifetime = transactions
    .filter((tx) => tx.kind === 'credit' && !tx.title.startsWith('Refund'))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const inFlight = redemptions.filter((request) =>
    ['UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(request.status),
  );

  const recommended = db.tasks
    .map((task) => ({ task, state: taskState(db, member.id, task) }))
    .filter(({ state }) => state.canStart)
    .sort((a, b) => b.task.rewardVEs - a.task.rewardVEs)
    .slice(0, 3);

  const claimedToday = member.lastCheckIn === todayKey();

  const claim = () => {
    try {
      const result = claimDaily(member.id);
      notify(`Daily reward claimed: +5 VE and 20 XP. Streak day ${result.streak}.`, 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const openTask = (task) => navigate(`/app/tasks?task=${task.id}`);

  return (
    <div className="page dashboard">
      <div className="page-head">
        <div>
          <p className="eyebrow">{greeting()}, {member.name.split(' ')[0]}</p>
          <h1>Your rewards, without the guesswork</h1>
          <p className="muted">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {' · '}
            {waiting.length ? `${waiting.length} item${waiting.length === 1 ? '' : 's'} waiting on validation` : 'Nothing waiting on validation'}
          </p>
        </div>
        <Link className="button button--primary" to="/app/tasks">
          Browse activities <ArrowRight size={16} />
        </Link>
      </div>

      <section className="dash-hero">
        <div className="balance-card">
          <div className="balance-card__head">
            <span className="muted">Available balance</span>
            <StatusPill tone="mint">Ready to redeem</StatusPill>
          </div>
          <p className="balance-card__amount">
            {formatNumber(balance)} <span>VE</span>
          </p>
          <p className="balance-card__inr">≈ {formatINR(vesToInr(balance))} · 10 VE = ₹1</p>
          <div className="balance-card__actions">
            <Link className="button button--primary button--sm" to="/app/redeem">
              <Gift size={15} /> Redeem VEs
            </Link>
            <Link className="button button--ghost button--sm" to="/app/wallet">
              <Wallet size={15} /> View ledger
            </Link>
          </div>
          <div className="balance-card__meta">
            <span>
              <strong>{formatVE(pending)}</strong> awaiting validation
            </span>
            <span>
              <strong>{inFlight.length}</strong> withdrawal{inFlight.length === 1 ? '' : 's'} in flight
            </span>
          </div>
        </div>

        <div className="level-card">
          <div className="level-card__head">
            <div>
              <p className="muted">Your progress</p>
              <p className="level-card__level">Level {level.level}</p>
            </div>
            <span className="level-card__badge"><Trophy size={18} /></span>
          </div>
          <ProgressBar value={level.progress} label={`${level.into} / ${XP_PER_LEVEL} XP`} />
          <p className="level-card__hint">
            {level.nextAt - member.xp} XP until Level {level.level + 1}. You earn XP when a reward is credited.
          </p>

          <div className="checkin">
            <div className="checkin__copy">
              <span className={`checkin__flame ${claimedToday ? 'is-done' : ''}`}><Flame size={18} /></span>
              <div>
                <strong>{member.streak}-day streak</strong>
                <span>{claimedToday ? 'Claimed today. Come back tomorrow.' : '+5 VE and 20 XP for today’s check-in.'}</span>
              </div>
            </div>
            <button
              type="button"
              className={`button button--sm ${claimedToday ? 'button--ghost' : 'button--mint'}`}
              onClick={claim}
              disabled={claimedToday}
            >
              {claimedToday ? 'Claimed' : 'Claim +5 VE'}
            </button>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard icon={Clock3} label="Awaiting validation" value={formatVE(pending)} hint={`${waiting.length} item${waiting.length === 1 ? '' : 's'}`} tone="amber" />
        <StatCard icon={Trophy} label="Lifetime earned" value={formatVE(lifetime)} hint="Excludes refunds" tone="violet" />
        <StatCard icon={ListChecks} label="Rewards credited" value={credited.length} hint="Validated activities" tone="mint" />
        <StatCard icon={Users} label="Verified referrals" value={member.referrals} hint="250 VE per friend" tone="sky" />
      </section>

      {waiting.length > 0 && (
        <section className="panel panel--flush">
          <div className="panel__head">
            <div>
              <h2>Waiting on validation</h2>
              <p className="muted">Pending rewards do not count toward your spendable balance yet.</p>
            </div>
            <Link className="text-link" to="/app/history">
              Open history <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="validation-list">
            {waiting.map((sub) => (
              <li key={sub.id}>
                <span className={`validation-list__icon tone-bg--${REWARD_STATUS[sub.status].tone}`}>
                  <Clock3 size={17} />
                </span>
                <div className="validation-list__copy">
                  <strong>{sub.taskTitle}</strong>
                  <span>
                    Submitted {timeAgo(sub.submittedAt)} ·{' '}
                    {sub.status === 'PENDING'
                      ? 'demo validation resolves in about 20 seconds'
                      : 'with a human reviewer'}
                  </span>
                </div>
                <span className="validation-list__reward">+{formatVE(sub.rewardVEs)}</span>
                <StatusPill tone={REWARD_STATUS[sub.status].tone}>{REWARD_STATUS[sub.status].label}</StatusPill>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionHeading
          eyebrow="Picked for you"
          title="Activities worth your time"
          description="Each one shows the reward, the effort and the conditions before you commit."
          action={<Link className="text-link" to="/app/tasks">All activities <ArrowRight size={14} /></Link>}
        />
        {recommended.length ? (
          <div className="task-grid">
            {recommended.map(({ task, state }) => (
              <TaskCard key={task.id} task={task} state={state} onOpen={openTask} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="Everything available is already in progress"
            description="You have submitted all the open activities. Check back when new campaigns arrive."
            action={<Link className="button button--ghost button--sm" to="/app/history">See your submissions</Link>}
          />
        )}
      </section>

      <div className="dash-columns">
        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Recent wallet activity</h2>
              <p className="muted">Every reward and refund has a dated ledger row.</p>
            </div>
            <Link className="text-link" to="/app/wallet">Full ledger</Link>
          </div>
          {transactions.length ? (
            <ul className="activity-list">
              {transactions.slice(0, 6).map((tx) => (
                <li key={tx.id}>
                  <span className={`activity-list__icon ${tx.kind === 'credit' ? 'is-credit' : 'is-debit'}`}>
                    {tx.kind === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </span>
                  <div className="activity-list__copy">
                    <strong>{tx.title}</strong>
                    <span>
                      {timeAgo(tx.createdAt)}
                      {tx.ref ? ` · ${tx.ref}` : ''}
                    </span>
                  </div>
                  <span className={`activity-list__amount ${tx.kind === 'credit' ? 'is-credit' : 'is-debit'}`}>
                    {tx.kind === 'credit' ? '+' : '−'}{formatNumber(tx.amount)} VE
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Wallet} title="No activity yet" description="Complete your first activity to start a ledger." />
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>What the statuses mean</h2>
              <p className="muted">No vague “processing” labels.</p>
            </div>
          </div>
          <ul className="status-guide">
            {Object.entries(REWARD_STATUS).map(([key, status]) => (
              <li key={key}>
                <StatusPill tone={status.tone}>{status.label}</StatusPill>
                <p>{status.description}</p>
              </li>
            ))}
          </ul>
          <div className="panel__note">
            <Sparkles size={15} />
            Need a second look? Rejected rewards can be appealed once from History.
          </div>
        </section>
      </div>
    </div>
  );
}
