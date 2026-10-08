import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroLogo from '../assets/hero.png';
import './Footer.css';

const Footer = () => {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role;
  const showStudentLinks = !isAuthenticated || role === 'STUDENT';
  const showCompanyLinks = !isAuthenticated || role === 'COMPANY';

  return (
    <footer className="footer" id="main-footer">
      <div className="footer-container">
        <div className={`footer-top ${showStudentLinks && showCompanyLinks ? 'two-groups' : showStudentLinks || showCompanyLinks ? 'one-group' : 'brand-only'}`}>
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon-sm">
                <img src={heroLogo} alt="InternConnect logo" />
              </div>
              <span className="footer-logo-text">Intern<span>Connect</span></span>
            </div>
            <p className="footer-tagline">
              Bridging talented students with innovative companies for life-changing internship experiences.
            </p>
          </div>

          {(showStudentLinks || showCompanyLinks) && (
            <div className={`footer-links-grid ${showStudentLinks && showCompanyLinks ? 'two-groups' : 'one-group'}`}>
              {showStudentLinks && (
                <div className="footer-links-col">
                  <h4>For Students</h4>
                  <ul>
                    <li><Link to="/internships" id="footer-browse-internships">Browse Internships</Link></li>
                    <li><Link to="/register" id="footer-student-signup">Create Profile</Link></li>
                    <li><Link to="/application-status" id="footer-track-applications">Track Applications</Link></li>
                    <li><Link to="/student-dashboard" id="footer-student-dashboard">Dashboard</Link></li>
                  </ul>
                </div>
              )}

              {showCompanyLinks && (
                <div className="footer-links-col">
                  <h4>For Companies</h4>
                  <ul>
                    <li><Link to="/post-internship" id="footer-post-internship">Post Internship</Link></li>
                    <li><Link to="/register" id="footer-company-signup">Register Company</Link></li>
                    <li><Link to="/company-dashboard" id="footer-company-dashboard">Dashboard</Link></li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} InternConnect. All rights reserved.</p>
          <p>Built for students and companies.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
