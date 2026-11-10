import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IMPROVEMENTS, REPORT_SECTIONS, SOURCES } from '../lib/constants';
import { StatusPill } from '../components/ui';

const METRICS = [
  { name: 'Task completion rate', why: 'How many started activities are completed successfully.' },
  { name: 'Reward processing time', why: 'How long a validated activity takes to reach the wallet.' },
  { name: 'Withdrawal success rate', why: 'Share of eligible requests that reach Completed.' },
  { name: 'Support request volume', why: 'How often missing rewards or unclear rules generate tickets.' },
  { name: 'Appeal resolution time', why: 'How long a rejected reward takes to be reviewed.' },
  { name: 'Returning members', why: 'Whether clearer status improves trust and retention.' },
];

export default function Research() {
  const { member } = useApp();

  return (
    <div className="page research-page">
      <div className="research-hero">
        <div className="research-hero__copy">
          <span className="hero__badge"><FileText size={14} /> Internship assessment · 28 October 2026</span>
          <h1>Understanding the platform, its users, features and possible improvements</h1>
          <p>
            This app is the practical half of a platform research assessment for the VELoop Rewards
            internship program. The report studies the member journey and proposes nine concrete
            improvements. Each one is implemented here as a working screen, not a mockup.
          </p>
          <div className="research-hero__actions">
            <a className="button button--primary" href="./docs/VELOOP_Platform_Research_Assessment.pdf" download>
              <Download size={16} /> Download the PDF report
            </a>
            <Link className="button button--outline" to="/app/tasks">
              Try the implemented flow <ArrowRight size={16} />
            </Link>
          </div>
          <div className="research-hero__meta">
            <span><strong>Prepared for</strong> VELoop Rewards Internship Program</span>
            <span><strong>Prepared by</strong> Assessment submission</span>
            <span><strong>Format</strong> Research note + working prototype</span>
          </div>
        </div>
        <div className="research-scorecard">
          <div className="research-scorecard__head">
            <StatusPill tone="mint">Implemented</StatusPill>
            <span className="muted">Report → product</span>
          </div>
          <div className="research-scorecard__grid">
            <div><strong>13</strong><span>report sections reviewed</span></div>
            <div><strong>9</strong><span>improvements shipped</span></div>
            <div><strong>4</strong><span>payout methods</span></div>
            <div><strong>6</strong><span>glossary terms</span></div>
          </div>
          <p className="research-scorecard__note">
            <Info size={14} /> The linked Google Drive assessment folder was not accessible while the
            report was written, so questions contained only there may need to be added later.
          </p>
        </div>
      </div>

      <section>
        <div className="section-intro section-intro--left">
          <p className="eyebrow">The research at a glance</p>
          <h2>Five observations that shaped the build</h2>
        </div>
        <div className="research-findings">
          {REPORT_SECTIONS.map((section) => (
            <article className="research-finding" key={section.id}>
              <span className="research-finding__number">{section.number}</span>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <p className="eyebrow">Traceability</p>
            <h2>From recommendation to working feature</h2>
            <p className="muted">Every improvement in section 7 and 8 of the report maps to something you can click.</p>
          </div>
          <span className="privacy-badge"><Target size={15} /> 9 / 9 shipped</span>
        </div>

        <div className="table-wrap">
          <table className="data-table data-table--trace">
            <thead>
              <tr>
                <th>Report recommendation</th>
                <th>What this build does</th>
                <th>Where to see it</th>
              </tr>
            </thead>
            <tbody>
              {IMPROVEMENTS.map((item) => (
                <tr key={item.report}>
                  <td><strong>{item.report}</strong></td>
                  <td>{item.implementation}</td>
                  <td><span className="trace-where">{item.where}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="section-intro section-intro--left">
          <p className="eyebrow">Measurement</p>
          <h2>How to check whether the improvements work</h2>
          <p className="muted">The report proposes six metrics. They are listed here so the next iteration stays honest.</p>
        </div>
        <div className="metric-grid">
          {METRICS.map((metric, index) => (
            <article className="metric-card" key={metric.name}>
              <span className="metric-card__index">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{metric.name}</h3>
                <p>{metric.why}</p>
              </div>
              <TrendingUp size={18} />
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <p className="eyebrow">Scope</p>
            <h2>Sources and limitations</h2>
          </div>
        </div>
        <div className="research-sources">
          <div>
            <h3><Lightbulb size={16} /> Sources used</h3>
            <ul className="source-list">
              {SOURCES.map((source) => (
                <li key={source.href}>
                  <a href={source.href} target="_blank" rel="noreferrer">
                    {source.label} <ExternalLink size={13} />
                  </a>
                </li>
              ))}
              <li><span>Internship notice supplied for the assessment, page 1.</span></li>
            </ul>
          </div>
          <div>
            <h3><CheckCircle2 size={16} /> Notes</h3>
            <ul className="check-list">
              <li><CheckCircle2 size={14} /> The report is written in a simple research-note style.</li>
              <li><CheckCircle2 size={14} /> It is based on the internship notice and publicly available VELoop pages.</li>
              <li><CheckCircle2 size={14} /> The separate Google Drive folder was inaccessible, so it may need updating.</li>
              <li><CheckCircle2 size={14} /> This prototype is independent and not affiliated with the live platform.</li>
            </ul>
          </div>
        </div>
        <div className="research-hero__actions">
          <a className="button button--ghost" href="./docs/VELOOP_Platform_Research_Assessment.pdf" download>
            <Download size={16} /> PDF report
          </a>
          {member ? (
            <Link className="text-link" to="/app/dashboard">Back to dashboard <ArrowRight size={14} /></Link>
          ) : (
            <Link className="text-link" to="/login">Sign in to try the flow <ArrowRight size={14} /></Link>
          )}
        </div>
      </section>
    </div>
  );
}
