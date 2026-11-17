# VELoop Rewards

A working, front-end rewards platform built from the **VELoop platform research assessment**. Instead of stopping at recommendations, this demo turns each one into a product decision you can click through: plain-language task briefs, explicit reward states, auditable wallet entries, withdrawal reference numbers, rejection reasons with a real appeal path, and an operations console that sees the same timeline the member does.

> **Demo only.** All data lives in your browser's `localStorage`. There is no backend, no real payout rail and no real account verification. Never enter real payment details.

The member experience includes **12 levels with one-of-a-kind SVG badges**, a horizontal level journey, animated XP progression and **XP Match**, a playable memory game that awards real XP and unlocks one-time VE bonuses.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview
```

The app uses `HashRouter` and a relative Vite `base`, so the contents of `dist/` can be dropped on any static host (GitHub Pages, Netlify, Vercel, S3) without rewrite rules.

---

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Member | `demo.user@veloop.demo` | `VeloopUser@2026` |
| Operations admin | `admin@veloop.demo` | `VeloopAdmin@2026` |
| Support agent | `support@veloop.demo` | `VeloopSupport@2026` |

The sign-in screens include one-click buttons that fill these credentials. You can also create a fresh local member account from **Create account**.

The seeded member starts with **5,603 VE**, a Level 4 profile (940 XP — 40 XP into the level), seeded transaction history, three daily XP Match runs and live items in every queue (one reward awaiting validation, one withdrawal in flight, one rejected reward, one open appeal, three support tickets).

### Resetting the demo

Sign in as a member and use **Support → Reset demo data**, or clear the browser key `veloop.rewards.db.v1`. The database is re-seeded on the next load.

---

## What the app demonstrates

### Member experience

- **Transparent task briefs** — reward, effort, expiry, level requirement, conditions and the exact reason a reward might be rejected, all before starting.
- **Level journey and collectible badges** — 12 levels, each with its own name, palette, emblem, ornamental frame and one-time VE bonus. The journey scrolls horizontally, centres the current level and clearly separates completed, current, next and locked milestones.
- **XP Match** — a playable memory game that turns a sharp run into real XP, with level-scaled difficulty, a daily run allowance, a live timer, run history and automatic level-up rewards.
- **Explicit reward states** — `Pending validation`, `Credited`, `Not approved` and `Under appeal`, each with a plain-language explanation.
- **Auditable wallet** — every credit and debit in one ledger, with the related reference and a running balance; pending rewards are excluded from spendable balance.
- **Withdrawals with receipts** — rate, minimum, fee, processing window and masked destination are shown before confirmation. Each request gets a reference such as `VLR-2026-LE3SWV` and a status timeline.
- **Rejection reasons and appeals** — a rejected reward shows the recorded reason; the member can submit one appeal with evidence, and the outcome is written back to the same submission.
- **Cancellation and refunds** — a withdrawal can be cancelled while it is under review and the VEs are refunded automatically.
- **Support that keeps history** — searchable help articles, ticket threads, statuses and staff replies.
- **Privacy in plain language** — what is stored, where it lives, retention, controls and links to the source report.
- **Research page** — the findings, improvement map, traceability table and success metrics from the assessment, inside the product.

### Levels, badges and XP Match

The Levels page (`/app/levels`) is a complete progression system rather than a static profile badge.

- **Linear XP** — 300 XP per level, capped at Level 12. XP never expires and never resets. The header, sidebar and dashboard all read from the same XP value.
- **Original badge artwork** — every level renders as a hand-built inline SVG badge with a unique frame silhouette (seed, hex, shield, orbit, laurel, wings, halo, prism), pattern, rosette count, emblem, ribbon and status treatment.
- **Four clear states** — completed badges stay lit, the current level is highlighted and animated, the next milestone is previewed with its XP target and bonus, and locked levels stay dimmed but readable.
- **Animated progression** — the XP bar, remaining-XP count, next-unlock preview and hero badge all animate from the member's live XP.
- **Detail sheet** — clicking any badge opens its full record: XP band, unlock bonus, perk, next milestone, daily game allowance and current position inside the level.
- **XP Match** — flip and match icon pairs before the timer expires. Difficulty scales with level:

| Levels | Pairs | Time | Columns |
| --- | --- | --- | --- |
| 1–2 | 6 | 60s | 4 |
| 3–5 | 8 | 58s | 4 |
| 6–8 | 9 | 54s | 6 |
| 9–12 | 10 | 50s | 5 |

- **Rewards** — each run awards `min(150, pairs × 8 + seconds left × 1.5)` XP. Score is `pairs × 100 + seconds left × 10`. Daily runs start at 3, increase to 4 at Level 6 and 5 at Level 9. Finished and failed runs both consume a daily run.
- **Level bonuses** — crossing a threshold credits the level's one-time VE bonus exactly once, including when a single run crosses two thresholds. All XP changes flow through one `grantXp` path so the wallet and transaction ledger stay consistent.

| Level | Name | XP band | Unlock bonus |
| --- | --- | --- | --- |
| 1 | Spark Starter | 0–299 | +100 VE |
| 2 | Loop Explorer | 300–599 | +250 VE |
| 3 | Pulse Seeker | 600–899 | +500 VE |
| 4 | Momentum Maker | 900–1,199 | +800 VE |
| 5 | Orbit Builder | 1,200–1,499 | +1,200 VE |
| 6 | Signal Master | 1,500–1,799 | +1,600 VE |
| 7 | Vault Keeper | 1,800–2,099 | +2,000 VE |
| 8 | Nova Strategist | 2,100–2,399 | +2,500 VE |
| 9 | Zenith Pilot | 2,400–2,699 | +3,000 VE |
| 10 | Legend of the Loop | 2,700–2,999 | +4,000 VE |
| 11 | Cosmic Curator | 3,000–3,299 | +5,000 VE |
| 12 | VELoop Immortal | 3,300+ | +7,500 VE |

### Operations console

- **Overview** — queue counts, in-flight value, completed payouts, recent activity and the same status vocabulary members see.
- **Redemption queue** — review the masked destination, reveal it deliberately, approve → process → complete, or reject with a written reason and automatic refund.
- **Appeals** — compare the original rejection reason with the member's appeal, then credit or confirm the decision; both require a reviewer note that is shown to the member.
- **Tickets** — reply, reply-and-resolve, or resolve, with the full thread and member context.

### Demo mechanics

- Reward validation resolves automatically about **20 seconds** after submission so the full lifecycle is visible in one sitting.
- Approval is randomised (~86%) to exercise both the credited and rejected paths.
- Everything is local: refreshes keep state, other browsers do not see it.

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing landing page with rates, demo accounts and report download |
| `/login`, `/register` | Member authentication |
| `/admin/login` | Operations authentication |
| `/app/dashboard` | Balance, level, streak, pending rewards, activity |
| `/app/levels` | 12-level journey, badge detail sheets, XP Match game |
| `/app/tasks` | Activity catalogue, filters, task detail and submission |
| `/app/wallet` | Balance, ledger, glossary, payout rates |
| `/app/redeem` | Withdrawal method, amount, destination and review |
| `/app/history` | Withdrawals and reward activity with timelines and appeals |
| `/app/support` | Help centre, ticket creation, threads, demo reset |
| `/app/research` | Research findings and traceability |
| `/app/privacy` | Plain-language privacy notice |
| `/research`, `/privacy` | Public versions of the same pages |
| `/admin` | Operations overview |
| `/admin/redemptions` | Redemption queue |
| `/admin/appeals` | Reward appeals |
| `/admin/tickets` | Member tickets |

---

## Mapping from the assessment

| Assessment recommendation | Where it lives |
| --- | --- |
| Reward clarity before effort | Task cards and task detail modal |
| Progression clarity and achievement | Level journey, collectible badges, XP Match, level-up bonus crediting |
| Visible reward lifecycle | Status pills, wallet mini-cards, status guide |
| Understandable withdrawal rules | Redeem review card, method cards, wallet glossary |
| Reference numbers and timelines | Withdrawal receipt modal, History timeline |
| Reasons for rejection | Reward activity, appeal modal, history detail |
| Human review path | Member appeal → operations appeals queue |
| Support continuity | Ticket threads and statuses |
| Trust and privacy communication | Privacy page, reset control, demo disclaimers |
| Operations observability | Admin overview, queues, audit-style timelines |
| Success metrics | Research page metric cards |

The full report is available in-app from the landing page and the research page:

- `public/docs/VELOOP_Platform_Research_Assessment.pdf`
- Source: `docs/VELOOP_Assessment_Natural_Student_Version_EDITABLE.docx`

---

## Tech stack

- **React 18** + **Vite 6**
- **React Router 6** (`HashRouter`)
- **lucide-react** icons
- Hand-written CSS with design tokens; no UI framework
- State persisted to `localStorage` under `veloop.rewards.db.v1`
- Passwords are hashed with SHA-256 and a fixed demo salt in the browser — **not production authentication**

```
src/
  components/
    layout/      app shells, navigation, route guards
    levels/      SVG badge artwork, XP Match game board
    rewards/     task card
    ui/          buttons, pills, modal, inputs, toasts, empty states
  context/       AppContext: session, derived balance, actions
  lib/           constants, level metadata, seeding, store, formatting, hashing, icons
  pages/         member pages, public pages, admin pages
  styles/        base, landing, app, pages, levels, admin
docs/            source DOCX and exported PDF
public/docs/     downloadable PDF served by the app
```

---

## Known limitations

- Front-end only; no server, database, email or payment integration.
- `localStorage` is per-browser and easy to edit; this is deliberate for a demo.
- Validation and approvals are simulated, not partner callbacks.
- Password hashing is demo-grade and must be replaced by a real identity provider.
- Currency is fixed at `10 VE = ₹1`; gift cards use `11 VE = ₹1`.
- XP Match runs, scores and daily limits are stored locally with no server timer, anti-cheat or leaderboard.
- Not audited for accessibility or production security.

---

## Deployment

Any static host works because routing is hash-based and asset paths are relative.

**Netlify / Vercel**

- Build command: `npm run build`
- Publish directory: `dist`

**GitHub Pages**

```bash
npm run build
npx gh-pages -d dist
```

Or publish `dist/` from a `gh-pages` branch. No base-path changes are needed because `base: './'` is already configured.

---

## Report

The assessment is an academic research report on the VELoop rewards platform, covering the platform overview, user segments, features, reward and withdrawal flows, trust issues, and prioritised improvements. This repository keeps the original DOCX and an exported PDF in `docs/`, and serves the PDF from the app for convenience.

If you are reviewing this as an assessment submission: the product is the argument. Each screen is intentionally tied to a finding or recommendation in the report.
