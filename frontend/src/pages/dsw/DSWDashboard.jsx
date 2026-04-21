import React, { useState, useEffect } from 'react';
import BookingTable from '../../components/common/BookingTable';
import { 
  Building2, Users, CalendarCheck, TrendingUp, Search, Filter, 
  MapPin, Bell, MoreVertical, LayoutGrid, List, FileSpreadsheet, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { getVenues } from '../../services/venueService';
import { getAllBookings } from '../../services/bookingService';
import { exportToCsv } from '../../utils/exportCsv';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';

const DSWDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [centralBookings, setCentralBookings] = useState([]);
  const { loading, request } = useApi();
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  const chartData = [
    { name: 'Approved', usage: statsData?.approvedBookings || 0 },
    { name: 'Pending', usage: statsData?.pendingBookings || 0 },
    { name: 'Total', usage: statsData?.totalBookings || 0 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await request(() => Promise.all([
          getVenues(),
          getAllBookings()
        ]));
        if (!result) return;
        const [venues, bookings] = result;
        
        setStatsData({
          totalVenues: venues?.length || 0,
          totalBookings: bookings?.length || 0,
          pendingBookings: bookings?.filter(b => b.status === "pending_dsw")?.length || 0,
          approvedBookings: bookings?.filter(b => b.status === "approved")?.length || 0,
          activeMaintenance: venues?.filter(v => v.status === 'maintenance')?.length || 0
        });

        const formatted = bookings
          .map(b => ({
             id: b._id,
             venue: b.venueId?.name || 'Central Venue',
             applicant: b.userId?.name || 'Faculty',
             date: new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
             time: `${b.startTime} - ${b.endTime}`,
             status: b.status.split('_').pop().toUpperCase(),
             dept: b.venueId?.departmentId?.name || 'General'
          }));
        setCentralBookings(formatted);
      } catch (error) {
        console.error('Failed to fetch DSW dashboard data', error);
      }
    };
    fetchData();
  }, []);

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
           <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Oversight Terminal...</p>
        </div>
     );
  }

  const handleExport = () => {
     if (!centralBookings.length) return toast.error('No reservation logs found');
     exportToCsv('university_bookings_report.csv', centralBookings);
     toast.success('Central Logs Exported Successfully');
  };

  const filteredBookings = (Array.isArray(centralBookings) ? centralBookings : []).filter(b => {
     if (!b) return false;
     const venue = b?.venue || '';
     const applicant = b?.applicant || '';
     const status = b?.status || '';
     const term = (searchTerm || '').toLowerCase();
     
     return venue.toLowerCase().includes(term) ||
            applicant.toLowerCase().includes(term) ||
            status.toLowerCase().includes(term);
  }).slice(0, 5);

  const metrics = [
    { label: 'Total Venues', value: statsData?.totalVenues || '0', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', path: '/admin/venues' },
    { label: 'Pending DSW', value: statsData?.pendingBookings || '0', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', path: '/dsw/approvals' },
    { label: 'Total Reservations', value: statsData?.totalBookings || '0', icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/logs' },
    { label: 'Approved', value: statsData?.approvedBookings || '0', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '#' },
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-12 transition-all">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-5 h-5" />
             </div>
             <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest pl-1 border-l-2 border-blue-200">Director of Student Welfare</h4>
           </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">University Oversight</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center">
             <LayoutGrid className="w-4 h-4 mr-2" />
             Campus-wide Venue Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 text-sm uppercase tracking-wider"
          >
             <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
             Export Logs
          </button>
          <button 
            onClick={() => navigate('/admin/venues')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-sm uppercase tracking-wider"
          >
             Central Venues
          </button>
        </div>
      </header>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {metrics.map((metric) => (
          <div 
            key={metric.label} 
            onClick={() => metric.path !== '#' && navigate(metric.path)}
            className={`p-8 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-blue-900/5 transition-all duration-300 group ${metric.path !== '#' ? 'cursor-pointer hover:shadow-blue-900/10' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{metric.label}</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{metric.value}</h3>
                <div className="mt-4 flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </div>
              </div>
              <div className={`p-4 rounded-3xl ${metric.bg} ${metric.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <metric.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

       {/* Detailed Insights & Capacity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all duration-300 group relative overflow-hidden">
           <div className="mb-10">
              <h3 className="text-2xl font-bold text-slate-900 leading-tight italic">Campus-wide Activity</h3>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">Utilization frequency by day of week</p>
           </div>
           
           <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                   contentStyle={{borderRadius: '1.25rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '15px'}}
                />
                <Area type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
           <h3 className="text-2xl font-bold mb-1 italic">Queue Overview</h3>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10">Central Infrastructure Flow</p>
           
           <div className="space-y-8 relative z-10">
              <div className="flex flex-col space-y-3">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-blue-400" />Approved Rate</span>
                    <span className="text-blue-400 italic">
                        {statsData?.totalBookings > 0 ? Math.round((statsData.approvedBookings / statsData.totalBookings) * 100) : 0}%
                    </span>
                 </div>
                 <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div 
                        className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        style={{ width: `${statsData?.totalBookings > 0 ? (statsData.approvedBookings / statsData.totalBookings) * 100 : 0}%` }}
                    ></div>
                 </div>
              </div>

              <div className="flex flex-col space-y-3">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-emerald-400" />Venue Availability</span>
                    <span className="text-emerald-400 italic">
                        {statsData?.totalVenues > 0 ? Math.round(((statsData.totalVenues - (statsData.activeMaintenance || 0)) / statsData.totalVenues) * 100) : 100}%
                    </span>
                 </div>
                 <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                        style={{ width: `${statsData?.totalVenues > 0 ? ((statsData.totalVenues - (statsData.activeMaintenance || 0)) / statsData.totalVenues) * 100 : 100}%` }}
                    ></div>
                 </div>
              </div>

              <div className="pt-8 flex flex-col items-center">
                 <button onClick={() => navigate('/timetable')} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 transition-all rounded-2xl font-bold text-xs tracking-widest uppercase italic">
                    Launch Infrastructure Map
                 </button>
              </div>
           </div>
           {/* Visual Flourish */}
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl opacity-50" />
        </div>
      </div>

      <div className="p-12 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/5">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 italic">Central Reservation Logs</h2>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Authorization History</p>
          </div>
           <div className="flex items-center space-x-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Filter logs..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-sans italic" 
               />
             </div>
             <button className="h-11 w-11 flex items-center justify-center bg-slate-50 text-slate-400 border border-slate-100 rounded-xl hover:bg-white hover:text-blue-600 transition-all shadow-sm">
                <Bell className="w-5 h-5" />
             </button>
          </div>
        </div>
        <BookingTable bookings={filteredBookings} />
      </div>
    </div>
  );
};

export default DSWDashboard;
