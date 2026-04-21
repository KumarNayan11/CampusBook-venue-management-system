import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, GraduationCap, BookOpen, Building2, ArrowRight, Sparkles } from 'lucide-react';

const roles = [
  {
    key: 'admin',
    label: 'Admin',
    description: 'Manage users, venues, and system settings',
    icon: Shield,
    gradient: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-500/25',
    bgAccent: 'bg-blue-50',
    textAccent: 'text-blue-600',
    borderAccent: 'border-blue-200',
  },
  {
    key: 'dsw',
    label: 'DSW',
    description: 'Approve central venue bookings & oversee operations',
    icon: Building2,
    gradient: 'from-violet-600 to-purple-600',
    shadow: 'shadow-violet-500/25',
    bgAccent: 'bg-violet-50',
    textAccent: 'text-violet-600',
    borderAccent: 'border-violet-200',
  },
  {
    key: 'hod',
    label: 'HOD',
    description: 'Approve departmental bookings & view analytics',
    icon: GraduationCap,
    gradient: 'from-emerald-600 to-teal-600',
    shadow: 'shadow-emerald-500/25',
    bgAccent: 'bg-emerald-50',
    textAccent: 'text-emerald-600',
    borderAccent: 'border-emerald-200',
  },
  {
    key: 'faculty',
    label: 'Faculty',
    description: 'Book venues & manage your reservations',
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/25',
    bgAccent: 'bg-amber-50',
    textAccent: 'text-amber-600',
    borderAccent: 'border-amber-200',
  },
];

const RoleSelector = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role) => {
    switchRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-semibold text-blue-600 mb-6">
            <Sparkles className="w-4 h-4" />
            Development Mode — No Login Required
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            CampusBook <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 font-medium max-w-md mx-auto">
            Select a role to enter the dashboard instantly
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <button
                key={role.key}
                onClick={() => handleSelect(role.key)}
                className="group relative text-left p-8 bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Gradient hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${role.bgAccent} ${role.textAccent} border ${role.borderAccent} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1.5">{role.label}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{role.description}</p>
                  </div>

                  <div className={`mt-1 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${role.gradient} ${role.shadow} shadow-lg text-white opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300`}>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center mt-12 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Hierarchical Venue Management &amp; Utilization System
        </p>
      </div>
    </div>
  );
};

export default RoleSelector;
