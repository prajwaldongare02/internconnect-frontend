import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import Pagination from '../components/Pagination';
import './ApplicationStatus.css';

const PAGE_SIZE = 4;

const STATUS_FILTERS = ['All', 'PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];

const statusConfig = {
  PENDING: { label: 'Pending Review', className: 'badge-warning', icon: '', desc: 'Your application is being reviewed by the company.' },
  SHORTLISTED: { label: 'Shortlisted', className: 'badge-primary', icon: '', desc: 'Congratulations! You\'ve been shortlisted for the next round.' },
  ACCEPTED: { label: 'Accepted', className: 'badge-success', icon: '', desc: 'You\'ve been accepted! Check your email for further details.' },
  REJECTED: { label: 'Not Selected', className: 'badge-danger', icon: '', desc: 'Unfortunately, this application did not move forward this time.' },
  WITHDRAWN: { label: 'Withdrawn', className: 'badge-danger', icon: '', desc: 'You withdrew this application. The company can no longer take action on it.' },
};

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState('All');
  const [withdrawing, setWithdrawing] = useState(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(null);
  const [withdrawError, setWithdrawError] = useState('');
  const [page, setPage] = useState(1);

  const fetchApplications = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await applicationService.getMyApplications();
      const data = res.data;
      setApplications(Array.isArray(data) ? data : data?.content || []);
    } catch {
      // Real applications only — an empty or failed result is shown
      // honestly instead of being replaced with fake ones.
      setApplications([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id) => {
    setWithdrawing(id);
    setWithdrawError('');
    try {
      await applicationService.withdraw(id);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'WITHDRAWN' } : a));
      setConfirmWithdraw(null);
    } catch {
      setWithdrawError('Could not withdraw that application. Please try again.');
    } finally {
      setWithdrawing(null);
    }
  };

  const filtered = filter === 'All' ? applications : applications.filter(a => a.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const counts = {
    All: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    SHORTLISTED: applications.filter(a => a.status === 'SHORTLISTED').length,
    ACCEPTED: applications.filter(a => a.status === 'ACCEPTED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
    WITHDRAWN: applications.filter(a => a.status === 'WITHDRAWN').length,
  };

  const getLogoColor = (name = '') => {
    const colors = ['#6C63FF', '#FF6B9D', '#00D4FF', '#A855F7', '#FF9F43', '#00E5A0'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="appstatus-page">
      {/* Confirm Modal */}
      {confirmWithdraw && (
        <div className="modal-overlay" onClick={() => setConfirmWithdraw(null)}>
          <div className="modal-card animate-fade-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">Withdraw Application?</h2>
              <button className="modal-close" onClick={() => setConfirmWithdraw(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-secondary)' }}>
              This action cannot be undone. Are you sure you want to withdraw your application?
            </p>
            {withdrawError && (
              <p style={{ color: '#FF4757', fontSize: '0.85rem' }}>⚠️ {withdrawError}</p>
            )}
            <div className="modal-actions" style={{ marginTop: 8 }}>
              <button className="btn-secondary-custom" onClick={() => setConfirmWithdraw(null)}>Cancel</button>
              <button
                className="btn-danger-custom"
                onClick={() => handleWithdraw(confirmWithdraw)}
                disabled={withdrawing === confirmWithdraw}
                id="confirm-withdraw-btn"
              >
                {withdrawing === confirmWithdraw ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-container">
        {/* Header */}
        <div className="appstatus-header">
          <div>
            <h1 className="appstatus-title">My Applications</h1>
            <p className="appstatus-sub">Track and manage all your internship applications.</p>
          </div>
          <Link to="/internships" className="btn-primary-custom" id="browse-more-btn">
            + Browse More
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="appstatus-summary">
          {Object.entries(statusConfig).map(([key, conf]) => (
            <div
              key={key}
              className={`appstatus-summary-card ${filter === key ? 'active' : ''}`}
              onClick={() => { setFilter(key); setPage(1); }}
              id={`filter-${key.toLowerCase()}`}
            >
              <span className="summary-icon">{conf.icon}</span>
              <span className="summary-count">{counts[key]}</span>
              <span className="summary-label">{conf.label}</span>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="appstatus-tabs">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              className={`appstatus-tab ${filter === f ? 'active' : ''}`}
              onClick={() => { setFilter(f); setPage(1); }}
              id={`tab-${f.toLowerCase()}`}
            >
              {f === 'All' ? `All (${counts.All})` : `${statusConfig[f]?.icon} ${f.charAt(0) + f.slice(1).toLowerCase()} (${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Application Cards */}
        {loading ? (
          <div className="appstatus-list">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }}></div>
            ))}
          </div>
        ) : loadError ? (
          <div className="appstatus-empty" id="applications-load-error">
            <div className="appstatus-empty-icon">⚠️</div>
            <h3>Couldn't load your applications</h3>
            <p>Please check your connection and try again.</p>
            <button className="btn-primary-custom" onClick={fetchApplications}>Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="appstatus-empty" id="no-applications">
            <div className="appstatus-empty-icon">📭</div>
            <h3>No applications found</h3>
            <p>{filter === 'All' ? "You haven't applied to any internships yet." : `No ${filter.toLowerCase()} applications.`}</p>
            <Link to="/internships" className="btn-primary-custom">Browse Internships</Link>
          </div>
        ) : (
          <div className="appstatus-list">
            {paginated.map((app, i) => {
              const conf = statusConfig[app.status] || statusConfig.PENDING;
              return (
                <div key={app.id || i} className="appstatus-card" id={`app-card-${app.id || i}`}>
                  <div className="appstatus-card-left">
                    <div className="appstatus-logo" style={{ background: getLogoColor(app.companyName) }}>
                      {(app.companyName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="appstatus-info">
                      <h3 className="appstatus-job-title">{app.internshipTitle}</h3>
                      <div className="appstatus-company">{app.companyName}</div>
                      <div className="appstatus-meta">
                        <span>📍 {app.location}</span>
                        <span>🗓 Applied: {app.appliedAt}</span>
                        <span>⏱ {app.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="appstatus-card-right">
                    <span className={conf.className}>{conf.icon} {conf.label}</span>
                    <p className="appstatus-status-desc">{conf.desc}</p>
                    {app.resumeUrl && (
                      <a
                        className="btn-secondary-custom appstatus-resume-btn"
                        href={applicationService.getResumeUrl(app.resumeUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Resume
                      </a>
                    )}
                    {(app.status === 'PENDING' || app.status === 'SHORTLISTED') && (
                      <button
                        className="btn-danger-custom appstatus-withdraw-btn"
                        onClick={() => setConfirmWithdraw(app.id)}
                        id={`withdraw-btn-${app.id || i}`}
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} idPrefix="applications" />
        )}
      </div>
    </div>
  );
};

export default ApplicationStatus;
