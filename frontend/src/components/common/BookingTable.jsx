import React from 'react';
import { CheckCircle, XCircle, Clock, MoreVertical, MapPin, Calendar, User, Eye, Trash2, Undo2, Ban } from 'lucide-react';

const BookingTable = ({ bookings = [], onView, onDelete, onWithdraw }) => {
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('approved')) return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20';
    if (s.includes('pending')) return 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/20';
    if (s.includes('rejected')) return 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/20';
    if (s.includes('withdrawn')) return 'bg-slate-100 text-slate-500 border-slate-200 ring-slate-500/20';
    return 'bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/20';
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('approved')) return <CheckCircle className="w-3 h-3 mr-1.5" />;
    if (s.includes('pending')) return <Clock className="w-3 h-3 mr-1.5" />;
    if (s.includes('rejected')) return <XCircle className="w-3 h-3 mr-1.5" />;
    if (s.includes('withdrawn')) return <Undo2 className="w-3 h-3 mr-1.5" />;
    return null;
  };

  const isTerminal = (status) => {
    const s = status?.toLowerCase() || '';
    return s.includes('withdrawn') || s.includes('rejected');
  };

  // If no real bookings yet, show empty state
  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-lg shadow-blue-900/5">
        <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">No matching records found</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden group">
      <div className="p-8 border-b border-slate-50 bg-slate-50/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg shadow-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight italic uppercase">Recent Reservations</h3>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Real-time persistence logs</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Venue & Session</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Applicant</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Department</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center italic">Status</th>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right italic">Action Suite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-blue-50/30 transition-all duration-300 group/row italic font-bold">
                <td className="px-8 py-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center group-hover/row:bg-white transition-colors duration-300 mr-4 group-hover/row:scale-105 group-hover/row:shadow-md">
                      <MapPin className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 tracking-tight group-hover/row:text-blue-600 transition-colors uppercase italic">{booking.venue}</p>
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1 text-slate-300" />
                        {booking.date} | {booking.time}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 font-bold text-slate-700 text-sm italic">{booking.applicant}</td>
                <td className="px-6 py-6 font-bold text-slate-400 text-xs tracking-widest uppercase italic">{booking.dept}</td>
                <td className="px-6 py-6 text-center">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border transition-all duration-500 transform hover:scale-105 hover:ring-2 ${getStatusStyle(booking.status)} shadow-sm`}>
                    {getStatusIcon(booking.status)}
                    {booking.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover/row:opacity-100 transition-all duration-300 transform translate-x-4 group-hover/row:translate-x-0">
                    {onView && (
                      <button 
                        onClick={() => onView(booking)}
                        className="p-2.5 text-blue-500 bg-white hover:bg-blue-50 rounded-xl transition-all border border-slate-100 shadow-sm" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {onWithdraw && !isTerminal(booking.status) && (
                      <button 
                        onClick={() => onWithdraw(booking.id)}
                        className="p-2.5 text-amber-500 bg-white hover:bg-amber-50 rounded-xl transition-all border border-slate-100 shadow-sm" title="Withdraw Booking">
                        <Undo2 className="w-4 h-4" />
                      </button>
                    )}
                    {onWithdraw && isTerminal(booking.status) && (
                      <span className="p-2.5 text-slate-300 cursor-not-allowed" title="Cannot withdraw — already finalized">
                        <Ban className="w-4 h-4" />
                      </span>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(booking.id)}
                        className="p-2.5 text-rose-500 bg-white hover:bg-rose-50 rounded-xl transition-all border border-slate-100 shadow-sm" title="Purge Record">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                   <div className="group-hover/row:hidden opacity-40">
                    <MoreVertical className="w-4 h-4 text-slate-300 ml-auto" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;
