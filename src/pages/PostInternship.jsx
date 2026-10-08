import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { internshipService } from '../services/internshipService';
import { companyService } from '../services/companyService';
import './PostInternship.css';

const LOCATIONS = ['Remote', 'On-site', 'Hybrid'];
const TYPES = ['Full-time', 'Part-time'];
const DURATIONS = ['1 month', '2 months', '3 months', '6 months', '6+ months'];
const CATEGORIES = ['Software Engineering', 'Data Science & AI', 'Product Management', 'UI/UX Design', 'Marketing & Growth', 'Finance & Business', 'Operations', 'Other'];

const PostInternship = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: 'Remote',
    type: 'Full-time',
    duration: '3 months',
    stipend: '',
    deadline: '',
    openings: '',
    description: '',
    responsibilities: '',
    requirements: '',
    skills: '',
    perks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [companyStatus, setCompanyStatus] = useState('PENDING');

  useEffect(() => {
    companyService.getProfile().then(res => setCompanyStatus(res.data?.status || 'PENDING')).catch(() => setCompanyStatus('PENDING'));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        responsibilities: formData.responsibilities.split('\n').filter(Boolean),
        requirements: formData.requirements.split('\n').filter(Boolean),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        perks: formData.perks.split('\n').filter(Boolean),
        openings: parseInt(formData.openings) || 1,
      };
      await internshipService.create(payload);
      setSuccess(true);
      setTimeout(() => navigate('/company-dashboard'), 2000);
    } catch (err) {
      // Show the real error — a company must know if their posting
      // genuinely failed to save, rather than being told it succeeded.
      setError(err.response?.data?.message || 'Failed to post internship. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (companyStatus !== 'APPROVED') {
    return (
      <div className="post-page"><div className="page-container">
        <div className="post-success-card">
          <h2>{companyStatus === 'REJECTED' ? 'Company approval required' : 'Awaiting Admin approval'}</h2>
          <p>{companyStatus === 'REJECTED' ? 'Your company account was not approved by the Admin. Please contact the college administrator.' : 'Your company account must be approved by the Admin before an internship can be posted.'}</p>
          <Link to="/company-dashboard" className="btn-primary-custom" style={{ marginTop: 16 }}>Back to Dashboard</Link>
        </div>
      </div></div>
    );
  }

  if (success) {
    return (
      <div className="post-page">
        <div className="page-container">
          <div className="post-success-card animate-fade-up">
            <div className="post-success-icon"></div>
            <h2>Internship Posted Successfully!</h2>
            <p>Your listing has been sent to every college's Placement Officer. It will appear to students at each college as soon as their TPO opens it for their campus. Redirecting to dashboard...</p>
            <span className="loading-spinner" style={{ marginTop: 16 }}></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-page">
      <div className="page-container">
        {/* Header */}
        <div className="post-header">
          <Link to="/company-dashboard" className="post-back-link">← Back to Dashboard</Link>
          <h1 className="post-title">Post an Internship</h1>
          <p className="post-sub">Reach thousands of talented students looking for opportunities.</p>
        </div>

        {/* Progress Steps */}
        <div className="post-steps">
          <div className={`post-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`} id="step-1-indicator">
            <div className="post-step-circle">{step > 1 ? '✓' : '1'}</div>
            <span>Role Details</span>
          </div>
          <div className="post-step-line"></div>
          <div className={`post-step ${step >= 2 ? 'active' : ''}`} id="step-2-indicator">
            <div className="post-step-circle">2</div>
            <span>Requirements & Perks</span>
          </div>
        </div>

        <div className="post-layout">
          {/* Form */}
          <div className="post-form-wrap">
            {error && (
              <div className="post-error" id="post-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            {step === 1 && (
              <form className="post-form" onSubmit={handleStep1} id="post-step1-form">
                <div className="post-form-section">
                  <h3 className="post-form-section-title">Basic Information</h3>

                  <div className="form-group">
                    <label className="form-label-custom" htmlFor="post-title">Job Title *</label>
                    <input
                      type="text"
                      id="post-title"
                      name="title"
                      className="form-control-custom"
                      placeholder="e.g. Software Engineer Intern"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label-custom" htmlFor="post-category">Category *</label>
                    <select
                      id="post-category"
                      name="category"
                      className="form-control-custom"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="post-row">
                    <div className="form-group">
                      <label className="form-label-custom">Location</label>
                      <div className="post-option-group">
                        {LOCATIONS.map(l => (
                          <button
                            type="button"
                            key={l}
                            className={`post-option-btn ${formData.location === l ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, location: l })}
                            id={`location-${l.toLowerCase()}`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label-custom">Type</label>
                      <div className="post-option-group">
                        {TYPES.map(t => (
                          <button
                            type="button"
                            key={t}
                            className={`post-option-btn ${formData.type === t ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, type: t })}
                            id={`type-${t.toLowerCase().replace(' ','-')}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="post-row">
                    <div className="form-group">
                      <label className="form-label-custom" htmlFor="post-duration">Duration</label>
                      <select
                        id="post-duration"
                        name="duration"
                        className="form-control-custom"
                        value={formData.duration}
                        onChange={handleChange}
                      >
                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label-custom" htmlFor="post-openings">Openings</label>
                      <input
                        type="number"
                        id="post-openings"
                        name="openings"
                        className="form-control-custom"
                        placeholder="e.g. 5"
                        value={formData.openings}
                        onChange={handleChange}
                        min={1}
                      />
                    </div>
                  </div>

                  <div className="post-row">
                    <div className="form-group">
                      <label className="form-label-custom" htmlFor="post-stipend">Monthly Stipend</label>
                      <input
                        type="text"
                        id="post-stipend"
                        name="stipend"
                        className="form-control-custom"
                        placeholder="e.g. ₹50,000/mo or Unpaid"
                        value={formData.stipend}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label-custom" htmlFor="post-deadline">Application Deadline</label>
                      <input
                        type="date"
                        id="post-deadline"
                        name="deadline"
                        className="form-control-custom"
                        value={formData.deadline}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label-custom" htmlFor="post-description">Description *</label>
                    <textarea
                      id="post-description"
                      name="description"
                      className="form-control-custom post-textarea"
                      placeholder="Describe the internship role, what students will learn, team culture..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      required
                    />
                  </div>
                </div>

                <div className="post-form-actions">
                  <button type="submit" className="btn-primary-custom post-next-btn" id="next-step-btn">
                    Continue to Requirements →
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="post-form" onSubmit={handleSubmit} id="post-step2-form">
                <div className="post-form-section">
                  <h3 className="post-form-section-title">Requirements & Details</h3>

                  <div className="form-group">
                    <label className="form-label-custom" htmlFor="post-responsibilities">
                      What will they do? <span className="form-hint">(one per line)</span>
                    </label>
                    <textarea
                      id="post-responsibilities"
                      name="responsibilities"
                      className="form-control-custom post-textarea"
                      placeholder="Build features using React&#10;Write unit tests&#10;Attend daily standups"
                      value={formData.responsibilities}
                      onChange={handleChange}
                      rows={5}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label-custom" htmlFor="post-requirements">
                      Requirements <span className="form-hint">(one per line)</span>
                    </label>
                    <textarea
                      id="post-requirements"
                      name="requirements"
                      className="form-control-custom post-textarea"
                      placeholder="Pursuing CS or related degree&#10;Strong problem-solving skills&#10;Experience with React"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows={5}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label-custom" htmlFor="post-skills">
                      Required Skills <span className="form-hint">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      id="post-skills"
                      name="skills"
                      className="form-control-custom"
                      placeholder="React, Node.js, Python, SQL"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label-custom" htmlFor="post-perks">
                      Perks & Benefits <span className="form-hint">(one per line)</span>
                    </label>
                    <textarea
                      id="post-perks"
                      name="perks"
                      className="form-control-custom post-textarea"
                      placeholder="Mentorship from senior engineers&#10;Flexible working hours&#10;Return offer opportunity"
                      value={formData.perks}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="post-form-actions">
                  <button type="button" className="btn-secondary-custom" onClick={() => setStep(1)} id="back-step-btn">
                    ← Back
                  </button>
                  <button type="submit" className="btn-primary-custom" disabled={loading} id="post-submit-btn">
                    {loading ? (
                      <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Posting...</>
                    ) : '🚀 Publish Internship'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Preview Sidebar */}
          <div className="post-preview-wrap">
            <div className="post-preview glass-card" id="post-preview">
              <h3 className="post-preview-title">Live Preview</h3>
              <div className="preview-card">
                <div className="preview-card-header">
                  <div className="preview-logo">
                    {formData.title ? formData.title.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="preview-job-title">{formData.title || 'Job Title'}</div>
                    <div className="preview-company">Your Company</div>
                  </div>
                </div>
                <div className="preview-details">
                  <span className="preview-detail">📍 {formData.location}</span>
                  <span className="preview-detail">⏱ {formData.duration}</span>
                  {formData.stipend && <span className="preview-detail preview-stipend">💰 {formData.stipend}</span>}
                </div>
                {formData.skills && (
                  <div className="preview-skills">
                    {formData.skills.split(',').slice(0, 4).map((s, i) => (
                      <span key={i} className="int-skill-tag">{s.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="preview-footer">
                  <span className="badge-primary">{formData.location}</span>
                  <span className="badge-success">{formData.type}</span>
                </div>
              </div>
              <div className="preview-tip">
                💡 This is how your listing will appear to students.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostInternship;
