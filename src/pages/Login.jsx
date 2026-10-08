import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../utils/roleUtils';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('STUDENT');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { const userData = await login({ ...formData, role }); navigate(dashboardPathForRole(userData.role)); }
    catch (err) { setError(err.response?.data?.message || 'Invalid credentials. Please try again.'); }
    finally { setLoading(false); }
  };

  return <div className="simple-auth-page">
    <div className="simple-auth-card">
      <div className="simple-auth-heading"><h1>InternConnect</h1><p>College Placement & Internship Portal</p></div>
      <h2>Login</h2>
      <p className="simple-auth-help">Select your account type and enter your credentials.</p>
      <div className="role-toggle role-toggle-4">
        {['STUDENT','COMPANY','PLACEMENT_OFFICER','ADMIN'].map(r => <button key={r} type="button" className={`role-btn ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>{r === 'PLACEMENT_OFFICER' ? 'TPO' : r === 'ADMIN' ? 'Admin' : r[0] + r.slice(1).toLowerCase()}</button>)}
      </div>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group"><label className="form-label-custom">Email</label><input type="email" name="email" className="form-control-custom" value={formData.email} onChange={e => setFormData({...formData,email:e.target.value})} required /></div>
        <div className="form-group"><label className="form-label-custom">Password</label><input type="password" name="password" className="form-control-custom" value={formData.password} onChange={e => setFormData({...formData,password:e.target.value})} required /></div>
        <button type="submit" className="btn-primary-custom auth-submit-btn" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
      <p className="auth-switch-text">New student or company? <Link to="/register" className="auth-switch-link">Create an account</Link></p>
      <Link to="/" className="simple-back-link">Back to landing page</Link>
    </div>
  </div>;
};
export default Login;
