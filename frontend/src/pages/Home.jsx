import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
   ArrowRight, Users, Navigation, Home as HomeIcon, Map, Building,
   BarChart2, Code2, Award, Building2, Calendar, Layers, Shield,
   GraduationCap, BookOpen, Check
} from 'lucide-react';
import { getPublicStats } from '../services/analyticsService';
import infrastructurePreview from '../assets/infrastructure-preview.png';
import mitsLogo from '../assets/mits-logo.png';

const Home = () => {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [stats, setStats] = useState({ totalVenues: '...', totalBookings: '...', totalUsers: '...' });

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const data = await getPublicStats();
            setStats({
               totalVenues: data.totalVenues?.toString() || '0',
               totalBookings: data.totalBookings?.toString() || '0',
               totalUsers: data.totalUsers?.toString() || '0'
            });
         } catch (err) {
            console.error('Landing stats sync failed');
         }
      };
      fetchStats();
   }, []);

   const marketingStats = [
      { label: 'Campus Venues Managed', value: stats.totalVenues, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100/50' },
      { label: 'Successful Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
      { label: 'Active Daily Users', value: stats.totalUsers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-100/50' },
   ];
   const roles = [
      {
         key: 'admin',
         label: 'Administrator',
         description: 'System-wide oversight, User management & Infrastructure control',
         icon: Shield,
         gradient: 'from-blue-600 to-indigo-600',
         bgAccent: 'bg-blue-50',
         textAccent: 'text-blue-700',
      },
      {
         key: 'dsw',
         label: 'DSW Officer',
         description: 'Approve central venues, Manage student welfare events & logs',
         icon: Building2,
         gradient: 'from-violet-600 to-purple-600',
         bgAccent: 'bg-violet-50',
         textAccent: 'text-violet-700',
      },
      {
         key: 'hod',
         label: 'Head of Dept',
         description: 'Manage departmental spaces, approve internal booking requests',
         icon: GraduationCap,
         gradient: 'from-emerald-600 to-teal-600',
         bgAccent: 'bg-emerald-50',
         textAccent: 'text-emerald-700',
      },
      {
         key: 'faculty',
         label: 'Faculty Member',
         description: 'Reserve halls for lectures, seminars & tracking your bookings',
         icon: BookOpen,
         gradient: 'from-amber-500 to-orange-600',
         bgAccent: 'bg-amber-50',
         textAccent: 'text-amber-700',
      },
   ];

   const handleDashboardRedirect = (e) => {
      e?.preventDefault();
      if (!user) {
         navigate('/login');
         return;
      }
      navigate('/dashboard');
   };

   return (
      <div className="min-h-screen bg-[#FDFBF7] selection:bg-blue-100 selection:text-blue-700 flex flex-col font-sans">

         {/* Background soft wavy elements */}
         <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-50/40 rounded-full blur-[100px]" />
         </div>

         {/* Navigation */}
         <nav className="relative z-50 pt-6 pb-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

               <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                  <div className="h-12 w-12 flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-full overflow-hidden p-1">
                     <img src={mitsLogo} alt="MITS Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[16px] font-black text-slate-800 leading-tight">Madhav Institute of Technology & Science</span>
                     <span className="text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase">CampusBook - Booking Management System</span>
                  </div>
               </div>

               <div className="hidden lg:flex items-center gap-1 bg-[#F9F6F0] px-2 py-1.5 rounded-full shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                  <a href="#" className="flex items-center gap-2 px-6 py-3 text-base font-bold text-blue-900 bg-white rounded-full shadow-sm">
                     <HomeIcon className="w-4 h-4" /> Home
                  </a>
                  <a href="#infrastructure" className="flex items-center gap-2 px-6 py-3 text-base font-bold text-slate-400 hover:text-slate-800 transition-colors">
                     <Map className="w-4 h-4" /> Infrastructure
                  </a>
                  <a href="#role-selection" className="flex items-center gap-2 px-6 py-3 text-base font-bold text-slate-400 hover:text-slate-800 transition-colors">
                     <Building className="w-4 h-4" /> User Roles
                  </a>
               </div>

               <button
                  onClick={handleDashboardRedirect}
                  className="px-8 py-2.5 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all active:scale-95"
               >
                  {user ? 'View Dashboard' : 'Login'}
               </button>
            </div>
         </nav>

         {/* Hero Section */}
         <section className="relative z-10 flex flex-col items-center justify-center pt-24 pb-28 px-6 md:pt-32">
            <div className="max-w-4xl mx-auto text-center space-y-7">
               <h1 className="text-6xl md:text-[5.5rem] font-black text-slate-900 tracking-tight leading-[1.05]">
                  Manage Your,<br />
                  <span className="text-blue-900">Facility Bookings Effortlessly.</span>
               </h1>
               <p className="text-[17px] md:text-[19px] text-slate-500 font-medium max-w-[700px] mx-auto leading-relaxed">
                  CampusBook is the centralized platform to discover, book, and efficiently manage all your college venues in one place. Simplify infrastructure utilization like never before.
               </p>

               <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={handleDashboardRedirect} className="px-8 py-3.5 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all flex items-center group active:scale-95">
                     Get Started
                     <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
               </div>
            </div>
         </section>

         {/* Quick Stats Summary */}
         <section id="analytics" className="relative z-10 py-16 px-6 bg-white border-y border-slate-100/60">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-12">
                  <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-blue-600 mb-2 block">System Analytics</span>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Live Platform Capacity</h3>
               </div>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {marketingStats.map((stat, idx) => {
                     const Icon = stat.icon;
                     return (
                        <div key={idx} className="bg-[#FDFBF7] rounded-3xl p-8 border border-amber-50/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center group">
                           <div className={`mx-auto w-14 h-14 rounded-[1.25rem] flex items-center justify-center mb-5 ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                              <Icon className="w-6 h-6" />
                           </div>
                           <h4 className="text-3xl font-black text-slate-900 mb-2">{stat.value}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                     )
                  })}
               </div>
            </div>
         </section>

         {/* Infrastructure Capabilities */}
         <section id="infrastructure" className="relative z-10 py-32 px-6 bg-[#FDFBF7]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-8 order-2 lg:order-1">
                  <div className="space-y-4">
                     <h5 className="text-blue-800 font-extrabold text-[10px] uppercase tracking-[0.3em]">Infrastructure Management</h5>
                     <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">Centralized Venue <br /> Visibility</h2>
                     <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-lg">
                        CampusBook provides transparent access to all campus venues. Empowering departments to track facility utilization seamlessly without scheduling conflicts.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-2">
                     {[
                        { title: 'Conflict Detection', desc: 'Prevents double booking effectively.' },
                        { title: 'Department Workflow', desc: 'Integrated approval chains.' },
                        { title: 'DSW Authorization', desc: 'Secure central venue controls.' },
                        { title: 'Usage Analytics', desc: 'Insights into venue tracking.' }
                     ].map((feat, i) => (
                        <div key={i} className="flex gap-4 group items-start bg-white p-5 rounded-2xl border border-slate-50 shadow-sm transition-all hover:shadow-md">
                           <div className="mt-0.5 h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 flex-shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                              <Check className="w-3 h-3" strokeWidth={3} />
                           </div>
                           <div>
                              <p className="text-[13px] font-bold text-slate-900 tracking-tight leading-none mb-1.5">{feat.title}</p>
                              <p className="text-[11px] font-medium text-slate-400 leading-snug">{feat.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="relative order-1 lg:order-2 flex justify-center">
                  <div className="relative w-full max-w-md aspect-square bg-white rounded-full p-4 border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.05)]">
                     <div className="absolute inset-4 rounded-full border border-dashed border-slate-200 animate-[spin_60s_linear_infinite]" />
                     <img
                        src={infrastructurePreview}
                        alt="Campus infrastructure overview"
                        className="relative z-10 rounded-full w-full h-full object-cover shadow-inner"
                     />
                  </div>
               </div>
            </div>
         </section>

         {/* Role Access Matrix */}
         <section id="role-selection" className="relative z-10 py-32 px-6 bg-white border-y border-slate-100/60">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-16 space-y-4">
                  <h5 className="text-blue-800 font-extrabold text-[10px] uppercase tracking-[0.3em]">Identity Matrix</h5>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Structured Authentication</h2>
                  <p className="text-slate-400 font-medium max-w-lg mx-auto text-[17px]">Secure hierarchical access layers designed specifically for university workflows.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {roles.map((role) => {
                     const Icon = role.icon;
                     return (
                        <div
                           key={role.key}
                           onClick={() => navigate('/login')}
                           className="group relative text-left p-8 bg-[#FDFBF7] rounded-[2rem] border border-amber-50/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between min-h-[260px] cursor-pointer"
                        >
                           <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

                           <div>
                              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-[1rem] ${role.bgAccent} ${role.textAccent} mb-6 transition-transform duration-300 group-hover:scale-[1.15] group-hover:-rotate-3`}>
                                 <Icon className="w-6 h-6" />
                              </div>
                              <h3 className="text-[19px] font-black text-slate-900 mb-2 tracking-tight">{role.label}</h3>
                              <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{role.description}</p>
                           </div>

                           <div className={`mt-6 inline-flex items-center text-xs font-bold opacity-70 group-hover:opacity-100 transition-opacity ${role.textAccent}`}>
                              Access Portal <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>
         </section>

         {/* Organic divider transition */}
         <div className="w-full h-24 bg-white" />

         {/* Bottom CTA Card */}
         <section className="relative z-10 pb-24 pt-6 px-6">
            <div className="max-w-5xl mx-auto relative">
               {/* Organic blob background */}
               <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-[120%] h-[120%] text-blue-600 fill-current">
                     <path d="M45.7,-77.2C58.9,-69.1,69.5,-56.9,76.6,-43.1C83.7,-29.4,87.3,-14.7,86.1,-0.7C84.9,13.3,78.8,26.7,70,38.1C61.3,49.5,49.9,59,37,65.8C24.1,72.6,9.6,76.7,-4.8,75.1C-19.1,73.4,-33.4,66,-45.5,56.1C-57.5,46.1,-67.4,33.6,-72.7,19.5C-78.1,5.3,-78.9,-10.4,-74.6,-24.8C-70.3,-39.3,-60.9,-52.4,-48.5,-60.9C-36.1,-69.4,-20.7,-73.2,-4.8,-75.7C11.1,-78.2,28.7,-79.4,45.7,-77.2Z" transform="translate(100 100)" />
                  </svg>
               </div>

               <div className="relative z-10 bg-white/40 backdrop-blur-md rounded-[3rem] p-16 md:p-24 text-center border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
                     <Award className="w-8 h-8 text-blue-800" />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight uppercase italic">
                     Elevate Your Campus <br className="hidden md:block" /> Experience.
                  </h2>
                  <p className="text-slate-500 font-bold italic mb-12 text-xl max-w-2xl">
                     Streamline venue reservations, coordinate department events, and foster a connected university community with CampusBook.
                  </p>
                  <button onClick={handleDashboardRedirect} className="px-12 py-4.5 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-900/30 hover:shadow-blue-900/40 hover:-translate-y-1 transition-all active:scale-95 group flex items-center">
                     Launch Dashboard
                     <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                  </button>
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className="relative z-10 py-12 px-6 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-3">
               <p className="text-[13px] font-semibold text-slate-400">
                  © 2026 MITS Gwalior CampusBook - Facility Booking System
               </p>
               <p className="text-[13px] font-semibold text-slate-400">
                  Made by <span className="text-blue-900 font-bold">Nayan Jain</span>
               </p>
            </div>
         </footer>
      </div>
   );
};

export default Home;
