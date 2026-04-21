import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, TrendingUp, Search, PlusCircle, Bookmark, Compass, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BookingTable from '../../components/common/BookingTable';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings } from '../../services/bookingService';
import useApi from '../../hooks/useApi';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const { loading, request } = useApi();

  const [stats, setStats] = useState({ approved: 0, pending: 0, total: 0 });
  const [activeSpot, setActiveSpot] = useState(null);

  const chartData = [
    { name: 'Approved', count: stats.approved },
    { name: 'Pending', count: stats.pending },
    { name: 'Total', count: stats.total },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookings = await request(() => getMyBookings());
        if (bookings) {
          const formatted = bookings
            .map((booking) => ({
              id: booking._id,
              venue: booking.venueId?.name || 'Unknown Venue',
              applicant: user?.name || booking.userId?.name || 'You',
              dept: booking.userId?.departmentId?.name || user?.departmentId?.name || 'General',
              date: new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: `${booking.startTime} - ${booking.endTime}`,
              status: booking.status.split('_').pop().toUpperCase(),
            }))
            .slice(0, 5);

          setRecentBookings(formatted);
          
          // Calculate stats for charts
          const approved = bookings.filter(b => b.status === 'approved').length;
          const pending = bookings.filter(b => b.status.startsWith('pending')).length;
          setStats({ approved, pending, total: bookings.length });

          // Find an active spot (first approved booking today or next)
          const liveSpot = formatted.find(b => b.status === 'APPROVED');
          if (liveSpot) setActiveSpot(liveSpot);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };
    fetchData();
  }, []);

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
           <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Instructor Terminal...</p>
        </div>
     );
  }

  return (
    <div className="space-y-12 animate-fade-in transition-all pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest pl-1 border-l-2 border-blue-200">Instructor Dashboard</h4>
           </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight italic">Welcome back, {user?.name || 'Instructor'}</h1>
          <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
             <Calendar className="w-4 h-4 mr-2" />
             Reservation Control & Scheduling
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/faculty/book')}
            className="flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 transition-all active:scale-95 text-sm uppercase tracking-widest"
          >
             <PlusCircle className="w-5 h-5 mr-3" />
             Initialize Reservation
          </button>
        </div>
      </header>

      {/* Hero Analytics & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 p-10 bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-blue-900/5 relative overflow-hidden group">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 italic">Weekly Utilization Graph</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                       <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                    <Tooltip cursor={{fill: '#f8fafc', borderRadius: 20}} />
                    <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorCount)" />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Visual Flourish */}
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
               <TrendingUp className="w-64 h-64 text-blue-600" />
            </div>
         </div>

         <div className="space-y-6">
            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-3xl font-extrabold mb-2 italic">Active Spot</h4>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">
                    {activeSpot ? `${activeSpot.venue} (Confirmed)` : 'No Active Sessions'}
                  </p>
                  
                  {activeSpot ? (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl group-hover:bg-white/10 transition-all duration-500">
                      <div className="h-10 w-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                          <Clock className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-sm font-bold">{activeSpot.time}</p>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Scheduled Session</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center">
                       <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Validations</p>
                    </div>
                  )}
               </div>
               
               <div className="pt-8">
                  <div className="flex items-center mb-6">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                        {activeSpot ? 'Platform handshake verified' : 'System idle'}
                     </span>
                  </div>
                  <button 
                    onClick={() => navigate('/faculty/bookings')}
                    className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-white/5 active:scale-95 text-xs uppercase tracking-widest"
                  >
                     Review All Logs
                  </button>
               </div>
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
            </div>
         </div>
      </div>

      {/* Table Section */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900 italic">Timeline of Requests</h3>
            <div className="flex items-center gap-2">
               <button onClick={() => navigate('/faculty/bookings')} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest shadow-sm">
                  Full Logbook
               </button>
            </div>
         </div>
         <BookingTable bookings={recentBookings} />
      </div>
    </div>
  );
};

export default FacultyDashboard;
