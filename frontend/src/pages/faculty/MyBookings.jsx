import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import BookingTable from '../../components/common/BookingTable';
import Modal from '../../components/common/Modal';
import { Clock, CheckSquare, AlertCircle, Loader2, MapPin, Calendar, Info, ShieldCheck, User } from 'lucide-react';
import { getMyBookings, withdrawBooking } from '../../services/bookingService';
import useApi from '../../hooks/useApi';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading, request } = useApi();

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const data = await request(() => getMyBookings());
      if (!data) return;
      // Format data for the BookingTable component
      const formatted = data.map(b => ({
        id: b._id,
        venue: b.venueId?.name || b.snapshot?.venueName || 'Unknown Venue',
        applicant: 'You',
        date: new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: `${b.startTime} - ${b.endTime}`,
        status: b.status.split('_').pop().toUpperCase(),
        dept: b.venueId?.departmentId?.name || b.snapshot?.departmentName || 'General',
        purpose: b.purpose,
        requirements: b.requirements || 'None specified'
      }));
      setBookings(formatted);
    } catch (error) {
      // Error handled by useApi wrapper
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this booking request?')) return;
    try {
      await request(() => withdrawBooking(id));
      toast.success('Booking withdrawn successfully');
      fetchMyBookings();
    } catch (error) {
      // Error handled automatically by useApi hook
    }
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const stats = {
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    pending: bookings.filter(b => b.status.startsWith('PENDING')).length,
    rejected: bookings.filter(b => b.status === 'REJECTED').length,
    withdrawn: bookings.filter(b => b.status === 'WITHDRAWN').length,
  };

  if (loading && bookings.length === 0) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
      <p className="font-bold text-slate-400 tracking-widest italic animate-pulse">Syncing Reservation Logs...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in transition-all">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight italic">My Reservations</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center italic">
            <CheckSquare className="w-4 h-4 mr-2" />
            Active Enrollment Tracking
          </p>
        </div>
      </header>

      {/* Modal for Details */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Reservation Details"
      >
        {selectedBooking && (
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center text-blue-500 border border-slate-100 shadow-sm">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-slate-900 uppercase italic leading-tight">{selectedBooking.venue}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center italic">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {selectedBooking.date} | {selectedBooking.time}
                </p>
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 italic">
                  {selectedBooking.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-blue-500" />
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Functional Purpose</p>
                </div>
                <p className="text-sm font-bold text-slate-700 italic leading-relaxed pl-7">{selectedBooking.purpose}</p>
              </div>

              <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Special Requirements</p>
                </div>
                <p className="text-sm font-bold text-slate-700 italic leading-relaxed pl-7">{selectedBooking.requirements}</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center gap-3">
               <User className="w-4 h-4 text-amber-500" />
               <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest italic">Reservation Identity: You (Faculty)</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center space-x-4 group hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 italic font-bold group-hover:scale-110 transition-transform">{stats.approved}</div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Confirmed Access</p>
            <p className="text-xl font-bold text-slate-800 tracking-tight italic">Reservation Active</p>
          </div>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center space-x-4 group hover:shadow-amber-500/10 transition-all duration-300">
          <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100 italic font-bold group-hover:scale-110 transition-transform">{stats.pending}</div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Review Pending</p>
            <p className="text-xl font-bold text-slate-800 tracking-tight italic">Verification Phase</p>
          </div>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center space-x-4 group hover:shadow-rose-500/10 transition-all duration-300">
          <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100 italic font-bold group-hover:scale-110 transition-transform">{stats.rejected}</div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Request Stopped</p>
            <p className="text-xl font-bold text-slate-800 tracking-tight italic">Decision Declined</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center text-blue-700 italic shadow-sm">
           <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0" />
           <p className="text-sm font-semibold tracking-tight uppercase">Decision Logic: HOD validates department venues. DSW validates central infrastructure.</p>
        </div>
        <BookingTable bookings={bookings} onWithdraw={handleWithdraw} onView={handleView} hideApplicant={true} />
      </div>
    </div>
  );
};

export default MyBookings;
