import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Download,
  Gift,
  Info,
  Search,
  Sparkles,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pendingCreditsOf, transactionsOf } from '../lib/store';
import { GLOSSARY } from '../lib/constants';
import {
  cx,
  dateShort,
  downloadCsv,
  formatINR,
  formatNumber,
  formatVE,
  vesToInr,
} from '../lib/format';
import { EmptyState, SectionHeading, StatusPill } from '../components/ui';

const FILTERS = [
  { id: 'all', label: 'All rows' },
  { id: 'credit', label: 'Credits' },
  { id: 'debit', label: 'Debits' },
];

export default function Wallet() {
  const { db, member, balance } = useApp();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const rows = member ? transactionsOf(db, member.id) : [];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter((tx) => (filter === 'all' ? true : tx.kind === filter))
      .filter((tx) => {
        if (!needle) return true;
        return (
          tx.title.toLowerCase().includes(needle) ||
          (tx.ref || '').toLowerCase().includes(needle) ||
          tx.detail.toLowerCase().includes(needle)
        );
      });
  }, [rows, filter, query]);

  if (!member) return null;

  const pending = pendingCreditsOf(db, member.id);
  const credited = rows.filter((tx) => tx.kind === 'credit').reduce((sum, tx) => sum + tx.amount, 0);
  const spent = rows.filter((tx) => tx.kind === 'debit').reduce((sum, tx) => sum + tx.amount, 0);

  const exportCsv = () => {
    downloadCsv('veloop-wallet-ledger.csv', [
      ['Date', 'Description', 'Detail', 'Type', 'Amount (VE)', 'Status', 'Reference'],
      ...rows.map((tx) => [
        dateShort(tx.createdAt),
        tx.title,
        tx.detail,
        tx.kind === 'credit' ? 'Credit' : 'Debit',
        tx.kind === 'credit' ? tx.amount : -tx.amount,
        'Completed',
        tx.ref || '',
      ]),
    ]);
  };

  return (
    <div className="page wallet-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Wallet</p>
          <h1>A ledger you can actually audit</h1>
          <p className="muted">Every credit, debit and refund — dated, labelled and referenced.</p>
        </div>
        <div className="page-head__actions">
          <button type="button" className="button button--ghost" onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
          <Link className="button button--primary" to="/app/redeem">
            Redeem VEs <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <section className="wallet-summary">
        <div className="wallet-balance">
          <p className="muted">Available balance</p>
          <p className="wallet-balance__amount">{formatNumber(balance)} <span>VE</span></p>
          <p className="wallet-balance__inr">≈ {formatINR(vesToInr(balance))}</p>
          <div className="wallet-balance__meter">
            <span style={{ width: `${Math.min(100, (balance / 5000) * 100)}%` }} />
          </div>
          <p className="wallet-balance__hint">
            {balance >= 1000
              ? 'You meet the minimum for every payout method.'
              : `${formatVE(1000 - balance)} more VE until the ₹100 minimum.`}
          </p>
        </div>

        <div className="wallet-mini-grid">
          <div className="wallet-mini">
            <span className="wallet-mini__icon is-credit"><ArrowDownLeft size={17} /></span>
            <p className="muted">Total credited</p>
            <strong>{formatVE(credited)}</strong>
          </div>
          <div className="wallet-mini">
            <span className="wallet-mini__icon is-debit"><ArrowUpRight size={17} /></span>
            <p className="muted">Total redeemed</p>
            <strong>{formatVE(spent)}</strong>
          </div>
          <div className="wallet-mini">
            <span className="wallet-mini__icon is-pending"><Sparkles size={17} /></span>
            <p className="muted">Pending validation</p>
            <strong>{formatVE(pending)}</strong>
            <span className="wallet-mini__note">Not spendable yet</span>
          </div>
          <div className="wallet-mini">
            <span className="wallet-mini__icon is-neutral"><Gift size={17} /></span>
            <p className="muted">Value at 10 VE = ₹1</p>
            <strong>{formatINR(vesToInr(balance))}</strong>
            <span className="wallet-mini__note">Before any gift-card premium</span>
          </div>
        </div>
      </section>

      <div className="callout callout--mint">
        <Info size={17} />
        <div>
          <strong>Credits are not money</strong>
          <p>
            VE is a platform credit. It becomes money only when a withdrawal completes. Pending rewards
            are shown separately and cannot be spent, which is why the available balance is the only
            number used at redemption.
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2>Reward activity</h2>
            <p className="muted">{rows.length} ledger rows · newest first</p>
          </div>
        </div>

        <div className="ledger-toolbar">
          <div className="chip-row chip-row--compact">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cx('chip', filter === item.id && 'is-active')}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
                <span>
                  {item.id === 'all'
                    ? rows.length
                    : rows.filter((tx) => tx.kind === item.id).length}
                </span>
              </button>
            ))}
          </div>
          <div className="search-input search-input--sm">
            <Search size={15} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search description or reference"
              aria-label="Search ledger"
            />
          </div>
        </div>

        {filtered.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th className="is-right">Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td className="is-nowrap">{dateShort(tx.createdAt)}</td>
                    <td>
                      <strong>{tx.title}</strong>
                      <span className="table-sub">{tx.detail}</span>
                    </td>
                    <td>
                      <span className={`type-pill ${tx.kind === 'credit' ? 'is-credit' : 'is-debit'}`}>
                        {tx.kind === 'credit' ? 'Credit' : 'Debit'}
                      </span>
                    </td>
                    <td className={cx('is-right', 'is-nowrap', tx.kind === 'credit' ? 'amount-credit' : 'amount-debit')}>
                      {tx.kind === 'credit' ? '+' : '−'}{formatNumber(tx.amount)} VE
                    </td>
                    <td><StatusPill tone="mint">Completed</StatusPill></td>
                    <td><code className="ref-code">{tx.ref || '—'}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={WalletIcon}
            title="No ledger rows match"
            description="Try a different filter or clear the search."
            action={
              <button type="button" className="button button--ghost button--sm" onClick={() => { setFilter('all'); setQuery(''); }}>
                Clear filters
              </button>
            }
          />
        )}
      </section>

      <section>
        <SectionHeading
          eyebrow="Plain-language glossary"
          title="What the words on this page mean"
          description="The assessment found that credit terminology is one of the biggest sources of confusion."
        />
        <div className="glossary-grid">
          {GLOSSARY.map((item) => (
            <article className="glossary-card" key={item.term}>
              <span className="glossary-card__icon"><BookOpen size={17} /></span>
              <div>
                <h3>{item.term}</h3>
                <span className="glossary-card__short">{item.short}</span>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
