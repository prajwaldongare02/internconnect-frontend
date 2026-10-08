import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import Pagination from '../components/Pagination';
import './AdminPanel.css';

const PAGE_SIZE = 6;


const emptyOfficerForm = { fullName: '', email: '', college: '', password: '' };
const emptyCollegeForm = { name: '' };

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [officers, setOfficers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [internships, setInternships] = useState([]);
  const [internshipsError, setInternshipsError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [officersPage, setOfficersPage] = useState(1);
  const [companiesPage, setCompaniesPage] = useState(1);
  const [studentsPage, setStudentsPage] = useState(1);
  const [internshipsPage, setInternshipsPage] = useState(1);

  const [officerModal, setOfficerModal] = useState(null); // null | 'create' | officer object (edit)
  const [collegeModal, setCollegeModal] = useState(false);
  const [collegeForm, setCollegeForm] = useState(emptyCollegeForm);
  const [savingCollege, setSavingCollege] = useState(false);
  const [collegeFormError, setCollegeFormError] = useState('');
  const [officerForm, setOfficerForm] = useState(emptyOfficerForm);
  const [savingOfficer, setSavingOfficer] = useState(false);
  const [officerFormError, setOfficerFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const collegeRes = await adminService.getColleges();
        const collegeData = collegeRes.data;
        setColleges(Array.isArray(collegeData) ? collegeData : collegeData.content || []);
      } catch {
        setColleges([]);
      }
      try {
        const res = await adminService.getPlacementOfficers();
        const data = res.data;
        setOfficers(Array.isArray(data) ? data : data.content || []);
      } catch {
        setOfficers([]);
      }
      try {
        const res = await adminService.getCompanies();
        const data = res.data;
        setCompanies(Array.isArray(data) ? data : data.content || []);
      } catch {
        setCompanies([]);
      }
      try {
        const res = await adminService.getStudents();
        const data = res.data;
        setStudents(Array.isArray(data) ? data : data.content || []);
      } catch {
        setStudents([]);
      }
      try {
        const res = await adminService.getInternships();
        const data = res.data;
        setInternships(Array.isArray(data) ? data : data.content || []);
        setInternshipsError(false);
      } catch {
        setInternships([]);
        setInternshipsError(true);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => ([
    { label: 'Colleges', value: colleges.filter(c => c.active).length },
    { label: 'Placement Officers', value: officers.length },
    { label: 'Active TPOs', value: officers.filter(o => o.isActive).length },
    { label: 'Partner Companies', value: companies.length },
    { label: 'Registered Students', value: students.length },
  ]), [colleges, officers, companies, students]);

  // ---------- Placement Officer CRUD ----------
  const openCreateCollege = () => {
    setCollegeForm(emptyCollegeForm);
    setCollegeFormError('');
    setCollegeModal(true);
  };

  const handleSaveCollege = async (e) => {
    e.preventDefault();
    if (!collegeForm.name.trim()) {
      setCollegeFormError('Enter the full college name.');
      return;
    }
    setSavingCollege(true);
    setCollegeFormError('');
    try {
      const res = await adminService.createCollege({ name: collegeForm.name.trim() });
      setColleges(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setCollegeModal(false);
      setCollegeForm(emptyCollegeForm);
    } catch (error) {
      setCollegeFormError(error?.response?.data?.message || 'Unable to create the college.');
    } finally {
      setSavingCollege(false);
    }
  };

  const handleToggleCollege = async (college) => {
    try {
      await adminService.toggleCollegeStatus(college.id, !college.active);
      setColleges(prev => prev.map(c => c.id === college.id ? { ...c, active: !college.active } : c));
    } catch {
      // Keep the current state if the server rejects the change.
    }
  };

  const openCreateOfficer = () => {
    setOfficerForm({ ...emptyOfficerForm, college: colleges.find(c => c.active)?.name || '' });
    setOfficerFormError('');
    setOfficerModal('create');
  };

  const openEditOfficer = (officer) => {
    setOfficerForm({ fullName: officer.fullName, email: officer.email, college: officer.college, password: '' });
    setOfficerFormError('');
    setOfficerModal(officer);
  };

  const handleOfficerFormChange = (e) => {
    setOfficerForm({ ...officerForm, [e.target.name]: e.target.value });
    setOfficerFormError('');
  };

  const handleSaveOfficer = async (e) => {
    e.preventDefault();
    if (!officerForm.fullName || !officerForm.email || !officerForm.college) {
      setOfficerFormError('Please fill in all required fields.');
      return;
    }
    if (officerModal === 'create' && !officerForm.password) {
      setOfficerFormError('Please set a temporary password for the new TPO.');
      return;
    }
    setSavingOfficer(true);
    try {
      if (officerModal === 'create') {
        const res = await adminService.createPlacementOfficer(officerForm);
        setOfficers(prev => [...prev, res.data]);
      } else {
        const id = officerModal.id;
        await adminService.updatePlacementOfficer(id, officerForm);
        setOfficers(prev => prev.map(o => (o.id === id ? { ...o, ...officerForm } : o)));
      }
      setOfficerModal(null);
    } catch {
      setOfficerFormError('Unable to save the placement officer. Please try again.');
    } finally {
      setSavingOfficer(false);
    }
  };

  const handleDeleteOfficer = async (id) => {
    try {
      await adminService.deletePlacementOfficer(id);
    } catch {
      return;
    }
    setOfficers(prev => prev.filter(o => o.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleOfficerStatus = async (officer) => {
    const nextStatus = !officer.isActive;
    try {
      await adminService.togglePlacementOfficerStatus(officer.id, nextStatus);
    } catch {
      return;
    }
    setOfficers(prev => prev.map(o => (o.id === officer.id ? { ...o, isActive: nextStatus } : o)));
  };

  // ---------- Company moderation ----------
  const handleCompanyStatus = async (id, status) => {
    try {
      await adminService.updateCompanyStatus(id, status);
    } catch {
      return;
    }
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
  };

  // ---------- Pagination slices ----------
  const officersTotalPages = Math.max(1, Math.ceil(officers.length / PAGE_SIZE));
  const paginatedOfficers = officers.slice((officersPage - 1) * PAGE_SIZE, officersPage * PAGE_SIZE);

  const companiesTotalPages = Math.max(1, Math.ceil(companies.length / PAGE_SIZE));
  const paginatedCompanies = companies.slice((companiesPage - 1) * PAGE_SIZE, companiesPage * PAGE_SIZE);

  const studentsTotalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const internshipsTotalPages = Math.max(1, Math.ceil(internships.length / PAGE_SIZE));
  const paginatedInternships = internships.slice((internshipsPage - 1) * PAGE_SIZE, internshipsPage * PAGE_SIZE);
  const paginatedStudents = students.slice((studentsPage - 1) * PAGE_SIZE, studentsPage * PAGE_SIZE);

  const collegeBreakdown = useMemo(() => {
    return colleges.map(c => {
      const count = students.filter(s => (s.college || '').toLowerCase() === c.name.toLowerCase()).length;
      const assigned = officers.filter(o => (o.college || '').toLowerCase() === c.name.toLowerCase());
      return [c.name, count, assigned];
    });
  }, [colleges, students, officers]);

  return (
    <div className="ap-page">
      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-card animate-fade-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Remove Placement Officer?</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {deleteConfirm.fullName} will lose access immediately, and internships pending approval for {deleteConfirm.college} will need a new TPO assigned.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary-custom" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger-custom" onClick={() => handleDeleteOfficer(deleteConfirm.id)} id="confirm-delete-officer-btn">
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create College modal */}
      {collegeModal && (
        <div className="modal-overlay" onClick={() => setCollegeModal(false)}>
          <div className="modal-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add College</h2>
              <button className="modal-close" onClick={() => setCollegeModal(false)}>✕</button>
            </div>
            <p className="modal-subtitle">Create the college first. You can then assign one or more TPO accounts to it.</p>
            {collegeFormError && <div className="auth-error" id="college-form-error">{collegeFormError}</div>}
            <form className="ap-modal-form" onSubmit={handleSaveCollege}>
              <div className="form-group">
                <label className="form-label-custom" htmlFor="college-name">College / University Name *</label>
                <input id="college-name" className="form-control-custom" value={collegeForm.name} onChange={e => { setCollegeForm({ name: e.target.value }); setCollegeFormError(''); }} placeholder="e.g. Institute of Management and Career Courses" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary-custom" onClick={() => setCollegeModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-custom" disabled={savingCollege}>{savingCollege ? 'Creating...' : 'Create College'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Placement Officer modal */}
      {officerModal && (
        <div className="modal-overlay" onClick={() => setOfficerModal(null)}>
          <div className="modal-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{officerModal === 'create' ? 'Add Placement Officer' : 'Edit Placement Officer'}</h2>
              <button className="modal-close" onClick={() => setOfficerModal(null)}>✕</button>
            </div>
            <p className="modal-subtitle">Each Placement Officer manages internship approvals for exactly one college.</p>

            {officerFormError && (
              <div className="auth-error" id="officer-form-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {officerFormError}
              </div>
            )}

            <form className="ap-modal-form" onSubmit={handleSaveOfficer} id="officer-form">
              <div className="form-group">
                <label className="form-label-custom" htmlFor="officer-fullname">Full Name *</label>
                <input
                  type="text" id="officer-fullname" name="fullName" className="form-control-custom"
                  placeholder="e.g. Dr. Rajesh Kumar" value={officerForm.fullName} onChange={handleOfficerFormChange} required
                />
              </div>
              <div className="form-group">
                <label className="form-label-custom" htmlFor="officer-email">Email *</label>
                <input
                  type="email" id="officer-email" name="email" className="form-control-custom"
                  placeholder="tpo@college.edu" value={officerForm.email} onChange={handleOfficerFormChange} required
                />
              </div>
              <div className="form-group">
                <label className="form-label-custom" htmlFor="officer-college">College / University *</label>
                <select
                  id="officer-college" name="college" className="form-control-custom"
                  value={officerForm.college} onChange={handleOfficerFormChange} required
                >
                  <option value="">Select an active college</option>
                  {colleges.filter(c => c.active).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label-custom" htmlFor="officer-password">
                  {officerModal === 'create' ? 'Temporary Password *' : 'Reset Password (optional)'}
                </label>
                <input
                  type="password" id="officer-password" name="password" className="form-control-custom"
                  placeholder={officerModal === 'create' ? 'At least 8 characters' : 'Leave blank to keep current password'}
                  value={officerForm.password} onChange={handleOfficerFormChange}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary-custom" onClick={() => setOfficerModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary-custom" disabled={savingOfficer} id="save-officer-btn">
                  {savingOfficer ? 'Saving...' : officerModal === 'create' ? '+ Add TPO' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="ap-welcome-banner">
        <div className="ap-welcome-orb"></div>
        <div className="page-container">
          <div className="ap-welcome-content">
            <div>
              <h1 className="ap-welcome-title">
                Welcome, <span className="gradient-text">{user?.name || 'Admin'}</span> 🛡️
              </h1>
              <p className="ap-welcome-sub">Manage Placement Officers across colleges, moderate companies, and oversee the whole placement pipeline.</p>
            </div>
            <div className="ap-welcome-actions">
              <button className="btn-secondary-custom" onClick={openCreateCollege} id="add-college-btn">+ Add College</button>
              <button className="btn-primary-custom" onClick={openCreateOfficer} id="add-officer-btn">+ Add TPO</button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container ap-main">
        {/* Stats */}
        <div className="ap-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="ap-stat-card" id={`admin-stat-${i}`}>
              <div className="ap-stat-icon">{s.icon || ""}</div>
              <div className="ap-stat-value">{loading ? '–' : s.value}</div>
              <div className="ap-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ap-tabs" id="admin-tabs">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'colleges', label: 'Colleges', count: colleges.length },
            { key: 'officers', label: 'Placement Officers', count: officers.length },
            { key: 'companies', label: 'Companies', count: companies.length },
            { key: 'students', label: 'Students', count: students.length },
            { key: 'internships', label: 'Internships', count: internships.length },
            { key: 'reports', label: 'Reports' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`ap-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              id={`admin-tab-${tab.key}`}
            >
              {tab.label}
              {typeof tab.count === 'number' && <span className="ap-tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">Students by College</h2>
                <p className="ap-section-desc">A quick read on which campuses are most active on the platform.</p>
              </div>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 120, borderRadius: 12 }}></div>
            ) : collegeBreakdown.length === 0 ? (
              <div className="ap-empty"><p>No student data yet.</p></div>
            ) : (
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead><tr><th>College</th><th>Registered Students</th><th>Assigned TPO</th></tr></thead>
                  <tbody>
                    {collegeBreakdown.map(([college, count, assigned]) => {
                      return (
                        <tr key={college}>
                          <td className="ap-td-primary">{college}</td>
                          <td>{count}</td>
                          <td>
                            {assigned.length ? assigned.map(o => o.fullName).join(', ') : (
                              <span className="ap-status-pill pending">Unassigned</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Colleges */}
        {activeTab === 'colleges' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">Colleges</h2>
                <p className="ap-section-desc">Admin creates colleges here first. TPO accounts can only be assigned to an active college.</p>
              </div>
              <button className="btn-primary-custom cd-small-btn" onClick={openCreateCollege}>+ Add College</button>
            </div>
            {colleges.length === 0 ? (
              <div className="ap-empty"><p>No colleges have been created yet. Add your first college before adding a TPO.</p></div>
            ) : (
              <div className="ap-table-wrap">
                <table className="ap-table" id="colleges-table">
                  <thead><tr><th>College</th><th>Status</th><th>Assigned TPOs</th><th>Actions</th></tr></thead>
                  <tbody>
                    {colleges.map(college => {
                      const assigned = officers.filter(o => (o.college || '').toLowerCase() === college.name.toLowerCase());
                      return (
                        <tr key={college.id}>
                          <td className="ap-td-primary">{college.name}</td>
                          <td><span className={`ap-status-pill ${college.active ? 'active' : 'inactive'}`}>{college.active ? 'Active' : 'Inactive'}</span></td>
                          <td>{assigned.length ? assigned.map(o => o.fullName).join(', ') : 'No TPO assigned'}</td>
                          <td><button className="ap-action-btn" onClick={() => handleToggleCollege(college)}>{college.active ? 'Deactivate' : 'Activate'}</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Placement Officers */}
        {activeTab === 'officers' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">Placement Officers (TPOs)</h2>
                <p className="ap-section-desc">Each TPO decides which internships are opened up to students at their own college.</p>
              </div>
              <button className="btn-primary-custom cd-small-btn" onClick={openCreateOfficer} id="officers-tab-add-btn">+ Add TPO</button>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 160, borderRadius: 12 }}></div>
            ) : officers.length === 0 ? (
              <div className="ap-empty">
                <div className="ap-empty-icon"></div>
                <p>No Placement Officers added yet.</p>
              </div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table" id="officers-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>College</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {paginatedOfficers.map((officer) => (
                        <tr key={officer.id} id={`officer-row-${officer.id}`}>
                          <td className="ap-td-primary">{officer.fullName}</td>
                          <td>{officer.email}</td>
                          <td>{officer.college}</td>
                          <td>
                            <span className={`ap-status-pill ${officer.isActive ? 'active' : 'inactive'}`}>
                              {officer.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="ap-actions">
                              <button className="ap-action-btn" onClick={() => openEditOfficer(officer)} id={`edit-officer-${officer.id}`}>Edit</button>
                              <button className="ap-action-btn" onClick={() => handleToggleOfficerStatus(officer)} id={`toggle-officer-${officer.id}`}>
                                {officer.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="ap-action-btn ap-reject" onClick={() => setDeleteConfirm(officer)} id={`delete-officer-${officer.id}`}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={officersPage} totalPages={officersTotalPages} onPageChange={setOfficersPage} idPrefix="officers" />
              </>
            )}
          </div>
        )}

        {/* Companies */}
        {activeTab === 'companies' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">Companies</h2>
                <p className="ap-section-desc">Approve new company accounts before their listings can reach any college.</p>
              </div>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 160, borderRadius: 12 }}></div>
            ) : companies.length === 0 ? (
              <div className="ap-empty"><p>No companies registered yet.</p></div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table" id="companies-table">
                    <thead>
                      <tr><th>Company</th><th>Email</th><th>Industry</th><th>Active Listings</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {paginatedCompanies.map((c) => (
                        <tr key={c.id} id={`company-row-${c.id}`}>
                          <td className="ap-td-primary">{c.name}</td>
                          <td>{c.email}</td>
                          <td>{c.industry}</td>
                          <td>{c.activeListings}</td>
                          <td>
                            <span className={`ap-status-pill ${c.status === 'APPROVED' ? 'active' : c.status === 'REJECTED' ? 'inactive' : 'pending'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            <div className="ap-actions">
                              {c.status !== 'APPROVED' && (
                                <button className="ap-action-btn ap-approve" onClick={() => handleCompanyStatus(c.id, 'APPROVED')} id={`approve-company-${c.id}`}>Approve</button>
                              )}
                              {c.status !== 'REJECTED' && (
                                <button className="ap-action-btn ap-reject" onClick={() => handleCompanyStatus(c.id, 'REJECTED')} id={`block-company-${c.id}`}>Reject</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={companiesPage} totalPages={companiesTotalPages} onPageChange={setCompaniesPage} idPrefix="companies" />
              </>
            )}
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">Students</h2>
                <p className="ap-section-desc">All registered students across every college on the platform.</p>
              </div>

            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 160, borderRadius: 12 }}></div>
            ) : students.length === 0 ? (
              <div className="ap-empty"><p>No students registered yet.</p></div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table" id="students-table">
                    <thead>
                      <tr><th>Name</th><th>College</th><th>Department</th><th>Skills</th></tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.map((s) => (
                        <tr key={s.id} id={`student-row-${s.id}`}>
                          <td className="ap-td-primary">
                            {s.fullName}
                            <div className="ap-td-sub">{s.email}</div>
                          </td>
                          <td>{s.college}</td>
                          <td>{s.department}</td>
                          <td>
                            <div className="ap-skill-tags">
                              {(s.skills || []).slice(0, 3).map((sk, i) => (
                                <span key={i} className="int-skill-tag">{sk}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={studentsPage} totalPages={studentsTotalPages} onPageChange={setStudentsPage} idPrefix="students" />
              </>
            )}
          </div>
        )}

        {/* Internships */}
        {activeTab === 'internships' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">All Internships</h2>
                <p className="ap-section-desc">Every company posting in the system and the colleges that have opened it.</p>
              </div>
            </div>
            {internshipsError ? (
              <div className="ap-empty"><p>Could not load internships right now.</p></div>
            ) : internships.length === 0 ? (
              <div className="ap-empty"><p>No internships have been posted yet.</p></div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table" id="admin-internships-table">
                    <thead>
                      <tr><th>Role</th><th>Company</th><th>Location</th><th>Status</th><th>Opened for Colleges</th><th>Applicants</th></tr>
                    </thead>
                    <tbody>
                      {paginatedInternships.map(job => (
                        <tr key={job.id}>
                          <td className="ap-td-primary">{job.title}<div className="ap-td-sub">Posted {job.postedAt || 'N/A'}</div></td>
                          <td>{job.companyName || 'N/A'}</td>
                          <td>{job.location || 'N/A'}</td>
                          <td><span className="ap-status-pill active">{job.status || 'OPEN'}</span></td>
                          <td>{job.approvedColleges?.length ? job.approvedColleges.join(', ') : 'Not opened by any college'}</td>
                          <td>{job.applicants || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={internshipsPage} totalPages={internshipsTotalPages} onPageChange={setInternshipsPage} idPrefix="admin-internships" />
              </>
            )}
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h2 className="ap-section-title">Placement Reports</h2>
                <p className="ap-section-desc">High-level snapshot generated from current platform activity.</p>
              </div>
            </div>
            <div className="ap-stats-grid">
              <div className="ap-stat-card">
                <div className="ap-stat-icon"></div>
                <div className="ap-stat-value">{students.length}</div>
                <div className="ap-stat-label">Total Students</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-icon"></div>
                <div className="ap-stat-value">{companies.filter(c => c.status === 'APPROVED').length}</div>
                <div className="ap-stat-label">Approved Companies</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-icon"></div>
                <div className="ap-stat-value">{officers.filter(o => o.isActive).length}</div>
                <div className="ap-stat-label">Active TPOs</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-icon"></div>
                <div className="ap-stat-value">{students.filter(s => s.status === 'ACCEPTED').length}</div>
                <div className="ap-stat-label">Offers Made</div>
              </div>
            </div>
            <p style={{ marginTop: 20, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Connect the <code>/admin/reports</code> API endpoint to replace this snapshot with exportable, date-ranged reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
