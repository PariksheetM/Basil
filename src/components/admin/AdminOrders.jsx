import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Trash2, X } from 'lucide-react';

const AdminOrders = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterOccasion, setFilterOccasion] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('session_token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await fetch('http://localhost:8000/api/admin/orders.php', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                navigate('/admin/login');
                return;
            }

            const result = await response.json();
            if (result.success) {
                setOrders(result.data);
                setError('');
            } else {
                setError(result.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Unable to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('session_token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await fetch('http://localhost:8000/api/admin/orders.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, status: newStatus })
            });

            if (response.status === 401 || response.status === 403) {
                navigate('/admin/login');
                return;
            }

            const result = await response.json();
            if (result.success) {
                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const deleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                const token = localStorage.getItem('session_token');
                if (!token) {
                    navigate('/admin/login');
                    return;
                }

                const response = await fetch('http://localhost:8000/api/admin/orders.php', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ orderId })
                });

                if (response.status === 401 || response.status === 403) {
                    navigate('/admin/login');
                    return;
                }

                const result = await response.json();
                if (result.success) {
                    setOrders(orders.filter(order => order.id !== orderId));
                }
            } catch (error) {
                console.error('Error deleting order:', error);
            }
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesOccasion = filterOccasion === 'all' || order.occasion === filterOccasion;
        return matchesSearch && matchesStatus && matchesOccasion;
    });

    const statusClass = (status) => {
        const normalized = (status || '').toLowerCase();
        if (normalized.includes('pending')) return 'status-pill pending';
        if (normalized.includes('confirm')) return 'status-pill confirmed';
        if (normalized.includes('deliver')) return 'status-pill delivered';
        return 'status-pill processing';
    };

    const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
                    <p className="text-sm text-slate-500">Manage and track customer orders in real-time</p>
                </div>
                <button className="admin-chip primary">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[220px] max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="soft-input w-full pl-10"
                        placeholder="Search by Order ID, Customer, or Product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="soft-input w-44"
                >
                    <option value="all">Status: All</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Delivered">Delivered</option>
                </select>

                <select
                    value={filterOccasion}
                    onChange={(e) => setFilterOccasion(e.target.value)}
                    className="soft-input w-44"
                >
                    <option value="all">Occasion: All</option>
                    <option value="Corporate Event">Corporate</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday Party">Birthday</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="glass-card p-5">
                <div className="overflow-x-auto">
                    <table className="table-soft">
                        <thead>
                            <tr>
                                <th>ORDER ID</th>
                                <th>CUSTOMER</th>
                                <th>OCCASION</th>
                                <th>MEAL PLAN</th>
                                <th>GUESTS</th>
                                <th>AMOUNT</th>
                                <th>DATE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-3">
                            {loading && (
                                <tr><td colSpan="9" className="text-center text-slate-500 py-6">Loading orders...</td></tr>
                            )}

                            {!loading && filteredOrders.length === 0 && (
                                <tr><td colSpan="9" className="text-center text-slate-500 py-6">No orders found.</td></tr>
                            )}

                            {!loading && filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="font-bold">#{order.id}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar text-xs">{(order.customer.name || 'G')[0]}</div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{order.customer.name}</p>
                                                <p className="text-xs text-slate-500">{order.customer.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-sm text-slate-700">{order.occasion}</td>
                                    <td className="text-sm text-slate-700">{order.mealPlan}</td>
                                    <td className="text-sm text-slate-700">{order.guestCount}</td>
                                    <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
                                    <td className="text-sm text-slate-600">{order.date}</td>
                                    <td><span className={statusClass(order.status)}>{order.status}</span></td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteOrder(order.id)}
                                                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-5 flex items-center justify-between border-b border-slate-100">
                            <div>
                                <p className="text-xs text-slate-500">Order</p>
                                <p className="text-xl font-bold text-slate-900">#{selectedOrder.id}</p>
                                <p className="text-sm text-slate-500">{selectedOrder.occasion}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            <div className="glass-card p-4 shadow-none border border-slate-100">
                                <p className="text-sm font-bold text-slate-900 mb-2">Customer Details</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                                    <span>Name: <strong>{selectedOrder.customer.name}</strong></span>
                                    <span>Email: {selectedOrder.customer.email || '—'}</span>
                                    <span>Phone: {selectedOrder.customer.phone}</span>
                                    <span>Address: {selectedOrder.address}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-4 shadow-none border border-slate-100">
                                    <p className="text-xs text-slate-500">Meal Plan</p>
                                    <p className="font-bold text-slate-900">{selectedOrder.mealPlan}</p>
                                </div>
                                <div className="glass-card p-4 shadow-none border border-slate-100">
                                    <p className="text-xs text-slate-500">Guest Count</p>
                                    <p className="font-bold text-slate-900">{selectedOrder.guestCount}</p>
                                </div>
                                <div className="glass-card p-4 shadow-none border border-slate-100">
                                    <p className="text-xs text-slate-500">Date & Time</p>
                                    <p className="font-bold text-slate-900">{selectedOrder.date} at {selectedOrder.time}</p>
                                </div>
                                <div className="glass-card p-4 shadow-none border border-slate-100">
                                    <p className="text-xs text-slate-500">Status</p>
                                    <span className={statusClass(selectedOrder.status)}>{selectedOrder.status}</span>
                                </div>
                            </div>

                            <div className="glass-card p-4 shadow-none border border-slate-100">
                                <p className="text-sm font-bold text-slate-900 mb-2">Menu Items</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                                {selectedOrder.addedItems.length > 0 && (
                                    <div className="mt-3 border-t border-slate-100 pt-3">
                                        <p className="text-xs font-bold text-amber-600 mb-1">Extra Items</p>
                                        {selectedOrder.addedItems.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm">
                                                <span>{item.name}</span>
                                                <span className="text-amber-600">+₹{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="glass-card p-4 shadow-none border border-slate-100">
                                <p className="text-sm font-bold text-slate-900 mb-2">Price Breakdown</p>
                                <div className="space-y-2 text-sm text-slate-700">
                                    <div className="flex justify-between"><span>Base (₹{selectedOrder.basePrice} × {selectedOrder.guestCount})</span><span>{formatCurrency(selectedOrder.basePrice * selectedOrder.guestCount)}</span></div>
                                    {selectedOrder.addedItems.length > 0 && (
                                        <div className="flex justify-between"><span>Customizations</span><span>{formatCurrency(selectedOrder.addedItems.reduce((sum, item) => sum + item.price, 0) * selectedOrder.guestCount)}</span></div>
                                    )}
                                    <div className="flex justify-between"><span>Delivery</span><span>₹50</span></div>
                                    <div className="flex justify-between"><span>GST (5%)</span><span>{formatCurrency((selectedOrder.totalAmount - 50) * 0.05)}</span></div>
                                    <div className="subtle-divider"></div>
                                    <div className="flex justify-between font-bold text-slate-900"><span>Total Amount</span><span className="text-emerald-600">{formatCurrency(selectedOrder.totalAmount)}</span></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => updateOrderStatus(selectedOrder.id, 'Confirmed')} className="soft-input bg-blue-600 text-white font-bold text-center">Mark as Confirmed</button>
                                <button onClick={() => updateOrderStatus(selectedOrder.id, 'Delivered')} className="soft-input bg-emerald-600 text-white font-bold text-center">Mark as Delivered</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
