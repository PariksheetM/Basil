import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { imgUrl } from '../utils/imgUrl.js';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function NavCartButton() {
    const navigate = useNavigate();
    const { cart, cartCount, removeFromCart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Cart Icon Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#154212] text-white text-sm font-semibold hover:bg-[#1d5a18] transition-all shadow-sm"
            >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#904b33] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                        {cartCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-[380px] bg-white rounded-2xl shadow-[0_20px_60px_-12px_rgba(28,28,25,0.15)] border border-[#c2c9bb]/20 z-[100] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#c2c9bb]/15">
                        <h3 className="text-sm font-bold text-[#154212]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Your Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                        </h3>
                        <button type="button" onClick={() => setIsOpen(false)} className="text-[#42493e]/50 hover:text-[#42493e] transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    {cart.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <ShoppingBag className="w-10 h-10 text-[#c2c9bb] mx-auto mb-3" />
                            <p className="text-sm font-semibold text-[#42493e]">Your cart is empty</p>
                            <p className="text-xs text-[#42493e]/60 mt-1">Customize a meal and add it here</p>
                        </div>
                    ) : (
                        <div className="max-h-[320px] overflow-y-auto">
                            {cart.map((item) => (
                                <div key={item.id} className="px-5 py-3.5 border-b border-[#c2c9bb]/10 hover:bg-[#f6f3ee]/50 transition-colors">
                                    <div className="flex gap-3">
                                        <div
                                            className="w-14 h-14 rounded-xl bg-cover bg-center shrink-0 ring-1 ring-[#c2c9bb]/20"
                                            style={{ backgroundImage: `url(${imgUrl(item.image)})` }}
                                        ></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm font-bold text-[#1c1c19] truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>{item.name}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-[#42493e]/30 hover:text-rose-500 transition-colors shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#42493e]/50">{item.guestCount} guests</span>
                                                {item.type && item.type !== 'both' && (
                                                    <span className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${item.type === 'veg' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                        {item.type}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-[#154212] mt-1">{formatCurrency(item.totalPrice)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="px-5 py-4 bg-[#f6f3ee] border-t border-[#c2c9bb]/15">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-[#42493e]/60 uppercase tracking-wider">Estimated Total</span>
                                <span className="text-lg font-extrabold text-[#154212]" style={{ fontFamily: 'Manrope, sans-serif' }}>{formatCurrency(cartTotal)}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/checkout', {
                                        state: {
                                            from: 'cart',
                                            orderSummary: {
                                                total: cartTotal,
                                                items: cart,
                                            },
                                        },
                                    });
                                }}
                                className="w-full bg-[#904b33] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#783922] transition-all uppercase tracking-wider shadow-md"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
