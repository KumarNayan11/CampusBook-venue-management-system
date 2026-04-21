import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  CheckCircle, Clock, 
  MapPin, User, Check, X, ShieldCheck, Mail, RefreshCw
} from 'lucide-react';
import { getAllBookings, hodApprove, dswApprove, rejectBooking } from '../services/bookingService';
import useApi from '../hooks/useApi';

const Approvals = ({ role = 'hod' }) => {
  const [data, setData] = useState([]);
  const { loading, request } = useApi();

  useEffect(() => {
    fetchPendingBookings();
  }, [role]);

  const fetchPendingBookings = async () => {
    try {
      const bookings = await request(() => getAllBookings());
      if (!bookings) return;
      
      // Filter based on role
      const pending = bookings.filter(b => {
        if (role === 'hod') return b.status === 'pending_hod';
        if (role === 'dsw') return b.status === 'pending_dsw';
        return false;
      });
      setData(pending);
    } catch (err) {
      // Handled by useApi toast
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        if (role === 'hod') await request(() => hodApprove(id));
        else await request(() => dswApprove(id));
      } else {
        await request(() => rejectBooking(id, 'Request denied by authority'));
      }
      
      toast.success(`Booking ${action === 'approve' ? 'Approved' : 'Rejected'}`);
      setData(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      // Handled by useApi toast
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 space-y-4">
      <RefreshCw className="animate-spin w-12 h-12 text-indigo-600" />
      <p className="text-slate-400 font-bold uppercase tracking-widest italic animate-pulse">Syncing Approval Terminal...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in transition-all pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest pl-1 border-l-2 border-indigo-200">
                {role.toUpperCase()} Decision Phase
              </h4>
           </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight italic">Pending Decisions</h1>
          <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center italic">
             <Clock className="w-4 h-4 mr-2" />
             Queueing Management System
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {data.map((item) => (
          <div 
            key={item._id} 
            className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden group p-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
               <div className="flex-1 space-y-6">
                  <div className="flex items-start gap-6">
                     <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center text-blue-500 border border-slate-100 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                        <MapPin className="w-8 h-8" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic leading-none mb-2">{item.venueId?.name || 'Central Venue'}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center italic">
                           {new Date(item.date).toDateString()} | {item.startTime} - {item.endTime}
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 group-hover:bg-blue-50/20 transition-all duration-500">
                     <div className="flex gap-4">
                        <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                           <User className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic leading-none mb-1">Applicant Reference</p>
                           <p className="text-sm font-bold text-slate-700 leading-none">{item.userId?.name || 'Unknown Faculty'}</p>
                           <p className="text-[9px] font-bold text-slate-400 italic mt-1">{item.userId?.email || 'N/A'}</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                           <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic leading-none mb-1">Stated Purpose</p>
                           <p className="text-xs font-bold text-slate-700 italic">{item.purpose}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-4 border-l-2 border-slate-50 pl-0 lg:pl-10 h-full">
                  <button 
                    onClick={() => handleAction(item._id, 'reject')}
                    className="flex-1 lg:flex-none h-16 w-16 bg-white border border-slate-200 text-rose-500 rounded-3xl hover:bg-rose-50 hover:border-rose-200 transition-all shadow-xl shadow-rose-900/5 active:scale-95 flex items-center justify-center shadow-rose-500/5"
                  >
                     <X className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={() => handleAction(item._id, 'approve')}
                    className="flex-1 lg:flex-none h-16 w-48 bg-emerald-600 text-white rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center text-lg font-bold gap-3 uppercase tracking-widest"
                  >
                     <Check className="w-6 h-6" />
                     Approve
                  </button>
               </div>
            </div>
          </div>
        ))}
        
        {!loading && data.length === 0 && (
          <div className="p-24 text-center bg-white border border-slate-100 rounded-[3.5rem] shadow-sm italic">
             <CheckCircle className="w-24 h-24 text-slate-200 mx-auto mb-8 animate-pulse" />
             <h3 className="text-3xl font-extrabold text-slate-300 italic uppercase tracking-tighter">Queue Exhausted</h3>
             <p className="text-slate-400 font-bold uppercase tracking-widest mt-3">All requests have been successfully processed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
