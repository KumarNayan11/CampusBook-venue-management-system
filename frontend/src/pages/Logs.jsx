import React, { useState, useEffect } from 'react';
import BookingTable from '../components/common/BookingTable';
import { getAllBookings } from '../services/bookingService';
import { getVenues } from '../services/venueService';
import { useAuth } from '../context/AuthContext';
import { Loader2, CalendarRange, Filter } from 'lucide-react';
import useApi from '../hooks/useApi';

const Logs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [rawBookings, setRawBookings] = useState([]);
  const { loading, request } = useApi();
  const [viewLimit, setViewLimit] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ venueId: '', status: '', departmentId: '', date: '' });
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [bookings, vData] = await request(() => Promise.all([
          getAllBookings(),
          getVenues()
        ]));
        
        if (vData) {
           setVenues(vData);
           const depts = [];
           const dIds = new Set();
           vData.forEach(v => {
              const d = v.departmentId;
              if (d && typeof d === 'object' && d._id && !dIds.has(d._id)) {
                 dIds.add(d._id);
                 depts.push(d);
              }
           });
           setDepartments(depts);
        }

        if (!bookings) return;
        
        let filtered = bookings;
        if (user?.role === 'hod') {
          const userDeptId = typeof user.departmentId === 'object' ? user.departmentId._id : user.departmentId;
          filtered = bookings.filter(b => {
             const venueDeptId = typeof b.venueId?.departmentId === 'object' ? b.venueId?.departmentId._id : b.venueId?.departmentId;
             return venueDeptId === userDeptId;
          });
        }
        
        setRawBookings(filtered);
      } catch (error) {
        console.error('Failed to init logs', error);
      }
    };
    
    initData();
  }, [user]);

  useEffect(() => {
     let result = rawBookings;
     
     if (filters.venueId) {
        result = result.filter(b => b?.venueId?._id === filters.venueId);
     }
     if (filters.status) {
        result = result.filter(b => b?.status === filters.status);
     }
     if (filters.departmentId) {
        result = result.filter(b => {
           const venueDeptId = typeof b?.venueId?.departmentId === 'object' ? b?.venueId?.departmentId?._id : b?.venueId?.departmentId;
           return venueDeptId === filters.departmentId;
        });
     }
     if (filters.date) {
        result = result.filter(b => {
           if (!b?.date) return false;
           // Format b.date to YYYY-MM-DD
           const bDate = new Date(b.date).toISOString().split('T')[0];
           return bDate === filters.date;
        });
     }
     
     const formatted = result.map(b => ({
         id: b._id,
         venue: b?.venueId?.name || 'Unknown Venue',
         applicant: b?.userId?.name || 'Unknown',
         date: new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
         time: `${b.startTime} - ${b.endTime}`,
         status: b.status?.split('_').pop().toUpperCase() || 'UNKNOWN',
         dept: b?.venueId?.departmentId?.name || 'Central / General'
     }));
     
     setLogs(formatted);
  }, [filters, rawBookings]);

  if (loading && logs.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Logs...</p>
       </div>
     );
  }

  const displayedLogs = logs.slice(0, viewLimit);

  return (
    <div className="space-y-8 animate-fade-in transition-all">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight uppercase italic flex items-center">
             LOG ARCHIVES
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center">
             <CalendarRange className="w-4 h-4 mr-2" />
             {user?.role === 'hod' 
               ? `Department View – ${user.departmentId?.name || 'Department'}`
               : 'Central Infrastructure Logs'}
          </p>
        </div>
      </header>

       <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-2xl shadow-blue-900/5">
         <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
           <h2 className="text-xl font-bold text-slate-800 tracking-tight italic">
             {user?.role === 'hod' ? 'Department booking logs' : 'All booking logs across campus infrastructure'}
           </h2>
           <button 
             onClick={() => setShowFilters(!showFilters)}
             className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center shadow-sm hover:bg-slate-100 transition-all active:scale-95"
           >
              <Filter className="w-4 h-4 mr-2" />
              Filter Logs
           </button>
         </div>

         {showFilters && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Venue</label>
                  <select 
                     value={filters.venueId} 
                     onChange={(e) => setFilters(prev => ({ ...prev, venueId: e.target.value }))}
                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                     <option value="">All Venues</option>
                     {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Status</label>
                  <select 
                     value={filters.status} 
                     onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                     <option value="">All Statuses</option>
                     <option value="approved">Approved</option>
                     <option value="pending_hod">Pending HOD</option>
                     <option value="pending_dsw">Pending DSW</option>
                     <option value="withdrawn">Withdrawn</option>
                     <option value="rejected">Rejected</option>
                  </select>
               </div>
               {user?.role !== 'hod' && (
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Department</label>
                  <select 
                     value={filters.departmentId} 
                     onChange={(e) => setFilters(prev => ({ ...prev, departmentId: e.target.value }))}
                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                     <option value="">All Departments</option>
                     {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
               </div>
               )}
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Date</label>
                  <input 
                     type="date"
                     value={filters.date} 
                     onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
               </div>
            </div>
         )}

         {logs.length === 0 && Object.values(filters).some(v => v !== '') ? (
            <div className="py-12 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-3xl">
               <Filter className="w-10 h-10 text-slate-300 mb-3" />
               <p className="text-sm font-bold text-slate-400 tracking-widest uppercase italic">No logs match the selected filters.</p>
               <button 
                 onClick={() => setFilters({ venueId: '', status: '', departmentId: '', date: '' })}
                 className="mt-4 px-4 py-2 bg-white text-blue-500 font-bold text-xs rounded-lg shadow-sm border border-slate-200"
               >
                 Clear Filters
               </button>
            </div>
         ) : (
            <BookingTable bookings={displayedLogs} />
         )}
         
         {logs.length > viewLimit && (
           <div className="flex justify-center mt-6">
              <button 
                onClick={() => setViewLimit(prev => prev + 20)}
                className="px-6 py-3 bg-white border border-blue-100 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-sm active:scale-95 text-xs uppercase tracking-widest"
              >
                 Load More Archives
              </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default Logs;
