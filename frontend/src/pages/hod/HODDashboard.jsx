import React, { useState, useEffect } from 'react';
import BookingTable from '../../components/common/BookingTable';
import { CheckCircle, XCircle, Clock, Search, Filter, GraduationCap, TrendingUp, BarChart3, ArrowRight, Loader2, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getVenues } from '../../services/venueService';
import { getAllBookings } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import { exportToCsv } from '../../utils/exportCsv';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi';

const HODDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const { loading, request } = useApi();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await request(() => Promise.all([
          getVenues(),
          getAllBookings()
        ]));
        if (!result) return;
        const [venues, bookings] = result;
        const userDeptId = typeof user?.departmentId === 'object' ? user?.departmentId?._id : user?.departmentId;

        const deptBookings = bookings.filter(b => {
            const venueDeptId = typeof b.venueId?.departmentId === 'object' ? b.venueId?.departmentId?._id : b.venueId?.departmentId;
            return venueDeptId === userDeptId;
        });
        
        const deptVenues = venues.filter(v => {
            const vDeptId = typeof v.departmentId === 'object' ? v.departmentId?._id : v.departmentId;
            return vDeptId === userDeptId;
        });

        const pendingCount = deptBookings.filter(b => b.status === 'pending_hod').length;
        const approvedCount = deptBookings.filter(b => b.status === 'approved' || b.status === 'pending_dsw').length;

        setStatsData({
            totalVenues: deptVenues.length,
            totalBookings: deptBookings.length,
            pendingApproval: pendingCount,
            approvedBookings: approvedCount
        });
        
        const formatted = deptBookings
          .filter(b => b.status === 'pending_hod')
          .map(b => ({
            id: b._id,
            venue: b.venueId?.name || 'Department Venue',
            applicant: b.userId?.name || 'Faculty',
            date: new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: `${b.startTime} - ${b.endTime}`,
            status: b.status.split('_').pop().toUpperCase(),
            dept: b.venueId?.departmentId?.name || 'General'
          }));
        setPendingRequests(formatted);
      } catch (error) {
        console.error('Failed to fetch HOD dashboard data', error);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Department Terminal...</p>
       </div>
    );
  }

  const filteredRequests = (Array.isArray(pendingRequests) ? pendingRequests : []).filter(r => {
    if (!r) return false;
    const venue = r?.venue || '';
    const applicant = r?.applicant || '';
    const term = (searchTerm || '').toLowerCase();
    
    return venue.toLowerCase().includes(term) ||
           applicant.toLowerCase().includes(term);
  }).slice(0, 5);
  
  let dRate = '100%';
  if (statsData?.totalBookings > 0 && statsData?.approvedBookings !== undefined) {
      dRate = `${Math.round((statsData.approvedBookings / statsData.totalBookings) * 100)}%`;
  }

  const stats = [
    { label: 'Pending Approvals', value: statsData?.pendingApproval || '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', path: '/hod/approvals' },
    { label: 'Department Venues', value: statsData?.totalVenues || '0', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', path: '#' },
    { label: 'Department Bookings', value: statsData?.totalBookings || '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/logs' },
    { label: 'Decision Rate', value: dRate, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '#' },
  ];

  const handleExport = () => {
    if (!pendingRequests.length) return toast.error('No reservation logs found');
    exportToCsv(`${user?.departmentId?.name || 'Department'}_Utilization.csv`, pendingRequests);
    toast.success('Department Logs Exported');
  };

  const showAdminOnlyMessage = () => {
    toast.error('Venue management is currently available to admins only.');
  };

  return (
    <div className="space-y-12 animate-fade-in transition-all">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight uppercase italic">{user?.departmentId?.name || 'Department'} Portal</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center">
             <BarChart3 className="w-4 h-4 mr-2" />
             Departmental Performance & Control
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
             onClick={handleExport}
             className="px-5 py-2.5 text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center"
          >
             <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
             Export Logs
          </button>
          <button onClick={showAdminOnlyMessage} className="px-5 py-2.5 text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95">Configure Venues</button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            onClick={() => stat.path !== '#' && navigate(stat.path)}
             className={`p-8 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-blue-900/5 transition-all duration-300 group ${stat.path !== '#' ? 'cursor-pointer hover:shadow-blue-900/10' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tighter">{stat.value}</h3>
                <div className="mt-4 flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.2%
                </div>
              </div>
              <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <stat.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

       <div className="bg-amber-50/50 border border-amber-100 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
             <div className="max-w-xl">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center italic uppercase tracking-tighter">
                   <Clock className="w-6 h-6 mr-3 text-amber-500 animate-pulse" />
                   Pending Approvals
                </h3>
                <p className="mt-2 text-slate-600 font-medium leading-relaxed">
                   There are <span className="font-bold text-amber-600">{statsData?.pendingApproval || '0'} pending reservation requests</span> that need your immediate review to proceed with department scheduling.
                </p>
             </div>
             <button onClick={() => navigate('/hod/approvals')} className="mt-8 md:mt-0 px-8 py-4 bg-white border border-amber-200 text-amber-700 font-bold rounded-2xl hover:bg-amber-100/50 transition-all shadow-lg active:scale-95 flex items-center uppercase tracking-widest text-xs">
                Action All Requests
                <ArrowRight className="w-4 h-4 ml-2" />
             </button>
          </div>
          <div className="absolute top-0 right-0 p-10 transform translate-x-20 -translate-y-20 opacity-5 group-hover:scale-110 transition-transform duration-700">
             <Clock className="w-64 h-64" />
          </div>
       </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight italic">Recent Activity</h2>
          <div className="flex space-x-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search activities..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm font-sans italic" 
                />
             </div>
             <button className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center shadow-sm hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4 mr-2" />
                Filter
             </button>
          </div>
        </div>
        <BookingTable bookings={filteredRequests} />
      </div>
    </div>
  );
};


export default HODDashboard;
