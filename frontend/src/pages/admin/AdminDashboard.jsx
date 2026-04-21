import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { exportToCsv } from '../../utils/exportCsv';
import toast from 'react-hot-toast';
import { 
  Users, Calendar, MapPin, CheckCircle, TrendingUp, AlertCircle, Clock, 
  RefreshCw, Loader2, FileSpreadsheet, ChevronDown
} from 'lucide-react';
import { getUsers } from '../../services/userService';
import { getVenues } from '../../services/venueService';
import { getAllBookings } from '../../services/bookingService';
import useApi from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeVenues: 0,
    totalBookings: 0,
    approvedRate: '0%'
  });
  const { loading, request } = useApi();
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [users, venues, bookings] = await request(() => Promise.all([
        getUsers(),
        getVenues(),
        getAllBookings()
      ]));
      
      const uCount = users?.length || 0;
      const vCount = venues?.length || 0;
      const bCount = bookings?.length || 0;
      const pCount = bookings?.filter(b => b?.status?.includes('pending'))?.length || 0;
      
      let rate = '0%';
      if (bCount > 0) {
         const approvedCount = bookings.filter(b => b?.status === "approved").length;
         rate = `${Math.round((approvedCount / bCount) * 100)}%`;
      }

      setStats({
        totalUsers: uCount, 
        activeVenues: vCount,
        totalBookings: bCount,
        pendingBookings: pCount,
        approvedRate: rate
      });
      if (isManual) toast.success('System Synchronization Complete');
    } catch (error) {
      console.error('Stats fetch error:', error);
      toast.error('Unable to load live system analytics.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    exportToCsv('system_audit_report.csv', [stats]);
    toast.success('System Audit Exported');
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
      <p className="font-bold text-slate-400 tracking-widest italic animate-pulse">Initializing System Oversight...</p>
    </div>
  );

  const statCards = [
    { label: 'Platform Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', path: '/admin/users' },
    { label: 'Capacity (Venues)', value: stats.activeVenues, icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/admin/venues' },
    { label: 'Total Logs', value: stats.totalBookings, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', path: '/logs' },
    { label: 'Oversight Rate', value: stats.approvedRate, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '#' },
  ];

  const chartData = [
    { name: 'Approved', bookings: stats.totalBookings - (stats.pendingBookings || 0) },
    { name: 'Pending', bookings: stats.pendingBookings || 0 },
    { name: 'Total', bookings: stats.totalBookings },
  ];

  return (
    <div className="space-y-10 animate-fade-in transition-all pb-12 font-sans italic selection:bg-blue-100 selection:text-blue-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">System Analytics</h1>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center italic">
            <TrendingUp className="w-4 h-4 mr-2" />
            Live Infrastructure Propagation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
             onClick={() => fetchDashboardStats(true)}
             disabled={refreshing}
             className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-95 group/refresh"
          >
             <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover/refresh:rotate-180'} transition-transform duration-500`} />
          </button>
          <button 
             onClick={handleExport}
             className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center text-xs uppercase tracking-widest italic"
          >
             <FileSpreadsheet className="w-4 h-4 mr-2" />
             Export Audit
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              onClick={() => stat.path !== '#' && navigate(stat.path)}
              className={`p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 transition-all duration-300 group ${stat.path !== '#' ? 'cursor-pointer hover:shadow-blue-900/10' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">{stat.label}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tighter">{stat.value}</h3>
                  <div className="mt-3 flex items-center text-[10px] font-extrabold text-emerald-500 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5%
                  </div>
                </div>
                <div className={`p-5 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-current/10 border border-current/10`}>
                  <Icon className="w-7 h-7" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-12 bg-white border border-slate-100 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden relative group">
          <div className="mb-12 flex items-center justify-between">
             <div>
              <h3 className="text-2xl font-bold text-slate-900 italic leading-none">Reservations Velocity</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 italic flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Utilization frequency by month
              </p>
            </div>
            <select className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm italic cursor-pointer">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800, transform: 'translate(0, 10)'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc', borderRadius: 20}}
                  contentStyle={{borderRadius: '1.25rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '15px'}}
                />
                <Bar dataKey="bookings" fill="#2563eb" radius={[15, 15, 15, 15]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-12 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
          <h3 className="text-2xl font-bold italic leading-none mb-2">Queue Propagation</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 mb-12 italic">Pending Oversight Status</p>
          
          <div className="space-y-10 relative z-10">
            <div className="flex flex-col space-y-4">
               <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 italic">
                     <Clock className="w-4 h-4 text-amber-500" />
                     Oversight Queue
                  </p>
                  <span className="text-amber-500 font-bold italic text-sm">{stats.pendingBookings > 0 ? 'Active' : 'Clear'}</span>
               </div>
               <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-1000"
                    style={{ width: `${Math.min(100, (stats.pendingBookings / (stats.totalBookings || 1)) * 100)}%` }}
                  ></div>
               </div>
            </div>

            <div className="flex flex-col space-y-4">
               <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 italic">
                     <Clock className="w-4 h-4 text-blue-500" />
                     Approved Logs
                  </p>
                  <span className="text-blue-500 font-bold italic text-sm">{stats.approvedRate}</span>
               </div>
               <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-1000"
                    style={{ width: stats.approvedRate }}
                  ></div>
               </div>
            </div>

            <div className="p-8 bg-blue-600 rounded-3xl text-white mt-12 shadow-2xl shadow-blue-500/30 overflow-hidden relative group/internal hover:-translate-y-1 transition-all duration-300">
              <div className="relative z-10">
                <h4 className="text-xl font-extrabold italic uppercase tracking-tighter">Priority Alerts</h4>
                <p className="text-[10px] font-bold text-blue-100 mt-2 opacity-80 uppercase tracking-widest italic">Action Required ASAP</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-3xl font-black">{stats.pendingBookings || 0}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Pending Oversight Items</span>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 p-4 opacity-10 group-hover/internal:scale-125 transition-transform duration-1000">
                <AlertCircle className="w-32 h-32" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
