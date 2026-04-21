import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, Save, Key, RefreshCw, Settings2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getConfig, updateConfig } from '../services/configService';
import useApi from '../hooks/useApi';

const Settings = () => {
    const { user, updateProfile } = useAuth();
    const { loading, request } = useApi();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });

    // Admin config state
    const { loading: configLoading, request: configRequest } = useApi();
    const { loading: configSaving, request: configSaveRequest } = useApi();
    const [configData, setConfigData] = useState({ min_advance_hours: 24 });

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchConfig();
        }
    }, [user]);

    const fetchConfig = async () => {
        try {
            const data = await configRequest(() => getConfig());
            if (data) setConfigData({ min_advance_hours: data.min_advance_hours ?? 24 });
        } catch (error) {
            console.error('Failed to load system config', error);
        }
    };

    const handleConfigSave = async (e) => {
        e.preventDefault();
        if (configData.min_advance_hours < 0) {
            return toast.error('Advance hours must be non-negative');
        }
        try {
            await configSaveRequest(() => updateConfig({ min_advance_hours: Number(configData.min_advance_hours) }));
            toast.success('System configuration updated');
        } catch (error) {
            // Handled by useApi
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            await request(() => updateProfile({
                name: formData.name,
                email: formData.email,
                ...(formData.password && { password: formData.password })
            }));
            setFormData({ ...formData, password: '', confirmPassword: '' });
        } catch (error) {
            // Error handled in AuthContext or useApi
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-12 transition-all">
            <header>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase italic">User Configuration</h1>
                <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center italic">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Protocols & Identity Management
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/5 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-sky-400" />
                        <div className="w-24 h-24 bg-gradient-to-tr from-slate-100 to-white rounded-full mx-auto flex items-center justify-center border-4 border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <User className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="mt-6 text-xl font-black text-slate-900 uppercase tracking-tight italic">{user?.name}</h3>
                        <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mt-1 bg-blue-50 inline-block px-3 py-1 rounded-full">{user?.role}</p>
                        
                        <div className="mt-8 pt-8 border-t border-slate-50 space-y-4 text-left">
                           <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate">{user?.email}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <Shield className="w-4 h-4 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight italic">Authenticated Vector</span>
                           </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Access Log</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-relaxed">Your session is secured with RSA-256 encryption. Last platform handshake: {new Date().toLocaleDateString()}</p>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl" />
                    </div>
                </div>

                {/* Form Area */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-blue-900/5">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="flex items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic ml-1">
                                        <User className="w-3 h-3 mr-2" />
                                        Identity Label
                                    </label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic ml-1">
                                        <Mail className="w-3 h-3 mr-2" />
                                        Digital Vector (Email)
                                    </label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="user@university.edu"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic ml-1">
                                        <Lock className="w-3 h-3 mr-2" />
                                        New Cipher (Password)
                                    </label>
                                    <input 
                                        type="password" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Leave blank to maintain"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic ml-1">
                                        <Key className="w-3 h-3 mr-2" />
                                        Confirm Cipher
                                    </label>
                                    <input 
                                        type="password" 
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Re-enter password"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full mt-10 py-5 bg-blue-600 text-white rounded-3xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Syncing Identity...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Authorize Update
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Admin-only System Configuration Section */}
                    {user?.role === 'admin' && (
                        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-400" />
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                                    <Settings2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">System Configuration</h3>
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">Admin-Only Global Parameters</p>
                                </div>
                            </div>

                            {configLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                                </div>
                            ) : (
                                <form onSubmit={handleConfigSave} className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic ml-1">
                                            <Clock className="w-3 h-3 mr-2" />
                                            Minimum Advance Booking Hours
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="number" 
                                                min="0"
                                                step="1"
                                                value={configData.min_advance_hours}
                                                onChange={(e) => setConfigData({...configData, min_advance_hours: e.target.value})}
                                                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-amber-500/20"
                                                placeholder="24"
                                            />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">hours</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 italic ml-1 mt-1">
                                            Faculty must book at least this many hours before the event start time. Set to 0 to disable.
                                        </p>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={configSaving}
                                        className="w-full py-4 bg-amber-500 text-white rounded-3xl font-bold hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                                    >
                                        {configSaving ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Propagating Config...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Update System Config
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
