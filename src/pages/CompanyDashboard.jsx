import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { internshipService } from '../services/internshipService';
import { applicationService } from '../services/applicationService';
import { companyService } from '../services/companyService';
import Pagination from '../components/Pagination';
import './CompanyDashboard.css';

const LISTINGS_PAGE_SIZE = 5;
const APPLICANTS_PAGE_SIZE = 5;

const statusBadge = {
  PENDING: 'badge-warning',
  SHORTLISTED: 'badge-primary',
  ACCEPTED: 'badge-success',
  REJECTED: 'badge-danger',
};

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [companyStatus, setCompanyStatus] = useState(user?.companyStatus || 'PENDING');
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingsError, setListingsError] = useState(false);
  const [applicantsError, setApplicantsError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [listingsPage, setListingsPage] = useState(1);
  const [applicantsPage, setApplicantsPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const profile = await companyService.getProfile();
      setCompanyStatus(profile.data?.status || 'PENDING');
    } catch {
      setCompanyStatus(user?.companyStatus || 'PENDING');
    }
    setListingsError(false);
    setApplicantsError(false);
    // Real data only — an empty (or failed) response is shown honestly
    // instead of being padded with fake listings/applicants.
    try {
      const res = await internshipService.getMine();
      const data = res.data;
      setInternships(Array.isArray(data) ? data : data?.content || []);
    } catch {
      setInternships([]);
      setListingsError(true);
    }
    try {
      const appRes = await applicationService.getApplicationsForCompany();
      const data = appRes.data;
      setApplicants(Array.isArray(data) ? data : data?.content || []);
    } catch {
      setApplicants([]);
      setApplicantsError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setActionError('');
    try {
      await internshipService.delete(id);
      setInternships(prev => prev.filter(i => i.id !== id));
    } catch {
      setActionError('Could not delete that listing. Please try again.');
    }
    setDeletingId(null);
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    setUpdatingId(appId);
    setActionError('');
    try {
      await applicationService.updateStatus(appId, newStatus);
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch {
      setActionError('Could not update that application. Please try again.');
    }
    setUpdatingId(null);
  };

  const totalApplicants = internships.reduce((s, i) => s + (i.applicants || 0), 0);
  const activeListings = internships.filter(i => i.status !== 'CLOSED').length;
  const shortlisted = applicants.filter(a => a.status === 'SHORTLISTED').length;

  const stats = [
    { label: 'Active Listings', value: activeListings, icon: '📋', color: 'stat-purple' },
    { label: 'Total Applicants', value: totalApplicants, icon: '', color: 'stat-blue' },
    { label: 'Shortlisted', value: shortlisted, icon: '', color: 'stat-orange' },
  ];

  const listingsTotalPages = Math.max(1, Math.ceil(internships.length / LISTINGS_PAGE_SIZE));
  const paginatedListings = internships.slice(
    (listingsPage - 1) * LISTINGS_PAGE_SIZE,
    listingsPage * LISTINGS_PAGE_SIZE
  );

  const applicantsTotalPages = Math.max(1, Math.ceil(applicants.length / APPLICANTS_PAGE_SIZE));
  const paginatedApplicants = applicants.slice(
    (applicantsPage - 1) * APPLICANTS_PAGE_SIZE,
    applicantsPage * APPLICANTS_PAGE_SIZE
  );

  return (
    <div className="company-dashboard">
      {/* Welcome Banner */}
      <div className="cd-welcome-banner">
        <div className="cd-welcome-orb"></div>
        <div className="page-container">
          <div className="cd-welcome-content">
            <div>
              <h1 className="cd-welcome-title">
                Welcome, <span className="gradient-text">{user?.name || 'Company'}</span>
              </h1>
              <p className="cd-welcome-sub">Manage your internship listings and review applicants.</p>
            </div>
            <div className="cd-welcome-actions">
              <Link to={companyStatus === 'APPROVED' ? '/post-internship' : '#'} className="btn-primary-custom cd-post-btn" id="dashboard-post-btn" onClick={e => { if (companyStatus !== 'APPROVED') e.preventDefault(); }}>
                {companyStatus === 'APPROVED' ? '+ Post Internship' : 'Awaiting Approval'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container cd-main">
        {companyStatus !== 'APPROVED' && (
          <div className="cd-empty" style={{ marginBottom: 20, border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: 8 }}>Company approval pending</h3>
            <p>{companyStatus === 'REJECTED'
              ? 'Your company account was not approved by the Admin. Please contact the college administrator.'
              : 'Your company account must be approved by the Admin before you can post internships.'}</p>
          </div>
        )}
        {actionError && (
          <div className="cd-empty" id="action-error-banner" style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.25)' }}>
            <p style={{ color: '#FF4757' }}>⚠️ {actionError}</p>
          </div>
        )}
        {/* Stats */}
        <div className="cd-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className={`sd-stat-card ${s.color}`} id={`cd-stat-${i}`}>
              <div className="sd-stat-icon">{s.icon}</div>
              <div className="sd-stat-value">{loading ? '–' : s.value}</div>
              <div className="sd-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Internship Listings */}
        <div className="cd-section glass-card">
          <div className="cd-section-header">
            <h2 className="cd-section-title">Your Internship Postings</h2>
            <Link to={companyStatus === 'APPROVED' ? '/post-internship' : '#'} className="btn-primary-custom cd-small-btn" id="post-new-btn" onClick={e => { if (companyStatus !== 'APPROVED') e.preventDefault(); }}>+ New Listing</Link>
          </div>

          {loading ? (
            <div className="cd-list">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }}></div>)}
            </div>
          ) : listingsError ? (
            <div className="cd-empty" id="listings-error">
              <p>Couldn't load your listings right now.</p>
              <button className="btn-secondary-custom" onClick={fetchData} style={{ marginTop: 12 }}>Try Again</button>
            </div>
          ) : internships.length === 0 ? (
            <div className="cd-empty" id="no-listings">
              <p>You haven't posted any internships yet.</p>
              {companyStatus === 'APPROVED' && <Link to="/post-internship" className="btn-primary-custom" style={{ marginTop: 12 }}>Post Your First Internship</Link>}
            </div>
          ) : (
            <div className="cd-table-wrap">
              <table className="cd-table" id="listings-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Applicants</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedListings.map((job, i) => (
                    <tr key={job.id || i} id={`listing-row-${job.id || i}`}>
                      <td className="cd-td-role">
                        <div className="cd-role-title">{job.title}</div>
                        <div className="cd-role-date">Posted: {job.postedAt}</div>
                      </td>
                      <td className="cd-td-text">{job.location}</td>
                      <td className="cd-td-text">{job.type}</td>
                      <td className="cd-td-applicants">
                        <span className="cd-applicant-count">{job.applicants || 0}</span>
                      </td>
                      <td className="cd-td-text">{job.deadline}</td>
                      <td>
                        <span className={job.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <div className="cd-actions">
                          <button
                            className="cd-action-btn cd-edit-btn"
                            onClick={() => navigate(`/post-internship?edit=${job.id}`)}
                            id={`edit-btn-${job.id || i}`}
                          >
                            Edit
                          </button>
                          <button
                            className="cd-action-btn cd-delete-btn"
                            onClick={() => handleDelete(job.id)}
                            disabled={deletingId === job.id}
                            id={`delete-btn-${job.id || i}`}
                          >
                            {deletingId === job.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && internships.length > 0 && (
            <Pagination page={listingsPage} totalPages={listingsTotalPages} onPageChange={setListingsPage} idPrefix="listings" />
          )}
        </div>

        {/* Applicant Management */}
        <div className="cd-section glass-card">
          <div className="cd-section-header">
            <h2 className="cd-section-title">Recent Applicants</h2>
            <span className="cd-applicant-total">{applicants.length} total</span>
          </div>

          {loading ? (
            <div className="cd-list">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }}></div>)}
            </div>
          ) : applicantsError ? (
            <div className="cd-empty" id="applicants-error">
              <p>Couldn't load applicants right now.</p>
              <button className="btn-secondary-custom" onClick={fetchData} style={{ marginTop: 12 }}>Try Again</button>
            </div>
          ) : applicants.length === 0 ? (
            <div className="cd-empty">
              <p>No applicants yet.</p>
            </div>
          ) : (
            <div className="cd-applicant-list">
              {paginatedApplicants.map((app, i) => (
                <div key={app.id || i} className="cd-applicant-row" id={`applicant-row-${app.id || i}`}>
                  <div className="cd-applicant-avatar">
                    {(app.studentName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="cd-applicant-info">
                    <div className="cd-applicant-name">{app.studentName}</div>
                    <div className="cd-applicant-role">{app.internshipTitle} · Applied {app.appliedAt}</div>
                  </div>
                  <div className="cd-applicant-actions">
                    {app.resumeUrl && (
                      <a
                        className="cd-action-btn cd-resume-btn"
                        href={applicationService.getResumeUrl(app.resumeUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`resume-btn-${app.id || i}`}
                      >
                        View Resume
                      </a>
                    )}
                    <span className={statusBadge[app.status] || 'badge-warning'}>{app.status}</span>
                    <div className="cd-status-btns">
                      {app.status !== 'SHORTLISTED' && (
                        <button
                          className="cd-action-btn cd-shortlist-btn"
                          onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                          disabled={updatingId === app.id}
                          id={`shortlist-btn-${app.id || i}`}
                        >
                          Shortlist for 1 Round
                        </button>
                      )}
                      {app.status !== 'REJECTED' && (
                        <button
                          className="cd-action-btn cd-reject-btn"
                          onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                          disabled={updatingId === app.id}
                          id={`reject-btn-${app.id || i}`}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && applicants.length > 0 && (
            <Pagination page={applicantsPage} totalPages={applicantsTotalPages} onPageChange={setApplicantsPage} idPrefix="applicants" />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
