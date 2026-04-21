import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Search, Filter, Info, AlertCircle, ArrowRight, RefreshCw, Building2 } from 'lucide-react';
import { getVenues } from '../../services/venueService';
import { createBooking } from '../../services/bookingService';
import useApi from '../../hooks/useApi';
import { useLocation } from 'react-router-dom';

const generateTimeSlots = (openTime, closeTime) => {
  const slots = [];
  const start = parseInt((openTime || '08:00').split(':')[0], 10);
  const end = parseInt((closeTime || '20:00').split(':')[0], 10);
  for (let hour = start; hour <= end; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
};

const BookVenue = () => {
  const [venues, setVenues] = useState([]);
  const { loading, request } = useApi();
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [formData, setFormData] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchVenues();
    if (location.state) {
      setFormData(prev => ({
        ...prev,
        bookingDate: location.state.date || '',
        startTime: location.state.startTime || '',
        endTime: location.state.endTime || ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (venues.length > 0 && location.state?.venueId) {
      const v = venues.find(venue => venue._id === location.state.venueId);
      if (v) setSelectedVenue(v);
    }
  }, [venues, location.state]);

  useEffect(() => {
    if (selectedVenue) {
      const slots = generateTimeSlots(selectedVenue.booking_open_time, selectedVenue.booking_close_time);
      if (slots.length >= 2) {
        setFormData(prev => {
          let sTime = prev.startTime && slots.includes(prev.startTime) ? prev.startTime : slots[0];
          let eTime = prev.endTime && slots.includes(prev.endTime) && prev.endTime > sTime ? prev.endTime : null;
          
          if (!eTime) {
              const idx = slots.indexOf(sTime);
              eTime = idx !== -1 && idx + 1 < slots.length ? slots[idx + 1] : slots[1];
          }
          
          return {
            ...prev,
            startTime: sTime,
            endTime: eTime
          };
        });
      }
    }
  }, [selectedVenue]);

  const fetchVenues = async () => {
    try {
      const data = await request(() => getVenues());
      if (data) setVenues(data);
    } catch (err) {
      // Error handled by useApi
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (selectedVenue?.booking_open_time && selectedVenue?.booking_close_time) {
      const open = selectedVenue.booking_open_time;
      const close = selectedVenue.booking_close_time;
      if (formData.startTime < open || formData.endTime > close) {
        toast.error(`This venue only accepts bookings between ${open} and ${close}`);
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      const { bookingDate, ...rest } = formData;
      await request(() => createBooking({
        venueId: selectedVenue._id,
        date: bookingDate,
        ...rest
      }));
      toast.success('Booking request submitted! Waiting for approval.');
      setFormData({ bookingDate: '', startTime: '', endTime: '', purpose: '', requirements: '' });
      setSelectedVenue(null);
    } catch (err) {
      // Error handled by useApi
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'startTime' && updated.endTime && updated.endTime <= value) {
        const slots = generateTimeSlots(selectedVenue?.booking_open_time, selectedVenue?.booking_close_time);
        const idx = slots.indexOf(value);
        if (idx !== -1 && idx + 1 < slots.length) {
            updated.endTime = slots[idx + 1];
        } else {
            updated.endTime = '';
        }
      }
      return updated;
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const availableSlots = selectedVenue 
    ? generateTimeSlots(selectedVenue.booking_open_time, selectedVenue.booking_close_time) 
    : [];

  if (loading) return <div className="flex justify-center items-center h-96"><RefreshCw className="animate-spin w-10 h-10 text-blue-600" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">Book a Venue</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center italic">
            <Search className="w-4 h-4 mr-2" />
            University Infrastructure Portal
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venues.map((venue) => {
              const isMaintenance = venue.status === 'maintenance';
              return (
              <div 
                key={venue._id} 
                onClick={!isMaintenance ? () => setSelectedVenue(venue) : undefined}
                className={`group bg-white border rounded-3xl overflow-hidden transition-all duration-300 ${!isMaintenance ? 'cursor-pointer hover:shadow-xl' : 'grayscale opacity-60 border-red-200 cursor-not-allowed'} ${selectedVenue?._id === venue._id ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg' : 'border-slate-100'}`}
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={venue.image || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205"} alt={venue.name} className={`w-full h-full object-cover transition-transform duration-500 ${!isMaintenance && 'group-hover:scale-110'}`} />
                  <div className="absolute top-4 right-4">
                    {isMaintenance ? (
                      <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">
                        MAINTENANCE
                      </span>
                    ) : (
                      <span className="bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">
                        AVAILABLE
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white shadow-lg">
                      {venue.type}
                    </span>
                    {venue.category && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-violet-600 text-white shadow-lg">
                        {venue.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                   <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic">{venue.name}</h3>
                   <div className="mt-4 space-y-2">
                    <p className="flex items-center text-sm font-medium text-slate-500 italic">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                      {venue.location || 'Campus Center'}
                    </p>
                    <p className="flex items-center text-sm font-medium text-slate-500 italic">
                      <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                      {venue.type === 'central' ? 'Campus Wide' : (venue.departmentId?.name || 'Departmental')}
                    </p>
                    <p className="flex items-center text-sm font-medium text-slate-500 italic">
                      <span className="w-4 h-4 mr-2 flex items-center justify-center font-bold text-xs text-blue-500">👨‍👩‍👧‍👦</span>
                      Capacity: {venue.capacity} People
                    </p>
                    {venue.booking_open_time && venue.booking_close_time && (
                      <p className="flex items-center text-sm font-medium text-slate-500 italic">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        Hours: {venue.booking_open_time} — {venue.booking_close_time}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-blue-900/5 p-8 space-y-6">
             <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                   <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight italic">Reservation</h2>
             </div>

             {!selectedVenue ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center italic">
                   <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select a venue to begin</p>
                </div>
             ) : (
                <form onSubmit={handleBooking} className="space-y-5 animate-slide-up">
                   <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-2">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1 italic">Focusing On</p>
                      <p className="text-sm font-bold text-blue-700 uppercase tracking-tight">{selectedVenue.name}</p>
                   </div>
                   
                   {selectedVenue.status === 'maintenance' && (
                     <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3 italic">
                       <AlertCircle className="w-5 h-5 flex-shrink-0" />
                       <span className="text-xs font-bold uppercase tracking-widest">This venue is currently under maintenance</span>
                     </div>
                   )}
                   
                   <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Event Schedule Date</label>
                        <input name="bookingDate" value={formData.bookingDate} onChange={handleChange} min={today} type="date" required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 italic focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Start</label>
                            <select name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 italic focus:ring-2 focus:ring-blue-500/20 shadow-sm">
                                <option value="" disabled>Select</option>
                                {availableSlots.slice(0, -1).map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Finish</label>
                            <select name="endTime" value={formData.endTime} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 italic focus:ring-2 focus:ring-blue-500/20 shadow-sm">
                                <option value="" disabled>Select</option>
                                {availableSlots.map(time => (
                                    <option key={time} value={time} disabled={time <= formData.startTime}>{time}</option>
                                ))}
                            </select>
                         </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Functional Purpose</label>
                        <textarea name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Required justification for booking..." required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 italic h-24 resize-none shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Special Requirements</label>
                        <textarea name="requirements" value={formData.requirements} onChange={handleChange} placeholder="e.g. IT support, seating arrangements..." className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 italic h-20 resize-none shadow-sm" />
                      </div>
                   </div>

                   <button type="submit" disabled={isSubmitting || selectedVenue.status === 'maintenance'} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-xs flex items-center justify-center">
                      {isSubmitting ? 'Processing...' : 'Confirm Request'}
                      <ArrowRight className="w-4 h-4 ml-3" />
                   </button>
                </form>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookVenue;
