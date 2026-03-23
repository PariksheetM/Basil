import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, RefreshCw, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api.js';

const AdminOccasions = () => {
    const navigate = useNavigate();
    const [meals, setMeals] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newOccasion, setNewOccasion] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '' });
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchOccasionList();
        fetchMeals();
    }, []);

    const flashSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const fetchOccasionList = async () => {
        try {
            const token = localStorage.getItem('session_token');
            if (!token) { setLoading(false); navigate('/admin/login'); return; }
            const response = await fetch(`${API_BASE_URL}/admin/occasions.php`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) { setLoading(false); navigate('/admin/login'); return; }
            const result = await response.json();
            if (result.success) setOccasions(result.data || []);
        } catch (err) {
            console.error('Error loading occasions:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeals = async () => {
        try {
            const token = localStorage.getItem('session_token');
            if (!token) return;
            const response = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) setMeals(result.data || []);
        } catch (err) {
            console.error('Error loading meals:', err);
        }
    };

    // Count meal plans per occasion (case-insensitive)
    const mealCountByOccasion = useMemo(() => {
        return meals.reduce((acc, meal) => {
            const key = (meal.occasion || '').toLowerCase();
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }, [meals]);

    const getMealCount = (occName) => mealCountByOccasion[(occName || '').toLowerCase()] || 0;

    // â”€â”€ CREATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleCreate = async () => {
        if (!newOccasion.name.trim()) return;
        try {
            setSaving(true);
            setError('');
            const token = localStorage.getItem('session_token');
            if (!token) { navigate('/admin/login'); return; }
            const response = await fetch(`${API_BASE_URL}/admin/occasions.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newOccasion.name.trim(), description: newOccasion.description.trim() })
            });
            if (response.status === 401 || response.status === 403) { navigate('/admin/login'); return; }
            const result = await response.json();
            if (result.success) {
                setNewOccasion({ name: '', description: '' });
                flashSuccess('Occasion created successfully.');
                fetchOccasionList();
            } else {
                setError(result.message || 'Unable to create occasion');
            }
        } catch (err) {
            console.error('Error creating occasion:', err);
            setError('Unable to create occasion.');
        } finally {
            setSaving(false);
        }
    };

    // â”€â”€ UPDATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const startEdit = (occ) => {
        setEditingId(occ.id);
        setEditForm({ name: occ.name, description: occ.description || '' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', description: '' });
    };

    const handleUpdate = async (id) => {
        if (!editForm.name.trim()) return;
        try {
            setSaving(true);
            setError('');
            const token = localStorage.getItem('session_token');
            if (!token) { navigate('/admin/login'); return; }
            const response = await fetch(`${API_BASE_URL}/admin/occasions.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id, name: editForm.name.trim(), description: editForm.description.trim() })
            });
            if (response.status === 401 || response.status === 403) { navigate('/admin/login'); return; }
            const result = await response.json();
            if (result.success) {
                cancelEdit();
                flashSuccess('Occasion updated successfully.');
                fetchOccasionList();
            } else {
                setError(result.message || 'Unable to update occasion');
            }
        } catch (err) {
            console.error('Error updating occasion:', err);
            setError('Unable to update occasion.');
        } finally {
            setSaving(false);
        }
    };

    // â”€â”€ DELETE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleDelete = async (id) => {
        try {
            setError('');
            const token = localStorage.getItem('session_token');
            if (!token) { navigate('/admin/login'); return; }
            const response = await fetch(`${API_BASE_URL}/admin/occasions.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id })
            });
            if (response.status === 401 || response.status === 403) { navigate('/admin/login'); return; }
            const result = await response.json();
            if (result.success) {
                setDeletingId(null);
                flashSuccess('Occasion deleted successfully.');
                fetchOccasionList();
            } else {
                setError(result.message || 'Unable to delete occasion');
            }
        } catch (err) {
            console.error('Error deleting occasion:', err);
            setError('Unable to delete occasion.');
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Occasion Management</p>
                    <h1 className="text-2xl font-extrabold text-slate-900">Manage Occasion Master</h1>
                    <p className="text-sm text-slate-500">Create, edit and delete occasion types used across meal plans.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { fetchOccasionList(); fetchMeals(); }} className="admin-chip">
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={() => navigate('/admin/meal-plans')} className="admin-chip primary">
                        Go to Meal Plans
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X size={14} /></button>
                </div>
            )}
            {success && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm flex items-center gap-2">
                    <Check size={14} /> {success}
                </div>
            )}

            {/* Create New Occasion */}
            <div className="glass-card p-5 space-y-4">
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Plus size={16} className="text-emerald-600" /> Add New Occasion
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={newOccasion.name}
                        onChange={(e) => setNewOccasion({ ...newOccasion, name: e.target.value })}
                        className="soft-input"
                        placeholder="Occasion name (e.g. Kitty Party)"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <input
                        type="text"
                        value={newOccasion.description}
                        onChange={(e) => setNewOccasion({ ...newOccasion, description: e.target.value })}
                        className="soft-input"
                        placeholder="Short description (optional)"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                </div>
                <button
                    onClick={handleCreate}
                    disabled={saving || !newOccasion.name.trim()}
                    className="admin-chip primary w-fit disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={14} /> {saving ? 'Saving...' : 'Save Occasion'}
                </button>
            </div>

            {/* Occasions Master Table */}
            <div className="glass-card p-5">
                <p className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-600" />
                    All Occasions
                    <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        {occasions.length}
                    </span>
                </p>

                {loading ? (
                    <p className="text-slate-500 text-sm">Loading occasions...</p>
                ) : occasions.length === 0 ? (
                    <p className="text-slate-500 text-sm">No occasions found. Create one above.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-soft">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>OCCASION NAME</th>
                                    <th>DESCRIPTION</th>
                                    <th>MEAL PLANS</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {occasions.map((occ, idx) => (
                                    <tr key={occ.id}>
                                        <td className="text-slate-400 text-xs">{idx + 1}</td>

                                        {/* NAME */}
                                        <td>
                                            {editingId === occ.id ? (
                                                <input
                                                    className="soft-input text-sm py-1"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="font-semibold text-slate-900">{occ.name}</span>
                                            )}
                                        </td>

                                        {/* DESCRIPTION */}
                                        <td>
                                            {editingId === occ.id ? (
                                                <input
                                                    className="soft-input text-sm py-1"
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    placeholder="Optional description"
                                                />
                                            ) : (
                                                <span className="text-sm text-slate-500">{occ.description || 'â€”'}</span>
                                            )}
                                        </td>

                                        {/* MEAL PLANS COUNT */}
                                        <td>
                                            <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
                                                {getMealCount(occ.name)} plans
                                            </span>
                                        </td>

                                        {/* STATUS */}
                                        <td><span className="status-pill confirmed">Active</span></td>

                                        {/* ACTIONS */}
                                        <td>
                                            {editingId === occ.id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdate(occ.id)}
                                                        disabled={saving}
                                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                                        title="Save changes"
                                                    >
                                                        <Check size={15} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600"
                                                        title="Cancel"
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                </div>
                                            ) : deletingId === occ.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-red-600 font-medium">Delete?</span>
                                                    <button
                                                        onClick={() => handleDelete(occ.id)}
                                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                                                        title="Confirm delete"
                                                    >
                                                        <Check size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingId(null)}
                                                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600"
                                                        title="Cancel"
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => startEdit(occ)}
                                                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingId(occ.id)}
                                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOccasions;
