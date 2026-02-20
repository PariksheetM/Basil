import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Truck, CreditCard, CheckCircle2, Lock, Receipt, ChevronDown, ChevronUp, AlertCircle, Plus, Minus, Trash2, Users, Leaf, Drumstick, Edit3, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart: contextCart, removeFromCart, updateCartItem } = useCart();

    // State for editable cart
    const [cartItems, setCartItems] = useState([]);
    const [deliveryAddress, setDeliveryAddress] = useState('123 Corporate Blvd, Suite 400');
    const [selectedDate, setSelectedDate] = useState('Feb 10, 2026');
    const [selectedTime, setSelectedTime] = useState('1:30 PM');
    const [contactPerson, setContactPerson] = useState('Sarah Jenkins');
    const [editingAddress, setEditingAddress] = useState(false);

    // Load cart items on mount
    useEffect(() => {
        if (contextCart && contextCart.length > 0) {
            setCartItems(contextCart.map(item => ({
                ...item,
                editableGuestCount: item.guestCount || item.quantity || 1
            })));
        }
    }, [contextCart]);

    const deliveryFee = 50.00;
    const taxRate = 0.05; // 5% GST
    
    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const basePrice = item.price || 0;
            const guestCount = item.editableGuestCount || item.guestCount || item.quantity || 1;
            const customizationCost = item.customizations?.addedItems?.reduce((sum, added) => sum + (added.price || 0), 0) || 0;
            return total + ((basePrice + customizationCost) * guestCount);
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + deliveryFee + taxAmount;

    // Update guest count for an item
    const updateGuestCount = (itemId, newCount) => {
        if (newCount < 1) return;
        setCartItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, editableGuestCount: newCount } : item
        ));
    };

    // Remove item from cart
    const handleRemoveItem = (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        removeFromCart(itemId);
    };

    // Calculate price for individual item
    const calculateItemPrice = (item) => {
        const basePrice = item.price || 0;
        const guestCount = item.editableGuestCount || item.guestCount || item.quantity || 1;
        const customizationCost = item.customizations?.addedItems?.reduce((sum, added) => sum + (added.price || 0), 0) || 0;
        return (basePrice + customizationCost) * guestCount;
    };

    // Accordion State
    const [expandedItem, setExpandedItem] = useState(null);

    const toggleItemExpansion = (itemId) => {
        setExpandedItem(expandedItem === itemId ? null : itemId);
    };

    // Success State
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

    const handlePayment = () => {
        setIsPaymentSuccess(true);
        setTimeout(() => {
            navigate('/home');
        }, 2500);
    };

    if (isPaymentSuccess) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-fade-in px-4 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-scale-up">
                    <CheckCircle2 size={48} className="text-green-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Your order has been placed successfully. A confirmation email has been sent to you.</p>
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400 mt-4">Redirecting to home...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <header className="max-w-7xl mx-auto px-4 py-3 flex items-center relative justify-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 absolute left-4">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
                </header>
            </div>

            <div className="max-w-7xl mx-auto p-4 space-y-6 md:grid md:grid-cols-12 md:gap-8 md:space-y-0 md:items-start">

                {/* Left Column: Forms & Menu Summary */}
                <div className="md:col-span-8 space-y-6">

                    {/* Menu Summary (Only for Buffet) */}
                    {isBuffet && (
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-red-700">Menu Summary</h2>
                            </div>

                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-3 mb-6">
                                <AlertCircle className="text-red-500 shrink-0" size={20} />
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Quantities are <span className="font-bold text-gray-800">auto-calculated</span> based on your guest count ({guestCount}).
                                    You can adjust them manually if needed.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <AccordionItem
                                    title="Starter"
                                    items={getAllItems('sides').filter(i => !i.name.includes('Rice') && !i.name.includes('Bread'))} // Mock categorization
                                    categoryKey="starters"
                                />
                                <AccordionItem
                                    title="Main Course"
                                    items={getAllItems('mains')}
                                    categoryKey="mains"
                                />
                                <AccordionItem
                                    title="Bread, Rice & Noodles"
                                    items={getAllItems('sides').filter(i => i.name.includes('Rice') || i.name.includes('Bread') || i.name.includes('Noodles'))}
                                    categoryKey="rice_bread"
                                />
                                <AccordionItem
                                    title="Dessert"
                                    items={getAllItems('drinks')} // Using drinks as placeholder for desserts
                                    categoryKey="dessert"
                                />
                            </div>
                        </div>
                    )}

                    {/* Delivery Details */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <TruckIcon className="text-gray-400" size={20} />
                            <h2 className="font-bold text-gray-900">Delivery Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">DELIVERY ADDRESS</label>
                                <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between border border-gray-100">
                                    <span className="text-sm font-medium text-gray-700">{location.state?.deliveryAddress || "123 Corporate Blvd, Suite 400"}</span>
                                    <MapPin size={16} className="text-gray-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">DATE</label>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm font-medium text-gray-700">
                                        {selectedDate || 'Select Date'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">TIME</label>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm font-medium text-gray-700">
                                        {selectedTime || 'Select Time'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">CONTACT PERSON</label>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm font-medium text-gray-700">
                                    Sarah Jenkins (Office Manager)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CreditCard className="text-gray-400" size={20} />
                                <h2 className="font-bold text-gray-900">Payment Method</h2>
                            </div>
                            <button className="text-green-600 text-xs font-bold hover:text-green-700">Edit</button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center">
                                    <span className="text-white text-[8px] font-bold">VISA</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Visa Corporate</p>
                                    <p className="text-xs text-gray-500">Ending in •••• 4242</p>
                                </div>
                            </div>
                            <CheckCircle2 className="text-green-500 fill-green-100" size={24} />
                        </div>
                    </div>

                    {/* Promo Code */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">PROMO CODE</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter code"
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500"
                            />
                            <button className="bg-gray-900 text-white px-6 rounded-xl text-sm font-bold hover:bg-black transition-colors">
                                Apply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Payment Summary (Sticky on Desktop) */}
                <div className="md:col-span-4 md:sticky md:top-24">
                    {/* Order Summary */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Receipt className="text-gray-400" size={20} />
                            <h2 className="font-bold text-gray-900">Ordering For</h2>
                        </div>

                        <div className="flex gap-4 mb-6 pb-6 border-b border-dashed border-gray-200">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={boxImage} className="w-full h-full object-cover" alt="Meal Box" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{boxName}</h3>
                                <p className="text-xs text-gray-500 mb-2">Buffet Setup</p>
                                <div className="flex justify-between items-center">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">Guests: {guestCount || 1}</span>
                                    <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <span>Delivery Fee</span>
                                    <div className="w-3 h-3 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[8px] font-bold">i</div>
                                </div>
                                <span className="font-medium text-gray-900">₹{deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax (8%)</span>
                                <span className="font-medium text-gray-900">₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-2">
                                <span className="font-bold text-lg text-gray-900">Total</span>
                                <span className="font-bold text-xl text-gray-900">₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        className="hidden md:flex w-full mt-4 bg-green-500 text-white py-4 rounded-xl font-bold text-base hover:bg-green-600 transition-colors shadow-lg shadow-green-200 items-center justify-center gap-2"
                    >
                        Confirm and Pay <span className="opacity-50">|</span> ₹{totalAmount.toFixed(2)}
                    </button>
                    <div className="hidden md:flex justify-center items-center gap-1 mt-3 text-xs text-gray-400">
                        <Lock size={10} />
                        <span>Secure SSL encrypted transaction</span>
                    </div>

                </div>
            </div>

            {/* Bottom Bar (Mobile Only) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-50 md:hidden">
                <button
                    onClick={handlePayment}
                    className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-base hover:bg-green-600 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                    Confirm and Pay <span className="opacity-50">|</span> ₹{totalAmount.toFixed(2)}
                </button>
                <div className="flex justify-center items-center gap-1 mt-3 text-xs text-gray-400">
                    <Lock size={10} />
                    <span>Secure SSL encrypted transaction</span>
                </div>
            </div>

        </div>
    );
};

// Helper Icon since lucide-react Truck might be different than the image icon
const TruckIcon = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
);

export default CheckoutPage;
