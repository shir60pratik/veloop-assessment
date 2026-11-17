import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Coins,
  Crown,
  Flame,
  Gem,
  Gift,
  Play,
  RotateCcw,
  Rocket,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  gameConfigForLevel,
  gameRunsForLevel,
  levelMeta,
} from '../../lib/levels';
import { gameRunsOf, gameRunsToday } from '../../lib/store';
import { cx, formatNumber } from '../../lib/format';
import { LevelBadge } from './LevelBadge';

const CARD_ICONS = [
  { icon: Gift, tone: 'violet' },
  { icon: Zap, tone: 'amber' },
  { icon: Star, tone: 'sky' },
  { icon: Crown, tone: 'gold' },
  { icon: Gem, tone: 'mint' },
  { icon: Flame, tone: 'rose' },
  { icon: Target, tone: 'sky' },
  { icon: Rocket, tone: 'violet' },
  { icon: Trophy, tone: 'gold' },
  { icon: Coins, tone: 'mint' },
];

function shuffle(items) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function buildDeck(pairs) {
  const picks = shuffle(CARD_ICONS).slice(0, pairs);
  return shuffle(
    picks.flatMap((entry, index) => [
      { uid: `${index}-a`, pairId: index, icon: entry.icon, tone: entry.tone, matched: false },
      { uid: `${index}-b`, pairId: index, icon: entry.icon, tone: entry.tone, matched: false },
    ]),
  );
}

function xpForRun(pairs, timeLeft) {
  return Math.max(0, Math.min(150, Math.round(pairs * 8 + timeLeft * 1.5)));
}

export function LevelGame() {
  const { db, member, level, awardGameXp, notify } = useApp();
  const [phase, setPhase] = useState('idle');
  const [run, setRun] = useState(null);
  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const submittedRef = useRef(false);
  const busyRef = useRef(false);
  const finishRef = useRef(() => {});

  const liveConfig = useMemo(() => gameConfigForLevel(level.level), [level.level]);
  const config = run || liveConfig;
  const runs = member ? gameRunsToday(db, member.id) : [];
  const allRuns = member ? gameRunsOf(db, member.id) : [];
  const limit = gameRunsForLevel(level.level);
  const playsLeft = Math.max(0, limit - runs.length);
  const best = allRuns.reduce((top, entry) => Math.max(top, entry.score || 0), 0);
  const idleDeck = useMemo(() => buildDeck(liveConfig.pairs), [liveConfig.pairs]);
  const board = deck.length ? deck : idleDeck;
  const columns = config.columns || 4;

  const finish = (won) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const finalPairs = won ? (run?.pairs || config.pairs) : matchedPairs;
    const finalTime = won ? timeLeft : 0;
    const earnedXp = xpForRun(finalPairs, finalTime);
    const finalScore = finalPairs * 100 + finalTime * 10;
    setPhase(won ? 'won' : 'lost');
    setScore(finalScore);
    setResult({
      won,
      pairs: finalPairs,
      totalPairs: run?.pairs || config.pairs,
      timeLeft: finalTime,
      xp: earnedXp,
      score: finalScore,
      awarding: true,
      error: '',
      levelBefore: level.level,
      levelAfter: level.level,
      bonuses: [],
    });

    try {
      const award = awardGameXp(member.id, {
        score: finalScore,
        xp: earnedXp,
        pairs: finalPairs,
        timeLeft: finalTime,
      });
      setResult((current) => ({
        ...current,
        awarding: false,
        levelBefore: award.levelBefore,
        levelAfter: award.levelAfter,
        bonuses: award.bonuses,
        playsLeft: award.playsLeft,
      }));
      notify(
        award.levelAfter > award.levelBefore
          ? `Level ${award.levelAfter} unlocked with +${earnedXp} XP.`
          : `XP Match finished: +${earnedXp} XP added to your journey.`,
        'success',
      );
    } catch (error) {
      setResult((current) => ({ ...current, awarding: false, error: error.message }));
      notify(error.message, 'error');
    }
  };

  finishRef.current = finish;

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    if (timeLeft <= 0) {
      finishRef.current(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, timeLeft]);

  useEffect(() => () => {
    busyRef.current = false;
  }, []);

  const start = () => {
    if (!member) return;
    if (playsLeft <= 0) {
      notify(`Daily limit reached. You get ${limit} runs at Level ${level.level}.`, 'info');
      return;
    }
    const next = gameConfigForLevel(level.level);
    submittedRef.current = false;
    busyRef.current = false;
    setRun(next);
    setDeck(buildDeck(next.pairs));
    setFlipped([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeLeft(next.seconds);
    setScore(0);
    setResult(null);
    setPhase('playing');
  };

  const flip = (index) => {
    if (phase !== 'playing' || busyRef.current) return;
    const card = deck[index];
    if (!card || card.matched || flipped.includes(index)) return;

    if (!flipped.length) {
      setFlipped([index]);
      return;
    }

    const first = flipped[0];
    if (deck[first].pairId === card.pairId) {
      const nextDeck = deck.map((entry, entryIndex) =>
        entryIndex === first || entryIndex === index ? { ...entry, matched: true } : entry,
      );
      const nextPairs = matchedPairs + 1;
      setDeck(nextDeck);
      setFlipped([]);
      setMatchedPairs(nextPairs);
      setScore((value) => value + 100 + Math.max(0, timeLeft));
      if (nextPairs === (run?.pairs || config.pairs)) {
        window.setTimeout(() => finishRef.current(true), 260);
      }
      return;
    }

    setFlipped([first, index]);
    setMoves((value) => value + 1);
    busyRef.current = true;
    window.setTimeout(() => {
      setFlipped([]);
      busyRef.current = false;
    }, 720);
  };

  const earnedXp = result?.xp ?? 0;
  const timerTotal = run?.seconds || config.seconds;
  const timerPercent = timerTotal ? Math.max(0, Math.min(1, timeLeft / timerTotal)) : 0;
  const ring = 2 * Math.PI * 25;

  return (
    <section className="xp-game" id="xp-match" aria-labelledby="xp-match-title">
      <div className="xp-game__head">
        <div>
          <p className="eyebrow">Level game</p>
          <h2 id="xp-match-title">XP Match</h2>
          <p className="muted">
            Flip the loop cards, match every pair and turn a sharp run into XP for your next level.
          </p>
        </div>
        <div className="xp-game__chips">
          <span className="game-chip">
            <Play size={13} /> {playsLeft}/{limit} runs left today
          </span>
          <span className="game-chip">
            <Trophy size={13} /> Best {formatNumber(best)}
          </span>
        </div>
      </div>

      <div className="xp-game__body">
        <aside className="xp-game__hud">
          <div className={cx('game-timer', phase === 'playing' && timeLeft <= 10 && 'is-low')}>
            <svg viewBox="0 0 60 60" role="img" aria-label={`${timeLeft} seconds left`}>
              <circle cx="30" cy="30" r="25" className="game-timer__track" />
              <circle
                cx="30"
                cy="30"
                r="25"
                className="game-timer__fill"
                style={{ strokeDasharray: ring, strokeDashoffset: ring * (1 - timerPercent) }}
              />
            </svg>
            <div className="game-timer__copy">
              <strong>{phase === 'playing' ? timeLeft : config.seconds}</strong>
              <span>sec</span>
            </div>
          </div>

          <div className="game-hud__stats">
            <div>
              <span>Pairs</span>
              <strong>{matchedPairs}/{run?.pairs || config.pairs}</strong>
            </div>
            <div>
              <span>Moves</span>
              <strong>{moves}</strong>
            </div>
            <div>
              <span>Score</span>
              <strong>{formatNumber(score)}</strong>
            </div>
          </div>

          <div className="game-hud__rule">
            <Timer size={15} />
            <p><strong>+8 XP per pair</strong> and <strong>+1.5 XP per second</strong> left, capped at 150 XP. Finished runs still count toward the daily limit.</p>
          </div>

          <button
            type="button"
            className={cx('button button--primary button--block', phase === 'playing' && 'is-muted')}
            onClick={start}
            disabled={phase === 'playing' || playsLeft <= 0}
          >
            {phase === 'playing' ? (
              'Run in progress'
            ) : playsLeft <= 0 ? (
              'Come back tomorrow'
            ) : (
              <><RotateCcw size={15} /> {phase === 'idle' ? 'Start a run' : 'Play again'}</>
            )}
          </button>
          <p className="game-hud__note">
            Level {level.level} difficulty · {config.pairs} pairs · {config.seconds}s
          </p>
        </aside>

        <div className="xp-game__stage">
          <div
            className={cx('game-board', `game-board--cols-${columns}`, phase === 'playing' && 'is-live')}
            style={{ '--cols': columns }}
            aria-live="polite"
          >
            {board.map((card, index) => {
              const Icon = card.icon;
              const isFlipped = flipped.includes(index);
              return (
                <button
                  key={card.uid}
                  type="button"
                  className={cx(
                    'game-card',
                    `game-card--${card.tone}`,
                    (isFlipped || card.matched) && 'is-flipped',
                    card.matched && 'is-matched',
                  )}
                  onClick={() => flip(index)}
                  disabled={phase !== 'playing' || card.matched}
                  aria-label={
                    card.matched || isFlipped
                      ? 'Revealed loop card'
                      : 'Hidden loop card, flip to reveal'
                  }
                >
                  <span className="game-card__inner">
                    <span className="game-card__face game-card__back" aria-hidden="true">
                      <span className="game-card__mark">V</span>
                      <span className="game-card__glint" />
                    </span>
                    <span className="game-card__face game-card__front" aria-hidden="true">
                      <Icon size={24} />
                      <span className="game-card__spark" />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {phase === 'idle' && (
            <div className="game-overlay game-overlay--idle">
              <span className="game-overlay__icon"><Sparkles size={26} /></span>
              <p className="eyebrow">Level {level.level} board</p>
              <h3>Ready to match the loop?</h3>
              <p>{config.pairs} pairs · {config.seconds} seconds · up to 150 XP</p>
              <button type="button" className="button button--primary" onClick={start} disabled={playsLeft <= 0}>
                <Play size={15} /> {playsLeft <= 0 ? 'Daily limit reached' : 'Start XP Match'}
              </button>
            </div>
          )}

          {(phase === 'won' || phase === 'lost') && result && (
            <div className={cx('game-overlay', 'game-result', result.won ? 'is-won' : 'is-lost')}>
              {result.levelAfter > result.levelBefore ? (
                <>
                  <span className="game-result__badge">
                    <LevelBadge level={result.levelAfter} size="md" status="current" showLabel={false} />
                  </span>
                  <p className="eyebrow">Level unlocked</p>
                  <h3>{levelMeta(result.levelAfter).name}</h3>
                  <p className="game-result__lede">
                    {result.won ? 'Board cleared and ' : 'Time called and '}
                    +{earnedXp} XP carried you into Level {result.levelAfter}.
                  </p>
                  {result.bonuses?.length > 0 && (
                    <p className="game-result__bonus">
                      <Gift size={14} /> Level bonus credited: +{formatNumber(result.bonuses.reduce((sum, entry) => sum + entry.bonusVE, 0))} VE
                    </p>
                  )}
                </>
              ) : (
                <>
                  <span className="game-result__icon">
                    {result.won ? <Crown size={26} /> : <Timer size={26} />}
                  </span>
                  <p className="eyebrow">{result.won ? 'Board cleared' : 'Time is up'}</p>
                  <h3>{result.won ? 'Clean loop' : 'So close to the loop'}</h3>
                  <p className="game-result__lede">
                    {result.won
                      ? `All ${result.totalPairs} pairs matched with ${result.timeLeft}s to spare.`
                      : `${result.pairs} of ${result.totalPairs} pairs matched. Every run still earns XP.`}
                  </p>
                </>
              )}

              <div className="game-result__stats">
                <div><span>XP earned</span><strong>+{earnedXp}</strong></div>
                <div><span>Score</span><strong>{formatNumber(result.score)}</strong></div>
                <div><span>Time left</span><strong>{result.timeLeft}s</strong></div>
              </div>

              {result.error && <p className="form-error" role="alert">{result.error}</p>}
              {result.awarding && <p className="game-result__pending">Adding XP to your journey…</p>}

              <div className="game-result__actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={start}
                  disabled={result.awarding || playsLeft <= 0}
                >
                  <RotateCcw size={15} /> {playsLeft <= 0 ? 'No runs left today' : 'Play again'}
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  See the journey
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="xp-game__foot">
        <span><Zap size={14} /> {gameRunsForLevel(level.level)} daily runs at Level {level.level}</span>
        <span><Gem size={14} /> XP never expires and every run keeps its own record</span>
      </div>
    </section>
  );
}
