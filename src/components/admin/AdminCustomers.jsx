import React, { useState, useEffect } from 'react';
import { Search, Eye, Mail, Phone, Calendar, ShoppingBag, X } from 'lucide-react';

const AdminCustomers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/customers.php');
            const result = await response.json();
            if (result.success) {
                setCustomers(result.data);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{customers.length} total customers</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
                        {/* Customer Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{customer.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <Mail size={14} />
                                        <span>{customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <Phone size={14} />
                                        <span>{customer.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(customer)}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                                title="View Details"
                            >
                                <Eye size={18} />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">Total Orders</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{customer.totalOrders}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 col-span-2">
                                <p className="text-xs text-green-600 dark:text-green-400 font-bold mb-1">Total Spent</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{customer.totalSpent.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Member since:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{customer.joinDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={16} className="text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Favorite Occasion:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{customer.favoriteOccasion}</span>
                            </div>
                        </div>

                        {/* Most Ordered */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Most Ordered:</p>
                            <div className="flex flex-wrap gap-2">
                                {customer.mostOrdered.map((item, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded-full">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 p-6 flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl backdrop-blur-sm">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                                    <p className="text-sm text-green-50 mt-1">{selectedCustomer.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Contact Info */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{selectedCustomer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{selectedCustomer.phone}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Calendar size={16} className="text-gray-400 mt-0.5" />
                                        <span className="text-gray-600 dark:text-gray-400">Address:</span>
                                        <span className="font-medium text-gray-900 dark:text-white flex-1">{selectedCustomer.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4">
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-2">Total Orders</p>
                                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{selectedCustomer.totalOrders}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-4 col-span-2">
                                    <p className="text-xs text-green-600 dark:text-green-400 font-bold mb-2">Total Revenue</p>
                                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Favorite Occasion */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4">
                                <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-2">Favorite Occasion</p>
                                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{selectedCustomer.favoriteOccasion}</p>
                            </div>

                            {/* Most Ordered Meals */}
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Most Ordered Meals</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCustomer.mostOrdered.map((item, index) => (
                                        <span key={index} className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-xl font-medium">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Recent Orders</h3>
                                <div className="space-y-3">
                                    {selectedCustomer.recentOrders.map((order) => (
                                        <div key={order.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{order.id}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.occasion}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">₹{order.amount.toLocaleString()}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{order.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
