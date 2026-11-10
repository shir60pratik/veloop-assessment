import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Gift,
  Info,
  Lock,
  Play,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { METHODS, METHOD_BY_ID, tiersFor } from '../lib/constants';
import {
  cx,
  formatINR,
  formatNumber,
  formatVE,
  maskDestination,
  vesToInr,
} from '../lib/format';
import { CopyButton, Modal, StatusPill } from '../components/ui';

const METHOD_ICONS = {
  smartphone: Smartphone,
  wallet: Wallet,
  gift: Gift,
  play: Play,
};

export default function Redeem() {
  const { member, balance, redeem, notify } = useApp();
  const [params, setParams] = useSearchParams();
  const requested = params.get('method');
  const method = METHOD_BY_ID[requested] || METHOD_BY_ID.upi;

  const [amount, setAmount] = useState(method.steps[0]);
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const affordable = method.steps.find((value) => value * method.rate <= balance);
    setAmount(affordable || method.steps[0]);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method.id]);

  if (!member) return null;

  const tiers = tiersFor(method);
  const cost = amount * method.rate;
  const balanceAfter = balance - cost;
  const canAfford = balance >= cost;
  const selectedTier = tiers.find((tier) => tier.inr === amount);

  const selectMethod = (id) => {
    setParams({ method: id });
    setError('');
  };

  const submit = (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const request = redeem(member.id, { methodId: method.id, inr: amount, destination });
      setSuccess(request);
      setDestination('');
      notify(`Request ${request.reference} created. VEs deducted and held for review.`, 'success');
    } catch (err) {
      setError(err.message);
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page redeem-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Redeem</p>
          <h1>Turn VEs into something you can use</h1>
          <p className="muted">
            The rate, minimum, fee and processing window are shown before you confirm — not buried in a
            help article.
          </p>
        </div>
        <StatusPill tone="mint">Balance {formatVE(balance)}</StatusPill>
      </div>

      <div className="stepper" aria-label="Redemption steps">
        <div className="stepper__item is-active"><span>1</span> Method</div>
        <div className="stepper__line" />
        <div className={cx('stepper__item', amount && 'is-active')}><span>2</span> Amount</div>
        <div className="stepper__line" />
        <div className={cx('stepper__item', destination && 'is-active')}><span>3</span> Destination</div>
        <div className="stepper__line" />
        <div className="stepper__item"><span>4</span> Review</div>
      </div>

      <div className="redeem-layout">
        <form className="redeem-form" onSubmit={submit}>
          <section className="panel">
            <div className="panel__head">
              <div>
                <h2>1 · Choose a payout method</h2>
                <p className="muted">Cash or gift card. Rates differ for gift cards.</p>
              </div>
            </div>
            <div className="method-grid">
              {METHODS.map((item) => {
                const Icon = METHOD_ICONS[item.icon] || Banknote;
                const active = item.id === method.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={cx('method-card', `method-card--${item.accent}`, active && 'is-active')}
                    onClick={() => selectMethod(item.id)}
                    aria-pressed={active}
                  >
                    <span className="method-card__icon"><Icon size={18} /></span>
                    <strong>{item.label}</strong>
                    <span className="method-card__rate">{item.rate} VE per ₹1</span>
                    <span className="method-card__meta">{item.processing}</span>
                    {active && <span className="method-card__check"><CheckCircle2 size={16} /></span>}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel__head">
              <div>
                <h2>2 · Choose an amount</h2>
                <p className="muted">
                  {method.label} · minimum {formatVE(method.min)} ({formatINR(vesToInr(method.min))})
                </p>
              </div>
            </div>
            <div className="amount-grid">
              {tiers.map((tier) => {
                const affordable = balance >= tier.ves;
                const active = amount === tier.inr;
                return (
                  <button
                    type="button"
                    key={tier.inr}
                    className={cx('amount-card', active && 'is-active', !affordable && 'is-disabled')}
                    onClick={() => affordable && setAmount(tier.inr)}
                    disabled={!affordable}
                  >
                    <span className="amount-card__inr">{formatINR(tier.inr)}</span>
                    <span className="amount-card__ves">{formatNumber(tier.ves)} VE</span>
                    {!affordable && (
                      <span className="amount-card__short">
                        Need {formatNumber(tier.ves - balance)} more VE
                      </span>
                    )}
                    {active && <span className="amount-card__check"><CheckCircle2 size={16} /></span>}
                  </button>
                );
              })}
            </div>
            {!canAfford && (
              <div className="callout callout--amber">
                <CircleAlert size={16} />
                <div>
                  <strong>This amount is above your balance</strong>
                  <p>
                    You have {formatVE(balance)}. Complete more activities or choose a smaller amount.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel__head">
              <div>
                <h2>3 · Where should we send it?</h2>
                <p className="muted">
                  {method.destinationType === 'upi'
                    ? 'Use a UPI ID you control. It is masked everywhere it appears.'
                    : 'We deliver gift cards to this email address.'}
                </p>
              </div>
            </div>
            <label className="field">
              <span>{method.destinationLabel}</span>
              <div className="input-wrap">
                {method.destinationType === 'upi' ? <Smartphone size={16} /> : <Wallet size={16} />}
                <input
                  type={method.destinationType === 'upi' ? 'text' : 'email'}
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder={method.destinationHint}
                  autoComplete="off"
                />
              </div>
              <span className="field__hint">
                Demo only — use a sample address. Never enter real bank details here.
              </span>
            </label>
            {destination && (
              <p className="mask-preview">
                <Lock size={13} /> Shown to operations as <code>{maskDestination(method.id, destination)}</code>
              </p>
            )}
          </section>

          <div className="callout callout--mint">
            <ShieldCheck size={17} />
            <div>
              <strong>You can cancel while it is under review</strong>
              <p>
                VEs are deducted on submit so the same balance cannot be spent twice. If you cancel
                before approval, the full amount is refunded automatically.
              </p>
            </div>
          </div>
        </form>

        <aside className="quote-card">
          <div className="quote-card__head">
            <h2>Review</h2>
            <StatusPill tone="amber">Step 4</StatusPill>
          </div>

          <div className="quote-card__amount">
            <p className="muted">You receive</p>
            <p className="quote-card__inr">{formatINR(amount)}</p>
            <p className="quote-card__ves">{formatNumber(cost)} VE</p>
          </div>

          <dl className="quote-list">
            <div><dt>Method</dt><dd>{method.label}</dd></div>
            <div><dt>Rate</dt><dd>{method.rate} VE = ₹1</dd></div>
            <div><dt>Processing</dt><dd>{method.processing}</dd></div>
            <div><dt>Fee</dt><dd>None</dd></div>
            <div><dt>Balance after</dt><dd>{formatNumber(Math.max(0, balanceAfter))} VE</dd></div>
          </dl>

          <div className="quote-card__destination">
            <span>Destination</span>
            <strong>{destination ? maskDestination(method.id, destination) : 'Not entered yet'}</strong>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="button button--primary button--block" disabled={busy || !canAfford}>
            {busy ? 'Creating request…' : 'Confirm request'}
            {!busy && <ArrowRight size={16} />}
          </button>

          <p className="quote-card__note">
            <Info size={14} />
            A reference number and timeline are created immediately. {selectedTier ? `${formatINR(selectedTier.inr)} = ${formatNumber(selectedTier.ves)} VE.` : ''}
          </p>
          <Link to="/app/history" className="text-link quote-card__link">
            See past requests <ArrowRight size={14} />
          </Link>
        </aside>
      </div>

      <SuccessModal request={success} onClose={() => setSuccess(null)} />
    </div>
  );
}

function SuccessModal({ request, onClose }) {
  if (!request) return null;
  return (
    <Modal
      open={Boolean(request)}
      onClose={onClose}
      title="Request created"
      subtitle="Your VEs are held while operations review the destination."
      size="md"
      footer={
        <>
          <Link className="button button--primary" to="/app/history" onClick={onClose}>
            Open history <ArrowRight size={15} />
          </Link>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <div className="success-block">
        <span className="success-block__icon"><BadgeCheck size={26} /></span>
        <p className="success-block__label">Reference number</p>
        <div className="success-block__ref">
          <code>{request.reference}</code>
          <CopyButton value={request.reference} />
        </div>
        <p className="muted">Quote this to support — you never need to resend your destination.</p>

        <div className="success-summary">
          <div><span>Amount</span><strong>{formatINR(request.inr)}</strong></div>
          <div><span>Cost</span><strong>{formatNumber(request.ves)} VE</strong></div>
          <div><span>Method</span><strong>{request.methodLabel}</strong></div>
          <div><span>Status</span><StatusPill tone="amber">Under review</StatusPill></div>
        </div>

        <div className="mini-timeline">
          <div className="mini-timeline__row is-done">
            <span />
            <div>
              <strong>Request received</strong>
              <p>Reference created and VEs deducted.</p>
            </div>
          </div>
          <div className="mini-timeline__row">
            <span />
            <div>
              <strong>Operations review</strong>
              <p>Destination checked, usually within 24–48 hours.</p>
            </div>
          </div>
          <div className="mini-timeline__row">
            <span />
            <div>
              <strong>Payout sent</strong>
              <p>Status changes to Completed with a timestamp.</p>
            </div>
          </div>
        </div>

        <p className="quote-card__note">
          <Clock3 size={14} /> Published window for {request.methodLabel}: check the timeline in History.
        </p>
      </div>
    </Modal>
  );
}
