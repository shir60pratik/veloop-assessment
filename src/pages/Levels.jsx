import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Flame,
  Gamepad2,
  Gift,
  Info,
  Lock,
  Play,
  Sparkles,
  Target,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { XP_PER_LEVEL } from '../lib/constants';
import {
  LEVELS,
  MAX_LEVEL,
  gameConfigForLevel,
  gameRunsForLevel,
  levelMeta,
  levelRange,
  levelStatus,
} from '../lib/levels';
import { formatNumber } from '../lib/format';
import { LevelBadge } from '../components/levels/LevelBadge';
import { LevelGame } from '../components/levels/LevelGame';
import { Modal, StatusPill } from '../components/ui';

const STATUS = {
  complete: { label: 'Unlocked', tone: 'mint', Icon: BadgeCheck },
  current: { label: 'You are here', tone: 'violet', Icon: Sparkles },
  next: { label: 'Next milestone', tone: 'amber', Icon: Zap },
  locked: { label: 'Locked', tone: 'muted', Icon: Lock },
};

const EARN_WAYS = [
  {
    icon: Flame,
    tone: 'amber',
    title: 'Daily check-in',
    amount: '+20 XP',
    detail: 'Claim once a day. The XP lands on top of your +5 VE streak reward.',
  },
  {
    icon: Target,
    tone: 'violet',
    title: 'Validated activities',
    amount: '5–150+ XP',
    detail: 'Every approved task, survey, ad or campaign credits XP along with its VE reward.',
  },
  {
    icon: Gamepad2,
    tone: 'mint',
    title: 'XP Match',
    amount: 'up to 150 XP',
    detail: 'Clear the loop board before the timer runs out. Better runs mean bigger XP.',
  },
  {
    icon: Gift,
    tone: 'sky',
    title: 'Level bonus',
    amount: '100–7,500 VE',
    detail: 'Each new level unlocks a one-time VE bonus, credited straight to your wallet.',
  },
];

function padLevel(level) {
  return String(level).padStart(2, '0');
}

export default function Levels() {
  const { db, member, balance, level } = useApp();
  const [barReady, setBarReady] = useState(false);
  const [selected, setSelected] = useState(null);
  const [edges, setEdges] = useState({ prev: false, next: true });
  const railRef = useRef(null);
  const currentRef = useRef(null);

  const meta = levelMeta(level.level);
  const next = level.isMax ? null : levelMeta(level.level + 1);
  const remaining = level.isMax ? 0 : Math.max(0, XP_PER_LEVEL - level.into);
  const percent = Math.round(level.progress * 100);

  useEffect(() => {
    const timer = window.setTimeout(() => setBarReady(true), 240);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const card = currentRef.current;
    if (!rail || !card) return undefined;
    const center = () => {
      const target = card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
      rail.scrollTo({ left: Math.max(0, target), behavior: 'auto' });
      const max = rail.scrollWidth - rail.clientWidth;
      setEdges({ prev: rail.scrollLeft > 8, next: rail.scrollLeft < max - 8 });
    };
    const frame = window.requestAnimationFrame(center);
    const timer = window.setTimeout(center, 420);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [level.level, member?.id]);

  useEffect(() => {
    setBarReady(false);
    const timer = window.setTimeout(() => setBarReady(true), 160);
    return () => window.clearTimeout(timer);
  }, [level.level, member?.xp]);

  if (!member) return null;

  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(260, rail.clientWidth * 0.62), behavior: 'smooth' });
  };

  const onRailScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setEdges({ prev: rail.scrollLeft > 8, next: rail.scrollLeft < max - 8 });
  };

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectedMeta = selected ? levelMeta(selected) : null;
  const selectedStatus = selected ? levelStatus(selected, level.level) : 'locked';
  const selectedState = STATUS[selectedStatus];
  const SelectedStateIcon = selectedState.Icon;
  const selectedConfig = selected ? gameConfigForLevel(selected) : null;
  const selectedRequired = selected ? (selected - 1) * XP_PER_LEVEL : 0;
  const selectedMissing = Math.max(0, selectedRequired - (member.xp || 0));
  const gamesPlayed = (db.gameRuns || []).filter((run) => run.userId === member.id).length;

  const openLevel = (levelNumber) => setSelected(levelNumber);

  const openGame = () => {
    setSelected(null);
    window.setTimeout(() => scrollToSection('xp-match'), 120);
  };

  return (
    <div className="page levels-page">
      <section className="levels-hero">
        <div className="levels-hero__copy">
          <span className="levels-hero__kicker">
            <Sparkles size={14} /> Season 1 · The Loop
          </span>
          <h1>
            Climb the loop.
            <span className="text-gradient"> Collect every badge.</span>
          </h1>
          <p className="levels-hero__lede">
            Twelve levels, twelve one-of-a-kind badges and a real reward every time you climb.
            Earn XP from check-ins, validated activities and the XP Match game, then watch your
            next milestone unlock.
          </p>
          <div className="levels-hero__actions">
            <button type="button" className="button button--primary" onClick={() => scrollToSection('xp-match')}>
              <Play size={16} /> Play XP Match
            </button>
            <button type="button" className="button button--ghost" onClick={() => scrollToSection('journey')}>
              Explore the journey <ArrowRight size={16} />
            </button>
          </div>
          <div className="levels-hero__meta">
            <span><Trophy size={15} /> Level {level.level} of {MAX_LEVEL}</span>
            <span><Flame size={15} /> {member.streak}-day streak</span>
            <span><Wallet size={15} /> {formatNumber(balance)} VE</span>
          </div>
        </div>

        <div className="levels-hero__stage" aria-hidden="true">
          <span className="hero-orbit hero-orbit--one" />
          <span className="hero-orbit hero-orbit--two" />
          <span className="hero-orbit hero-orbit--three" />
          <span className="hero-pulse" />
          <span className="hero-spark hero-spark--one">✦</span>
          <span className="hero-spark hero-spark--two">✦</span>
          <span className="hero-spark hero-spark--three">✦</span>
          <span className="hero-spark hero-spark--four">✦</span>
          <div className="levels-hero__badge">
            <LevelBadge level={level.level} size="xl" status="current" />
          </div>
          <span className="hero-chip hero-chip--xp">
            <Zap size={14} />
            <span><strong>{formatNumber(member.xp)}</strong><em>lifetime XP</em></span>
          </span>
          <span className="hero-chip hero-chip--tier">
            <Crown size={14} />
            <span><strong>{meta.name}</strong><em>current badge</em></span>
          </span>
          <span className="hero-chip hero-chip--streak">
            <Flame size={14} />
            <span><strong>{member.streak} days</strong><em>streak alive</em></span>
          </span>
        </div>
      </section>

      <section
        className="level-progress"
        aria-labelledby="level-progress-title"
        style={{ '--accent': meta.glow, '--accent-soft': meta.from }}
      >
        <span className="level-progress__wash" aria-hidden="true" />
        <div className="level-progress__badge">
          <LevelBadge level={level.level} size="lg" status="current" />
          <span className="level-progress__badge-cap">Level {padLevel(level.level)}</span>
        </div>

        <div className="level-progress__main">
          <div className="level-progress__head">
            <div>
              <p className="eyebrow">Current standing</p>
              <h2 id="level-progress-title">{meta.name}</h2>
              <p className="muted">{meta.tagline}</p>
            </div>
            <StatusPill tone={level.isMax ? 'amber' : 'violet'}>
              {level.isMax ? 'Maximum level' : `Level ${level.level} of ${MAX_LEVEL}`}
            </StatusPill>
          </div>

          <div className={level.isMax ? 'xp-bar is-complete' : 'xp-bar'}>
            <div className="xp-bar__labels">
              <span>
                <strong>{level.isMax ? XP_PER_LEVEL : level.into}</strong> / {XP_PER_LEVEL} XP
              </span>
              <span>{percent}%</span>
            </div>
            <div
              className="xp-bar__track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label={`Level ${level.level} progress`}
            >
              <span
                className="xp-bar__fill"
                style={{ width: barReady || level.isMax ? `${percent}%` : '0%' }}
              >
                <span className="xp-bar__shine" />
              </span>
              <span
                className="xp-bar__marker"
                style={{ left: barReady || level.isMax ? `${percent}%` : '0%' }}
              >
                <Sparkles size={11} />
              </span>
            </div>
            <div className="xp-bar__scale">
              <span>Level {level.level}</span>
              <span>{level.isMax ? 'All badges unlocked' : `Level ${level.level + 1}`}</span>
            </div>
          </div>

          <div className="level-progress__facts">
            <div>
              <Zap size={15} />
              <span><strong>{formatNumber(member.xp)}</strong> lifetime XP</span>
            </div>
            <div>
              <Target size={15} />
              <span>
                <strong>{level.isMax ? '0' : formatNumber(remaining)}</strong>{' '}
                {level.isMax ? 'XP to stay immortal' : 'XP to next level'}
              </span>
            </div>
            <div>
              <Gift size={15} />
              <span>
                <strong>{level.isMax ? 'All collected' : `+${formatNumber(next.bonusVE)} VE`}</strong>{' '}
                {level.isMax ? 'in level bonuses' : 'next unlock bonus'}
              </span>
            </div>
          </div>
        </div>

        <div className="level-progress__next">
          {next ? (
            <>
              <p className="eyebrow">Next unlock</p>
              <div className="level-progress__next-badge">
                <LevelBadge level={next.level} size="sm" status="next" showLabel={false} />
              </div>
              <strong>{next.name}</strong>
              <span className="level-progress__next-range">{levelRange(next.level)}</span>
              <span className="level-progress__next-perk"><Sparkles size={13} /> {next.perk}</span>
              <span className="level-progress__next-reward">
                <Gift size={13} /> +{formatNumber(next.bonusVE)} VE
              </span>
            </>
          ) : (
            <>
              <p className="eyebrow">Final badge</p>
              <div className="level-progress__next-badge">
                <LevelBadge level={MAX_LEVEL} size="sm" status="current" showLabel={false} />
              </div>
              <strong>VELoop Immortal</strong>
              <span className="level-progress__next-range">Every level complete</span>
              <span className="level-progress__next-perk"><Crown size={13} /> Maximum prestige</span>
              <span className="level-progress__next-reward"><Gift size={13} /> 7,500 VE claimed</span>
            </>
          )}
        </div>
      </section>

      <section id="journey" className="level-journey" aria-labelledby="journey-title">
        <div className="level-journey__head">
          <div>
            <p className="eyebrow">The level journey</p>
            <h2 id="journey-title">Every milestone, one long loop</h2>
            <p className="muted">
              Glide through all {MAX_LEVEL} levels. Completed badges stay lit, your current level
              sits centre stage and locked milestones preview what is next.
            </p>
          </div>
          <div className="level-journey__controls">
            <div className="level-journey__legend" aria-hidden="true">
              <span><i className="legend-dot legend-dot--complete" /> Unlocked</span>
              <span><i className="legend-dot legend-dot--current" /> Current</span>
              <span><i className="legend-dot legend-dot--next" /> Next</span>
              <span><i className="legend-dot legend-dot--locked" /> Locked</span>
            </div>
            <div className="level-journey__arrows">
              <button
                type="button"
                className="icon-button"
                onClick={() => scrollRail(-1)}
                disabled={!edges.prev}
                aria-label="Scroll to earlier levels"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => scrollRail(1)}
                disabled={!edges.next}
                aria-label="Scroll to later levels"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div
          className="level-journey__rail"
          ref={railRef}
          onScroll={onRailScroll}
          tabIndex={0}
          aria-label="Level journey, scroll horizontally"
        >
          <div className="level-journey__track">
            {LEVELS.map((entry) => {
              const status = levelStatus(entry.level, level.level);
              const state = STATUS[status];
              const StateIcon = state.Icon;
              const toneStyle = {
                '--tone-from': entry.from,
                '--tone-to': entry.to,
                '--tone-glow': entry.glow,
                '--tone-ink': entry.ink,
              };
              return (
                <article
                  key={entry.level}
                  className={`journey-step journey-step--${status}`}
                  style={toneStyle}
                  ref={entry.level === level.level ? currentRef : null}
                >
                  <div className="journey-step__node">
                    <StateIcon size={13} />
                  </div>
                  <button
                    type="button"
                    className="journey-card"
                    onClick={() => openLevel(entry.level)}
                    aria-label={`View details for Level ${entry.level}, ${entry.name}`}
                  >
                    <span className="journey-card__top">
                      <span className={`journey-card__state journey-card__state--${status}`}>
                        <StateIcon size={11} /> {state.label}
                      </span>
                      <span className="journey-card__level">L{padLevel(entry.level)}</span>
                    </span>

                    <span className="journey-card__badge">
                      <LevelBadge level={entry.level} size="md" status={status} />
                    </span>

                    <span className="journey-card__range">{levelRange(entry.level)}</span>
                    <h3>{entry.name}</h3>
                    <span className="journey-card__tagline">{entry.tagline}</span>

                    <span className="journey-card__rule" aria-hidden="true" />

                    <span className="journey-card__meta">
                      <span><Zap size={13} /> {entry.level <= level.level ? `${formatNumber((entry.level - 1) * XP_PER_LEVEL)} XP` : `${formatNumber((entry.level - 1) * XP_PER_LEVEL)} XP needed`}</span>
                      <span><Gift size={13} /> +{formatNumber(entry.bonusVE)} VE</span>
                    </span>

                    <span className="journey-card__perk">
                      <Sparkles size={13} /> {entry.perk}
                    </span>

                    {status === 'current' && (
                      <span className="journey-card__current">
                        <span className="journey-card__current-track">
                          <span
                            className="journey-card__current-fill"
                            style={{ width: `${Math.round(level.progress * 100)}%` }}
                          />
                        </span>
                        <span>{level.into} / {XP_PER_LEVEL} XP inside this level</span>
                      </span>
                    )}

                    <span className="journey-card__cta">
                      View badge details <ArrowRight size={13} />
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <p className="level-journey__hint">
          <Info size={13} /> Drag, swipe or use the arrows to travel the whole loop. Tap any badge
          to open its full reward sheet.
        </p>
      </section>

      <LevelGame />

      <section className="xp-guide" aria-labelledby="xp-guide-title">
        <div className="xp-guide__head">
          <div>
            <p className="eyebrow">The XP economy</p>
            <h2 id="xp-guide-title">Four honest ways to move up</h2>
            <p className="muted">
              Every XP change is recorded once. Level bonuses are credited automatically the moment
              you cross a threshold.
            </p>
          </div>
          <span className="xp-guide__played">
            <Gamepad2 size={15} /> {formatNumber(gamesPlayed)} XP Match runs played
          </span>
        </div>

        <div className="xp-guide__grid">
          {EARN_WAYS.map(({ icon: Icon, tone, title, amount, detail }) => (
            <article key={title} className={`xp-way xp-way--${tone}`}>
              <span className="xp-way__icon"><Icon size={19} /></span>
              <span className="xp-way__amount">{amount}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>

        <div className="xp-guide__rule">
          <Info size={16} />
          <p>
            Levels are linear: <strong>300 XP per level</strong>, capped at Level {MAX_LEVEL}.
            If one activity carries you across two thresholds, both one-time VE bonuses are
            credited in the same pass. XP never expires and never resets.
          </p>
        </div>
      </section>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selectedMeta ? `Level ${padLevel(selected)} · ${selectedMeta.name}` : ''}
        subtitle={selectedMeta?.tagline}
        size="lg"
        footer={
          selectedMeta && (
            <div className="level-detail__footer">
              <button type="button" className="button button--ghost" onClick={() => setSelected(null)}>
                Close
              </button>
              {selectedStatus === 'complete' ? (
                <button type="button" className="button button--mint" onClick={() => setSelected(null)}>
                  <BadgeCheck size={15} /> Badge already collected
                </button>
              ) : (
                <button type="button" className="button button--primary" onClick={openGame}>
                  <Play size={15} /> Earn XP now
                </button>
              )}
            </div>
          )
        }
      >
        {selectedMeta && (
          <div className={`level-detail level-detail--${selectedStatus}`}>
            <div
              className="level-detail__art"
              style={{ '--tone-glow': selectedMeta.glow, '--tone-from': selectedMeta.from }}
            >
              <span className="level-detail__halo" aria-hidden="true" />
              <LevelBadge level={selected} size="xl" status={selectedStatus} />
              <span className={`level-detail__state level-detail__state--${selectedStatus}`}>
                <SelectedStateIcon size={13} /> {selectedState.label}
              </span>
            </div>

            <div className="level-detail__body">
              <div className="level-detail__facts">
                <div>
                  <span><Target size={14} /> XP requirement</span>
                  <strong>{levelRange(selected)}</strong>
                </div>
                <div>
                  <span><Gift size={14} /> Unlock bonus</span>
                  <strong>+{formatNumber(selectedMeta.bonusVE)} VE</strong>
                </div>
                <div>
                  <span><Sparkles size={14} /> Level perk</span>
                  <strong>{selectedMeta.perk}</strong>
                </div>
                <div>
                  <span><Gamepad2 size={14} /> Daily game</span>
                  <strong>
                    {gameRunsForLevel(selected)} runs · {selectedConfig.pairs} pairs · {selectedConfig.seconds}s
                  </strong>
                </div>
              </div>

              <div className={`level-detail__note level-detail__note--${selectedStatus}`}>
                {selectedStatus === 'complete' && (
                  <p>
                    <BadgeCheck size={15} /> This badge is already in your collection. Its VE
                    bonus has been credited to your wallet.
                  </p>
                )}
                {selectedStatus === 'current' && (
                  <p>
                    <Sparkles size={15} /> You are living this level right now with{' '}
                    <strong>{level.into} XP</strong> inside it.{' '}
                    {level.isMax ? 'This is the top of the loop.' : `${formatNumber(remaining)} XP to the next badge.`}
                  </p>
                )}
                {(selectedStatus === 'next' || selectedStatus === 'locked') && (
                  <p>
                    <Lock size={15} /> Locked for now.{' '}
                    <strong>{formatNumber(selectedMissing)} XP</strong> stands between your current
                    total and this badge. XP Match is the fastest way to close the gap.
                  </p>
                )}
              </div>

              <div className="level-detail__next">
                <span>Next after this</span>
                {selected < MAX_LEVEL ? (
                  <div>
                    <LevelBadge level={selected + 1} size="xs" status="locked" showLabel={false} />
                    <div>
                      <strong>{levelMeta(selected + 1).name}</strong>
                      <span>{levelMeta(selected + 1).perk} · +{formatNumber(levelMeta(selected + 1).bonusVE)} VE</span>
                    </div>
                  </div>
                ) : (
                  <p>You have reached the final badge in the loop.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="levels-signoff">
        <Trophy size={17} />
        <p>
          Your level is public only to you. XP and badges are retained in this demo account so you
          can test the full journey end to end.
        </p>
        <button type="button" className="text-link" onClick={() => scrollToSection('journey')}>
          Back to the journey <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
