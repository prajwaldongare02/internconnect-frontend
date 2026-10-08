import { Link } from 'react-router-dom';
import heroLogo from '../assets/hero.png';
import './Home.css';

const Home = () => (
  <div className="simple-home">
    <section className="simple-hero">
      <div className="simple-home-container">
        <img className="simple-home-logo" src={heroLogo} alt="InternConnect" />
        <p className="simple-kicker">College Placement & Internship Portal</p>
        <h1>Manage internships in one place.</h1>
        <p className="simple-hero-text">
          Colleges manage opportunities, companies post internships, TPOs approve them for their college,
          and students apply.
        </p>
        <div className="simple-actions">
          <Link to="/login" className="simple-primary-btn">Login</Link>
          <Link to="/register" className="simple-secondary-btn">Student / Company Registration</Link>
        </div>
      </div>
    </section>

    <section className="simple-workflow">
      <div className="simple-home-container">
        <h2>How InternConnect works</h2>
        <div className="simple-workflow-grid">
          <div><span>01</span><h3>College</h3><p>Admin manages colleges and placement officers.</p></div>
          <div><span>02</span><h3>Company</h3><p>Approved companies post internship opportunities.</p></div>
          <div><span>03</span><h3>TPO</h3><p>TPOs open suitable internships for their college.</p></div>
          <div><span>04</span><h3>Students</h3><p>Students view approved internships and apply.</p></div>
        </div>
      </div>
    </section>
  </div>
);

export default Home;
