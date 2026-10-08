import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { internshipService } from '../services/internshipService';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import './InternshipDetail.css';

const InternshipDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await internshipService.getById(id);
        if (res.data) {
          setInternship(res.data);

          // Always ask the backend whether this student has already applied.
          // This keeps the Apply button correct after refresh, navigation, or
          // opening the internship directly from the dashboard.
          if (isAuthenticated && user?.role === 'STUDENT') {
            try {
              const applicationsRes = await applicationService.getMyApplications();
              const alreadyApplied = (applicationsRes.data || []).some(
                application =>
                  Number(application.internshipId) === Number(id)
                  && application.status !== 'WITHDRAWN'
              );
              setApplied(alreadyApplied);
            } catch {
              // Keep the normal Apply state if application history cannot be loaded.
            }
          }
        } else {
          setNotFound(true);
        }
      } catch {
        // Real internship only — if it can't be fetched (doesn't exist,
        // or the backend is unreachable), say so honestly instead of
        // showing a fake listing.
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, isAuthenticated, user?.role]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!resume) {
      setApplyError('Please attach your resume in PDF format before applying.');
      return;
    }
    if (resume.type && resume.type !== 'application/pdf' && !resume.name.toLowerCase().endsWith('.pdf')) {
      setApplyError('Only PDF resumes are allowed.');
      return;
    }
    if (resume.size > 5 * 1024 * 1024) {
      setApplyError('Resume must be 5 MB or smaller.');
      return;
    }
    setApplying(true);
    setApplyError('');
    try {
      await applicationService.apply(id, { coverLetter, resume });
      setApplied(true);
      setShowModal(false);
      setResume(null);
      setCoverLetter('');
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const getLogoColor = (name = '') => {
    const colors = ['#6C63FF', '#FF6B9D', '#00D4FF', '#A855F7', '#FF9F43', '#00E5A0'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="page-container">
          <div className="detail-skeleton">
            <div className="skeleton" style={{ height: 200, borderRadius: 20 }}></div>
            <div className="skeleton" style={{ height: 400, borderRadius: 20, marginTop: 24 }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !internship) {
    return (
      <div className="detail-page">
        <div className="page-container">
          <div className="int-empty" id="internship-not-found" style={{ marginTop: 60 }}>
            <div className="int-empty-icon"></div>
            <h3>Internship not found</h3>
            <p>This listing may have been removed, or the link is incorrect.</p>
            <Link to="/internships" className="btn-secondary-custom" style={{ marginTop: 12 }}>Browse Internships</Link>
          </div>
        </div>
      </div>
    );
  }

  const job = internship;

  return (
    <div className="detail-page">
      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay" id="apply-modal" onClick={() => setShowModal(false)}>
          <div className="modal-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Apply for {job.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <p className="modal-subtitle">at {job.companyName}</p>
            {applyError && <div className="apply-error" id="apply-error">{applyError}</div>}
            <div className="form-group">
              <label className="form-label-custom" htmlFor="resume-file">Resume (PDF, max 5 MB) *</label>
              <input
                id="resume-file"
                className="form-control-custom"
                type="file"
                accept=".pdf,application/pdf"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setApplyError('');
                  if (file && file.size > 5 * 1024 * 1024) {
                    setResume(null);
                    setApplyError('Resume must be 5 MB or smaller.');
                    e.target.value = '';
                    return;
                  }
                  if (file && !file.name.toLowerCase().endsWith('.pdf')) {
                    setResume(null);
                    setApplyError('Only PDF resumes are allowed.');
                    e.target.value = '';
                    return;
                  }
                  setResume(file);
                }}
              />
              {resume && (
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 8 }}>
                  Selected: {resume.name} ({(resume.size / (1024 * 1024)).toFixed(2)} MB)
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label-custom" htmlFor="cover-letter">Cover Letter (optional)</label>
              <textarea
                id="cover-letter"
                className="form-control-custom cover-letter-textarea"
                placeholder="Tell them why you're a great fit..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={6}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn-primary-custom"
                onClick={handleApply}
                disabled={applying || !resume}
                id="submit-application-btn"
              >
                {applying ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Submitting...</> : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/" className="bc-link">Home</Link>
          <span className="bc-sep">›</span>
          <Link to="/internships" className="bc-link">Internships</Link>
          <span className="bc-sep">›</span>
          <span className="bc-current">{job.title}</span>
        </div>

        <div className="detail-layout">
          {/* Main Content */}
          <div className="detail-main">
            {/* Header Card */}
            <div className="detail-header-card glass-card">
              <div className="detail-company-row">
                <div className="detail-logo" style={{ background: getLogoColor(job.companyName) }}>
                  {(job.companyName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="detail-job-title">{job.title}</h1>
                  <div className="detail-company-name">{job.companyName}</div>
                </div>
              </div>

              <div className="detail-quick-facts">
                <div className="detail-fact">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {job.location}
                </div>
                <div className="detail-fact">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {job.duration}
                </div>
                <div className="detail-fact detail-fact-green">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  {job.stipend}
                </div>
                <div className="detail-fact">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Deadline: {job.deadline}
                </div>
              </div>

              <div className="detail-badges">
                <span className="badge-primary">{job.location}</span>
                <span className="badge-success">{job.type}</span>
                {job.openings && <span className="badge-warning">{job.openings} Openings</span>}
              </div>
            </div>

            {/* Description */}
            <div className="detail-section glass-card">
              <h2 className="detail-section-title">About the Role</h2>
              <p className="detail-section-text">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="detail-section glass-card">
                <h2 className="detail-section-title">What You'll Do</h2>
                <ul className="detail-list">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="detail-list-item">
                      <span className="detail-list-icon">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="detail-section glass-card">
                <h2 className="detail-section-title">Requirements</h2>
                <ul className="detail-list">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="detail-list-item">
                      <span className="detail-list-icon">✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills && (
              <div className="detail-section glass-card">
                <h2 className="detail-section-title">Skills Required</h2>
                <div className="detail-skills">
                  {job.skills.map((s, i) => (
                    <span key={i} className="int-skill-tag detail-skill">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Perks */}
            {job.perks && (
              <div className="detail-section glass-card">
                <h2 className="detail-section-title">Perks & Benefits</h2>
                <div className="detail-perks">
                  {job.perks.map((p, i) => (
                    <div key={i} className="detail-perk-item">
                      <span className="perk-star"></span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            {/* Apply Card */}
            <div className="apply-card glass-card">
              {applied ? (
                <div className="applied-success" id="applied-success">
                  <div className="applied-icon"></div>
                  <h3>Already Applied</h3>
                  <p>You have already applied for this internship. Track your status in <Link to="/application-status">My Applications</Link>.</p>
                </div>
              ) : (
                <>
                  <div className="apply-card-header">
                    <div className="apply-stipend">{job.stipend}</div>
                    <div className="apply-stipend-label">Monthly Stipend</div>
                  </div>
                  <div className="apply-info-row">
                    <span>Applicants</span>
                    <strong>{job.applicants || '500+'}</strong>
                  </div>
                  <div className="apply-info-row">
                    <span>Openings</span>
                    <strong>{job.openings || 'Multiple'}</strong>
                  </div>
                  <div className="apply-info-row">
                    <span>Type</span>
                    <strong>{job.type}</strong>
                  </div>
                  <div className="apply-deadline">
                    🗓 Apply before {job.deadline}
                  </div>
                  {user?.role === 'STUDENT' || !isAuthenticated ? (
                    <button
                      className="btn-primary-custom apply-now-btn"
                      onClick={() => isAuthenticated ? setShowModal(true) : navigate('/login')}
                      id="apply-now-btn"
                    >
                      {isAuthenticated ? '🚀 Apply Now' : '🔐 Login to Apply'}
                    </button>
                  ) : (
                    <div className="company-note">Companies cannot apply for internships.</div>
                  )}
                </>
              )}
            </div>

            {/* Company Card */}
            {job.companyAbout && (
              <div className="company-card glass-card">
                <h3 className="company-card-title">About {job.companyName}</h3>
                <p className="company-card-text">{job.companyAbout}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetail;
