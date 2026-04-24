import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, UserMinus, Search, Filter, Mail, Edit3, 
  Trash2, Shield, MoreVertical, CheckCircle2, XCircle, Loader2, X
} from 'lucide-react';
import { getUsers, deleteUser, updateUser, createUser } from '../../services/userService';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const { loading, request } = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'faculty', password: ''
  });

  const fetchUsers = async () => {
    try {
      const data = await request(() => getUsers());
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      // Error handled by useApi
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openForm = (user = null) => {
    if (user) {
      setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
      setEditId(user._id);
      setIsEditing(true);
    } else {
      setFormData({ name: '', email: '', role: 'faculty', password: 'password123' }); // Default password for new users
      setEditId(null);
      setIsEditing(false);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        if (!editId) return toast.error('User ID missing');
        await request(() => updateUser(editId, formData));
        toast.success('User Profile Synced');
      } else {
        await request(() => createUser(formData));
        toast.success('New Identity Authorized');
      }
      closeForm();
      fetchUsers();
    } catch (error) {
      // Error handled by useApi
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('revoke platform access for this user?')) {
      try {
        await request(() => deleteUser(id));
        toast.success('Account Terminated');
        fetchUsers();
      } catch (error) {
        // Error handled by useApi
      }
    }
  };

  const getRoleBadge = (role) => {
    if (!role) return 'bg-slate-50 text-slate-600 border-slate-100 italic';
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-rose-50 text-rose-600 border-rose-100 italic';
      case 'dsw': return 'bg-violet-50 text-violet-600 border-violet-100 italic';
      case 'hod': return 'bg-emerald-50 text-emerald-600 border-emerald-100 italic';
      default: return 'bg-blue-50 text-blue-600 border-blue-100 italic';
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    if (!user) return false;
    const name = user?.name || '';
    const email = user?.email || '';
    const dept = user?.departmentId?.name || '';

    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = name.toLowerCase().includes(term) ||
                        email.toLowerCase().includes(term) ||
                        dept.toLowerCase().includes(term);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-10 animate-fade-in pb-12 transition-all text-slate-900">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase italic">User Directory</h1>
          <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center italic">
             <Shield className="w-4 h-4 mr-2" />
             Access Control & Hierarchy Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openForm()}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs uppercase tracking-widest"
          >
             <UserPlus className="w-4 h-4 mr-2" />
             Authorize Identity
          </button>
        </div>
      </header>

      {/* Analytics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-6">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-md">
               <Users className="w-8 h-8" />
            </div>
            <div>
               <p className="text-xl font-extrabold text-slate-900 leading-none mb-1">{users.length} Total</p>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 italic">Platform Users</p>
            </div>
         </div>
         <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-6">
            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-md">
               <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
               <p className="text-xl font-extrabold text-slate-900 leading-none mb-1">{users.filter(u => u.role === 'faculty').length}</p>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 italic">Faculty Core</p>
            </div>
         </div>
         <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-6">
            <div className="h-14 w-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100 shadow-md">
               <Shield className="w-8 h-8" />
            </div>
            <div>
               <p className="text-xl font-extrabold text-slate-900 leading-none mb-1">{users.filter(u => u.role === 'admin' || u.role === 'dsw').length}</p>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 italic">Oversight Block</p>
            </div>
         </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-lg w-full relative">
             <button onClick={closeForm} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors"><X className="w-8 h-8" /></button>
             <h3 className="text-3xl font-extrabold text-slate-900 italic mb-8 uppercase tracking-tighter">{isEditing ? 'Access Modification' : 'Global Authorization'}</h3>
             <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 italic ml-1">Full Legal Label</label>
                    <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" required placeholder="User name" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 italic ml-1">Digital Vector (Email)</label>
                    <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" required placeholder="user@university.edu" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 italic ml-1">System Permissions Layer</label>
                    <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner uppercase tracking-wider">
                      <option value="faculty">Faculty</option>
                      <option value="hod">HOD</option>
                      <option value="dsw">DSW</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {!isEditing && (
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 italic ml-1">Access Protocol (Password)</label>
                      <input value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} type="password" required placeholder="password123" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner" />
                    </div>
                  )}
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-3xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase tracking-widest text-xs mt-4">
                  {isEditing ? 'Confirm Specifications' : 'Initialize Protocol'}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-sans italic" 
            />
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
             {['all', 'admin', 'dsw', 'hod', 'faculty'].map((r) => (
               <button 
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all ${roleFilter === r ? 'bg-white text-blue-600 shadow-md ring-1 ring-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {r}
               </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest italic">User Profile</th>
                <th className="px-6 py-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest italic">System Role</th>
                <th className="px-6 py-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest italic">Department</th>
                <th className="px-6 py-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest italic">Status Log</th>
                <th className="px-10 py-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-right italic">Actions Suite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan="5" className="px-10 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                         <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Synchronizing User Base...</p>
                      </div>
                   </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-10 py-12 text-center text-slate-400 font-extrabold italic uppercase tracking-widest text-xs">
                      No identities found matching current vector.
                   </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50/30 transition-all duration-300 group/row italic font-bold">
                  <td className="px-10 py-7">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-2xl border-2 border-white shadow-lg bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-500 font-extrabold mr-4 text-[10px] tracking-widest group-hover/row:scale-110 transition-transform duration-500">
                         {(user?.name || 'U').split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-900 group-hover/row:text-blue-600 transition-colors uppercase tracking-tight italic">{user?.name || 'Unknown User'}</p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center mt-0.5 tracking-tighter lowercase">
                        <Mail className="w-3 h-3 mr-1 text-slate-300" />
                        {user?.email || 'no-email'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-7">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border transition-all duration-300 shadow-sm ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-7 font-extrabold text-[10px] uppercase tracking-widest italic">
                    {user.departmentId?.name ? (
                      <span className="text-slate-700">{user.departmentId.name}</span>
                    ) : user.role === 'hod' ? (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px]">Unassigned</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-7">
                    <div className="flex items-center text-xs font-bold text-slate-400 tracking-tight gap-2 italic">
                       <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse"></span>
                       Authorized
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openForm(user)}
                        className="p-3 text-blue-500 bg-white hover:bg-blue-50 border border-slate-100 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 group/btn"
                      >
                         <Edit3 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-3 text-rose-500 bg-white hover:bg-rose-50 border border-slate-100 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 group/btn"
                      >
                         <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ManageUsers;
