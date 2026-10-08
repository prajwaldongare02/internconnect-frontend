import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';
import { notificationService } from '../services/notificationService';
import './NotificationBell.css';

const POLL_INTERVAL_MS = 30000;

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const statusIcon = {
  SHORTLISTED: '',
  ACCEPTED: '',
  REJECTED: '',
  PENDING: '',
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    let applications = [];
    try {
      const res = await applicationService.getMyApplications();
      applications = res.data || [];
    } catch {
      applications = [];
    }
    const updated = notificationService.syncApplicationStatuses(user.id, applications);
    setNotifications(updated);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    setNotifications(notificationService.getNotifications(user.id));
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, refresh]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notificationService.markAllRead(user.id));
  };

  return (
    <div className="notif-wrap" ref={wrapRef} id="notification-bell-wrap">
      <button
        className="notif-bell-btn"
        onClick={() => setOpen((o) => !o)}
        id="notification-bell-btn"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="notif-badge" id="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown animate-fade" id="notification-dropdown">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-read" onClick={handleMarkAllRead} id="mark-all-read-btn">
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <span className="notif-empty-icon">🔔</span>
                <p>You're all caught up. We'll notify you when your application status changes.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} id={`notif-${n.id}`}>
                  <span className="notif-item-icon">{statusIcon[n.status] || '🔔'}</span>
                  <div className="notif-item-body">
                    <p>{n.message}</p>
                    <span className="notif-item-time">{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link to="/application-status" className="notif-view-all" onClick={() => setOpen(false)} id="notif-view-all-link">
            View all applications →
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
