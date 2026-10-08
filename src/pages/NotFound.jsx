import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-page" id="not-found-page">
      <div className="nf-orb nf-orb-1"></div>
      <div className="nf-orb nf-orb-2"></div>
      <div className="nf-content animate-fade-up">
        <div className="nf-code">404</div>
        <div className="nf-emoji">🚀</div>
        <h1 className="nf-title">Page Not Found</h1>
        <p className="nf-desc">
          Looks like this page launched into orbit. Let's get you back on track.
        </p>
        <div className="nf-actions">
          <Link to="/" className="btn-primary-custom" id="go-home-btn">
            ← Go to Home
          </Link>
          <Link to="/internships" className="btn-secondary-custom" id="browse-internships-btn">
            Browse Internships
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
