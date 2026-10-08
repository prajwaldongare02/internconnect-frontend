import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { internshipService } from '../services/internshipService';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import './Internships.css';

const LOCATIONS = ['All', 'Remote', 'On-site', 'Hybrid'];
const TYPES = ['All', 'Full-time', 'Part-time'];
const DURATIONS = ['All', '1-2 months', '3-6 months', '6+ months'];
const PAGE_SIZE = 6;

const SkeletonCard = () => (
  <div className="int-card skeleton-card">
    <div className="skeleton sk-logo"></div>
    <div className="skeleton sk-title"></div>
    <div className="skeleton sk-sub"></div>
    <div className="skeleton sk-badges"></div>
    <div className="skeleton sk-btn"></div>
  </div>
);

const Internships = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [type, setType] = useState('All');
  const [duration, setDuration] = useState('All');
  const [page, setPage] = useState(1);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (location !== 'All') params.location = location;
      if (type !== 'All') params.type = type;
      const res = await internshipService.getAll(params);
      const data = res.data;
      if (Array.isArray(data)) {
        setInternships(data);
      } else {
        setInternships(data.content || data.internships || []);
      }
    } catch {
      setError('Failed to load internships. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, location, type]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInternships();
  };

  // Real internships only. If the backend is genuinely unreachable we
  // show an explicit error state (see `error` below) instead of
  // substituting fake companies — an empty or short list from a real,
  // working backend must be shown as-is, not padded with mock data.
  const filtered = useMemo(() => {
    return internships.filter(item => {
      const q = search.toLowerCase();
      const matchSearch = !search
        || item.title?.toLowerCase().includes(q)
        || item.companyName?.toLowerCase().includes(q)
        || item.skills?.some(s => s.toLowerCase().includes(q));
      const matchLocation = location === 'All' || item.location === location;
      const matchType = type === 'All' || item.type === type;
      const matchDuration = (() => {
        if (duration === 'All') return true;
        const months = parseInt(item.duration, 10) || 0;
        if (duration === '1-2 months') return months >= 1 && months <= 2;
        if (duration === '3-6 months') return months >= 3 && months <= 6;
        if (duration === '6+ months') return months >= 6;
        return true;
      })();

      // Backend already returns only internships approved for this student's
      // college. Keep the client-side check strict as a second safety layer.
      const matchCollege = user?.role === 'STUDENT'
        && Array.isArray(item.approvedColleges)
        && item.approvedColleges.some(c => c?.toLowerCase() === user?.college?.toLowerCase());

      return matchSearch && matchLocation && matchType && matchDuration && matchCollege;
    });
  }, [internships, search, location, type, duration, user]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getInitials = (name) => (name || '?').charAt(0).toUpperCase();
  const formatStipend = (stipend) => String(stipend).replace(/\$/g, '₹');
  const getLogoColor = (name = '') => {
    const colors = ['#6C63FF', '#FF6B9D', '#00D4FF', '#A855F7', '#FF9F43', '#00E5A0'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="internships-page">
      {/* Page Header */}
      <section className="int-hero">
        <div className="int-hero-orb int-orb-1"></div>
        <div className="int-hero-orb int-orb-2"></div>
        <div className="page-container">
          <div className="int-hero-content">
            <span className="section-tag">Explore Opportunities</span>
            <h1 className="int-hero-title">Find Your <span className="gradient-text">Perfect Internship</span></h1>
            <p className="int-hero-sub">Browse verified internship opportunities approved by your placement cell.</p>

            {/* Search Bar */}
            <form className="int-search-bar" onSubmit={handleSearch} id="internships-search-form">
              <div className="int-search-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search roles, companies, or skills..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  id="internships-search-input"
                  className="int-search-input"
                />
              </div>
              <button type="submit" className="btn-primary-custom int-search-btn" id="internships-search-btn">Search</button>
            </form>
          </div>
        </div>
      </section>

      <div className="page-container">
        <div className="int-layout">
          {/* Filters Sidebar */}
          <aside className="int-filters" id="filters-panel">
            <div className="filter-section">
              <h3 className="filter-heading">Location</h3>
              <div className="filter-options">
                {LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    className={`filter-chip ${location === loc ? 'active' : ''}`}
                    onClick={() => { setLocation(loc); setPage(1); }}
                    id={`filter-location-${loc.toLowerCase()}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-section">
              <h3 className="filter-heading">Type</h3>
              <div className="filter-options">
                {TYPES.map(t => (
                  <button
                    key={t}
                    className={`filter-chip ${type === t ? 'active' : ''}`}
                    onClick={() => { setType(t); setPage(1); }}
                    id={`filter-type-${t.toLowerCase().replace('-','')}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-section">
              <h3 className="filter-heading">Duration</h3>
              <div className="filter-options">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    className={`filter-chip ${duration === d ? 'active' : ''}`}
                    onClick={() => { setDuration(d); setPage(1); }}
                    id={`filter-duration-${d.replace(/[\s+]/g,'-').toLowerCase()}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="int-main">
            <div className="int-results-header">
              <span className="int-results-count">{filtered.length} opportunities found</span>
              {(search || location !== 'All' || type !== 'All' || duration !== 'All') && (
                <button className="int-clear-filters" onClick={() => { setSearch(''); setLocation('All'); setType('All'); setDuration('All'); setPage(1); }} id="clear-filters-btn">
                  Clear filters ×
                </button>
              )}
            </div>

            {loading ? (
              <div className="int-grid">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="int-empty" id="fetch-error">
                <div className="int-empty-icon">⚠️</div>
                <h3>Couldn't reach the server</h3>
                <p>{error}</p>
                <button className="btn-secondary-custom" onClick={fetchInternships}>Try Again</button>
              </div>
            ) : internships.length === 0 ? (
              <div className="int-empty" id="no-internships-yet">
                <div className="int-empty-icon">📭</div>
                <h3>No internships open for your college yet</h3>
                <p>Companies post roles, then your placement officer opens them up for your campus. Check back soon.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="int-empty" id="no-results">
                <div className="int-empty-icon"></div>
                <h3>No internships match your filters</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button className="btn-secondary-custom" onClick={() => { setSearch(''); setLocation('All'); setType('All'); setDuration('All'); setPage(1); }}>Reset Filters</button>
              </div>
            ) : (
              <div className="int-grid">
                {paginated.map((item, i) => (
                  <div key={item.id || i} className="int-card" id={`internship-card-${item.id || i}`}>
                    <div className="int-card-header">
                      <div className="int-company-logo" style={{ background: getLogoColor(item.companyName) }}>
                        {getInitials(item.companyName)}
                      </div>
                      <div className="int-card-meta">
                        <h3 className="int-card-title">{item.title}</h3>
                        <span className="int-card-company">{item.companyName}</span>
                      </div>
                    </div>

                    <div className="int-card-details">
                      <span className="int-detail-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {item.location}
                      </span>
                      <span className="int-detail-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {item.duration}
                      </span>
                      {item.stipend && (
                        <span className="int-detail-item int-stipend">
                          {formatStipend(item.stipend)}
                        </span>
                      )}
                    </div>

                    {item.skills && item.skills.length > 0 && (
                      <div className="int-skills">
                        {item.skills.slice(0, 3).map((skill, j) => (
                          <span key={j} className="int-skill-tag">{skill}</span>
                        ))}
                        {item.skills.length > 3 && <span className="int-skill-more">+{item.skills.length - 3}</span>}
                      </div>
                    )}

                    <div className="int-card-footer">
                      <div className="int-badges">
                        <span className="badge-primary">{item.location}</span>
                        <span className="badge-success">{item.type}</span>
                      </div>
                      <Link
                        to={`/internships/${item.id || i + 1}`}
                        className="btn-primary-custom int-view-btn"
                        id={`view-internship-${item.id || i}`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} idPrefix="internships" />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Internships;
