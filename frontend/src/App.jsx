import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import RoleSelector from './pages/RoleSelector';
import Home from './pages/Home';

// Core Pages (Authenticated Home for each role)
import AdminDashboard from './pages/admin/AdminDashboard';
import DSWDashboard from './pages/dsw/DSWDashboard';
import HODDashboard from './pages/hod/HODDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';

// Action-specific Pages
import BookVenue from './pages/faculty/BookVenue';
import MyBookings from './pages/faculty/MyBookings';
import Approvals from './pages/Approvals';
import ManageUsers from './pages/admin/ManageUsers';
import ManageVenues from './pages/admin/ManageVenues';

// Redirects to login if no user is set
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
       <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic animate-pulse">Synchronizing Credentials...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user?.role?.toLowerCase())) {
    return <Navigate to="/dashboard" />;
  }

  return <Layout>{children}</Layout>;
};

// Redirect away from login if already logged in (optional, but keep for logic)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Picks the correct Home Dashboard based on role  
const RoleDashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin': return <AdminDashboard />;
    case 'dsw': return <DSWDashboard />;
    case 'hod': return <HODDashboard />;
    case 'faculty': return <FacultyDashboard />;
    default: return <Navigate to="/login" />;
  }
};

import ViewTimetable from './pages/ViewTimetable';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Analytics from './pages/Analytics';

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Main Landing & Feature Page (Overall View) */}
            <Route path="/" element={<Home />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/real-login" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          
          {/* Unified Dashboard — auto-selects by role */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          } />

          {/* Common Authenticated Routes */}
          <Route path="/timetable" element={
            <ProtectedRoute>
              <ViewTimetable />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/venues" element={
            <ProtectedRoute roles={['admin', 'dsw']}>
              <ManageVenues />
            </ProtectedRoute>
          } />


          {/* DSW Routes */}
          <Route path="/dsw/approvals" element={
            <ProtectedRoute roles={['dsw']}>
              <Approvals role="dsw" />
            </ProtectedRoute>
          } />

          {/* HOD Routes */}
          <Route path="/hod/approvals" element={
            <ProtectedRoute roles={['hod']}>
              <Approvals role="hod" />
            </ProtectedRoute>
          } />

          {/* Core Admin, DSW, and HOD shared pages */}
          <Route path="/analytics" element={
            <ProtectedRoute roles={['admin', 'dsw', 'hod']}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/logs" element={
            <ProtectedRoute roles={['admin', 'dsw', 'hod']}>
              <Logs />
            </ProtectedRoute>
          } />

          {/* Faculty & Admin Routes for Booking */}
          <Route path="/book-venue" element={
            <ProtectedRoute roles={['faculty', 'admin', 'hod']}>
              <BookVenue />
            </ProtectedRoute>
          } />
          <Route path="/faculty/bookings" element={
            <ProtectedRoute roles={['faculty', 'hod']}>
              <MyBookings />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
