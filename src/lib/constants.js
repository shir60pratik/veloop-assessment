export const VES_PER_RUPEE = 10;
export const XP_PER_LEVEL = 300;

export const METHODS = [
  {
    id: 'upi',
    label: 'UPI Cash',
    short: 'UPI',
    kind: 'cash',
    rate: 10,
    min: 1000,
    steps: [100, 250, 500],
    destinationType: 'upi',
    destinationLabel: 'UPI ID',
    destinationHint: 'yourname@bank',
    processing: '24–48 hours',
    blurb: 'Send cash straight to your bank account over UPI.',
    note: 'No processing fee. Minimum 1,000 VE (₹100).',
    accent: 'violet',
    icon: 'smartphone',
  },
  {
    id: 'paypal',
    label: 'PayPal Cash',
    short: 'PayPal',
    kind: 'cash',
    rate: 10,
    min: 1000,
    steps: [100, 250, 500],
    destinationType: 'email',
    destinationLabel: 'PayPal email',
    destinationHint: 'you@example.com',
    processing: '3–5 business days',
    blurb: 'Receive cash in your PayPal balance, wherever you are.',
    note: 'No processing fee. Minimum 1,000 VE (₹100).',
    accent: 'sky',
    icon: 'wallet',
  },
  {
    id: 'amazon',
    label: 'Amazon Gift Card',
    short: 'Amazon',
    kind: 'gift',
    rate: 11,
    min: 1100,
    steps: [100, 250, 500],
    destinationType: 'email',
    destinationLabel: 'Delivery email',
    destinationHint: 'you@example.com',
    processing: 'Instant – 24 hours',
    blurb: 'A digital Amazon gift card delivered to your inbox.',
    note: 'Gift cards cost 11 VE per ₹1. Minimum 1,100 VE (₹100).',
    accent: 'amber',
    icon: 'gift',
  },
  {
    id: 'googlePlay',
    label: 'Google Play Gift Card',
    short: 'Google Play',
    kind: 'gift',
    rate: 11,
    min: 1100,
    steps: [100, 250, 500],
    destinationType: 'email',
    destinationLabel: 'Delivery email',
    destinationHint: 'you@example.com',
    processing: 'Instant – 24 hours',
    blurb: 'Top up apps, games and subscriptions with a Play card.',
    note: 'Gift cards cost 11 VE per ₹1. Minimum 1,100 VE (₹100).',
    accent: 'mint',
    icon: 'play',
  },
];

export const METHOD_BY_ID = Object.fromEntries(METHODS.map((method) => [method.id, method]));

export function tiersFor(method) {
  return method.steps.map((inr) => ({ inr, ves: inr * method.rate }));
}

export const REWARD_STATUS = {
  PENDING: {
    label: 'Pending validation',
    tone: 'amber',
    description: 'The campaign partner is checking that the activity met its conditions.',
  },
  CREDITED: {
    label: 'Credited',
    tone: 'mint',
    description: 'The reward is in your wallet and available, subject to the withdrawal minimum.',
  },
  REJECTED: {
    label: 'Not approved',
    tone: 'rose',
    description: 'The activity did not meet one or more conditions. You can appeal with details.',
  },
  APPEALED: {
    label: 'Under appeal',
    tone: 'violet',
    description: 'A human reviewer is looking at your appeal. You will see the outcome here.',
  },
};

export const REDEMPTION_STATUS = {
  UNDER_REVIEW: {
    label: 'Under review',
    tone: 'amber',
    description: 'Your request is with the operations team. You can still cancel for a full refund.',
  },
  APPROVED: {
    label: 'Approved',
    tone: 'violet',
    description: 'Approved and queued for payout. Cancellation is no longer available.',
  },
  PROCESSING: {
    label: 'Processing',
    tone: 'sky',
    description: 'The payout is being sent to your chosen destination.',
  },
  COMPLETED: {
    label: 'Completed',
    tone: 'mint',
    description: 'The payout was sent. Keep your reference number for support.',
  },
  REJECTED: {
    label: 'Rejected',
    tone: 'rose',
    description: 'The request could not be paid. Your VEs were refunded automatically.',
  },
  CANCELLED: {
    label: 'Cancelled',
    tone: 'muted',
    description: 'You cancelled this request and your VEs were refunded.',
  },
};

export const TICKET_STATUS = {
  OPEN: { label: 'Open', tone: 'amber' },
  IN_REVIEW: { label: 'In review', tone: 'violet' },
  RESOLVED: { label: 'Resolved', tone: 'mint' },
};

export const REJECTION_REASONS = [
  'The activity was not completed for the required duration.',
  'An attention check was missed during the survey.',
  'The tracked action could not be verified by the partner.',
  'More than one account was detected on this device.',
  'The task expired before the result reached the partner.',
];

export const GLOSSARY = [
  {
    term: 'VE (VELoop credit)',
    short: 'Platform credit',
    body: 'VEs are reward credits, not money. 10 VE is worth ₹1 when you redeem. VEs cannot be transferred between members.',
  },
  {
    term: 'Available balance',
    short: 'Ready to redeem',
    body: 'Only credited VEs count toward your available balance. Pending rewards are shown separately and cannot be spent.',
  },
  {
    term: 'Pending validation',
    short: 'Not yet yours',
    body: 'The activity was submitted but a partner or automated check still has to confirm it. This is why the task is not credited instantly.',
  },
  {
    term: 'Credited',
    short: 'In your wallet',
    body: 'The reward passed validation and was added to your balance with a ledger row that you can audit.',
  },
  {
    term: 'Reference number',
    short: 'Your receipt',
    body: 'Every withdrawal gets a reference such as VLR-2026-8F3K2A. Quote it to support to get an update without repeating your details.',
  },
  {
    term: 'Appeal',
    short: 'A second look',
    body: 'If a reward is rejected, you can ask for a human review once, with your explanation. The outcome is recorded on the submission.',
  },
];

export const HELP_ARTICLES = [
  {
    id: 'how-rewards-work',
    category: 'Rewards',
    title: 'How rewards are validated and credited',
    summary: 'What “pending” means, who checks the activity, and when VEs reach your wallet.',
    body: [
      'Every task shows a reward amount, an estimated time, the conditions that must be met and an expiry date before you start. Read those details first — they are the same rules the validation step uses.',
      'After you submit an activity, it moves to Pending validation. A campaign partner or an automated check confirms that all conditions were met. Only then does the reward become Credited and appear in your available balance.',
      'In this demo, validation resolves in about 20 seconds so you can watch the lifecycle. On the live platform, validation can take up to 72 hours depending on the campaign.',
      'You can see every reward, its status and its reference in Wallet → Reward activity. Pending rewards never count toward a withdrawal until they are credited.',
    ],
  },
  {
    id: 'why-rejected',
    category: 'Rewards',
    title: 'Why a reward can be rejected',
    summary: 'The five most common reasons — and how the appeal works.',
    body: [
      'A reward is rejected when the activity did not meet one of the conditions shown on the task brief. Common reasons are an incomplete survey, a missed attention check, a partner that could not verify the tracked action, duplicate accounts on one device, or an expiry that passed before the result arrived.',
      'The rejection is recorded with the reason and the date. If you believe the decision is wrong, open the submission in History and choose Appeal. Add what happened and any reference you have.',
      'An appeal goes to a human reviewer, not the automated check. You will see Under appeal while it is being looked at, then either Credited or Not approved with a final note. Each submission can be appealed once.',
    ],
  },
  {
    id: 'withdrawals',
    category: 'Withdrawals',
    title: 'How withdrawals work, step by step',
    summary: 'Minimums, rates, processing windows and what your reference number means.',
    body: [
      'Choose a method, an amount and a destination. The review screen shows the exact VE cost, the rupee value, the minimum for that method and your balance after the request.',
      'When you confirm, VEs are deducted immediately and a reference number is created. That number is your receipt. The request starts as Under review so the same balance cannot be spent twice in another tab.',
      'The operations team checks the destination and the account. Approved requests move to Processing, then Completed when the payout is sent. UPI usually takes 24–48 hours; PayPal takes 3–5 business days; gift cards are usually delivered within 24 hours.',
      'You can cancel while a request is Under review and the VEs are refunded in full. Once a request is Approved it can no longer be cancelled.',
    ],
  },
  {
    id: 'delays',
    category: 'Withdrawals',
    title: 'What to do when a withdrawal is delayed',
    summary: 'How to read the timeline and when to contact support.',
    body: [
      'Open History and select the request. The timeline shows every status change with a timestamp. If the request is still Under review, no action is needed — the current stage is shown clearly instead of a vague “processing”.',
      'If the request has been in the same stage longer than the published window, contact support with your reference number. Support can see the same timeline, so you do not need to resend your destination details.',
      'If a request is rejected, the reason is recorded and the VEs are refunded automatically. Rejected requests are terminal; submit a new request with a corrected destination if needed.',
    ],
  },
  {
    id: 'appeals',
    category: 'Appeals',
    title: 'Appealing a reward decision',
    summary: 'One appeal, a human reviewer, and a written outcome.',
    body: [
      'Open History → Reward activity, find the rejected reward and choose Appeal. Explain what you did and include any detail that helps the reviewer, such as the time you completed the task.',
      'The submission moves to Under appeal and is added to the operations queue. A reviewer checks the submission against the campaign record and either credits the reward or confirms the rejection with a note.',
      'Appeals are not a way to retry a task. If you want another attempt after a final rejection, start the task again only if it is still active and its conditions allow a retry.',
    ],
  },
  {
    id: 'privacy',
    category: 'Privacy & safety',
    title: 'Privacy in plain language',
    summary: 'What the demo stores, where it stores it, and what would change in production.',
    body: [
      'This demo keeps everything in your browser using localStorage: your demo account, wallet, submissions, withdrawals and support tickets. No data is sent to a server and nothing is shared with third parties.',
      'Your withdrawal destination is masked everywhere it is listed. In production, destinations would be encrypted at rest, revealed only to authorised operations staff, and every reveal would be written to an audit log.',
      'You can delete all demo data at any time from the Support page. That clears the local database and reseeds the sample accounts.',
      'Never enter a real UPI ID, bank detail or password into a demo. Use the sample values shown on the login screen.',
    ],
  },
  {
    id: 'account-safety',
    category: 'Privacy & safety',
    title: 'Keeping your account safe',
    summary: 'Bots, fake referrals and suspicious activity.',
    body: [
      'Rewards platforms are targeted by bots and fake referrals. VELoop-style platforms use device checks, attention checks and referral verification to protect genuine campaign activity.',
      'Use one account per person, complete activities yourself and never share a one-time code. If a task asks you to install software or pay a fee, stop and report it to support.',
      'This demo never asks for a real payment. The internship offer mentions a possible certificate fee; this app is independent of that process and does not collect payments.',
    ],
  },
];

export const REPORT_SECTIONS = [
  {
    id: 'platform',
    number: '02',
    title: 'What VELoop Rewards is',
    body: 'A rewards platform where members complete tasks, ads, surveys, games, check-ins and referrals to earn credits. Brands use the same activities to reach engaged users. Rewards depend on validation and platform rules, not just completion.',
  },
  {
    id: 'users',
    number: '03',
    title: 'Who uses it',
    body: 'Members need clear tasks, visible reward details and an easy way to check progress. Brands need reliable completion data. Support needs enough context to investigate missing rewards and delayed withdrawals.',
  },
  {
    id: 'workflow',
    number: '04',
    title: 'The member workflow',
    body: 'Create an account → choose an activity → complete it → wait for validation → check the wallet → redeem → contact support if something goes wrong. Every step in this app shows its current status.',
  },
  {
    id: 'strengths',
    number: '06',
    title: 'What already works',
    body: 'Varied activity types, daily rewards and levels that make progress visible, a help centre grouped by topic, anti-bot and fake-referral rules, and public information about withdrawals and privacy.',
  },
  {
    id: 'gaps',
    number: '07',
    title: 'What could be improved',
    body: 'Explain rewards before a task starts. Make reward status explicit. Explain delays with a timeline. Simplify privacy language. Explain what credits are worth. Put appeals and help next to the problem.',
  },
];

export const IMPROVEMENTS = [
  {
    report: 'Explain rewards before users start',
    implementation: 'Every task brief shows the reward in VEs and ₹, estimated effort, conditions, eligibility and expiry before the start button is enabled.',
    where: 'Tasks → task detail',
  },
  {
    report: 'Make reward status clearer',
    implementation: 'Four explicit states — Pending validation, Credited, Not approved, Under appeal — with a description of what each one means.',
    where: 'Wallet, History',
  },
  {
    report: 'Explain withdrawal delays',
    implementation: 'Each withdrawal has a reference number and a timestamped timeline. The current stage and the published window are always visible.',
    where: 'History → request detail',
  },
  {
    report: 'Give users a reference number',
    implementation: 'A unique VLR-2026-XXXXXX reference is generated at submission, shown on the success screen and stored with the ledger row.',
    where: 'Redeem, History, Support',
  },
  {
    report: 'Provide a reason and an appeal',
    implementation: 'Rejections carry a reason. Eligible rejections can be appealed once and are reviewed in the operations console with a written outcome.',
    where: 'History → Appeal, Admin → Appeals',
  },
  {
    report: 'Explain platform credits',
    implementation: 'A six-term glossary, including “10 VE = ₹1”, sits beside the wallet and is repeated at redemption.',
    where: 'Wallet, Redeem',
  },
  {
    report: 'Improve support access',
    implementation: 'Searchable help articles, ticket creation and a data reset control are grouped on one support page, with the ticket status visible to the member.',
    where: 'Support',
  },
  {
    report: 'Make privacy easier to understand',
    implementation: 'A plain-language privacy page explains what is stored, where, for how long, and what would change in production.',
    where: 'Privacy',
  },
  {
    report: 'Test on mobile and slow connections',
    implementation: 'Responsive layout, large tap targets, reduced-motion support and no blocking web fonts or heavy media.',
    where: 'Whole app',
  },
];

export const SOURCES = [
  { label: 'VELoop Rewards website', href: 'https://www.velooprewards.in/' },
  { label: 'Help Center', href: 'https://www.velooprewards.in/help-center' },
  {
    label: 'Withdrawal help',
    href: 'https://www.velooprewards.in/help-center/withdrawals/how-withdrawals-work',
  },
  { label: 'Privacy Policy', href: 'https://www.velooprewards.in/privacy-policy' },
  { label: 'Disclaimer', href: 'https://www.velooprewards.in/disclaimer' },
];

export const DEMO_ACCOUNTS = {
  member: { email: 'demo.user@veloop.demo', password: 'VeloopUser@2026' },
  admin: { email: 'admin@veloop.demo', password: 'VeloopAdmin@2026' },
  support: { email: 'support@veloop.demo', password: 'VeloopSupport@2026' },
};
