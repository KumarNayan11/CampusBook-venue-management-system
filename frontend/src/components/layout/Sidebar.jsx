import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckSquare, 
  MapPin, 
  UserCircle,
  BarChart,
  LogOut,
  CalendarCheck2,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const getNavLinks = () => {
    const common = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'View Timetable', path: '/timetable', icon: Calendar },
      { name: 'Settings', path: '/settings', icon: UserCircle },
    ];

    const admin = [
      { name: 'Analytics', path: '/analytics', icon: BarChart },
      { name: 'Manage Users', path: '/admin/users', icon: Users },
      { name: 'Manage Venues', path: '/admin/venues', icon: MapPin },
      { name: 'Logs', path: '/logs', icon: FileText },
    ];

    const dsw = [
      { name: 'Analytics', path: '/analytics', icon: BarChart },
      { name: 'Booking Approvals', path: '/dsw/approvals', icon: CheckSquare },
      { name: 'Logs', path: '/logs', icon: FileText },
    ];

    const hod = [
      { name: 'Analytics', path: '/analytics', icon: BarChart },
      { name: 'Department Approvals', path: '/hod/approvals', icon: CheckSquare },
      { name: 'Book Venue', path: '/book-venue', icon: Calendar },
      { name: 'My Bookings', path: '/faculty/bookings', icon: CalendarCheck2 },
      { name: 'Logs', path: '/logs', icon: FileText },
    ];

    const faculty = [
      { name: 'Book Venue', path: '/book-venue', icon: Calendar },
      { name: 'My Bookings', path: '/faculty/bookings', icon: CalendarCheck2 },
    ];

    if (!user) return common;

    let links = [...common];
    if (user.role === 'admin') links = [...links, ...admin];
    if (user.role === 'dsw') links = [...links, ...dsw];
    if (user.role === 'hod') links = [...links, ...hod];
    if (user.role === 'faculty') links = [...links, ...faculty];

    return links;
  };

  const handleLogout = () => {
    logout();
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex flex-col w-64 h-full bg-slate-900 text-white shadow-xl fixed left-0 top-0 overflow-y-auto transform transition-transform duration-300">
      <div 
        className="flex items-center justify-center h-20 bg-blue-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <h1 className="text-xl font-bold tracking-tight">CampusBook</h1>
      </div>
      
      <div className="flex-1 px-4 py-8 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white font-medium shadow-md translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3 transition-colors group-hover:text-blue-400" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center px-4 py-3 mb-2 space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <UserCircle className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'Role'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 mt-2 text-sm text-slate-400 hover:text-rose-400 transition-colors group"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
