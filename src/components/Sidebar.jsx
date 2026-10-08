import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const gridIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const searchIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const studentLinks = [
  { to: '/student-dashboard', label: 'Dashboard', icon: gridIcon },
  { to: '/internships', label: 'Browse Jobs', icon: searchIcon },
  {
    to: '/application-status',
    label: 'My Applications',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

const companyLinks = [
  { to: '/company-dashboard', label: 'Dashboard', icon: gridIcon },
  {
    to: '/post-internship',
    label: 'Post Internship',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
];

const officerLinks = [
  { to: '/placement-officer-dashboard', label: 'Dashboard', icon: gridIcon },
];

const adminLinks = [
  { to: '/admin-dashboard', label: 'Dashboard', icon: gridIcon },
];

const linksForRole = (role) => {
  switch (role) {
    case 'COMPANY':
      return companyLinks;
    case 'PLACEMENT_OFFICER':
      return officerLinks;
    case 'ADMIN':
      return adminLinks;
    case 'STUDENT':
    default:
      return studentLinks;
  }
};

const Sidebar = () => {
  const { user } = useAuth();
  const links = linksForRole(user?.role);

  return (
    <aside className="sidebar" id="main-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user?.name || 'User'}</span>
          <span className="sidebar-user-role">{user?.role || 'Student'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            id={`sidebar-${link.label.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {(user?.role !== 'COMPANY' && user?.role !== 'PLACEMENT_OFFICER') && (
      <div className="sidebar-footer-link">
        <NavLink to="/" className="sidebar-link" id="sidebar-home">
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span className="sidebar-label">Home</span>
        </NavLink>
      </div>
      )}
    </aside>
  );
};

export default Sidebar;
