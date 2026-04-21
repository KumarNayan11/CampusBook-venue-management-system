import React, { useState, useEffect } from 'react';
import { Bell, CheckSquare, X, Info, CalendarCheck, AlertCircle } from 'lucide-react';
import { getAllBookings, getMyBookings } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

const NotificationTray = () => {
    const { user } = useAuth();
    const { request } = useApi();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchUpdates = async () => {
           if (!user) return;
           try {
              let bookData = [];
              if (user.role === 'faculty') {
                 bookData = await request(() => getMyBookings());
              } else {
                 bookData = await request(() => getAllBookings());
              }
              if (!bookData) return;

              let derived = [];
              const r = user.role;

              if (r === 'admin' || r === 'dsw') {
                  derived = bookData.filter(b => b.status === "pending_dsw");
              } else if (r === 'hod') {
                  const uDept = String(typeof user.departmentId === 'object' ? user.departmentId?._id : user.departmentId);
                  derived = bookData.filter(b => {
                      const vDept = String(typeof b.venueId?.departmentId === 'object' ? b.venueId?.departmentId?._id : b.venueId?.departmentId);
                      return b.status === "pending_hod" && vDept === uDept;
                  });
              } else if (r === 'faculty') {
                  // Only map status updates to terminal results for faculty notification logs
                  derived = bookData.filter(b => b.status === 'approved' || b.status === 'rejected');
              }

              const formatted = derived.map(b => {
                  const s = b.status?.toLowerCase() || '';
                  let messageStatus = 'pending approval';
                  let type = 'booking_request';

                  if (s === 'approved') {
                     messageStatus = 'approved';
                     type = 'booking_approved';
                  } else if (s === 'rejected') {
                     messageStatus = 'rejected';
                     type = 'booking_rejected';
                  } else if (s === 'pending_hod') {
                     messageStatus = 'pending department approval';
                  }

                  const venueName = b.venueId?.name || 'Unknown Venue';
                  const dateDisplay = new Date(b.date).toLocaleDateString();

                  return {
                     _id: b._id,
                     type,
                     title: `${venueName} Update`,
                     message: `${venueName} booking on ${dateDisplay} (${b.startTime}-${b.endTime}) is ${messageStatus}.`,
                     createdAt: b.updatedAt || b.createdAt || new Date(),
                     isRead: false
                  };
              });

              setNotifications(formatted);
           } catch(e) { }
        };
        fetchUpdates();
    }, [user, isOpen]);

    const handleMarkAsRead = (id) => {
        setNotifications(prev => prev.filter(n => n._id !== id));
    };

    const handleMarkAllRead = () => {
        setNotifications([]);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking_request': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            case 'booking_approved': return <CalendarCheck className="w-4 h-4 text-emerald-500" />;
            case 'booking_rejected': return <X className="w-4 h-4 text-rose-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 rounded-xl border border-slate-100 shadow-sm"
            >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-scale-in origin-top-right">
                    <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest italic">Signal Logs</h4>
                        <button 
                            onClick={handleMarkAllRead}
                            className="text-[9px] font-extrabold text-blue-600 uppercase tracking-tighter hover:underline"
                        >
                            Sync All Read
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center space-y-3">
                                <Bell className="w-8 h-8 text-slate-200 mx-auto" />
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">No signals detected</p>
                            </div>
                        ) : (
                            <>
                                {notifications.slice(0, 5).map((n) => (
                                    <div 
                                        key={n._id} 
                                        onClick={() => handleMarkAsRead(n._id)}
                                        className={`p-5 hover:bg-slate-50 transition-colors border-b border-slate-50 cursor-pointer relative ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                                    >
                                        {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
                                        <div className="flex gap-4">
                                            <div className="mt-1">{getIcon(n.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[11px] font-extrabold text-slate-900 uppercase tracking-tight truncate ${!n.isRead ? 'font-black' : ''}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed capitalize">{n.message}</p>
                                                <p className="text-[8px] font-extrabold text-slate-300 mt-2 uppercase italic">
                                                    {formatDistanceToNow(new Date(n.createdAt))} ago
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {notifications.length > 5 && (
                                    <div className="p-3 text-center bg-slate-50">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Showing latest 5 notifications</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="w-full p-4 text-[9px] font-extrabold text-slate-400 hover:text-slate-600 transition-colors bg-slate-50/50 border-t border-slate-100 uppercase tracking-widest italic"
                    >
                      Close Terminal
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationTray;
