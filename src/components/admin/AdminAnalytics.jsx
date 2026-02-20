import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Award } from 'lucide-react';

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({
        metrics: { totalOrders: 0, totalRevenue: 0, totalCustomers: 0, avgOrderValue: 0 },
        revenueData: [],
        occasionStats: [],
        topCustomers: [],
        popularMeals: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/analytics.php');
            const result = await response.json();
            if (result.success) {
                setAnalyticsData(result.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const maxRevenue = analyticsData.revenueData.length > 0 
        ? Math.max(...analyticsData.revenueData.map(d => parseFloat(d.revenue))) 
        : 1;

    const getColorClass = (color) => {
        const colors = {
            blue: 'bg-blue-500',
            pink: 'bg-pink-500',
            purple: 'bg-purple-500',
            green: 'bg-green-500',
            orange: 'bg-orange-500'
        };
        return colors[color] || 'bg-gray-500';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Business performance overview</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">+12%</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">{analyticsData.metrics.totalOrders.toLocaleString()}</p>
                    <p className="text-sm text-blue-100">Total Orders</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">+18%</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">₹{(analyticsData.metrics.totalRevenue / 100000).toFixed(1)}L</p>
                    <p className="text-sm text-green-100">Total Revenue</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Users size={24} />
                        </div>
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">+8%</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">{analyticsData.metrics.totalCustomers}</p>
                    <p className="text-sm text-purple-100">Total Customers</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">+25%</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">₹{analyticsData.metrics.avgOrderValue.toLocaleString()}</p>
                    <p className="text-sm text-orange-100">Avg Order Value</p>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Trend</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly revenue over the last 6 months</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold">6M</button>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold">1Y</button>
                    </div>
                </div>
                <div className="flex items-end justify-between gap-4 h-64">
                    {analyticsData.revenueData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-xl relative group" 
                                 style={{ height: `${(parseFloat(data.revenue) / maxRevenue) * 100}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-green-500 to-green-400 rounded-t-xl"></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ₹{(parseFloat(data.revenue) / 1000).toFixed(0)}K
                                </div>
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{data.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Orders by Occasion & Top Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders by Occasion */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Orders by Occasion</h2>
                    <div className="space-y-4">
                        {analyticsData.occasionStats.map((occasion, index) => {
                            const colorMap = ['blue', 'pink', 'purple', 'green', 'orange'];
                            const color = colorMap[index % colorMap.length];
                            return (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{occasion.name}</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{occasion.orders} orders</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${getColorClass(color)} rounded-full transition-all duration-500`}
                                        style={{ width: `${occasion.percentage}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{occasion.percentage}% of total</span>
                                    <span className="text-xs font-bold text-green-600">₹{(occasion.revenue / 1000).toFixed(0)}K</span>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Customers</h2>
                        <Award className="text-yellow-500" size={24} />
                    </div>
                    <div className="space-y-4">
                        {analyticsData.topCustomers.map((customer, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                            {customer.avatar}
                                        </div>
                                        {index === 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                                                👑
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{customer.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{customer.orders} orders</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">₹{(customer.spent / 1000).toFixed(0)}K</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Meals */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Most Popular Meal Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analyticsData.popularMeals.map((meal, index) => (
                        <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                    #{index + 1}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{meal.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{meal.orders} orders</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">₹{(meal.revenue / 1000).toFixed(0)}K</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">revenue</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Peak Order Times */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar size={32} />
                    <div>
                        <h2 className="text-xl font-bold">Peak Order Times</h2>
                        <p className="text-sm text-purple-100 mt-1">Busiest days and times for orders</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-sm text-purple-100 mb-2">Busiest Day</p>
                        <p className="text-2xl font-bold">Saturday</p>
                        <p className="text-sm text-purple-100 mt-1">245 orders/week</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-sm text-purple-100 mb-2">Peak Hours</p>
                        <p className="text-2xl font-bold">12 PM - 2 PM</p>
                        <p className="text-sm text-purple-100 mt-1">35% of daily orders</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-sm text-purple-100 mb-2">Advance Booking</p>
                        <p className="text-2xl font-bold">7 Days</p>
                        <p className="text-sm text-purple-100 mt-1">Average lead time</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
