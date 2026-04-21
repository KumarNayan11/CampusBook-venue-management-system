import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, GraduationCap, BookOpen, Building2, ArrowRight, Sparkles, 
  MapPin, Calendar, Clock, CheckCircle, Navigation, Search, Filter, 
  Layers, BarChart3, Users, Zap, Globe, Layout, ChevronDown, Check
} from 'lucide-react';
import { getOverallAnalytics } from '../services/analyticsService';
import { getUsers } from '../services/userService';
import infrastructurePreview from '../assets/infrastructure-preview.png';

// Fallback stats will be overwritten by live data during mount
const initialStats = [
  { label: 'Total Campus Venues', value: '...', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Total Bookings', value: '...', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Departments Using System', value: '...', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Active Users', value: '...', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
];

const GitHub = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const roles = [
  {
    key: 'admin',
    label: 'Administrator',
    description: 'System-wide oversight, User management & Infrastructure control',
    icon: Shield,
    gradient: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-500/25',
    bgAccent: 'bg-blue-50',
    textAccent: 'text-blue-600',
    borderAccent: 'border-blue-200',
  },
  {
    key: 'dsw',
    label: 'DSW Officer',
    description: 'Approve central venues, Manage student welfare events & logs',
    icon: Building2,
    gradient: 'from-violet-600 to-purple-600',
    shadow: 'shadow-violet-500/25',
    bgAccent: 'bg-violet-50',
    textAccent: 'text-violet-600',
    borderAccent: 'border-violet-200',
  },
  {
    key: 'hod',
    label: 'Head of Dept',
    description: 'Manage departmental spaces, approve internal booking requests',
    icon: GraduationCap,
    gradient: 'from-emerald-600 to-teal-600',
    shadow: 'shadow-emerald-500/25',
    bgAccent: 'bg-emerald-50',
    textAccent: 'text-emerald-600',
    borderAccent: 'border-emerald-200',
  },
  {
    key: 'faculty',
    label: 'Faculty Member',
    description: 'Reserve halls for lectures, seminars & tracking your bookings',
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/25',
    bgAccent: 'bg-amber-50',
    textAccent: 'text-amber-600',
    borderAccent: 'border-amber-200',
  },
];

const Home = () => {
  const { switchRole, user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [liveStats, setLiveStats] = useState(initialStats);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch live stats for the landing page
    const fetchLiveStats = async () => {
      try {
        const [analytics, users] = await Promise.all([
          getOverallAnalytics(),
          getUsers()
        ]);
        
        if (analytics && users) {
          setLiveStats([
            { label: 'Total Campus Venues', value: analytics?.totals?.totalVenues?.toString() || '...', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Bookings', value: analytics?.totals?.totalBookings?.toString() || '...', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Departments Using System', value: analytics?.bookingsByDepartment?.length?.toString() || '...', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Active Users', value: users?.length?.toString() || '...', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
          ]);
        }
      } catch (error) {
        console.error('Failed to sync landing stats');
      }
    };

    fetchLiveStats();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDashboardRedirect = (e) => {
    e?.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    // /dashboard auto-selects the correct role via RoleDashboard
    navigate('/dashboard');
  };

  const handleSelectRole = (role, e) => {
    e?.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    // /dashboard auto-selects the correct role via RoleDashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-700">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div 
             onClick={() => navigate('/')}
             className="flex items-center gap-3 cursor-pointer"
          >
             <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Navigation className="w-5 h-5 fill-current" />
             </div>
             <span className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">
                CampusBook
             </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {['Infrastructure', 'Analytics', 'System Flow', 'Oversight'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">{item}</a>
            ))}
          </div>

          <button 
            onClick={handleDashboardRedirect}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10 cursor-pointer"
          >
            {user ? 'View Dashboard' : 'Get Started'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-44 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-extrabold text-blue-600 mb-8 uppercase tracking-widest animate-fade-in shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            V3.0 Now Live — Hierarchical Utilization Suite
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tight uppercase italic animate-fade-in" style={{ animationDelay: '100ms' }}>
             SMART CAMPUS <br /> <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">VENUE MANAGEMENT</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed uppercase tracking-tight animate-fade-in" style={{ animationDelay: '200ms' }}>
             CampusBook is a centralized platform for managing university facilities, booking approvals, and infrastructure utilization across departments without scheduling conflicts.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in" style={{ animationDelay: '300ms' }}>
             <button onClick={() => window.scrollTo({ top: document.getElementById('role-selection').offsetTop - 100, behavior: 'smooth' })} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40 flex items-center group active:scale-95">
                Access System Portal
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Banner */}
      <section id="analytics" className="relative z-10 py-12 px-6">
         <div className="max-w-7xl mx-auto">
            <h3 className="text-center font-bold text-lg md:text-xl text-slate-800 mb-6 uppercase tracking-widest italic">Live System Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {liveStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                     <div key={idx} className="p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 transition-all hover:scale-[1.02] group">
                        <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                           <Icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-1 italic">{stat.value}</h4>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">{stat.label}</p>
                     </div>
                  )
               })}
            </div>
         </div>
      </section>

      {/* Infrastructure Section */}
      <section id="infrastructure" className="relative z-10 py-32 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
               <div className="space-y-4">
                  <h5 className="text-blue-600 font-extrabold text-xs uppercase tracking-[0.3em] italic">01. Infrastructure Cloud</h5>
                  <h2 className="text-5xl font-black text-slate-900 leading-tight uppercase italic">CENTRALIZED VENUE <br /> VISIBILITY</h2>
                  <p className="text-slate-500 font-bold leading-relaxed max-w-lg italic">
                     CampusBook provides transparent access to all campus venues, allowing departments to check availability, avoid scheduling conflicts, and track facility utilization across the university.
                  </p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {[
                    { title: 'Timetable Conflict Detection' },
                    { title: 'Department Approval Workflow' },
                    { title: 'Central Venue Authorization' },
                    { title: 'Usage Analytics' }
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-4 group items-center">
                       <div className="mt-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Check className="w-3 h-3" strokeWidth={4} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic tracking-tighter leading-none mb-0">{feat.title}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="relative order-1 lg:order-2">
               <div className="aspect-square flex items-center justify-center">
                  <img
                     src={infrastructurePreview}
                     alt="Campus infrastructure overview"
                     className="rounded-xl shadow-lg w-full"
                  />
               </div>
            </div>
         </div>
      </section>

      {/* Role Selection Section - Simple Login Integrated */}
      <section id="role-selection" className="relative z-10 py-32 px-6 bg-slate-50 overflow-hidden">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
               <h5 className="text-blue-600 font-extrabold text-xs uppercase tracking-[0.4em] italic">02. Unified Authentication</h5>
               <h2 className="text-5xl font-black text-slate-900 uppercase italic">Access Your System</h2>
               <p className="text-slate-400 font-bold max-w-md mx-auto italic tracking-tight">Select your administrative layer to proceed into the CampusBook workspace.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {roles.map((role, idx) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.key}
                      onClick={() => handleSelectRole(role.key)}
                      className="group relative text-left p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer"
                    >
                      {/* Gradient hover overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500`} />
                      
                      <div>
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] ${role.bgAccent} ${role.textAccent} border ${role.borderAccent} mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm shadow-current/10`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 italic uppercase tracking-tighter leading-none">{role.label}</h3>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed italic">{role.description}</p>
                      </div>

                      <div className={`mt-8 flex items-center justify-center self-end w-12 h-12 rounded-2xl bg-gradient-to-br ${role.gradient} ${role.shadow} shadow-lg text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500`}>
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </button>
                  )
               })}
            </div>

            {/* Sub-footer inside section */}
            <div className="mt-20 flex flex-col items-center">
               <div className="w-full h-px bg-slate-200 mb-8 max-w-2xl" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Hierarchical Utilization Hub</p>
            </div>
         </div>
         
         {/* Background Visual Ornament */}
         <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-100/10 rounded-full blur-[200px] pointer-events-none" />
      </section>

      {/* Main Footer */}
      <footer className="relative z-10 py-10 px-6 border-t border-slate-50 bg-white">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <Navigation className="w-6 h-6 fill-current" />
               </div>
               <span className="text-lg font-black text-slate-900 tracking-widest uppercase italic">CAMPUSBOOK SYSTEM</span>
            </div>
            
            <div className="flex items-center gap-10">
               {['Privacy', 'Legal', 'Support', 'API'].map(item => (
                  <a key={item} href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">{item}</a>
               ))}
               <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                  <GitHub className="w-6 h-6" />
               </a>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto mt-10">
            <div className="flex flex-col items-center gap-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic text-center">
                  © CampusBook – Campus Facility Booking System. All rights reserved.
               </p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic text-center">
                  Built with brain by Team Para-dox
               </p>
            </div>
         </div>
      </footer>

      {/* Global Scroll Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}} />
    </div>
  );
};

export default Home;
