import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOverallAnalytics, getDepartmentAnalytics } from '../services/analyticsService';
import useApi from '../hooks/useApi';
import { Loader2, BarChart3, PieChart as PieChartIcon, TrendingUp, Presentation, CheckCircle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

const Analytics = () => {
    const { user } = useAuth();
    const { loading, request } = useApi();
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                let res;
                if (user?.role === 'hod') {
                    res = await request(() => getDepartmentAnalytics());
                } else {
                    res = await request(() => getOverallAnalytics());
                }
                if (res) setData(res);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            }
        };

        if (user) {
            fetchAnalytics();
        }
    }, [user]);

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Aggregating telemetry...</p>
            </div>
        );
    }

    const {
        totals,
        totalBookings,
        approvedBookings,
        pendingBookings,
        bookingsByDepartment,
        bookingsByVenue,
        topVenues,
        statusBreakdown,
        timeTrend,
        utilization
    } = data;

    // Use totals if available, otherwise fallback to top level primitive fields
    const safeTotalBookings = totals?.totalBookings || totalBookings || 0;
    const safeApproved = totals?.approvedBookings || approvedBookings || 0;
    const safePending = totals?.pendingBookings || pendingBookings || 0;
    const rejectionNode = statusBreakdown?.find(s => s.name === 'rejected');
    const safeRejected = rejectionNode?.value || 0;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const PIE_COLORS = {
        'approved': '#10b981',
        'pending_hod': '#f59e0b',
        'pending_dsw': '#f59e0b',
        'rejected': '#ef4444',
        'withdrawn': '#94a3b8'
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight uppercase italic flex items-center">
                        <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                        Live Analytics
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center">
                        {user?.role === 'hod' ? `Department View: ${user.departmentId?.name || ''}` : 'Campus-wide Infrastructure Telemetry'}
                    </p>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Total Bookings', value: safeTotalBookings, icon: Presentation, color: 'text-blue-500' },
                    { title: 'Approved', value: safeApproved, icon: CheckCircle, color: 'text-emerald-500' },
                    { title: 'Pending Approval', value: safePending, icon: Clock, color: 'text-amber-500' },
                    { title: 'Rejected', value: safeRejected, icon: TrendingUp, color: 'text-rose-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-blue-900/5 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                                <p className="text-3xl font-black text-slate-800 mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 bg-slate-50 rounded-2xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Bookings over Time */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-blue-900/5">
                    <h2 className="text-sm font-black text-slate-800 tracking-widest uppercase italic mb-6">Booking Volume Trend</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-blue-900/5">
                    <h2 className="text-sm font-black text-slate-800 tracking-widest uppercase italic mb-6 flex items-center">
                        <PieChartIcon className="w-4 h-4 mr-2 text-slate-400" />
                        Approval Resolution Breakdown
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={statusBreakdown || []} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60}
                                    outerRadius={80} 
                                    paddingAngle={5}
                                >
                                    {(statusBreakdown || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bookings by Department (Admin/DSW) or Volume by Venue (HOD) */}
                {user?.role !== 'hod' && bookingsByDepartment && (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-blue-900/5">
                    <h2 className="text-sm font-black text-slate-800 tracking-widest uppercase italic mb-6">Bookings by Department</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bookingsByDepartment} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 9, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {(bookingsByDepartment || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                )}

                {/* Venue Utilization */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-blue-900/5">
                    <h2 className="text-sm font-black text-slate-800 tracking-widest uppercase italic mb-6">Venue Utilization (%)</h2>
                    <div className="h-64 overflow-y-auto pr-4">
                        <div className="space-y-4">
                            {(utilization || []).map((v, i) => (
                                <div key={i} className="flex flex-col space-y-1 relative">
                                    <div className="flex justify-between items-center z-10 w-full">
                                        <span className="text-[10px] font-extrabold text-slate-600 uppercase uppercase">{v.name}</span>
                                        <span className="text-xs font-black text-slate-800">{v.utilization}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-1000 ease-out ${v.utilization > 75 ? 'bg-rose-500' : v.utilization > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                          style={{ width: `${v.utilization}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!utilization || utilization.length === 0) && (
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mt-12">No utilization data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Venues */}
                {topVenues && topVenues.length > 0 && (
                <div className={`bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-blue-900/5 ${user?.role === 'hod' ? 'lg:col-span-2' : ''}`}>
                    <h2 className="text-sm font-black text-slate-800 tracking-widest uppercase italic mb-6">Top Most Booked Venues</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topVenues.map((tv, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center transform transition-all hover:scale-105">
                                <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black mb-3">
                                    #{idx + 1}
                                </div>
                                <h3 className="text-xs font-extrabold text-slate-800 uppercase italic tracking-wide h-8 flex items-center justify-center">{tv.name}</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Bookings Count: <span className="text-slate-900 font-black text-lg">{tv.count}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
