import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Flame,
  Gavel,
  Gift,
  ListChecks,
  Lock,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo, StatusPill } from '../components/ui';
import { DEMO_ACCOUNTS, METHODS, tiersFor } from '../lib/constants';
import { formatINR } from '../lib/format';

const STEPS = [
  {
    icon: ListChecks,
    title: 'Pick a task with the full brief',
    body: 'Reward, time, conditions, eligibility and expiry are shown before you start — not after.',
  },
  {
    icon: Clock3,
    title: 'Watch the status, not a spinner',
    body: 'Pending validation, Credited, Not approved or Under appeal. Each state explains itself.',
  },
  {
    icon: Wallet,
    title: 'Audit every credit',
    body: 'A dated ledger row for every reward and refund, with the task name and a reference.',
  },
  {
    icon: Banknote,
    title: 'Withdraw with a receipt',
    body: 'Get a reference number and a timestamped timeline for every withdrawal request.',
  },
];

const FEATURES = [
  {
    icon: Eye,
    title: 'Rewards explained up front',
    body: 'Every brief shows the VE amount, the rupee value, the effort and exactly why a reward could be denied.',
    tag: 'Finding 7.1',
  },
  {
    icon: BadgeCheck,
    title: 'Four honest reward states',
    body: 'Pending, Credited, Not approved and Under appeal are distinct — with a plain-language description for each.',
    tag: 'Finding 7.2',
  },
  {
    icon: Clock3,
    title: 'Delays with a timeline',
    body: 'Withdrawals show the current stage, a timestamp for every change and the published processing window.',
    tag: 'Finding 7.3',
  },
  {
    icon: Gavel,
    title: 'A reason and an appeal',
    body: 'Rejected rewards carry a reason. Eligible rejections can be appealed once to a human reviewer.',
    tag: 'Finding 8.4',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy in plain words',
    body: 'A short summary explains what is stored, why, for how long, and what changes in a production build.',
    tag: 'Finding 7.4',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first and light',
    body: 'Responsive layouts, large tap targets and no blocking web fonts — tested down to small phone widths.',
    tag: 'Finding 8.5',
  },
];

export default function Landing() {
  const { member } = useApp();

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="container landing-nav__inner">
          <Link to="/" aria-label="VELoop Rewards home">
            <Logo />
          </Link>
          <nav className="landing-nav__links" aria-label="Landing navigation">
            <a href="#how">How it works</a>
            <a href="#fixed">What we fixed</a>
            <a href="#payouts">Payouts</a>
            <Link to="/research">Research</Link>
          </nav>
          <div className="landing-nav__actions">
            {member ? (
              <Link className="button button--primary button--sm" to="/app/dashboard">
                Open dashboard <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link className="button button--ghost button--sm" to="/login">
                  Sign in
                </Link>
                <Link className="button button--primary button--sm" to="/register">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__copy">
              <span className="hero__badge">
                <Sparkles size={14} />
                Built from the VELoop platform research assessment
              </span>
              <h1>
                Do the task.
                <br />
                See the reward.
                <br />
                <span className="text-gradient">Know the status.</span>
              </h1>
              <p className="hero__lede">
                A working rewards platform that turns the assessment&apos;s recommendations into product
                decisions: clear task briefs, explicit reward states, auditable credits and withdrawals
                that always come with a receipt.
              </p>
              <div className="hero__actions">
                <Link className="button button--primary" to={member ? '/app/dashboard' : '/login'}>
                  {member ? 'Continue to dashboard' : 'Try the live demo'}
                  <ArrowRight size={17} />
                </Link>
                <Link className="button button--outline" to="/research">
                  <FileText size={17} />
                  Read the research
                </Link>
              </div>
              <ul className="hero__checks">
                <li><CheckCircle2 size={15} /> No backend or database needed</li>
                <li><CheckCircle2 size={15} /> Member and operations demo accounts</li>
                <li><CheckCircle2 size={15} /> Data stays in your browser</li>
              </ul>
            </div>

            <div className="hero__visual" aria-label="Preview of a reward lifecycle">
              <div className="preview-card">
                <div className="preview-card__top">
                  <div>
                    <p className="preview-card__label">Available balance</p>
                    <p className="preview-card__balance">5,603 <span>VE</span></p>
                    <p className="preview-card__inr">≈ {formatINR(560.3)} · 10 VE = ₹1</p>
                  </div>
                  <StatusPill tone="mint">Credited</StatusPill>
                </div>

                <div className="preview-task">
                  <span className="preview-task__icon"><ListChecks size={18} /></span>
                  <div>
                    <strong>Fintech habits survey</strong>
                    <span>10 min · 12 questions · expires in 12 days</span>
                  </div>
                  <span className="preview-task__reward">+60 VE</span>
                </div>

                <div className="preview-timeline">
                  <div className="preview-timeline__row is-done">
                    <span className="preview-timeline__dot" />
                    <div>
                      <strong>Submitted</strong>
                      <span>Today, 10:42</span>
                    </div>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="preview-timeline__row is-done">
                    <span className="preview-timeline__dot" />
                    <div>
                      <strong>Validated by partner</strong>
                      <span>Attention checks passed</span>
                    </div>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="preview-timeline__row is-active">
                    <span className="preview-timeline__dot" />
                    <div>
                      <strong>Credited to wallet</strong>
                      <span>Reference SUB-4F2A</span>
                    </div>
                    <span className="preview-timeline__amount">+60 VE</span>
                  </div>
                </div>

                <div className="preview-reference">
                  <Lock size={14} />
                  Reference <strong>VLR-2026-8F3K2A</strong>
                </div>
              </div>

              <div className="preview-float preview-float--streak">
                <Flame size={16} />
                <div>
                  <strong>6-day streak</strong>
                  <span>+5 VE daily</span>
                </div>
              </div>
              <div className="preview-float preview-float--level">
                <TrendingUp size={16} />
                <div>
                  <strong>Level 4</strong>
                  <span>260 XP to Level 5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="container hero__stats">
            <div><strong>10</strong><span>activity types with full briefs</span></div>
            <div><strong>4</strong><span>payout methods with published windows</span></div>
            <div><strong>1,000 VE</strong><span>minimum withdrawal (₹100)</span></div>
            <div><strong>100%</strong><span>of withdrawals carry a reference</span></div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="container">
            <div className="section-intro">
              <p className="eyebrow">The workflow, made visible</p>
              <h2>Four steps. No mystery states.</h2>
              <p className="muted">
                The assessment found that members lose trust when they cannot tell why a reward is
                pending or a withdrawal is late. This build makes every stage explicit.
              </p>
            </div>
            <div className="steps-grid">
              {STEPS.map(({ icon: Icon, title, body }, index) => (
                <article className="step-card" key={title}>
                  <span className="step-card__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="step-card__icon"><Icon size={20} /></span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--alt" id="fixed">
          <div className="container">
            <div className="section-intro">
              <p className="eyebrow">From findings to features</p>
              <h2>What the research changed</h2>
              <p className="muted">
                Each recommendation from section 7 and 8 of the report maps to a working screen in this app.
              </p>
            </div>
            <div className="feature-grid">
              {FEATURES.map(({ icon: Icon, title, body, tag }) => (
                <article className="feature-card" key={title}>
                  <div className="feature-card__head">
                    <span className="feature-card__icon"><Icon size={19} /></span>
                    <span className="feature-card__tag">{tag}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <div className="section-cta">
              <Link className="text-link" to="/research">
                See the full findings-to-features map <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        <section className="section" id="payouts">
          <div className="container">
            <div className="section-intro">
              <p className="eyebrow">Redemption</p>
              <h2>Four ways to use your VEs</h2>
              <p className="muted">
                Every method shows its rate, minimum, processing window and a sample tier before you confirm.
              </p>
            </div>
            <div className="payout-grid">
              {METHODS.map((method) => {
                const tier = tiersFor(method)[0];
                return (
                  <article className={`payout-card payout-card--${method.accent}`} key={method.id}>
                    <span className="payout-card__icon">
                      {method.kind === 'gift' ? <Gift size={20} /> : <Banknote size={20} />}
                    </span>
                    <h3>{method.label}</h3>
                    <p>{method.blurb}</p>
                    <dl>
                      <div><dt>From</dt><dd>{tier.ves.toLocaleString('en-IN')} VE</dd></div>
                      <div><dt>Value</dt><dd>{formatINR(tier.inr)}</dd></div>
                      <div><dt>Arrives</dt><dd>{method.processing}</dd></div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section section--alt">
          <div className="container demo-panel">
            <div>
              <p className="eyebrow">Try it</p>
              <h2>Two demo accounts, one complete loop</h2>
              <p className="muted">
                Sign in as a member to complete tasks, watch a reward validate and request a withdrawal.
                Then open the operations console to review the same request as staff.
              </p>
              <div className="demo-panel__accounts">
                <div className="demo-account">
                  <span className="demo-account__role">Member</span>
                  <code>{DEMO_ACCOUNTS.member.email}</code>
                  <code>{DEMO_ACCOUNTS.member.password}</code>
                </div>
                <div className="demo-account">
                  <span className="demo-account__role">Operations</span>
                  <code>{DEMO_ACCOUNTS.admin.email}</code>
                  <code>{DEMO_ACCOUNTS.admin.password}</code>
                </div>
              </div>
              <p className="demo-panel__note">
                <ShieldCheck size={14} /> Demo only. Do not enter real payment details — data is stored in
                this browser.
              </p>
            </div>
            <div className="demo-panel__actions">
              <Link className="button button--primary" to="/login">
                Member sign in <ArrowRight size={16} />
              </Link>
              <Link className="button button--outline" to="/admin/login">
                Operations console
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container landing-footer__inner">
          <div>
            <Logo />
            <p className="muted">
              An internship assessment build. Independent of VELoop Rewards and not affiliated with the
              live platform.
            </p>
          </div>
          <div className="landing-footer__links">
            <Link to="/research">Research report</Link>
            <Link to="/privacy">Privacy summary</Link>
            <Link to="/login">Member sign in</Link>
            <Link to="/admin/login">Operations</Link>
          </div>
        </div>
        <div className="container landing-footer__bottom">
          <span>© {new Date().getFullYear()} VELoop Rewards assessment demo</span>
          <span>React · Vite · browser storage</span>
        </div>
      </footer>
    </div>
  );
}
