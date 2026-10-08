import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { placementOfficerService } from '../services/placementOfficerService';
import Pagination from '../components/Pagination';
import './AdminPanel.css';

const PAGE_SIZE = 6;

const PlacementOfficerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingError, setPendingError] = useState(false);
  const [approvedError, setApprovedError] = useState(false);
  const [applicationsError, setApplicationsError] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [applicationsPage, setApplicationsPage] = useState(1);

  const college = user?.college || 'Your College';

  const fetchAll = async () => {
    setLoading(true);
    setPendingError(false);
    setApprovedError(false);
    setApplicationsError(false);
    // Real data only. Companies fan a posting out to every TPO's queue;
    // until a real company has actually posted something, these lists
    // are genuinely empty — we never substitute fake postings.
    try {
      const res = await placementOfficerService.getPendingInternships();
      const data = res.data;
      setPending(Array.isArray(data) ? data : data?.content || []);
    } catch {
      setPending([]);
      setPendingError(true);
    }
    try {
      const res = await placementOfficerService.getApprovedInternships();
      const data = res.data;
      setApproved(Array.isArray(data) ? data : data?.content || []);
    } catch {
      setApproved([]);
      setApprovedError(true);
    }
    try {
      const res = await placementOfficerService.getCollegeApplications();
      const data = res.data;
      setApplications(Array.isArray(data) ? data : data?.content || []);
    } catch {
      setApplications([]);
      setApplicationsError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleApprove = async (internship) => {
    setActingId(internship.id);
    setActionError('');
    try {
      await placementOfficerService.approveInternship(internship.id);
      setPending(prev => prev.filter(p => p.id !== internship.id));
      setApproved(prev => [{ ...internship, approvedOn: new Date().toISOString().slice(0, 10) }, ...prev]);
    } catch (error) {
      setActionError(error?.response?.data?.message || 'Could not approve that internship. Please try again.');
    }
    setActingId(null);
  };

  const handleReject = async (internship) => {
    setActingId(internship.id);
    setActionError('');
    try {
      await placementOfficerService.rejectInternship(internship.id);
      setPending(prev => prev.filter(p => p.id !== internship.id));
    } catch (error) {
      setActionError(error?.response?.data?.message || 'Could not reject that internship. Please try again.');
    }
    setActingId(null);
  };

  const stats = useMemo(() => ([
    { label: 'Pending Approvals', value: pending.length, icon: null },
    { label: 'Opened for My College', value: approved.length, icon: null },
    { label: 'Students Applied', value: new Set(applications.map(a => a.studentId)).size, icon: null },
    { label: 'Applications', value: applications.length, icon: null },
  ]), [pending, approved, applications]);

  const pendingTotalPages = Math.max(1, Math.ceil(pending.length / PAGE_SIZE));
  const paginatedPending = pending.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);

  const approvedTotalPages = Math.max(1, Math.ceil(approved.length / PAGE_SIZE));
  const paginatedApproved = approved.slice((approvedPage - 1) * PAGE_SIZE, approvedPage * PAGE_SIZE);

  const applicationsTotalPages = Math.max(1, Math.ceil(applications.length / PAGE_SIZE));
  const paginatedApplications = applications.slice((applicationsPage - 1) * PAGE_SIZE, applicationsPage * PAGE_SIZE);

  return (
    <div className="ap-page">
      {/* Welcome Banner */}
      <div className="ap-welcome-banner">
        <div className="ap-welcome-orb"></div>
        <div className="page-container">
          <div className="ap-welcome-content">
            <div>
              <h1 className="ap-welcome-title">
                Welcome, <span className="gradient-text">{user?.name || 'Placement Officer'}</span> 
              </h1>
              <p className="ap-welcome-sub">
                You're the placement gatekeeper for <strong>{college}</strong>. Companies post once — you decide what your students see.
              </p>
            </div>

          </div>
        </div>
      </div>

      <div className="page-container ap-main">
        {actionError && (
          <div className="ap-empty" id="officer-action-error" style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.25)' }}>
            <p style={{ color: '#FF4757' }}>⚠️ {actionError}</p>
          </div>
        )}
        {/* Stats */}
        <div className="ap-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="ap-stat-card" id={`officer-stat-${i}`}>
              <div className="ap-stat-icon">{s.icon || ""}</div>
              <div className="ap-stat-value">{loading ? '–' : s.value}</div>
              <div className="ap-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ap-tabs" id="officer-tabs">
          {[
            { key: 'pending', label: 'Pending Approvals', count: pending.length },
            { key: 'approved', label: 'Opened for My College', count: approved.length },
            { key: 'applications', label: 'Students Who Applied', count: applications.length },
          ].map(tab => (
            <button
              key={tab.key}
              className={`ap-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              id={`officer-tab-${tab.key}`}
            >
              {tab.label}
              <span className="ap-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Pending Approvals */}
        {activeTab === 'pending' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">Pending Approvals</h2>
                <p className="ap-section-desc">Internships posted by companies, awaiting your decision to open them up for {college}.</p>
              </div>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 160, borderRadius: 12 }}></div>
            ) : pendingError ? (
              <div className="ap-empty" id="pending-error">
                <p>Couldn't load pending approvals right now.</p>
                <button className="btn-secondary-custom" onClick={fetchAll} style={{ marginTop: 12 }}>Try Again</button>
              </div>
            ) : pending.length === 0 ? (
              <div className="ap-empty">
                <div className="ap-empty-icon"></div>
                <p>You're all caught up — no internships waiting on a decision.</p>
              </div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table" id="pending-table">
                    <thead>
                      <tr><th>Role</th><th>Company</th><th>Location</th><th>Stipend</th><th>Deadline</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {paginatedPending.map((job) => (
                        <tr key={job.id} id={`pending-row-${job.id}`}>
                          <td className="ap-td-primary">
                            {job.title}
                            <div className="ap-td-sub">Posted {job.postedAt}</div>
                          </td>
                          <td>{job.companyName}</td>
                          <td>{job.location}</td>
                          <td>{job.stipend}</td>
                          <td>{job.deadline}</td>
                          <td>
                            <div className="ap-actions">
                              <button
                                className="ap-action-btn ap-approve"
                                onClick={() => handleApprove(job)}
                                disabled={actingId === job.id}
                                id={`approve-internship-${job.id}`}
                              >
                                {actingId === job.id ? 'Saving...' : `Open for ${college}`}
                              </button>
                              <button
                                className="ap-action-btn ap-reject"
                                onClick={() => handleReject(job)}
                                disabled={actingId === job.id}
                                id={`reject-internship-${job.id}`}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={pendingPage} totalPages={pendingTotalPages} onPageChange={setPendingPage} idPrefix="pending" />
              </>
            )}
          </div>
        )}

        {/* Approved */}
        {activeTab === 'approved' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">Opened for {college}</h2>
                <p className="ap-section-desc">These internships are now visible to your students on the listings page.</p>
              </div>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 160, borderRadius: 12 }}></div>
            ) : approvedError ? (
              <div className="ap-empty" id="approved-error">
                <p>Couldn't load approved internships right now.</p>
                <button className="btn-secondary-custom" onClick={fetchAll} style={{ marginTop: 12 }}>Try Again</button>
              </div>
            ) : approved.length === 0 ? (
              <div className="ap-empty"><p>Nothing approved yet — check the Pending Approvals tab.</p></div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table" id="approved-table">
                    <thead>
                      <tr><th>Role</th><th>Company</th><th>Location</th><th>Stipend</th><th>Opened On</th></tr>
                    </thead>
                    <tbody>
                      {paginatedApproved.map((job) => (
                        <tr key={job.id} id={`approved-row-${job.id}`}>
                          <td className="ap-td-primary">{job.title}</td>
                          <td>{job.companyName}</td>
                          <td>{job.location}</td>
                          <td>{job.stipend}</td>
                          <td>
                            <span className="ap-status-pill active">{job.approvedOn}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={approvedPage} totalPages={approvedTotalPages} onPageChange={setApprovedPage} idPrefix="approved" />
              </>
            )}
          </div>
        )}

        {/* Applications from students of this college */}
        {activeTab === 'applications' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">Students Who Applied</h2>
                <p className="ap-section-desc">Students from {college} who applied to internships that you opened for your college.</p>
              </div>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 160, borderRadius: 12 }}></div>
            ) : applicationsError ? (
              <div className="ap-empty" id="applications-error">
                <p>Couldn't load student applications right now.</p>
                <button className="btn-secondary-custom" onClick={fetchAll} style={{ marginTop: 12 }}>Try Again</button>
              </div>
            ) : applications.length === 0 ? (
              <div className="ap-empty"><p>No students from your college have applied to your opened internships yet.</p></div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table" id="officer-applications-table">
                    <thead>
                      <tr><th>Student</th><th>Company</th><th>Internship</th><th>Department</th><th>Applied On</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {paginatedApplications.map((app) => (
                        <tr key={app.id} id={`officer-application-row-${app.id}`}>
                          <td className="ap-td-primary">
                            {app.studentName || 'Student'}
                            <div className="ap-td-sub">{app.studentEmail || ''}</div>
                          </td>
                          <td>{app.companyName || '—'}</td>
                          <td>{app.internshipTitle || '—'}</td>
                          <td>{app.department || '—'}</td>
                          <td>{app.appliedAt || '—'}</td>
                          <td>
                            <span className={`ap-status-pill ${app.status === 'ACCEPTED' || app.status === 'SHORTLISTED' ? 'active' : app.status === 'REJECTED' ? 'inactive' : 'pending'}`}>
                              {app.status || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={applicationsPage} totalPages={applicationsTotalPages} onPageChange={setApplicationsPage} idPrefix="officer-applications" />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementOfficerDashboard;
