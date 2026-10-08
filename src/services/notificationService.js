// InternConnect doesn't yet have a push/notification backend, so this
// service derives notifications for a student by comparing the latest
// application list against the last-seen snapshot. It's intentionally
// framework-agnostic (localStorage only) so it works the same whether
// the data came from the real API or a mock fallback.

const notifKey = (userId) => `ic_notifications_${userId || 'guest'}`;
const snapshotKey = (userId) => `ic_app_snapshot_${userId || 'guest'}`;

const STATUS_MESSAGES = {
  SHORTLISTED: (title, company) => `You've been shortlisted for ${title} at ${company}! ⭐`,
  ACCEPTED: (title, company) => `Great news! You're accepted for ${title} at ${company} 🎉`,
  REJECTED: (title, company) => `Your application for ${title} at ${company} was not selected this time.`,
  PENDING: (title, company) => `Your application for ${title} at ${company} is under review.`,
};

const safeParse = (raw, fallback) => {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const notificationService = {
  /**
   * Compares `applications` against the stored snapshot for `userId`,
   * generates notification entries for any status changes, persists
   * both the snapshot and the notification list, and returns the
   * updated notification list (most recent first).
   */
  syncApplicationStatuses(userId, applications = []) {
    if (!userId) return [];

    const snapshot = safeParse(localStorage.getItem(snapshotKey(userId)), {});
    const existing = safeParse(localStorage.getItem(notifKey(userId)), []);
    const isFirstRun = Object.keys(snapshot).length === 0;

    const nextSnapshot = { ...snapshot };
    const fresh = [];

    applications.forEach((app) => {
      if (!app?.id) return;
      const prevStatus = snapshot[app.id];
      if (prevStatus === app.status) return;

      nextSnapshot[app.id] = app.status;

      // On the very first sync we only surface statuses that already
      // moved past "Pending" (so the bell has something to show in a
      // demo) instead of notifying about every single application.
      const shouldNotify = isFirstRun ? app.status !== 'PENDING' : true;
      if (!shouldNotify) return;

      const msgFn = STATUS_MESSAGES[app.status];
      const message = msgFn
        ? msgFn(app.internshipTitle, app.companyName)
        : `Status update: ${app.internshipTitle} is now ${app.status}`;

      fresh.push({
        id: `${app.id}-${app.status}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        applicationId: app.id,
        message,
        status: app.status,
        createdAt: new Date().toISOString(),
        read: false,
      });
    });

    const updated = [...fresh, ...existing].slice(0, 30);
    localStorage.setItem(snapshotKey(userId), JSON.stringify(nextSnapshot));
    localStorage.setItem(notifKey(userId), JSON.stringify(updated));
    return updated;
  },

  getNotifications(userId) {
    return safeParse(localStorage.getItem(notifKey(userId)), []);
  },

  markAllRead(userId) {
    const updated = this.getNotifications(userId).map((n) => ({ ...n, read: true }));
    localStorage.setItem(notifKey(userId), JSON.stringify(updated));
    return updated;
  },

  clear(userId) {
    localStorage.removeItem(notifKey(userId));
    localStorage.removeItem(snapshotKey(userId));
  },
};
