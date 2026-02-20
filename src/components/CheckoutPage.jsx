import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    ChevronRight,
    Clock,
    CreditCard,
    Download,
    Info,
    Lock,
    Mail,
    MapPin,
    Minus,
    Phone,
    Plus,
    Receipt,
    ShieldCheck,
    Trash2,
    Truck,
    User,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import BrandLogo from './BrandLogo';
const MEAL_FALLBACK_IMG = 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80';

const PAYMENT_METHODS = [
    { id: 'card', label: 'Corporate Card', hint: 'Visa •••• 4242', icon: CreditCard },
    { id: 'netbanking', label: 'Netbanking', hint: 'Instant confirmation', icon: Building2 },
    { id: 'upi', label: 'UPI Autopay', hint: 'Monthly invoicing', icon: ShieldCheck },
];

const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart: contextCart, updateCartItem, removeFromCart, clearCart } = useCart();

    const [cartItems, setCartItems] = useState([]);
    const [contactInfo, setContactInfo] = useState({
        name: 'Sarah Jenkins',
        phone: '+91 98765 43210',
        email: 'sarah.jenkins@globex.com',
    });
    const [eventDetails, setEventDetails] = useState({
        date: '2026-02-10',
        timeSlot: '13:30',
        venue: 'Globex Tower, Embassy TechVillage, Bengaluru',
        notes: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [specialRequests, setSpecialRequests] = useState('');

    useEffect(() => {
        if (contextCart?.length) {
            setCartItems(
                contextCart.map((item) => ({
                    ...item,
                    editableGuestCount: item.guestCount || item.quantity || 1,
                }))
            );
        } else {
            setCartItems([]);
        }
    }, [contextCart]);

    useEffect(() => {
        if (location.state?.orderSummary) {
            const { guestCount, date, time, venue } = location.state.orderSummary;
            if (guestCount) {
                setCartItems((prev) =>
                    prev.map((item) => ({
                        ...item,
                        editableGuestCount: guestCount,
                    }))
                );
            }
            setEventDetails((prev) => ({
                ...prev,
                date: date || prev.date,
                timeSlot: time || prev.timeSlot,
                venue: venue || prev.venue,
            }));
        }
    }, [location.state?.orderSummary]);

    const totalGuests = useMemo(
        () =>
            cartItems.reduce(
                (total, item) => total + (item.editableGuestCount || item.guestCount || item.quantity || 0),
                0
            ),
        [cartItems]
    );

    const calculateItemPrice = (item) => {
        const basePrice = item.price || 0;
        const guestCount = item.editableGuestCount || item.guestCount || item.quantity || 1;
        const customizationCost =
            item.customizations?.addedItems?.reduce((sum, added) => sum + (added.price || 0), 0) || 0;
        return (basePrice + customizationCost) * guestCount;
    };

    const menuSubtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0),
        [cartItems]
    );
    const logisticsFee = useMemo(() => {
        if (!totalGuests) return 0;
        const base = 1800;
        const scaled = Math.ceil(totalGuests / 50) * 600;
        return base + scaled;
    }, [totalGuests]);

    const serviceRetainer = useMemo(() => Math.round(menuSubtotal * 0.03), [menuSubtotal]);

    const taxes = useMemo(
        () => Math.round((menuSubtotal + logisticsFee + serviceRetainer) * 0.05),
        [menuSubtotal, logisticsFee, serviceRetainer]
    );

    const grandTotal = menuSubtotal + logisticsFee + serviceRetainer + taxes;
    const perGuestEstimate = totalGuests ? Math.round(grandTotal / totalGuests) : grandTotal;

    const handleGuestAdjust = (itemId, delta) => {
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.id !== itemId) return item;
                const current = item.editableGuestCount || item.guestCount || item.quantity || 1;
                const next = Math.max(current + delta, 10);
                updateCartItem(item.id, { guestCount: next });
                return { ...item, editableGuestCount: next };
            })
        );
    };

    const handleGuestInput = (itemId, value) => {
        const parsed = Number(value);
        if (Number.isNaN(parsed) || parsed < 10) return;
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === itemId
                    ? (updateCartItem(item.id, { guestCount: parsed }), { ...item, editableGuestCount: parsed })
                    : item
            )
        );
    };

    const handleRemoveItem = (itemId) => {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
        removeFromCart(itemId);
    };

    const handleConfirmOrder = () => {
        const orderNumber = `FB-${Date.now().toString().slice(-6).toUpperCase()}`;
        const cartPayload = cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            guests: item.editableGuestCount || item.guestCount || item.quantity || 1,
            type: item.type,
            image: item.image,
            customizations: item.customizations,
            total: calculateItemPrice(item),
        }));

        const payload = {
            orderNumber,
            createdAt: new Date().toISOString(),
            contactInfo,
            eventDetails,
            guestCount: totalGuests,
            totals: {
                menuSubtotal,
                logisticsFee,
                serviceRetainer,
                taxes,
                grandTotal,
            },
            paymentMethod,
            specialRequests,
            items: cartPayload,
        };

        const token = localStorage.getItem('session_token');

        const postOrder = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/create_order.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...payload,
                        occasion: eventDetails?.occasion || 'Custom Event',
                        mealPlanName: cartItems[0]?.name || 'Meal Plan',
                        packageSelections: cartItems[0]?.customizations || null,
                        pricingSnapshot: {
                            perPlate: payload.totals.menuSubtotal / Math.max(1, totalGuests),
                            estimatedTotal: payload.totals.grandTotal,
                            guestCount: totalGuests,
                        },
                    }),
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message || 'Unable to place order');
                }

                clearCart();
                navigate('/order-details', {
                    state: {
                        confirmation: {
                            orderNumber: data.data?.order_number || orderNumber,
                            createdAt: payload.createdAt,
                            contactInfo,
                            eventDetails,
                            totalGuests,
                            totals: {
                                menuSubtotal,
                                logisticsFee,
                                serviceRetainer,
                                taxes,
                                grandTotal,
                            },
                            paymentMethod,
                            cartItems: cartPayload,
                        },
                    },
                });
            } catch (error) {
                console.error('Order submission failed:', error);
                navigate('/order-details', { state: { confirmation: payload } });
            }
        };

        postOrder();
    };

    return (
        <div className="min-h-screen bg-[#f6f3ee]">
            <header className="bg-white border-b border-[#e8e1d4] sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BrandLogo showWordmark={false} imgClassName="h-8 w-auto" />
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full border border-[#e8e1d4] flex items-center justify-center hover:border-[#f27f0d]/40 hover:text-[#f27f0d] transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-[#f27f0d] font-semibold">Secure checkout</p>
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Finalize your corporate banquet</h1>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
                        <ShieldCheck className="w-5 h-5 text-[#2f855a]" />
                        <span>Enterprise compliance & GST invoicing ready</span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-10">
                    <div className="space-y-6">
                        <section className="bg-white rounded-2xl shadow-sm border border-[#ede5d8] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Order overview</h2>
                                    <p className="text-sm text-gray-500">Review guest counts & menu inclusions</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/meal-box')}
                                    className="text-sm font-medium text-[#f27f0d] hover:text-[#d96f0a]"
                                >
                                    Modify selection
                                </button>
                            </div>
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <article
                                        key={item.id}
                                        className="border border-[#f1eadf] rounded-xl p-4 bg-[#fcfaf6] flex flex-col sm:flex-row sm:items-start gap-4"
                                    >
                                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#ede3d2] flex-shrink-0">
                                            <img
                                                src={item.image || MEAL_FALLBACK_IMG}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src = MEAL_FALLBACK_IMG;
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900 leading-tight">{item.name}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-medium text-gray-500">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#ecdccb]">
                                                            <User className="w-3.5 h-3.5" /> {item.editableGuestCount || item.guestCount} Guests
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#ecdccb]">
                                                            {item.type === 'veg' ? 'Vegetarian service' : item.type === 'non-veg' ? 'Non-vegetarian' : 'Dual preference'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="grid sm:grid-cols-[220px_minmax(0,1fr)] gap-4 sm:items-center">
                                                <div className="flex items-center bg-white border border-[#ecdccb] rounded-lg overflow-hidden">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGuestAdjust(item.id, -10)}
                                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#f27f0d]"
                                                        aria-label="Decrease guests"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={10}
                                                        value={item.editableGuestCount || 10}
                                                        onChange={(event) => handleGuestInput(item.id, event.target.value)}
                                                        className="w-full text-center text-sm font-semibold text-gray-900 focus:outline-none border-x border-[#ecdccb] bg-transparent"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGuestAdjust(item.id, 10)}
                                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#f27f0d]"
                                                        aria-label="Increase guests"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Estimated total</span>
                                                    <span className="text-base font-semibold text-gray-900">{formatCurrency(calculateItemPrice(item))}</span>
                                                </div>
                                            </div>

                                            {item.customizations?.selectedItems?.length ? (
                                                <details className="bg-white border border-[#ede3d2] rounded-lg">
                                                    <summary className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 cursor-pointer">
                                                        Selected menu ({item.customizations.selectedItems.length} items)
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    </summary>
                                                    <div className="px-3 pb-3 pt-1 grid sm:grid-cols-2 gap-2 text-xs text-gray-600">
                                                        {item.customizations.selectedItems.map((entry, index) => (
                                                            <span key={`${item.id}-selected-${index}`} className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#f27f0d]"></span>
                                                                {typeof entry === 'string' ? entry : entry.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </details>
                                            ) : null}
                                            {item.customizations?.addedItems?.length ? (
                                                <div className="bg-[#fff8ec] border border-[#f4d7ab] rounded-lg px-3 py-2 text-xs text-[#c86b08] font-semibold">
                                                    Premium add-ons:{' '}
                                                    {item.customizations.addedItems.map((addon) => addon.name).join(', ')}
                                                </div>
                                            ) : null}
                                        </div>
                                    </article>
                                ))}

                                {!cartItems.length && (
                                    <div className="text-center py-10 border border-dashed border-[#e6dbc7] rounded-2xl bg-white">
                                        <p className="text-sm text-gray-500 mb-4">Your banquet cart is empty.</p>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/meal-box')}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f27f0d] text-white text-sm font-semibold shadow-sm hover:bg-[#d96f0a]"
                                        >
                                            Plan a new menu
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-[#ede5d8] p-6 space-y-6">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold text-gray-900">Client point of contact</h2>
                                <p className="text-sm text-gray-500">Invoice and coordination updates will be shared here.</p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <label className="flex flex-col text-sm font-medium text-gray-700 space-y-2">
                                    Full name
                                    <div className="flex items-center gap-2 border border-[#ede5d8] rounded-lg px-3 py-2.5 bg-[#fdfbf8]">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={contactInfo.name}
                                            onChange={(event) => setContactInfo((prev) => ({ ...prev, name: event.target.value }))}
                                            className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800"
                                        />
                                    </div>
                                </label>
                                <label className="flex flex-col text-sm font-medium text-gray-700 space-y-2">
                                    Phone number
                                    <div className="flex items-center gap-2 border border-[#ede5d8] rounded-lg px-3 py-2.5 bg-[#fdfbf8]">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={contactInfo.phone}
                                            onChange={(event) => setContactInfo((prev) => ({ ...prev, phone: event.target.value }))}
                                            className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800"
                                        />
                                    </div>
                                </label>
                                <label className="flex flex-col text-sm font-medium text-gray-700 space-y-2">
                                    Work email
                                    <div className="flex items-center gap-2 border border-[#ede5d8] rounded-lg px-3 py-2.5 bg-[#fdfbf8]">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={contactInfo.email}
                                            onChange={(event) => setContactInfo((prev) => ({ ...prev, email: event.target.value }))}
                                            className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800"
                                        />
                                    </div>
                                </label>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-[#ede5d8] p-6 space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Event logistics</h2>
                                <p className="text-sm text-gray-500">We lock-in prep and dispatch windows around these details.</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <label className="flex flex-col text-sm font-medium text-gray-700 space-y-2">
                                    Service date
                                    <div className="flex items-center gap-2 border border-[#ede5d8] rounded-lg px-3 py-2.5 bg-[#fdfbf8]">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={eventDetails.date}
                                            onChange={(event) => setEventDetails((prev) => ({ ...prev, date: event.target.value }))}
                                            className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800"
                                        />
                                    </div>
                                </label>
                                <label className="flex flex-col text-sm font-medium text-gray-700 space-y-2">
                                    Dispatch window
                                    <div className="flex items-center gap-2 border border-[#ede5d8] rounded-lg px-3 py-2.5 bg-[#fdfbf8]">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="time"
                                            value={eventDetails.timeSlot}
                                            onChange={(event) => setEventDetails((prev) => ({ ...prev, timeSlot: event.target.value }))}
                                            className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800"
                                        />
                                    </div>
                                </label>
                            </div>
                            <label className="flex flex-col text-sm font-medium text-gray-700 space-y-2">
                                Venue address
                                <div className="flex items-start gap-2 border border-[#ede5d8] rounded-lg px-3 py-2.5 bg-[#fdfbf8]">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                    <textarea
                                        rows={2}
                                        value={eventDetails.venue}
                                        onChange={(event) => setEventDetails((prev) => ({ ...prev, venue: event.target.value }))}
                                        className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 resize-none"
                                        placeholder="Venue name, floor, landmark, parking instructions"
                                    />
                                </div>
                            </label>
                            <label className="flex flex-col text-sm font-medium text-gray-700 space-y-2">
                                Internal notes
                                <div className="flex items-start gap-2 border border-dashed border-[#e8ddcb] rounded-lg px-3 py-2.5 bg-[#fefbf5]">
                                    <AlertCircle className="w-4 h-4 text-[#f27f0d] mt-1" />
                                    <textarea
                                        rows={2}
                                        value={specialRequests}
                                        onChange={(event) => setSpecialRequests(event.target.value)}
                                        className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 resize-none"
                                        placeholder="e.g. Corporate branding on dessert station"
                                    />
                                </div>
                            </label>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-[#ede5d8] p-6 space-y-5">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Payment preference</h2>
                                <p className="text-sm text-gray-500">All invoices include GST and detailed consumption breakdown.</p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-3">
                                {PAYMENT_METHODS.map((method) => {
                                    const Icon = method.icon;
                                    const isActive = paymentMethod === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition ${
                                                isActive
                                                    ? 'border-[#f27f0d] bg-[#fff6ea] text-gray-900 shadow-sm'
                                                    : 'border-[#ede5d8] bg-white text-gray-600 hover:border-[#f27f0d]/40'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-[#f27f0d]' : 'text-gray-400'}`} />
                                            <span className="text-sm font-semibold">{method.label}</span>
                                            <span className="text-xs text-gray-500">{method.hint}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Download className="w-5 h-5 text-[#f27f0d]" />
                                <button type="button" className="font-semibold hover:text-[#f27f0d]">
                                    Download pro-forma quote
                                </button>
                            </div>
                            <button
                                type="button"
                                disabled={!cartItems.length}
                                onClick={handleConfirmOrder}
                                className="inline-flex items-center justify-center gap-2 px-10 py-3 rounded-full text-white font-semibold bg-[#f27f0d] hover:bg-[#d96f0a] shadow-lg shadow-[#f27f0d]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Confirm & generate invoice
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <section className="bg-white rounded-2xl shadow-md border border-[#ede5d8] p-6">
                            <header className="flex items-center justify-between pb-4 border-b border-[#f0e7d9]">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Investment summary</h2>
                                    <p className="text-xs text-gray-500">All values inclusive of chef manpower & serviceware.</p>
                                </div>
                                <Receipt className="w-5 h-5 text-[#f27f0d]" />
                            </header>
                            <div className="py-4 space-y-3 text-sm text-gray-600">
                                <div className="flex items-center justify-between">
                                    <span>Menu selection</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(menuSubtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Logistics & dispatch</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(logisticsFee)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Service retainer</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(serviceRetainer)}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-[#f0e7d9] pb-3">
                                    <span>Taxes & compliance (5%)</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(taxes)}</span>
                                </div>
                                <div className="flex items-center justify-between text-base font-semibold text-gray-900">
                                    <span>Total payable</span>
                                    <span>{formatCurrency(grandTotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Per guest estimate</span>
                                    <span>{formatCurrency(perGuestEstimate)}</span>
                                </div>
                            </div>
                            <div className="bg-[#fff6ea] border border-[#f4d7ab] rounded-xl p-3 text-xs text-[#b85e07] flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                30% deposit invoice raised instantly. Balance payable post-service based on actual covers.
                            </div>
                            <button
                                type="button"
                                disabled={!cartItems.length}
                                onClick={handleConfirmOrder}
                                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2f855a] text-white font-semibold py-3 shadow-lg shadow-emerald-100 hover:bg-[#256f49] disabled:opacity-60"
                            >
                                Confirm & pay deposit
                                <ShieldCheck className="w-5 h-5" />
                            </button>
                            <p className="mt-3 text-[11px] text-gray-400 text-center flex items-center justify-center gap-2">
                                <Lock className="w-3.5 h-3.5" /> SSL encrypted invoicing portal
                            </p>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-[#ede5d8] p-6 space-y-4 text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                                <Truck className="w-5 h-5 text-[#f27f0d]" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Day-of operations</h3>
                                    <p className="text-xs text-gray-500">Live updates from dispatch to service wrap-up.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-[#2f855a]" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Backup kitchens on call</h3>
                                    <p className="text-xs text-gray-500">Redundancy kitchens 15km radius for contingency.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-[#4b5563]" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">GST compliant invoices</h3>
                                    <p className="text-xs text-gray-500">Ref FB-GST-221 ready for finance uploads.</p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
