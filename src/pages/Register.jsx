import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { collegeService } from '../services/collegeService';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('STUDENT');
  const [formData, setFormData] = useState({ name:'', email:'', password:'', confirmPassword:'', college:'', department:'' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [colleges, setColleges] = useState([]);
  useEffect(() => { collegeService.getActiveColleges().then(res => { const d=res.data; setColleges(Array.isArray(d)?d:d?.content||[]); }).catch(()=>setColleges([])); }, []);
  const change = e => { setFormData({...formData,[e.target.name]:e.target.value}); setError(''); };
  const submit = async e => {
    e.preventDefault();
    if(formData.password!==formData.confirmPassword){setError('Passwords do not match.');return;}
    if(role==='STUDENT'&&!formData.college){setError('Please select your college.');return;}
    setLoading(true); setError('');
    try { const payload={name:formData.name,email:formData.email,password:formData.password,role}; if(role==='STUDENT') Object.assign(payload,{college:formData.college,department:formData.department}); await authService.register(payload); navigate('/login'); }
    catch(err){setError(err.response?.data?.message||'Registration failed. Please try again.');} finally{setLoading(false);}
  };
  return <div className="simple-auth-page"><div className="simple-auth-card">
    <div className="simple-auth-heading"><h1>InternConnect</h1><p>College Placement & Internship Portal</p></div>
    <h2>Create account</h2><p className="simple-auth-help">Students and companies can register here. TPO and Admin accounts are created by the Admin.</p>
    <div className="role-toggle"><button type="button" className={`role-btn ${role==='STUDENT'?'active':''}`} onClick={()=>setRole('STUDENT')}>Student</button><button type="button" className={`role-btn ${role==='COMPANY'?'active':''}`} onClick={()=>setRole('COMPANY')}>Company</button></div>
    {error&&<div className="auth-error">{error}</div>}
    <form onSubmit={submit} className="auth-form">
      <div className="form-group"><label className="form-label-custom">{role==='COMPANY'?'Company Name':'Full Name'}</label><input name="name" className="form-control-custom" value={formData.name} onChange={change} required /></div>
      <div className="form-group"><label className="form-label-custom">Email</label><input type="email" name="email" className="form-control-custom" value={formData.email} onChange={change} required /></div>
      {role==='STUDENT'&&<div className="post-row"><div className="form-group"><label className="form-label-custom">College</label><select name="college" className="form-control-custom" value={formData.college} onChange={change} required><option value="">Select your college</option>{colleges.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></div><div className="form-group"><label className="form-label-custom">Department</label><input name="department" className="form-control-custom" value={formData.department} onChange={change} /></div></div>}
      <div className="form-group"><label className="form-label-custom">Password</label><input type="password" name="password" minLength={8} className="form-control-custom" value={formData.password} onChange={change} required /></div>
      <div className="form-group"><label className="form-label-custom">Confirm Password</label><input type="password" name="confirmPassword" className="form-control-custom" value={formData.confirmPassword} onChange={change} required /></div>
      {role==='STUDENT'&&colleges.length===0&&<div className="auth-error">No colleges are available yet. The Admin must create your college first.</div>}
      {role==='COMPANY'&&<p className="simple-auth-note">Company accounts are reviewed by the Admin before internships can be posted.</p>}
      <button type="submit" className="btn-primary-custom auth-submit-btn" disabled={loading||(role==='STUDENT'&&colleges.length===0)}>{loading?'Creating account...':'Create account'}</button>
    </form>
    <p className="auth-switch-text">Already have an account? <Link to="/login" className="auth-switch-link">Login</Link></p><Link to="/" className="simple-back-link">Back to landing page</Link>
  </div></div>;
};
export default Register;
