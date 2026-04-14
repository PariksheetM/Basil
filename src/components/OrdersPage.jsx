import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle2, ChevronRight, Home, ClipboardList, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrderService from '../services/orderService';
import AuthService from '../services/authService';
import { imgUrl } from '../utils/imgUrl.js';

const ORDER_IMG_FALLBACK = 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=400&q=80';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            if (!AuthService.isLoggedIn()) {
                setOrders([]);
                setLoading(false);
                return;
            }

            const result = await OrderService.getOrders();
            if (result.success && Array.isArray(result.data)) {
                setOrders(result.data);
            } else {
                setOrders([]);
            }
            setLoading(false);
        };

        loadOrders();
    }, []);

    const Footer = () => (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-lg md:hidden">
            <div onClick={() => navigate('/home')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
                <Home size={24} />
                <span className="text-[10px] font-medium">Home</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-green-600">
                <ClipboardList size={24} />
                <span className="text-[10px] font-medium">Orders</span>
            </div>
            <div onClick={() => navigate('/account')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
                <User size={24} />
                <span className="text-[10px] font-medium">Account</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <header className="max-w-4xl mx-auto px-4 py-3 flex items-center relative justify-center">
                    <button onClick={() => navigate('/home')} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 absolute left-4">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Your Orders</h1>
                </header>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-500 text-sm">Loading your orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={32} className="text-gray-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 text-sm mb-6">Start exploring our menu to place your first order!</p>
                        <button onClick={() => navigate('/home')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-200">
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    orders.map((order, index) => (
                        <div key={order.id || index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Order #{order.order_number || order.id}</p>
                                        <p className="text-[10px] text-gray-500">{(order.event_date || order.created_at || '').slice(0, 10)} • {(order.items || []).length} Items</p>
                                    </div>
                                </div>
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full capitalize">
                                    {order.status || 'Placed'}
                                </span>
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img
                                        src={imgUrl(order.items?.[0]?.item_image || ORDER_IMG_FALLBACK)}
                                        className="w-full h-full object-cover"
                                        alt=""
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = ORDER_IMG_FALLBACK;
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{order.meal_plan_name || order.items?.[0]?.item_name || 'Meal Plan'}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{order.occasion || 'Event Order'} • {order.guest_count || order.items?.[0]?.quantity || 0} guests</p>
                                    <p className="font-bold text-sm text-gray-900">₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock size={14} />
                                    <span>{order.payment_status === 'paid' ? 'Payment completed' : 'Awaiting payment'}</span>
                                </div>
                                <button className="text-green-600 text-xs font-bold flex items-center gap-1">
                                    Track Order <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Footer />
        </div>
    );
};

export default OrdersPage;
