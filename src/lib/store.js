import { DB_KEY, DB_VERSION, seedDB } from './seed';
import { hashPassword } from './hash';
import {
  METHOD_BY_ID,
  REJECTION_REASONS,
  XP_PER_LEVEL,
} from './constants';
import {
  maskDestination,
  todayKey,
  yesterdayKey,
  VES_PER_RUPEE,
} from './format';

/* ------------------------------------------------------------------ *
 * Storage
 * ------------------------------------------------------------------ */

let cache = null;
let bootstrap = null;

function readStorage() {
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(db) {
  cache = db;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Storage can be unavailable (private mode). The in-memory copy still works.
  }
}

export async function ensureDB() {
  if (cache) return cache;
  if (!bootstrap) {
    bootstrap = (async () => {
      const stored = readStorage();
      if (stored && stored.version === DB_VERSION) {
        cache = stored;
        return cache;
      }
      const fresh = await seedDB();
      persist(fresh);
      return fresh;
    })();
  }
  return bootstrap;
}

export function getDB() {
  if (!cache) throw new Error('The demo database is still loading.');
  return cache;
}

export async function resetDemo() {
  cache = null;
  bootstrap = null;
  try {
    window.localStorage.removeItem(DB_KEY);
  } catch {
    /* ignore */
  }
  return ensureDB();
}

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const nowIso = () => new Date().toISOString();

export function userById(db, id) {
  return db.users.find((user) => user.id === id) || null;
}

export function memberOf(db) {
  return db.session?.memberId ? userById(db, db.session.memberId) : null;
}

export function adminOf(db) {
  return db.session?.adminId ? userById(db, db.session.adminId) : null;
}

export function balanceOf(db, userId) {
  return db.transactions
    .filter((tx) => tx.userId === userId)
    .reduce((sum, tx) => sum + (tx.kind === 'credit' ? tx.amount : -tx.amount), 0);
}

export function pendingCreditsOf(db, userId) {
  return db.submissions
    .filter((sub) => sub.userId === userId && (sub.status === 'PENDING' || sub.status === 'APPEALED'))
    .reduce((sum, sub) => sum + sub.rewardVEs, 0);
}

export function levelInfo(xp = 0) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return {
    level,
    into,
    nextAt: level * XP_PER_LEVEL,
    progress: into / XP_PER_LEVEL,
  };
}

export function transactionsOf(db, userId) {
  return db.transactions
    .filter((tx) => tx.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function submissionsOf(db, userId) {
  return db.submissions
    .filter((sub) => sub.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function redemptionsOf(db, userId) {
  return db.redemptions
    .filter((request) => request.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function ticketsOf(db, userId) {
  return db.tickets
    .filter((ticket) => ticket.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function taskState(db, userId, task) {
  const latest = db.submissions
    .filter((sub) => sub.userId === userId && sub.taskId === task.id)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

  const expired = new Date(task.expiresAt).getTime() < Date.now();
  const user = userById(db, userId);
  const locked = Boolean(task.minLevel && levelInfo(user?.xp || 0).level < task.minLevel);
  const busy = Boolean(latest && ['PENDING', 'CREDITED', 'APPEALED'].includes(latest.status));

  return {
    submission: latest || null,
    expired,
    locked,
    canStart: Boolean(task.active) && !expired && !locked && !busy,
    reason: locked
      ? `Unlocks at Level ${task.minLevel}`
      : expired
        ? 'This campaign has expired'
        : null,
  };
}

/* ------------------------------------------------------------------ *
 * Ledger primitives
 * ------------------------------------------------------------------ */

function addTransaction(db, userId, kind, amount, title, detail, ref = null) {
  const tx = {
    id: uid('tx'),
    userId,
    kind,
    amount,
    title,
    detail,
    createdAt: nowIso(),
    status: 'COMPLETED',
    ref,
  };
  db.transactions.unshift(tx);
  return tx;
}

function addSubmissionCredit(db, submission, note) {
  const user = userById(db, submission.userId);
  addTransaction(
    db,
    submission.userId,
    'credit',
    submission.rewardVEs,
    submission.taskTitle,
    note,
    `SUB-${submission.id.slice(-4).toUpperCase()}`,
  );
  if (user) user.xp = (user.xp || 0) + Math.max(5, Math.round(submission.rewardVEs * 0.6));
}

function makeReference(db) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const year = new Date().getFullYear();
  let reference = '';
  do {
    const body = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    reference = `VLR-${year}-${body}`;
  } while (db.redemptions.some((request) => request.reference === reference));
  return reference;
}

/* ------------------------------------------------------------------ *
 * Member auth
 * ------------------------------------------------------------------ */

export async function loginMember(email, password) {
  const db = getDB();
  const normalized = String(email || '').trim().toLowerCase();
  const user = db.users.find((candidate) => candidate.role === 'member' && candidate.email === normalized);
  if (!user) throw new Error('No member account was found for that email.');
  if (user.status !== 'active') throw new Error('This account is suspended. Contact support for a review.');
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) throw new Error('That password does not match this account.');
  user.lastLoginAt = nowIso();
  db.session.memberId = user.id;
  persist(db);
  return user;
}

export async function registerMember({ name, email, password }) {
  const db = getDB();
  const cleanName = String(name || '').trim();
  const normalized = String(email || '').trim().toLowerCase();
  if (cleanName.length < 2) throw new Error('Enter the name you want shown on your account.');
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(normalized)) throw new Error('Enter a valid email address.');
  if (String(password || '').length < 8) throw new Error('Use at least 8 characters for the demo password.');
  if (db.users.some((user) => user.email === normalized)) {
    throw new Error('An account already exists with that email. Try signing in.');
  }

  const user = {
    id: uid('u'),
    name: cleanName,
    email: normalized,
    passwordHash: await hashPassword(password),
    role: 'member',
    status: 'active',
    xp: 20,
    streak: 0,
    lastCheckIn: null,
    referrals: 0,
    emailVerified: true,
    joinedAt: nowIso(),
    lastLoginAt: nowIso(),
    avatarColor: 'violet',
  };
  db.users.push(user);
  addTransaction(db, user.id, 'credit', 100, 'Welcome bonus', 'New member welcome credit');
  db.session.memberId = user.id;
  persist(db);
  return user;
}

export function logoutMember() {
  const db = getDB();
  db.session.memberId = null;
  persist(db);
}

export async function loginAdmin(email, password) {
  const db = getDB();
  const normalized = String(email || '').trim().toLowerCase();
  const user = db.users.find(
    (candidate) => ['admin', 'support'].includes(candidate.role) && candidate.email === normalized,
  );
  if (!user) throw new Error('No operations account was found for that email.');
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) throw new Error('That password does not match this account.');
  user.lastLoginAt = nowIso();
  db.session.adminId = user.id;
  persist(db);
  return user;
}

export function logoutAdmin() {
  const db = getDB();
  db.session.adminId = null;
  persist(db);
}

/* ------------------------------------------------------------------ *
 * Rewards
 * ------------------------------------------------------------------ */

export function claimDaily(userId) {
  const db = getDB();
  const user = userById(db, userId);
  if (!user) throw new Error('Sign in again to claim the daily reward.');
  const today = todayKey();
  if (user.lastCheckIn === today) throw new Error('You have already claimed today. Come back tomorrow.');
  const continued = user.lastCheckIn === yesterdayKey();
  user.streak = continued ? (user.streak || 0) + 1 : 1;
  user.lastCheckIn = today;
  user.xp = (user.xp || 0) + 20;
  addTransaction(db, userId, 'credit', 5, 'Daily check-in', `Streak day ${user.streak}`);
  persist(db);
  return { amount: 5, streak: user.streak };
}

export function startTask(userId, taskId) {
  const db = getDB();
  const task = db.tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new Error('That activity is no longer available.');
  const state = taskState(db, userId, task);
  if (!state.canStart) {
    throw new Error(state.reason || 'This activity cannot be started right now.');
  }
  const submission = {
    id: uid('sub'),
    userId,
    taskId,
    taskTitle: task.title,
    rewardVEs: task.rewardVEs,
    status: 'PENDING',
    submittedAt: nowIso(),
    resolveAt: new Date(Date.now() + 20 * 1000).toISOString(),
    reviewedAt: null,
    reason: null,
    resolutionNote: null,
    appealMessage: null,
    appealAt: null,
  };
  db.submissions.unshift(submission);
  persist(db);
  return submission;
}

/**
 * Demo-only validation worker. In production a partner callback or a job would
 * perform this step; here it resolves ~20 seconds after submission so the full
 * lifecycle is visible.
 */
export function settleDueSubmissions() {
  const db = getDB();
  const due = db.submissions.filter(
    (sub) => sub.status === 'PENDING' && new Date(sub.resolveAt).getTime() <= Date.now(),
  );
  if (!due.length) return 0;

  due.forEach((submission, index) => {
    const approved = Math.random() < 0.86;
    submission.reviewedAt = nowIso();
    if (approved) {
      submission.status = 'CREDITED';
      submission.resolutionNote = 'Validated automatically. Reward added to your wallet.';
      addSubmissionCredit(db, submission, 'Validated automatically');
    } else {
      submission.status = 'REJECTED';
      submission.reason = REJECTION_REASONS[(submission.id.length + index) % REJECTION_REASONS.length];
      submission.resolutionNote = null;
    }
  });
  persist(db);
  return due.length;
}

export function appealSubmission(userId, submissionId, message) {
  const db = getDB();
  const submission = db.submissions.find(
    (candidate) => candidate.id === submissionId && candidate.userId === userId,
  );
  if (!submission) throw new Error('Submission not found.');
  if (submission.status !== 'REJECTED') throw new Error('Only a rejected reward can be appealed.');
  const text = String(message || '').trim();
  if (text.length < 15) throw new Error('Add at least 15 characters so the reviewer has context.');
  submission.status = 'APPEALED';
  submission.appealMessage = text;
  submission.appealAt = nowIso();
  persist(db);
  return submission;
}

/* ------------------------------------------------------------------ *
 * Redemptions
 * ------------------------------------------------------------------ */

export function redeem(userId, { methodId, inr, destination }) {
  const db = getDB();
  const method = METHOD_BY_ID[methodId];
  if (!method) throw new Error('Choose a payout method first.');
  const amount = Number(inr);
  if (!method.steps.includes(amount)) throw new Error('Choose one of the available amounts.');
  const ves = amount * method.rate;

  const balance = balanceOf(db, userId);
  if (ves > balance) {
    throw new Error(`You need ${ves - balance} more VE for this request.`);
  }

  const value = String(destination || '').trim();
  if (method.destinationType === 'upi') {
    if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(value)) {
      throw new Error('Enter a valid UPI ID, for example yourname@bank.');
    }
  } else if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(value)) {
    throw new Error('Enter a valid email address for delivery.');
  }

  const reference = makeReference(db);
  const request = {
    id: uid('red'),
    userId,
    method: method.id,
    methodLabel: method.label,
    destination: value,
    maskedDestination: maskDestination(method.id, value),
    ves,
    inr: amount,
    status: 'UNDER_REVIEW',
    reference,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    adminNote: null,
    timeline: [
      {
        status: 'UNDER_REVIEW',
        label: 'Request received',
        at: nowIso(),
        note: 'Reference created and VEs deducted.',
      },
    ],
  };

  addTransaction(db, userId, 'debit', ves, `Redemption · ${method.label}`, reference, reference);
  db.redemptions.unshift(request);
  persist(db);
  return request;
}

export function cancelRedemption(userId, redemptionId) {
  const db = getDB();
  const request = db.redemptions.find(
    (candidate) => candidate.id === redemptionId && candidate.userId === userId,
  );
  if (!request) throw new Error('Request not found.');
  if (request.status !== 'UNDER_REVIEW') {
    throw new Error('Only a request that is still under review can be cancelled.');
  }
  request.status = 'CANCELLED';
  request.updatedAt = nowIso();
  request.timeline.push({
    status: 'CANCELLED',
    label: 'Cancelled by member',
    at: nowIso(),
    note: 'VEs refunded to the wallet.',
  });
  addTransaction(
    db,
    userId,
    'credit',
    request.ves,
    `Refund · ${request.methodLabel}`,
    request.reference,
    request.reference,
  );
  persist(db);
  return request;
}

/* ------------------------------------------------------------------ *
 * Support tickets
 * ------------------------------------------------------------------ */

export function createTicket(userId, { subject, category, message }) {
  const db = getDB();
  const user = userById(db, userId);
  if (!user) throw new Error('Sign in again to contact support.');
  const cleanSubject = String(subject || '').trim();
  const cleanMessage = String(message || '').trim();
  if (cleanSubject.length < 5) throw new Error('Give the ticket a short subject (at least 5 characters).');
  if (cleanMessage.length < 15) throw new Error('Add a little more detail (at least 15 characters).');
  const ticket = {
    id: uid('tkt'),
    userId,
    subject: cleanSubject,
    category: category || 'General',
    message: cleanMessage,
    status: 'OPEN',
    priority: 'Normal',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    replies: [],
  };
  db.tickets.unshift(ticket);
  persist(db);
  return ticket;
}

export function replyAsMember(userId, ticketId, message) {
  const db = getDB();
  const ticket = db.tickets.find((candidate) => candidate.id === ticketId && candidate.userId === userId);
  if (!ticket) throw new Error('Ticket not found.');
  const text = String(message || '').trim();
  if (text.length < 2) throw new Error('Write a reply first.');
  const user = userById(db, userId);
  ticket.replies.push({
    id: uid('rep'),
    author: user.name,
    role: 'member',
    message: text,
    at: nowIso(),
  });
  ticket.status = 'IN_REVIEW';
  ticket.updatedAt = nowIso();
  persist(db);
  return ticket;
}

export function replyAsOperations(adminId, ticketId, message, resolve = false) {
  const db = getDB();
  const admin = userById(db, adminId);
  const ticket = db.tickets.find((candidate) => candidate.id === ticketId);
  if (!ticket) throw new Error('Ticket not found.');
  const text = String(message || '').trim();
  if (text.length < 2) throw new Error('Write a reply first.');
  ticket.replies.push({
    id: uid('rep'),
    author: admin.name,
    role: admin.role,
    message: text,
    at: nowIso(),
  });
  ticket.status = resolve ? 'RESOLVED' : 'IN_REVIEW';
  ticket.updatedAt = nowIso();
  persist(db);
  return ticket;
}

export function setTicketStatus(ticketId, status) {
  const db = getDB();
  const ticket = db.tickets.find((candidate) => candidate.id === ticketId);
  if (!ticket) throw new Error('Ticket not found.');
  ticket.status = status;
  ticket.updatedAt = nowIso();
  persist(db);
  return ticket;
}

/* ------------------------------------------------------------------ *
 * Operations actions
 * ------------------------------------------------------------------ */

const NEXT_REDEMPTION_STEP = {
  UNDER_REVIEW: 'APPROVED',
  APPROVED: 'PROCESSING',
  PROCESSING: 'COMPLETED',
};

const STEP_COPY = {
  APPROVED: { label: 'Approved by operations', note: 'Destination checked and request approved.' },
  PROCESSING: { label: 'Payout in progress', note: 'Sent to the payout provider.' },
  COMPLETED: { label: 'Payout completed', note: 'Provider confirmed the payout.' },
};

export function advanceRedemption(redemptionId, adminId) {
  const db = getDB();
  const request = db.redemptions.find((candidate) => candidate.id === redemptionId);
  if (!request) throw new Error('Request not found.');
  const next = NEXT_REDEMPTION_STEP[request.status];
  if (!next) throw new Error('This request cannot move forward from its current status.');
  const admin = userById(db, adminId);
  request.status = next;
  request.updatedAt = nowIso();
  request.timeline.push({
    status: next,
    label: STEP_COPY[next].label,
    at: nowIso(),
    note: STEP_COPY[next].note,
    by: admin?.name,
  });
  persist(db);
  return request;
}

export function rejectRedemption(redemptionId, adminId, note) {
  const db = getDB();
  const request = db.redemptions.find((candidate) => candidate.id === redemptionId);
  if (!request) throw new Error('Request not found.');
  if (!['UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(request.status)) {
    throw new Error('This request cannot be rejected from its current status.');
  }
  const reason = String(note || '').trim();
  if (reason.length < 5) throw new Error('Add a short reason so the member understands the decision.');
  const admin = userById(db, adminId);
  request.status = 'REJECTED';
  request.updatedAt = nowIso();
  request.adminNote = reason;
  request.timeline.push({
    status: 'REJECTED',
    label: 'Rejected by operations',
    at: nowIso(),
    note: reason,
    by: admin?.name,
  });
  addTransaction(
    db,
    request.userId,
    'credit',
    request.ves,
    `Refund · ${request.methodLabel}`,
    request.reference,
    request.reference,
  );
  persist(db);
  return request;
}

export function resolveAppeal(submissionId, adminId, decision, note) {
  const db = getDB();
  const submission = db.submissions.find((candidate) => candidate.id === submissionId);
  if (!submission) throw new Error('Submission not found.');
  if (submission.status !== 'APPEALED') throw new Error('This submission is not under appeal.');
  const clean = String(note || '').trim();
  if (clean.length < 5) throw new Error('Add a short reviewer note.');
  const admin = userById(db, adminId);
  submission.reviewedAt = nowIso();
  submission.resolutionNote = `${clean}${admin ? ` — ${admin.name}` : ''}`;
  if (decision === 'approve') {
    submission.status = 'CREDITED';
    addSubmissionCredit(db, submission, 'Appeal upheld');
  } else {
    submission.status = 'REJECTED';
    submission.appealMessage = submission.appealMessage || '';
    submission.appealResolved = true;
  }
  persist(db);
  return submission;
}

export { VES_PER_RUPEE };
