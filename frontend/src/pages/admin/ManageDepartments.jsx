import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Building2, Plus, Edit3, Trash2, RefreshCw, X, User, Search, Users, BookOpen
} from 'lucide-react';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../../services/departmentService';
import { getUsers } from '../../services/userService';
import useApi from '../../hooks/useApi';

const getDefaultFormData = () => ({ name: '', hodId: '' });

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [hods, setHods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(getDefaultFormData());

  const { loading, request } = useApi();
  const { request: requestUsers } = useApi();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [depts, users] = await Promise.all([
        request(() => getDepartments()),
        requestUsers(() => getUsers()),
      ]);
      if (Array.isArray(depts)) setDepartments(depts);
      if (Array.isArray(users)) setHods(users.filter((u) => u.role === 'hod'));
    } catch {
      // Handled by useApi
    }
  };

  const openCreate = () => {
    setFormData(getDefaultFormData());
    setSelectedId(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const openEdit = (dept) => {
    setFormData({
      name: dept.name || '',
      hodId: dept.hodId?._id || dept.hodId || '',
    });
    setSelectedId(dept._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setIsEditing(false);
    setSelectedId(null);
    setFormData(getDefaultFormData());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      return toast.error('Department name is required.');
    }
    try {
      const payload = {
        name: formData.name.trim(),
        hodId: formData.hodId || null,
      };
      if (isEditing) {
        if (!selectedId) return toast.error('Record ID missing. Cannot update.');
        await request(() => updateDepartment(selectedId, payload));
        toast.success('Department updated!');
      } else {
        await request(() => createDepartment(payload));
        toast.success('Department created!');
      }
      handleClose();
      fetchAll();
    } catch {
      // Handled by useApi
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? This action cannot be undone.')) return;
    try {
      await request(() => deleteDepartment(id));
      toast.success('Department deleted.');
      fetchAll();
    } catch {
      // Handled by useApi
    }
  };

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && departments.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <RefreshCw className="animate-spin w-12 h-12 text-blue-600" />
        <p className="font-bold text-slate-300 tracking-widest italic animate-pulse">
          Loading Departments...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12 text-slate-900">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none uppercase italic">
            Departments
          </h1>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center italic">
            <Building2 className="w-4 h-4 mr-2" />
            Academic Division Registry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search departments…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Department
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Departments',
            value: departments.length,
            icon: Building2,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Assigned HODs',
            value: departments.filter((d) => d.hodId).length,
            icon: User,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Unassigned Depts',
            value: departments.filter((d) => !d.hodId).length,
            icon: Users,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-blue-900/5 flex items-center gap-5"
            >
              <div className={`p-4 rounded-2xl ${s.bg} ${s.color} shadow-sm`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest italic">
                  {s.label}
                </p>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tighter">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-md w-full relative">
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 italic uppercase tracking-tight">
                {isEditing ? 'Edit Department' : 'New Department'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">
                  Assign HOD (Optional)
                </label>
                <select
                  value={formData.hodId}
                  onChange={(e) => setFormData({ ...formData, hodId: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">— No HOD Assigned —</option>
                  {hods
                    .filter((hod) => {
                      // Show HODs who are unassigned OR already assigned to this department
                      const assignedDeptId = hod.departmentId?._id || hod.departmentId;
                      return !assignedDeptId || assignedDeptId === selectedId;
                    })
                    .map((hod) => (
                      <option key={hod._id} value={hod._id}>
                        {hod.name} ({hod.email})
                      </option>
                    ))}
                </select>
                {hods.length === 0 && (
                  <p className="mt-1.5 text-[10px] text-amber-500 font-bold uppercase tracking-widest italic">
                    No HOD accounts found in the system.
                  </p>
                )}
                {hods.filter((hod) => {
                  const assignedDeptId = hod.departmentId?._id || hod.departmentId;
                  return !assignedDeptId || assignedDeptId === selectedId;
                }).length === 0 && hods.length > 0 && (
                  <p className="mt-1.5 text-[10px] text-amber-500 font-bold uppercase tracking-widest italic">
                    All HODs are already assigned to departments.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-3xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase tracking-widest text-xs"
              >
                {isEditing ? 'Save Changes' : 'Create Department'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Department Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="p-6 rounded-3xl bg-slate-100 text-slate-400">
            <BookOpen className="w-12 h-12" />
          </div>
          <p className="font-bold text-slate-400 uppercase tracking-widest italic text-sm">
            {searchQuery ? 'No departments match your search.' : 'No departments yet. Create one!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((dept) => (
            <div
              key={dept._id}
              className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all duration-300 p-8 flex flex-col gap-5 group"
            >
              {/* Icon + Name */}
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight italic leading-tight truncate group-hover:text-blue-600 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">
                    Department
                  </p>
                </div>
              </div>

              {/* HOD Info */}
              <div className="bg-slate-50/80 rounded-2xl px-5 py-4 border border-slate-100 shadow-inner">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 italic flex items-center gap-1">
                  <User className="w-3 h-3" /> Head of Department
                </p>
                {dept.hodId ? (
                  <div>
                    <p className="text-sm font-bold text-slate-800 truncate">{dept.hodId.name}</p>
                    <p className="text-xs text-slate-500 truncate">{dept.hodId.email}</p>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-extrabold uppercase tracking-widest italic">
                    Unassigned
                  </span>
                )}
              </div>

              {/* Created date */}
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                Created{' '}
                {new Date(dept.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openEdit(dept)}
                  className="h-11 w-11 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                  title="Edit Department"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(dept._id)}
                  className="h-11 w-11 flex items-center justify-center bg-white border border-slate-200 text-rose-500 rounded-2xl hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm active:scale-95"
                  title="Delete Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
