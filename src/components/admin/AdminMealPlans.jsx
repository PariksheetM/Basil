import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Copy, Star, X, Save, Filter, Clipboard } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api.js';

const PRESET_CATEGORIES = [
    { name: 'Starters',     icon: 'ðŸ¥—' },
    { name: 'Main Course',  icon: 'ðŸ›' },
    { name: 'Breads/Bases', icon: 'ðŸ«“' },
    { name: 'Rice & Biryani', icon: 'ðŸš' },
    { name: 'Drinks',       icon: 'ðŸ¥¤' },
    { name: 'Desserts',     icon: 'ðŸ®' },
    { name: 'Snacks',       icon: 'ðŸ¥¨' },
    { name: 'Salads',       icon: 'ðŸ¥™' },
];

const getCategoryIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('starter') || n.includes('appetizer')) return 'ðŸ¥—';
    if (n.includes('main') || n.includes('curry') || n.includes('gravy')) return 'ðŸ›';
    if (n.includes('bread') || n.includes('base') || n.includes('roti') || n.includes('naan')) return 'ðŸ«“';
    if (n.includes('rice') || n.includes('biryani') || n.includes('pulao')) return 'ðŸš';
    if (n.includes('drink') || n.includes('beverage') || n.includes('juice') || n.includes('sherbet')) return 'ðŸ¥¤';
    if (n.includes('dessert') || n.includes('sweet') || n.includes('ice cream')) return 'ðŸ®';
    if (n.includes('snack') || n.includes('fries')) return 'ðŸ¥¨';
    if (n.includes('salad') || n.includes('raita')) return 'ðŸ¥™';
    if (n.includes('soup')) return 'ðŸ²';
    if (n.includes('include')) return '✅';
    return 'ðŸ½ï¸';
};

const AdminMealPlans = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid'); // grid or table
    const [showModal, setShowModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [occasionFilter, setOccasionFilter] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        occasion: 'corporate',
        price: '',
        type: 'veg',
        categoryItems: [
            {
                id: 'cat-1',
                name: 'Includes',
                items: [{ id: 'item-1', name: '', type: 'veg', image: '' }],
            },
        ],
        image: '',
        cuisine: 'Multi-cuisine',
        recommended: false,
        popular: false
    });

    const [meals, setMeals] = useState([]);
    const [occasions, setOccasions] = useState([
        { value: 'corporate', label: 'Corporate Event' },
        { value: 'wedding', label: 'Wedding' },
        { value: 'birthday', label: 'Birthday Party' },
        { value: 'houseParty', label: 'House Party' },
        { value: 'pooja', label: 'Pooja/Religious' },
        { value: 'other', label: 'Other' }
    ]);
    const [error, setError] = useState('');
    const [creatingOccasion, setCreatingOccasion] = useState(false);
    const [newOccasion, setNewOccasion] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchMeals();
        fetchOccasions();
    }, []);

    const fetchOccasions = async () => {
        try {
            const token = localStorage.getItem('session_token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/admin/occasions.php`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                navigate('/admin/login');
                return;
            }

            const result = await response.json();
            if (result.success) {
                const mapped = (result.data || []).map((o) => ({ value: o.name, label: o.name, description: o.description }));
                setOccasions(mapped.length ? mapped : occasions);
            }
        } catch (err) {
            console.error('Error fetching occasions:', err);
        }
    };

    const fetchMeals = async () => {
        try {
            const token = localStorage.getItem('session_token');
            if (!token) {
                setLoading(false);
                navigate('/admin/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                setLoading(false);
                navigate('/admin/login');
                return;
            }

            const result = await response.json();
            if (result.success) {
                setMeals(result.data);
                setError('');
            } else {
                setError(result.message || 'Failed to load meal plans');
            }
        } catch (error) {
            console.error('Error fetching meals:', error);
            setError('Unable to load meal plans. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingMeal(null);
        setFormData({
            name: '',
            occasion: occasions[0]?.value || 'corporate',
            price: '',
            type: 'veg',
            categoryItems: [],
            image: '',
            cuisine: 'Multi-cuisine',
            recommended: false,
            popular: false
        });
        setShowModal(true);
    };

    const openEditModal = (meal) => {
        setEditingMeal(meal);
        const structured = Array.isArray(meal.items) && meal.items.length && meal.items[0]?.items
            ? meal.items
            : [{ id: 'cat-1', name: 'Includes', items: deriveMealItems(meal).map((n, idx) => ({ id: `item-${idx}`, name: n, type: meal.type || 'veg', image: meal.image || '' })) }];
        setFormData({
            name: meal.name,
            occasion: meal.occasion,
            price: meal.price,
            type: meal.type,
            categoryItems: structured,
            image: meal.image,
            cuisine: meal.cuisine || 'Multi-cuisine',
            recommended: meal.recommended,
            popular: meal.popular
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payloadItems = formData.categoryItems || [];

        try {
            const apiData = {
                name: formData.name,
                occasion: formData.occasion,
                price: Number(formData.price),
                type: formData.type,
                items: payloadItems,
                image: formData.image,
                cuisine: formData.cuisine,
                recommended: formData.recommended,
                popular: formData.popular
            };

            if (editingMeal) {
                apiData.id = editingMeal.id;
                const token = localStorage.getItem('session_token');
                if (!token) {
                    navigate('/admin/login');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(apiData)
                });
                if (response.status === 401 || response.status === 403) {
                    navigate('/admin/login');
                    return;
                }
                const result = await response.json();
                if (result.success) {
                    fetchMeals();
                }
            } else {
                const token = localStorage.getItem('session_token');
                if (!token) {
                    navigate('/admin/login');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(apiData)
                });
                if (response.status === 401 || response.status === 403) {
                    navigate('/admin/login');
                    return;
                }
                const result = await response.json();
                if (result.success) {
                    fetchMeals();
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving meal:', error);
        }
    };

    const deleteMeal = async (id) => {
        if (window.confirm('Are you sure you want to delete this meal plan?')) {
            try {
                const token = localStorage.getItem('session_token');
                if (!token) {
                    navigate('/admin/login');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ id })
                });
                if (response.status === 401 || response.status === 403) {
                    navigate('/admin/login');
                    return;
                }
                const result = await response.json();
                if (result.success) {
                    fetchMeals();
                }
            } catch (error) {
                console.error('Error deleting meal:', error);
            }
        }
    };

    const duplicateMeal = async (meal) => {
        try {
            const newMealData = {
                name: `${meal.name} (Copy)`,
                occasion: meal.occasion,
                price: meal.price,
                type: meal.type,
                items: meal.items,
                image: meal.image,
                cuisine: meal.cuisine,
                recommended: meal.recommended,
                popular: meal.popular
            };
            const token = localStorage.getItem('session_token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newMealData)
            });
            if (response.status === 401 || response.status === 403) {
                navigate('/admin/login');
                return;
            }
            const result = await response.json();
            if (result.success) {
                fetchMeals();
            }
        } catch (error) {
            console.error('Error duplicating meal:', error);
        }
    };

    const toggleRecommended = async (id) => {
        const meal = meals.find(m => m.id === id);
        if (meal) {
            try {
                const token = localStorage.getItem('session_token');
                if (!token) {
                    navigate('/admin/login');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id,
                        name: meal.name,
                        occasion: meal.occasion,
                        price: meal.price,
                        type: meal.type,
                            items: meal.items,
                        image: meal.image,
                        cuisine: meal.cuisine,
                        recommended: !meal.recommended,
                        popular: meal.popular
                    })
                });
                const result = await response.json();
                if (result.success) {
                    fetchMeals();
                }
            } catch (error) {
                console.error('Error toggling recommended:', error);
            }
        }
    };

    const togglePopular = async (id) => {
        const meal = meals.find(m => m.id === id);
        if (meal) {
            try {
                const token = localStorage.getItem('session_token');
                if (!token) {
                    navigate('/admin/login');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/admin/meals.php`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id,
                        name: meal.name,
                        occasion: meal.occasion,
                        price: meal.price,
                        type: meal.type,
                            items: meal.items,
                        image: meal.image,
                        cuisine: meal.cuisine,
                        recommended: meal.recommended,
                        popular: !meal.popular
                    })
                });
                const result = await response.json();
                if (result.success) {
                    fetchMeals();
                }
            } catch (error) {
                console.error('Error toggling popular:', error);
            }
        }
    };

    const occasionOptions = [{ value: 'all', label: 'All Occasions' }, ...occasions];

    const deriveMealItems = (meal) => {
        if (Array.isArray(meal.items)) {
            // Structured categories [{name, items:[{name,...}]}]
            if (meal.items.length && meal.items[0]?.items) {
                return meal.items.flatMap((cat) => (cat.items || []).map((item) => item.name).filter(Boolean));
            }
            return meal.items;
        }
        if (typeof meal.items === 'string') {
            return meal.items
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
        return [];
    };

    const updateCategoryName = (categoryId, value) => {
        setFormData((prev) => ({
            ...prev,
            categoryItems: prev.categoryItems.map((cat) =>
                cat.id === categoryId ? { ...cat, name: value } : cat
            ),
        }));
    };

    const updateItemField = (categoryId, itemId, field, value) => {
        setFormData((prev) => ({
            ...prev,
            categoryItems: prev.categoryItems.map((cat) => {
                if (cat.id !== categoryId) return cat;
                return {
                    ...cat,
                    items: cat.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
                };
            }),
        }));
    };

    // ₹”€₹”€ Clipboard paste helpers ₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€
    const readImageFromClipboard = async (onImage, onText) => {
        try {
            if (navigator.clipboard && navigator.clipboard.read) {
                const clipItems = await navigator.clipboard.read();
                for (const ci of clipItems) {
                    const imgType = ci.types.find((t) => t.startsWith('image/'));
                    if (imgType) {
                        const blob = await ci.getType(imgType);
                        const reader = new FileReader();
                        reader.onload = (ev) => onImage(ev.target.result);
                        reader.readAsDataURL(blob);
                        return;
                    }
                    if (ci.types.includes('text/plain')) {
                        const blob = await ci.getType('text/plain');
                        const text = await blob.text();
                        onText(text.trim());
                        return;
                    }
                }
            } else {
                const text = await navigator.clipboard.readText();
                if (text) onText(text.trim());
            }
        } catch (err) {
            console.error('Clipboard read failed:', err);
        }
    };

    const handleItemImagePasteBtn = (categoryId, itemId) => {
        readImageFromClipboard(
            (dataUrl) => updateItemField(categoryId, itemId, 'image', dataUrl),
            (text) => updateItemField(categoryId, itemId, 'image', text)
        );
    };

    const handleItemImagePasteEvent = (e, categoryId, itemId) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const ci of items) {
            if (ci.type.startsWith('image/')) {
                e.preventDefault();
                const blob = ci.getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => updateItemField(categoryId, itemId, 'image', ev.target.result);
                reader.readAsDataURL(blob);
                return;
            }
        }
    };

    const handleMainImagePasteBtn = () => {
        readImageFromClipboard(
            (dataUrl) => setFormData((prev) => ({ ...prev, image: dataUrl })),
            (text) => setFormData((prev) => ({ ...prev, image: text }))
        );
    };

    const handleMainImagePasteEvent = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const ci of items) {
            if (ci.type.startsWith('image/')) {
                e.preventDefault();
                const blob = ci.getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => setFormData((prev) => ({ ...prev, image: ev.target.result }));
                reader.readAsDataURL(blob);
                return;
            }
        }
    };
    // ₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€

    // ₹”€₹”€₹”€ preset & category helpers ₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€₹”€
    const addPresetCategory = (name) => {
        setFormData((prev) => ({
            ...prev,
            categoryItems: [
                ...prev.categoryItems,
                { id: `cat-${Date.now()}`, name, items: [{ id: `item-${Date.now()}`, name: '', type: 'veg', image: '' }] },
            ],
        }));
    };

    const addCategory = () => {
        setFormData((prev) => ({
            ...prev,
            categoryItems: [
                ...prev.categoryItems,
                { id: `cat-${Date.now()}`, name: '', items: [{ id: `item-${Date.now()}`, name: '', type: 'veg', image: '' }] },
            ],
        }));
    };

    const addItem = (categoryId) => {
        setFormData((prev) => ({
            ...prev,
            categoryItems: prev.categoryItems.map((cat) =>
                cat.id === categoryId
                    ? {
                          ...cat,
                          items: [...cat.items, { id: `item-${Date.now()}`, name: '', type: 'veg', image: '' }],
                      }
                    : cat
            ),
        }));
    };

    const removeItem = (categoryId, itemId) => {
        setFormData((prev) => ({
            ...prev,
            categoryItems: prev.categoryItems.map((cat) =>
                cat.id === categoryId
                    ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
                    : cat
            ),
        }));
    };

    const removeCategory = (categoryId) => {
        setFormData((prev) => ({
            ...prev,
            categoryItems: prev.categoryItems.filter((cat) => cat.id !== categoryId),
        }));
    };

    const filteredMeals = meals.filter((meal) =>
        occasionFilter === 'all' ||
        (meal.occasion || '').toLowerCase() === occasionFilter.toLowerCase()
    );

    const getPriceTier = (price) => {
        const numeric = Number(price) || 0;
        if (numeric < 200) {
            return 'Budget';
        }
        if (numeric < 350) {
            return 'Classic';
        }
        if (numeric < 500) {
            return 'Premium';
        }
        return 'Luxury';
    };

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Meal Plans</p>
                    <h1 className="text-2xl font-extrabold text-slate-900">Manage, edit and monitor subscription plans</h1>
                    <p className="text-sm text-slate-500">{filteredMeals.length} active of {meals.length} plans</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCreatingOccasion(true)} className="admin-chip">+ Add Occasion</button>
                    <button onClick={openAddModal} className="admin-chip primary"><Plus size={16} /> Add New Meal Plan</button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {creatingOccasion && (
                <div className="glass-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Create Occasion</p>
                            <p className="text-xs text-slate-500">Add a new occasion to map meal plans.</p>
                        </div>
                        <button onClick={() => setCreatingOccasion(false)} className="text-sm text-slate-500 hover:text-slate-900">Cancel</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={newOccasion.name}
                            onChange={(e) => setNewOccasion({ ...newOccasion, name: e.target.value })}
                            className="soft-input"
                            placeholder="Occasion name"
                        />
                        <input
                            type="text"
                            value={newOccasion.description}
                            onChange={(e) => setNewOccasion({ ...newOccasion, description: e.target.value })}
                            className="soft-input"
                            placeholder="Short description (optional)"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={async () => {
                                if (!newOccasion.name.trim()) return;
                                try {
                                    const token = localStorage.getItem('session_token');
                                    if (!token) { navigate('/admin/login'); return; }
                                    const response = await fetch(`${API_BASE_URL}/admin/occasions.php`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ name: newOccasion.name.trim(), description: newOccasion.description })
                                    });
                                    if (response.status === 401 || response.status === 403) { navigate('/admin/login'); return; }
                                    const result = await response.json();
                                    if (result.success) {
                                        setNewOccasion({ name: '', description: '' });
                                        setCreatingOccasion(false);
                                        fetchOccasions();
                                    }
                                } catch (err) {
                                    console.error('Error creating occasion:', err);
                                }
                            }}
                            className="admin-chip primary"
                        >
                            Save Occasion
                        </button>
                    </div>
                </div>
            )}

            <div className="glass-card p-4 flex flex-wrap gap-2 items-center">
                {occasionOptions.map((option) => {
                    const isActive = occasionFilter === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setOccasionFilter(option.value)}
                            className={`admin-chip ${isActive ? 'primary' : ''}`}
                            aria-pressed={isActive}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="glass-card p-6 text-slate-600">Loading meal plans...</div>
            ) : (
                <div className="card-grid">
                    <button
                        onClick={openAddModal}
                        className="glass-card border-dashed border-2 border-slate-200 p-5 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <Plus size={20} />
                        </div>
                        <p className="font-semibold">Create New Plan</p>
                        <p className="text-xs">Start a new subscription model</p>
                    </button>

                    {filteredMeals.length === 0 && (
                        <div className="glass-card p-6 text-slate-600">No meal plans found for this occasion.</div>
                    )}

                    {filteredMeals.map((meal) => {
                        const mealItems = deriveMealItems(meal);
                        const priceTier = getPriceTier(meal.price);
                        return (
                            <div key={meal.id} className="glass-card overflow-hidden flex flex-col">
                                <div className="relative h-40 overflow-hidden">
                                    {meal.image && (
                                        <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute top-3 left-3 admin-pill">{meal.type === 'veg' ? 'VEG' : 'NON-VEG'}</div>
                                    {meal.recommended && <span className="absolute top-3 right-3 admin-chip primary text-xs">Recommended</span>}
                                    {meal.popular && <span className="absolute top-12 right-3 admin-chip text-xs">Popular</span>}
                                </div>

                                <div className="p-4 flex-1 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm text-slate-500 capitalize">{meal.occasion}</p>
                                            <h3 className="text-lg font-bold text-slate-900">{meal.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-extrabold text-slate-900">₹{meal.price}</p>
                                            <p className="text-xs text-slate-500">per person</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="admin-chip">{meal.cuisine || 'Multi-cuisine'}</span>
                                        <span className="admin-chip">{priceTier}</span>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-1">Includes</p>
                                        <div className="flex flex-wrap gap-1">
                                            {mealItems.slice(0, 4).map((item, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-slate-100 text-xs rounded-lg text-slate-700">{item}</span>
                                            ))}
                                            {mealItems.length > 4 && (
                                                <span className="px-2 py-1 bg-slate-100 text-xs rounded-lg text-slate-700">+{mealItems.length - 4} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-auto">
                                        <button onClick={() => openEditModal(meal)} className="soft-input text-center font-semibold text-slate-700">Edit</button>
                                        <button onClick={() => duplicateMeal(meal)} className="soft-input text-center font-semibold text-slate-700">Copy</button>
                                        <button onClick={() => deleteMeal(meal.id)} className="soft-input text-center font-semibold text-red-600">Delete</button>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                        <button
                                            onClick={() => toggleRecommended(meal.id)}
                                            className={`admin-chip ${meal.recommended ? 'primary' : ''} flex-1 justify-center`}
                                        >
                                            {meal.recommended ? '₹œ“ Recommended' : 'Set Recommended'}
                                        </button>
                                        <button
                                            onClick={() => togglePopular(meal.id)}
                                            className={`admin-chip flex-1 justify-center ${meal.popular ? 'primary' : ''}`}
                                        >
                                            {meal.popular ? '₹˜… Popular' : 'Set Popular'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 p-6 flex items-center justify-between text-white">
                            <h2 className="text-2xl font-bold">{editingMeal ? 'Edit Meal Plan' : 'Add New Meal Plan'}</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Meal Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Meal Plan Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., Premium Corporate Lunch"
                                />
                            </div>

                            {/* Occasion & Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Occasion *
                                    </label>
                                    <select
                                        required
                                        value={formData.occasion}
                                        onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {occasions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setCreatingOccasion(true)}
                                        className="mt-2 text-sm text-green-600 font-semibold hover:underline"
                                    >
                                        + Create new occasion
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Price per Person (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="299"
                                    />
                                </div>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Meal Type *
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="veg"
                                            checked={formData.type === 'veg'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-4 h-4 text-green-500"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">ðŸŸ¢ Vegetarian</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="non-veg"
                                            checked={formData.type === 'non-veg'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-4 h-4 text-red-500"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">ðŸ”´ Non-Vegetarian</span>
                                    </label>
                                </div>
                            </div>

                            {/* ₹”€₹”€ Category-wise Menu Items ₹”€₹”€ */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Menu Items <span className="font-normal text-gray-400">(category wise)</span>
                                        </label>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Dot = type&nbsp;
                                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 align-middle" />&nbsp;Veg&nbsp;
                                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 align-middle" />&nbsp;Non-veg&nbsp;
                                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 align-middle" />&nbsp;Satvik ₹€” click dot to cycle
                                        </p>
                                    </div>
                                </div>

                                {/* Quick-add preset category chips */}
                                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-600 p-3 space-y-2 bg-gray-50/50 dark:bg-gray-700/30">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick add category</p>
                                    <div className="flex flex-wrap gap-2">
                                        {PRESET_CATEGORIES.map((preset) => {
                                            const exists = formData.categoryItems.some(
                                                (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                                            );
                                            return (
                                                <button
                                                    key={preset.name}
                                                    type="button"
                                                    disabled={exists}
                                                    onClick={() => addPresetCategory(preset.name)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                                                        ${exists
                                                            ? 'bg-green-50 border-green-300 text-green-600 cursor-default dark:bg-green-900/20'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                                                        }`}
                                                >
                                                    <span>{preset.icon}</span>
                                                    {preset.name}
                                                    {exists && <span className="text-green-500 ml-0.5">₹œ“</span>}
                                                </button>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={addCategory}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 transition-all"
                                        >
                                            <Plus size={11} /> Custom
                                        </button>
                                    </div>
                                </div>

                                {/* Category blocks */}
                                {formData.categoryItems.length === 0 && (
                                    <p className="text-sm text-center text-gray-400 py-4">
                                        Click a category above to start building your menu.
                                    </p>
                                )}

                                {formData.categoryItems.map((category) => (
                                    <div key={category.id} className="rounded-2xl border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm">
                                        {/* Category header */}
                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                            <span className="text-base leading-none">{getCategoryIcon(category.name)}</span>
                                            <input
                                                type="text"
                                                required
                                                value={category.name}
                                                onChange={(e) => updateCategoryName(category.id, e.target.value)}
                                                className="flex-1 bg-transparent text-sm font-bold text-gray-800 dark:text-gray-100 focus:outline-none placeholder-gray-400"
                                                placeholder="Category name (e.g. Starters)"
                                            />
                                            <span className="text-xs text-gray-400 tabular-nums">{category.items.length} item{category.items.length !== 1 ? 's' : ''}</span>
                                            <button
                                                type="button"
                                                onClick={() => addItem(category.id)}
                                                className="text-xs font-semibold text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition-all"
                                            >
                                                + Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(category.id)}
                                                className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                title="Remove category"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>

                                        {/* Items list */}
                                        <div className="p-3 space-y-2 bg-white dark:bg-gray-800">
                                            {/* Column headers */}
                                            <div className="grid grid-cols-12 gap-2 px-1">
                                                <span className="col-span-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Type</span>
                                                <span className="col-span-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Item Name</span>
                                                <span className="col-span-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Image</span>
                                                <span className="col-span-1" />
                                            </div>

                                            {category.items.map((item, itemIdx) => (
                                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-gray-700/40 rounded-xl px-2 py-2">
                                                    {/* Veg type toggle dot */}
                                                    <div className="col-span-1 flex justify-center">
                                                        <button
                                                            type="button"
                                                            title={`${item.type || 'veg'} ₹€” click to cycle`}
                                                            onClick={() =>
                                                                updateItemField(
                                                                    category.id,
                                                                    item.id,
                                                                    'type',
                                                                    item.type === 'veg' ? 'non-veg' : item.type === 'non-veg' ? 'satvik' : 'veg'
                                                                )
                                                            }
                                                            className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all hover:scale-110 focus:outline-none"
                                                            style={{
                                                                backgroundColor:
                                                                    item.type === 'non-veg' ? '#ef4444' :
                                                                    item.type === 'satvik'  ? '#f59e0b' : '#22c55e',
                                                                borderColor:
                                                                    item.type === 'non-veg' ? '#dc2626' :
                                                                    item.type === 'satvik'  ? '#d97706' : '#16a34a',
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Item name */}
                                                    <input
                                                        type="text"
                                                        required
                                                        value={item.name}
                                                        onChange={(e) => updateItemField(category.id, item.id, 'name', e.target.value)}
                                                        className="col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-400 placeholder-gray-400"
                                                        placeholder={`Item ${itemIdx + 1}`}
                                                    />

                                                    {/* Image URL + paste */}
                                                    <div className="col-span-6 flex items-center gap-1">
                                                        <div className="flex-1 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-green-400">
                                                            <input
                                                                type="text"
                                                                value={item.image || ''}
                                                                onChange={(e) => updateItemField(category.id, item.id, 'image', e.target.value)}
                                                                onPaste={(e) => handleItemImagePasteEvent(e, category.id, item.id)}
                                                                className="flex-1 min-w-0 px-2.5 py-1.5 bg-transparent text-xs text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
                                                                placeholder="Image URL (optional)"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleItemImagePasteBtn(category.id, item.id)}
                                                                title="Paste image or URL from clipboard"
                                                                className="px-2 py-1.5 border-l border-gray-200 dark:border-gray-600 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex-shrink-0"
                                                            >
                                                                <Clipboard size={11} />
                                                            </button>
                                                        </div>
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt=""
                                                                className="w-7 h-7 rounded-lg object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Remove item */}
                                                    <div className="col-span-1 flex justify-center">
                                                        {category.items.length > 1 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(category.id, item.id)}
                                                                className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                                title="Remove item"
                                                            >
                                                                <X size={13} />
                                                            </button>
                                                        ) : <span />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Image URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        onPaste={handleMainImagePasteEvent}
                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="https://example.com/image.jpg or paste image"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleMainImagePasteBtn}
                                        title="Paste image or URL from clipboard"
                                        className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 flex items-center gap-1.5"
                                    >
                                        <Clipboard size={16} />
                                        <span className="text-sm font-medium">Paste</span>
                                    </button>
                                </div>
                                {formData.image && (
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="mt-2 h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )}
                            </div>

                            {/* Cuisine */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Cuisine / Style
                                </label>
                                <input
                                    type="text"
                                    value={formData.cuisine}
                                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., North Indian, Multi-cuisine"
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.recommended}
                                        onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
                                        className="w-4 h-4 text-green-500 rounded"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Mark as Recommended</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.popular}
                                        onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                        className="w-4 h-4 text-orange-500 rounded"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Mark as Popular</span>
                                </label>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingMeal ? 'Save Changes' : 'Add Meal Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMealPlans;
