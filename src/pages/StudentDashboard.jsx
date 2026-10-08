import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';
import { internshipService } from '../services/internshipService';
import './StudentDashboard.css';

const statusColors = {
  PENDING: 'badge-warning',
  SHORTLISTED: 'badge-primary',
  ACCEPTED: 'badge-success',
  REJECTED: 'badge-danger',
};

const statusEmoji = {
  PENDING: '',
  SHORTLISTED: '',
  ACCEPTED: '',
  REJECTED: '',
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appsError, setAppsError] = useState(false);
  const [recError, setRecError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setAppsError(false);
    setRecError(false);

    // Real data only. If a fetch genuinely fails we show an honest
    // "couldn't load" state below — we never substitute fake
    // internships/applications for a real (possibly empty) result.
    try {
      const appRes = await applicationService.getMyApplications();
      const data = appRes.data;
      setApplications(Array.isArray(data) ? data : data?.content || []);
    } catch {
      setApplications([]);
      setAppsError(true);
    }

    try {
      const recRes = await internshipService.getAll();
      const data = recRes.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      setRecommended(list.slice(0, 3));
    } catch {
      setRecommended([]);
      setRecError(true);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { label: 'Applied', value: applications.length, icon: '📋', color: 'stat-purple' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'SHORTLISTED').length, icon: '', color: 'stat-blue' },
    { label: 'Accepted', value: applications.filter(a => a.status === 'ACCEPTED').length, icon: '', color: 'stat-green' },
    { label: 'Pending', value: applications.filter(a => a.status === 'PENDING').length, icon: '', color: 'stat-orange' },
  ];

  const getLogoColor = (name = '') => {
    const colors = ['#6C63FF', '#FF6B9D', '#00D4FF', '#A855F7', '#FF9F43', '#00E5A0'];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div className="student-dashboard">
      {/* Welcome Banner */}
      <div className="sd-welcome-banner">
        <div className="sd-welcome-orb"></div>
        <div className="page-container">
          <div className="sd-welcome-content">
            <div>
              <h1 className="sd-welcome-title">
                Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
              </h1>
              <p className="sd-welcome-sub">Track your applications and discover new opportunities.</p>
            </div>
            <Link to="/internships" className="btn-primary-custom sd-browse-btn" id="dashboard-browse-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Browse Internships
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container sd-main">
        {/* Stats */}
        <div className="sd-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className={`sd-stat-card ${s.color}`} id={`stat-card-${i}`}>
              <div className="sd-stat-icon">{s.icon}</div>
              <div className="sd-stat-value">{loading ? '–' : s.value}</div>
              <div className="sd-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="sd-two-col">
          {/* Recent Applications */}
          <div className="sd-section">
            <div className="sd-section-header">
              <h2 className="sd-section-title">Recent Applications</h2>
              <Link to="/application-status" className="sd-view-all" id="view-all-applications">View all →</Link>
            </div>

            {loading ? (
              <div className="sd-app-list">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="sd-app-row skeleton" style={{ height: 72, borderRadius: 12 }}></div>
                ))}
              </div>
            ) : appsError ? (
              <div className="cd-empty" id="applications-error">
                <p>Couldn't load your applications right now.</p>
                <button className="btn-secondary-custom" onClick={fetchData} style={{ marginTop: 10 }}>Try Again</button>
              </div>
            ) : applications.length === 0 ? (
              <div className="cd-empty" id="no-applications">
                <p>You haven't applied to any internships yet.</p>
                <Link to="/internships" className="btn-primary-custom" style={{ marginTop: 12 }}>Browse Internships</Link>
              </div>
            ) : (
              <div className="sd-app-list">
                {applications.slice(0, 5).map((app, i) => (
                  <div key={app.id || i} className="sd-app-row" id={`app-row-${app.id || i}`}>
                    <div className="sd-app-logo" style={{ background: getLogoColor(app.companyName) }}>
                      {(app.companyName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="sd-app-info">
                      <div className="sd-app-title">{app.internshipTitle}</div>
                      <div className="sd-app-company">{app.companyName} · {app.location}</div>
                    </div>
                    <div className="sd-app-right">
                      <span className={statusColors[app.status] || 'badge-warning'}>
                        {statusEmoji[app.status]} {app.status}
                      </span>
                      <div className="sd-app-date">{app.appliedAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended */}
          <div className="sd-section">
            <div className="sd-section-header">
              <h2 className="sd-section-title">Recommended for You</h2>
              <Link to="/internships" className="sd-view-all" id="view-all-recommended">See more →</Link>
            </div>

            {loading ? (
              <div className="sd-rec-list">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="sd-rec-card skeleton" style={{ height: 76, borderRadius: 12 }}></div>
                ))}
              </div>
            ) : recError ? (
              <div className="cd-empty" id="recommended-error">
                <p>Couldn't load internships right now.</p>
                <button className="btn-secondary-custom" onClick={fetchData} style={{ marginTop: 10 }}>Try Again</button>
              </div>
            ) : recommended.length === 0 ? (
              <div className="cd-empty" id="no-recommended">
                <p>No internships have been posted for your college yet. Check back soon!</p>
              </div>
            ) : (
              <div className="sd-rec-list">
                {recommended.map((job, i) => (
                  <Link
                    key={job.id || i}
                    to={`/internships/${job.id}`}
                    className="sd-rec-card"
                    id={`rec-card-${i}`}
                  >
                    <div className="sd-rec-logo" style={{ background: getLogoColor(job.companyName) }}>
                      {(job.companyName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="sd-rec-info">
                      <div className="sd-rec-title">{job.title}</div>
                      <div className="sd-rec-company">{job.companyName}</div>
                      <div className="sd-rec-meta">
                        <span className="badge-primary">{job.location}</span>
                        {job.stipend && <span className="sd-rec-stipend">{job.stipend}</span>}
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sd-rec-arrow">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="sd-tips glass-card">
          <h2 className="sd-section-title" style={{ marginBottom: 20 }}>💡 Tips to Stand Out</h2>
          <div className="sd-tips-grid">
            {[
              { icon: '📄', title: 'Update Your Resume', desc: 'Keep your resume fresh with recent projects and skills.' },
              { icon: '🤝', title: 'Network Actively', desc: 'Connect with professionals and alumni in your target field.' },
              { icon: '✍️', title: 'Personalize Cover Letters', desc: 'Tailor each application to the company and role.' },
              { icon: '🎯', title: 'Apply Consistently', desc: 'Apply to 3-5 roles weekly for the best results.' },
            ].map((tip, i) => (
              <div key={i} className="sd-tip-item" id={`tip-${i}`}>
                <div className="sd-tip-icon">{tip.icon}</div>
                <div>
                  <div className="sd-tip-title">{tip.title}</div>
                  <div className="sd-tip-desc">{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
