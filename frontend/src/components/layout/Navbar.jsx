import React from 'react';
import { Search, User, ChevronDown, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationTray from './NotificationTray';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const showSearch = location.pathname === '/admin/venues' || location.pathname === '/venues';

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-8 bg-white border-b border-slate-100 shadow-sm transition-all duration-200">
      <div className="flex items-center flex-1">
        {showSearch && (
        <div className="relative w-full max-w-lg group animate-fade-in">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none group-focus-within:text-blue-600 text-slate-400">
            <Search className="w-4 h-4 transition-colors" />
          </span>
          <input
            type="text"
            className="w-full py-2 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm group-hover:bg-slate-100/50"
            placeholder="Search venues, bookings or help..."
          />
        </div>
        )}
      </div>

      <div className="flex items-center space-x-6">
        <NotificationTray />
        
        <div 
          onClick={() => navigate('/settings')}
          className="flex items-center space-x-4 pl-6 border-l border-slate-100 py-1 cursor-pointer group"
        >
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{user?.name || 'Loading...'}</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{user?.role || 'user'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 p-[2px] shadow-md group-hover:shadow-blue-500/20 transition-all duration-300">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <User className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
