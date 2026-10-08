import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole, roleLabel } from '../utils/roleUtils';
import NotificationBell from './NotificationBell';
import heroLogo from '../assets/hero.png';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => dashboardPathForRole(user?.role);
  const canBrowseInternships = user?.role === 'STUDENT';

  return (
    <nav className={`navbar-custom ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to={isAuthenticated && (user?.role === 'COMPANY' || user?.role === 'PLACEMENT_OFFICER') ? getDashboardLink() : '/'} className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon">
            <img src={heroLogo} alt="InternConnect logo" />
          </div>
          <span className="logo-text">Intern<span className="logo-accent">Connect</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {(!isAuthenticated || (user?.role !== 'COMPANY' && user?.role !== 'PLACEMENT_OFFICER')) && (
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
          )}
          {canBrowseInternships && (
            <NavLink to="/internships" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              Internships
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to={getDashboardLink()} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
          )}
          {user?.role === 'COMPANY' && (
            <NavLink to="/post-internship" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              Post Job
            </NavLink>
          )}
          {user?.role === 'STUDENT' && (
            <NavLink to="/application-status" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              My Applications
            </NavLink>
          )}
        </div>

        {/* Auth Buttons */}
        <div className={`navbar-auth ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <div className="user-menu">
              {user?.role === 'STUDENT' && <NotificationBell />}
              <div className="user-avatar" title={user?.name}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="user-name">
                {user?.name}
                <span className="user-role-tag">{roleLabel(user?.role)}</span>
              </span>
              <button className="btn-logout" onClick={handleLogout} id="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-nav-login" id="nav-login-btn" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn-nav-signup" id="nav-signup-btn" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          id="hamburger-btn"
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
