import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Building2, MapPin, Plus, Search, Edit3, Trash2, 
  Users, RefreshCw, X
} from 'lucide-react';
import { getVenues, createVenue, deleteVenue, updateVenue } from '../../services/venueService';
import { getDepartments } from '../../services/departmentService';
import useApi from '../../hooks/useApi';

const VENUE_CATEGORIES = [
  'seminar_hall',
  'auditorium',
  'laboratory',
  'classroom',
  'conference_room',
  'sports_facility',
];

const getDefaultVenueFormData = () => ({
  name: '',
  type: 'central',
  capacity: '',
  location: '',
  image: '',
  departmentId: '',
  category: 'sports_facility',
  booking_open_time: '08:00',
  booking_close_time: '20:00',
  isAvailable: true,
});

const ManageVenues = () => {
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const { loading, request } = useApi();
  const { request: requestDept } = useApi();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(getDefaultVenueFormData());

  useEffect(() => {
    fetchVenues();
    fetchDepartments();
  }, []);

  const fetchVenues = async () => {
    try {
      const data = await request(() => getVenues());
      if (Array.isArray(data)) setVenues(data);
    } catch (error) {
      // Handled by useApi
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await requestDept(() => getDepartments());
      if (Array.isArray(data)) setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  const openEdit = (venue) => {
    setFormData({
      name: venue.name || '',
      type: venue.type,
      capacity: venue.capacity ?? '',
      location: venue.location || '',
      image: venue.image || '',
      departmentId: venue.departmentId?._id || venue.departmentId || '',
      category: venue.category || 'sports_facility',
      booking_open_time: venue.booking_open_time || '08:00',
      booking_close_time: venue.booking_close_time || '20:00',
      isAvailable: venue.status === 'available' || venue.status === undefined
    });
    setSelectedId(venue._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const openCreate = () => {
    setFormData(getDefaultVenueFormData());
    setSelectedId(null);
    setIsEditing(false);
    setShowAddForm(true);
  };

  const handleClose = () => {
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedId(null);
    setFormData(getDefaultVenueFormData());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const normalizedCapacity = Number(formData.capacity);

      if (!formData.name?.trim() || !formData.location?.trim() || !normalizedCapacity || normalizedCapacity < 1) {
        return toast.error('Please complete all required venue fields before saving.');
      }

      // Validate department if departmental
      if (formData.type === 'departmental' && !formData.departmentId) {
        return toast.error('Please select a department for this venue');
      }

      const normalizedCategory = formData.category || 'sports_facility';
      if (!VENUE_CATEGORIES.includes(normalizedCategory)) {
        return toast.error('Please select a valid venue category.');
      }

      // If central, ensure departmentId is cleared
      const submissionData = {
        ...formData,
        name: formData.name.trim(),
        capacity: normalizedCapacity,
        location: formData.location.trim(),
        category: normalizedCategory,
        status: formData.isAvailable ? 'available' : 'maintenance'
      };
      if (submissionData.type === 'central') {
        submissionData.departmentId = null;
      }

      if (isEditing) {
        if (!selectedId) {
          return toast.error('Unable to update this venue because the record ID is missing.');
        }
        await request(() => updateVenue(selectedId, submissionData));
        toast.success('Asset Specifications Updated!');
      } else {
        await request(() => createVenue(submissionData));
        toast.success('Infrastructure Asset Registered!');
      }
      handleClose();
      fetchVenues();
    } catch (error) {
      // Handled by useApi
    }
  };

  const handleDeleteVenue = async (id) => {
    if (!window.confirm('Decommission this asset?')) return;
    try {
      await request(() => deleteVenue(id));
      toast.success('Asset Removed');
      fetchVenues();
    } catch (error) {
      // Handled by useApi
    }
  };

  if (loading) return <div className="flex flex-col justify-center items-center h-96 gap-4"><RefreshCw className="animate-spin w-12 h-12 text-blue-600" /><p className="font-bold text-slate-300 tracking-widest italic animate-pulse">Syncing Asset Logs...</p></div>;

  return (
    <div className="space-y-12 animate-fade-in pb-12 transition-all text-slate-900">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none uppercase italic">Venue Inventory</h1>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center italic">
             <Building2 className="w-4 h-4 mr-2" />
             Infrastructure Oversight Terminal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={openCreate}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs uppercase tracking-widest"
          >
             <Plus className="w-4 h-4 mr-2" />
             New Asset
          </button>
        </div>
      </header>

      {/* Add/Edit Venue Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-xl w-full relative">
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Cancel Allocation"
              >
                <X className="w-8 h-8" />
              </button>
              <h3 className="text-3xl font-extrabold text-slate-900 italic mb-8 uppercase tracking-tighter">
                {isEditing ? 'Asset Modification' : 'Asset Registration'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Asset Label</label>
                       <input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" required placeholder="e.g. Grand Auditorium" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Infrastructure Class</label>
                       <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner uppercase tracking-wider">
                          <option value="central">Central</option>
                          <option value="departmental">Departmental</option>
                       </select>
                    </div>
                    {formData.type === 'departmental' && (
                       <div className="col-span-2">
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Assigned Department</label>
                          <select 
                             value={formData.departmentId} 
                             onChange={(e) => setFormData({...formData, departmentId: e.target.value})} 
                             required
                             className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner"
                          >
                             <option value="">Select Department</option>
                             {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                             ))}
                          </select>
                       </div>
                    )}
                    <div className={formData.type === 'departmental' ? "col-span-2" : "col-span-1"}>
                       <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Headcount Limit</label>
                       <input value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} type="number" required placeholder="Pax Limit" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner" />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Physical Vector (Location)</label>
                       <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} type="text" required placeholder="Block/Floor reference" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Venue Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner uppercase tracking-wider"
                        >
                           {VENUE_CATEGORIES.map((category) => (
                             <option key={category} value={category}>
                               {category.replace(/_/g, ' ')}
                             </option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Booking Opens</label>
                        <input value={formData.booking_open_time} onChange={(e) => setFormData({...formData, booking_open_time: e.target.value})} type="time" required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 italic">Booking Closes</label>
                        <input value={formData.booking_close_time} onChange={(e) => setFormData({...formData, booking_close_time: e.target.value})} type="time" required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner" />
                     </div>
                     <div className="col-span-2 pt-4">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 italic">Venue Availability</label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={formData.isAvailable}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  isAvailable: e.target.checked
                                })
                              }
                            />
                            <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isAvailable ? 'transform translate-x-6' : ''}`}></div>
                          </div>
                          <span className={`text-sm font-bold uppercase tracking-widest italic ${formData.isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {formData.isAvailable ? 'Available for Booking' : 'Under Maintenance'}
                          </span>
                        </label>
                     </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-3xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase tracking-widest text-xs">
                    {isEditing ? 'Confirm Changes' : 'Authorize Asset Registry'}
                 </button>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {venues.map((venue) => {
          const isMaintenance = venue.status === 'maintenance';
          return (
          <div key={venue._id} className={`bg-white border rounded-[2.5rem] shadow-2xl shadow-blue-900/5 transition-all duration-500 overflow-hidden group ${isMaintenance ? 'grayscale opacity-60 border-red-200 hover:shadow-red-900/5' : 'border-slate-100 hover:shadow-blue-900/10'}`}>
            <div className="flex flex-col md:flex-row h-full">
               <div className="md:w-64 h-64 md:h-auto overflow-hidden relative border-r-2 border-slate-50">
                  <img src={venue.image || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205"} alt={venue.name} className={`w-full h-full object-cover transition-transform duration-700 ${!isMaintenance && 'group-hover:scale-110'}`} />
                  <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent transition-colors duration-500 ${!isMaintenance && 'group-hover:from-blue-900/40'}`} />
               </div>

               <div className="flex-1 p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 italic">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest border border-blue-100 ${venue.type === 'central' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {venue.type === 'departmental' ? (venue.departmentId?.name || venue.type) : venue.type}
                          </span>
                          {venue.category && (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest bg-violet-50 text-violet-600 border border-violet-100">
                              {venue.category.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none italic">{venue.name}</h3>
                      </div>
                      {isMaintenance ? (
                        <span className="bg-red-100 text-red-600 text-[9px] px-3 py-1 font-extrabold uppercase tracking-widest rounded-full border border-red-200 shadow-sm italic transition-all duration-500">
                          MAINTENANCE
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[9px] font-extrabold border shadow-sm tracking-widest uppercase italic transition-all duration-500 bg-emerald-50 text-emerald-600 border-emerald-100">
                            AVAILABLE
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 shadow-inner italic">
                      <div className="space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          Coordinate
                        </p>
                        <p className="text-xs font-bold text-slate-700 truncate">{venue.location}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          Volume
                        </p>
                        <p className="text-xs font-bold text-slate-700">{venue.capacity}</p>
                      </div>
                      {venue.booking_open_time && venue.booking_close_time && (
                        <div className="col-span-2 space-y-1 pt-2 border-t border-slate-100">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Booking Window</p>
                          <p className="text-xs font-bold text-slate-700">{venue.booking_open_time} — {venue.booking_close_time}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6">
                    <button 
                      onClick={() => openEdit(venue)}
                      className="h-12 w-12 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteVenue(venue._id)} 
                      className="h-12 w-12 flex items-center justify-center bg-white border border-slate-200 text-rose-500 rounded-2xl hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm active:scale-95"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default ManageVenues;
