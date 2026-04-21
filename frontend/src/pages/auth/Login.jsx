import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      toast.success('Access Granted! Welcome back.');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Authentication Failed');
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
        <div className="w-full max-w-md p-10 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-blue-900/5 transition-all duration-500 scale-100 hover:shadow-blue-900/10 hover:border-blue-500/20 group">
          <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 mb-4 rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[2px] shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/40 group-hover:-translate-y-1 transition-all duration-300">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center overflow-hidden">
              <div className="h-8 w-8 bg-blue-600 rounded-lg transform rotate-45 flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-sm font-semibold text-slate-400 uppercase tracking-widest">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block pl-1 text-sm font-bold text-slate-700 tracking-tight" htmlFor="email">Email Address</label>
            <div className="relative group/input">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                className="w-full py-3.5 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-1">
              <label className="block text-sm font-bold text-slate-700 tracking-tight" htmlFor="password">Password</label>
              <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors decoration-2 underline-offset-4">Forgot Password?</a>
            </div>
            <div className="relative group/input">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full py-3.5 pl-11 pr-12 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-blue-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex items-center justify-center w-full py-4 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-blue-500/20"
          >
            {isLoading ? (
              <svg className="w-5 h-5 mr-3 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            <span>{isLoading ? 'Signing In...' : 'Access Dashboard'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 hover:underline decoration-2 underline-offset-4 font-bold">Create one today</Link>
        </p>
      </div>
      
      <div className="mt-8 flex space-x-6 text-xs font-bold text-slate-400 tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity">
        <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
      </div>
      </div>
    </div>
  );
};

export default Login;
