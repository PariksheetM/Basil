import React, { createContext, useContext, useState, useEffect } from 'react';
import OrderService from '../services/orderService';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('occasionCart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);
                const count = parsedCart.reduce((total, item) => total + item.quantity, 0);
                setCartCount(count);
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                setCart([]);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (cart && cart.length >= 0) {
            localStorage.setItem('occasionCart', JSON.stringify(cart));
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
        }
    }, [cart]);

    const refreshCart = async () => {
        // For backend integration (traditional menu items)
        setLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            if (token) {
                const result = await OrderService.getCart();
                if (result.success) {
                    // Backend cart logic
                    console.log('Backend cart loaded:', result.data);
                }
            }
        } catch (error) {
            console.error('Error refreshing cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        // Frontend-only cart for occasion menus
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
            
            if (existingItemIndex > -1) {
                // Update quantity if item exists
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += item.quantity || 1;
                updatedCart[existingItemIndex].totalPrice = updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].guestCount;
                return updatedCart;
            } else {
                // Add new item
                return [...prevCart, item];
            }
        });
        return { success: true };
    };

    const updateCartItem = (itemId, updates) => {
        setCart(prevCart => 
            prevCart.map(item => 
                item.id === itemId ? { ...item, ...updates } : item
            )
        );
        return { success: true };
    };

    const removeFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
        return { success: true };
    };

    const clearCart = () => {
        setCart([]);
        setCartCount(0);
        localStorage.removeItem('occasionCart');
    };

    const value = {
        cart,
        cartCount,
        loading,
        refreshCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
