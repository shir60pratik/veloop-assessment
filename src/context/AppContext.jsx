import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  advanceRedemption,
  appealSubmission,
  balanceOf,
  cancelRedemption,
  claimDaily,
  createTicket,
  ensureDB,
  getDB,
  levelInfo,
  loginAdmin,
  loginMember,
  logoutAdmin,
  logoutMember,
  memberOf,
  adminOf,
  pendingCreditsOf,
  redeem,
  registerMember,
  rejectRedemption,
  replyAsMember,
  replyAsOperations,
  resetDemo,
  resolveAppeal,
  setTicketStatus,
  settleDueSubmissions,
  startTask,
} from '../lib/store';
import { ToastViewport } from '../components/ui/Toast';

const AppContext = createContext(null);

let toastId = 0;

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [db, setDb] = useState(null);
  const [toasts, setToasts] = useState([]);

  const refresh = useCallback(() => {
    try {
      setDb({ ...getDB() });
    } catch {
      /* not bootstrapped yet */
    }
  }, []);

  const notify = useCallback((message, tone = 'success') => {
    toastId += 1;
    const id = toastId;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4400);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    let alive = true;
    ensureDB().then(() => {
      if (!alive) return;
      refresh();
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!ready) return undefined;
    const timer = window.setInterval(() => {
      const settled = settleDueSubmissions();
      if (settled) {
        refresh();
        notify(
          settled === 1
            ? 'A reward finished validation. Check your wallet for the outcome.'
            : `${settled} rewards finished validation. Check your wallet.`,
          'info',
        );
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [ready, refresh, notify]);

  const value = useMemo(() => {
    const member = db ? memberOf(db) : null;
    const admin = db ? adminOf(db) : null;
    const balance = db && member ? balanceOf(db, member.id) : 0;
    const pending = db && member ? pendingCreditsOf(db, member.id) : 0;
    const level = levelInfo(member?.xp || 0);

    const memberAction = (fn) => (...args) => {
      const result = fn(...args);
      refresh();
      return result;
    };

    return {
      ready,
      db,
      member,
      admin,
      balance,
      pending,
      level,
      notify,
      toasts,
      dismiss,
      refresh,
      resetAll: async () => {
        await resetDemo();
        refresh();
        notify('Demo data was reset to the original sample accounts.', 'info');
      },
      login: async (email, password) => {
        const user = await loginMember(email, password);
        refresh();
        return user;
      },
      register: async (payload) => {
        const user = await registerMember(payload);
        refresh();
        return user;
      },
      logout: () => {
        logoutMember();
        refresh();
      },
      loginAdmin: async (email, password) => {
        const user = await loginAdmin(email, password);
        refresh();
        return user;
      },
      logoutAdmin: () => {
        logoutAdmin();
        refresh();
      },
      claimDaily: memberAction((userId) => claimDaily(userId)),
      startTask: memberAction((userId, taskId) => startTask(userId, taskId)),
      appeal: memberAction((userId, submissionId, message) =>
        appealSubmission(userId, submissionId, message),
      ),
      redeem: memberAction((userId, payload) => redeem(userId, payload)),
      cancelRedemption: memberAction((userId, id) => cancelRedemption(userId, id)),
      createTicket: memberAction((userId, payload) => createTicket(userId, payload)),
      replyToTicket: memberAction((userId, ticketId, message) =>
        replyAsMember(userId, ticketId, message),
      ),
      advanceRedemption: (id, adminId) => {
        const result = advanceRedemption(id, adminId);
        refresh();
        return result;
      },
      rejectRedemption: (id, adminId, note) => {
        const result = rejectRedemption(id, adminId, note);
        refresh();
        return result;
      },
      resolveAppeal: (submissionId, adminId, decision, note) => {
        const result = resolveAppeal(submissionId, adminId, decision, note);
        refresh();
        return result;
      },
      replyAsOperations: (adminId, ticketId, message, resolve) => {
        const result = replyAsOperations(adminId, ticketId, message, resolve);
        refresh();
        return result;
      },
      setTicketStatus: (ticketId, status) => {
        const result = setTicketStatus(ticketId, status);
        refresh();
        return result;
      },
    };
  }, [ready, db, toasts, dismiss, notify, refresh]);

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
