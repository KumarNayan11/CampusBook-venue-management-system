import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, Loader2, Building2, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { getVenues } from '../services/venueService';
import { getAllBookings } from '../services/bookingService';
import useApi from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDateLocal } from '../utils/dateUtils';

const ViewTimetable = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAuthorized = user?.role === 'faculty' || user?.role === 'hod';
    const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'daily'
    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));
    const [bookings, setBookings] = useState([]);
    const [weekDates, setWeekDates] = useState([]);

    const { loading: loadingVenues, request: requestVenues } = useApi();
    const { loading: loadingBookings, request: requestBookings } = useApi();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const now = new Date();
        const dayOfWeek = now.getDay() || 7; 
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek + 1);
        monday.setHours(0, 0, 0, 0);
        return monday;
    });

    const getDynamicTimeSlots = () => {
        let start = 8; // 08:00
        let end = 17;  // 17:00

        if (selectedVenue?.booking_open_time && selectedVenue?.booking_close_time) {
            const parsedStart = parseInt(selectedVenue.booking_open_time.split(':')[0], 10);
            const parsedEnd = parseInt(selectedVenue.booking_close_time.split(':')[0], 10);

            if (!isNaN(parsedStart) && !isNaN(parsedEnd) && parsedStart <= parsedEnd) {
                start = parsedStart;
                end = parsedEnd;
            }
        }

        const slots = [];
        for (let i = start; i < end; i++) {
            const modifier = i >= 12 ? 'PM' : 'AM';
            const displayHour = i > 12 ? i - 12 : (i === 0 ? 12 : i);
            const formattedHour = displayHour.toString().padStart(2, '0');
            slots.push(`${formattedHour}:00 ${modifier}`);
        }
        return slots;
    };

    const timeSlots = getDynamicTimeSlots();

    useEffect(() => {
        const loadVenues = async () => {
            try {
                const data = await requestVenues(() => getVenues());
                if (Array.isArray(data)) {
                    setVenues(data);
                    if (data.length > 0) setSelectedVenue(data[0]);
                }
            } catch (error) { }
        };
        loadVenues();
    }, []);

    const fetchBookings = async () => {
        try {
            let params = {};
            if (viewMode === 'weekly') {
                if (!selectedVenue) return;

                const monday = new Date(currentWeekStart);
                const saturday = new Date(monday);
                saturday.setDate(monday.getDate() + 5);

                const dates = [];
                for (let i = 0; i < 6; i++) {
                    const d = new Date(monday);
                    d.setDate(monday.getDate() + i);
                    dates.push({
                        dayName: days[i],
                        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        fullDate: formatDateLocal(d)
                    });
                }
                setWeekDates(dates);

                params = {
                    venueId: selectedVenue._id,
                    startDate: formatDateLocal(monday),
                    endDate: formatDateLocal(saturday)
                };
            } else {
                if (!selectedDate) return;
                params = { date: selectedDate };
            }

            const data = await requestBookings(() => getAllBookings(params));
            if (Array.isArray(data)) {
                // Filter out rejected and withdrawn bookings immediately
                const activeBookings = data.filter(b => b && b.status !== 'rejected' && b.status !== 'withdrawn');
                setBookings(activeBookings);
            }
        } catch (error) { }
    };

    useEffect(() => {
        fetchBookings();
    }, [viewMode, selectedVenue, selectedDate, currentWeekStart]);

    const navigateWeek = (direction) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(currentWeekStart.getDate() + (direction * 7));
        setCurrentWeekStart(newStart);
    };

    // Helpers for Weekly View rendering
    const getBookingForSlot = (targetDate, timeLabel) => {
        if (!Array.isArray(bookings)) return undefined;
        return bookings.find(entry => {
            if (!entry || !entry.date) return false;

            // Accurate date matching using YYYY-MM-DD
            // Use local date parts to avoid UTC shifting
            const entryDateStr = formatDateLocal(entry.date);
            if (entryDateStr !== targetDate) return false;

            const parseTime = (tString) => {
                const [timePart, modifier] = (tString || '').split(' ');
                if (!timePart || !modifier) return 0;
                let [hours, minutes] = timePart.split(':');
                if (hours === '12') hours = '00';
                if (modifier.toUpperCase() === 'PM') hours = parseInt(hours, 10) + 12;
                return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
            };

            const parse24H = (t24) => {
                if (!t24) return 0;
                let [hours, minutes] = t24.split(':');
                return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
            };

            const slotStart = parseTime(timeLabel);
            const slotEnd = slotStart + 60;
            const entryStart = parse24H(entry.startTime);
            const entryEnd = parse24H(entry.endTime);

            return (entryStart >= slotStart && entryStart < slotEnd) ||
                (entryStart < slotStart && entryEnd > slotStart);
        });
    };

    const handleSlotClick = (dateStr, timeStr) => {
        if (!isAuthorized || !selectedVenue) return;

        let [timePart, modifier] = (timeStr || '').split(' ');
        let [hours, minutes] = (timePart || '08:00').split(':');

        if (hours === '12') hours = '00';
        if (modifier && modifier.toUpperCase() === 'PM') hours = String(parseInt(hours, 10) + 12).padStart(2, '0');

        const startTime24 = `${String(hours).padStart(2, '0')}:${minutes}`;
        const endHour = String(parseInt(hours, 10) + 1).padStart(2, '0');
        const endTime24 = `${endHour}:${minutes}`;

        navigate("/book-venue", {
            state: {
                venueId: selectedVenue._id,
                venueName: selectedVenue.name,
                date: dateStr,
                startTime: startTime24,
                endTime: endTime24
            }
        });
    };

    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'approved') return 'bg-emerald-500 shadow-emerald-500/20 text-emerald-50 border-emerald-600';
        return 'bg-amber-500 shadow-amber-500/20 text-amber-50 border-amber-600'; // Pending hod/dsw
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'approved') return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20';
        return 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/20';
    };

    const getStatusText = (status) => {
        return (status || '').split('_').map(w => w.toUpperCase()).join(' ');
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12 transition-all">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase italic">Live Schedule</h1>
                    <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center italic">
                        <Calendar className="w-4 h-4 mr-2" />
                        Calendar view of bookings in logs.
                    </p>
                </div>

                {/* View Toggles */}
                <div className="flex bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100/50">
                    <button
                        onClick={() => setViewMode('weekly')}
                        className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${viewMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Venue Weekly
                    </button>
                    <button
                        onClick={() => setViewMode('daily')}
                        className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${viewMode === 'daily' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <List className="w-4 h-4 mr-2" />
                        Daily Schedule
                    </button>
                </div>
            </header>

            {/* Controls Bar */}
            <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-[1.5rem] shadow-sm">
                {viewMode === 'weekly' ? (
                    <div className="flex items-center gap-3 w-full">
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border-blue-100 shadow-sm ml-2">
                            <Building2 className="w-5 h-5 text-blue-500" />
                        </div>
                        <select
                            value={selectedVenue?._id || ''}
                            onChange={(e) => setSelectedVenue(venues.find(v => v._id === e.target.value))}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 pr-10 uppercase italic tracking-widest outline-none py-3 cursor-pointer"
                        >
                            {venues.map(v => (
                                <option key={v._id} value={v._id}>{v.name}</option>
                            ))}
                        </select>
                        <div className="ml-auto flex items-center gap-2">
                            <button 
                                onClick={() => navigateWeek(-1)}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-100 bg-white shadow-sm"
                                title="Previous Week"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center px-4 py-2 bg-blue-50/50 border border-blue-100/50 text-blue-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest italic shadow-inner">
                                <Clock className="w-3.5 h-3.5 mr-2" /> 
                                {weekDates[0]?.label} - {weekDates[5]?.label}
                            </div>
                            <button 
                                onClick={() => navigateWeek(1)}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-100 bg-white shadow-sm"
                                title="Next Week"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 w-full">
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border-blue-100 shadow-sm ml-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 w-full uppercase italic tracking-widest outline-none py-3"
                        />
                    </div>
                )}
            </div>

            {/* Timetable Grids */}
            <div className="bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-blue-900/5 overflow-hidden relative min-h-[400px]">
                {loadingBookings && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest italic text-blue-600">Syncing...</span>
                    </div>
                )}

                {viewMode === 'weekly' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="p-6 text-xs font-extrabold uppercase tracking-widest italic border-r border-slate-800 w-32">Time Vector</th>
                                    {weekDates.map(wd => (
                                        <th key={wd.dayName} className="p-4 text-xs font-extrabold uppercase tracking-widest italic text-center min-w-[160px]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span>{wd.dayName}</span>
                                                <span className="text-[10px] text-slate-400 font-bold tracking-tight">{wd.label}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((time, idx) => (
                                    <tr key={time} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                        <td className="p-6 text-[10px] font-extrabold text-slate-400 text-center border-r border-slate-100 italic uppercase bg-slate-50/30">
                                            <div className="flex items-center justify-center gap-2">
                                                <Clock className="w-3 h-3 text-slate-300" />
                                                {time}
                                            </div>
                                        </td>
                                        {weekDates.map(wd => {
                                            const booking = getBookingForSlot(wd.fullDate, time);
                                            return (
                                                <td key={`${wd.dayName}-${time}`} className="p-3 border border-slate-50 relative h-28 transition-colors hover:bg-blue-50/20">
                                                    {booking ? (
                                                        <div className={`absolute inset-2 rounded-xl p-3 shadow-lg flex flex-col justify-between border  group ${getStatusStyle(booking.status)}`}>
                                                            <div>
                                                                <div className="flex items-start justify-between">
                                                                    <p className="text-[9px] font-extrabold uppercase tracking-widest italic leading-none opacity-90">{booking.startTime} - {booking.endTime}</p>
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-white opacity-70 group-hover:animate-ping" />
                                                                </div>
                                                                <p className="text-xs font-bold mt-2 leading-tight uppercase line-clamp-2">{booking.purpose || 'Reserved Event'}</p>
                                                            </div>
                                                            <div className="flex justify-between items-end mt-2 opacity-90 border-t border-white/20 pt-1.5">
                                                                <p className="text-[8px] font-extrabold uppercase tracking-widest italic truncate max-w-[80px] flex items-center"><MapPin className="w-2.5 h-2.5 mr-1" /> {booking?.userId?.name || 'Unknown'}</p>
                                                                <p className="text-[8px] font-extrabold uppercase tracking-widest bg-black/10 px-1.5 py-0.5 rounded shadow-inner">{getStatusText(booking.status).split(' ')[0]}</p>
                                                            </div>
                                                        </div>
                                                    ) : selectedVenue?.status === 'maintenance' ? (
                                                        <div className="absolute inset-2 flex items-center justify-center rounded-xl transition-all border border-red-200 bg-red-50">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest italic text-red-600">
                                                                MAINTENANCE
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={isAuthorized ? () => handleSlotClick(wd.fullDate, time) : undefined}
                                                            className={`absolute inset-2 flex items-center justify-center rounded-xl transition-all group/empty ${isAuthorized ? 'cursor-pointer bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:shadow-sm' : 'bg-slate-50 border border-slate-100'}`}
                                                        >
                                                            <span className={`text-[10px] font-bold uppercase tracking-widest italic transition-colors opacity-0 group-hover/empty:opacity-100 ${isAuthorized ? 'text-blue-600' : 'text-slate-400'}`}>
                                                                {isAuthorized ? 'Book Slot' : 'Available'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Venue</th>
                                    <th className="px-6 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Time Vector</th>
                                    <th className="px-6 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Event Purpose</th>
                                    <th className="px-6 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Applicant</th>
                                    <th className="px-8 py-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right italic">Status Log</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {bookings.length === 0 && !loadingBookings ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <Search className="w-10 h-10 text-slate-200 mb-3" />
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No operational instances scheduled on this temporal vector.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-blue-50/30 transition-colors group/row">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-white border border-slate-100 text-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover/row:scale-110 transition-transform">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 uppercase italic tracking-tight">{booking.venueId?.name || 'Unknown Venue'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-xs font-bold text-slate-600 uppercase tracking-widest">
                                                <div className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-2 text-slate-400" />
                                                    {booking.startTime} - {booking.endTime}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-sm font-bold text-slate-700 italic">{booking?.purpose || 'Reserved Event'}</td>
                                            <td className="px-6 py-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{booking?.userId?.name || 'Unknown'}</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border transition-all ${getStatusBadge(booking.status)}`}>
                                                    {getStatusText(booking.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Legend Component */}
            {viewMode === 'weekly' && (
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Legend Indicator</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-emerald-100 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider italic">Approved Session</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-amber-100 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider italic">Pending Approval</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">Empty Slot</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewTimetable;
