import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Briefcase, CheckCircle2, ArrowLeft, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getDepartments } from '../../services/departmentService';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'faculty',
    department: ''
  });
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Failed to fetch departments');
      }
    };
    fetchDepts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await register(formData);
    if (result.success) {
      toast.success('Account Created! Welcome to CampusBook.');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-slate-50 selection:bg-blue-100 selection:text-blue-700">
      <div className="w-full max-w-7xl mx-auto mb-4 md:mb-8">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center pb-12">
        <div className="w-full max-w-xl p-10 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-blue-900/5 transition-all duration-500 scale-100 hover:shadow-blue-900/10 hover:border-blue-500/20 group">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 mb-4 rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[2px] shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/40 group-hover:-translate-y-1 transition-all duration-300">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center overflow-hidden">
               <div className="h-8 w-8 border-4 border-blue-600 rounded-lg transform rotate-45 flex items-center justify-center">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
          <p className="mt-2 text-sm font-semibold text-slate-400 uppercase tracking-widest">Join our professional network</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block pl-1 text-sm font-bold text-slate-700 tracking-tight">Full Name</label>
            <div className="relative group/input">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                <User className="w-4 h-4" />
              </span>
              <input
                name="name"
                type="text"
                className="w-full py-3.5 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="John Doe"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block pl-1 text-sm font-bold text-slate-700 tracking-tight">Email Address</label>
            <div className="relative group/input">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                <Mail className="w-4 h-4" />
              </span>
              <input
                name="email"
                type="email"
                className="w-full py-3.5 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="you@example.com"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block pl-1 text-sm font-bold text-slate-700 tracking-tight">Your Role</label>
            <div className="relative group/input">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                <Briefcase className="w-4 h-4" />
              </span>
              <select
                name="role"
                value={formData.role}
                className="w-full py-3.5 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 appearance-none bg-no-repeat bg-[right_1rem_center]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")` }}
                onChange={handleChange}
                required
              >
                <option value="faculty">Faculty Member</option>
                <option value="hod">Head of Department</option>
                <option value="dsw">DSW Coordinator</option>
                <option value="admin">Site Administrator</option>
              </select>
            </div>
          </div>

          {['faculty', 'hod'].includes(formData.role) && (
            <div className="space-y-1.5">
              <label className="block pl-1 text-sm font-bold text-slate-700 tracking-tight">Department</label>
              <div className="relative group/input">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                  <Building2 className="w-4 h-4" />
                </span>
                <select
                  name="department"
                  value={formData.department}
                  className="w-full py-3.5 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")` }}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>{dept.name}</option>
                  ))}
                  {departments.length === 0 && <option value="General">General</option>}
                </select>
              </div>
            </div>
          )}

          <div className="md:col-span-2 space-y-1.5">
            <label className="block pl-1 text-sm font-bold text-slate-700 tracking-tight">Access Password</label>
            <div className="relative group/input">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                <Lock className="w-4 h-4" />
              </span>
              <input
                name="password"
                type="password"
                className="w-full py-3.5 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="At least 8 characters"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex items-center justify-center w-full py-4 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-70 shadow-xl shadow-blue-500/20"
            >
              {isLoading ? (
                <svg className="w-5 h-5 mr-3 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              <span>{isLoading ? 'Creating Account...' : 'Initialize Membership'}</span>
              {!isLoading && <CheckCircle2 className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" />}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Already a member?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline decoration-2 underline-offset-4 font-bold">Sign in here</Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Signup;
