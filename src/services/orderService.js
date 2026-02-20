const API_BASE_URL = 'http://localhost:8000/api';

class OrderService {
    static getAuthHeader() {
        const token = localStorage.getItem('session_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // Get all menu items
    static async getMenu() {
        try {
            const response = await fetch(`${API_BASE_URL}/menu.php`, {
                method: 'GET'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get menu error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    // Get current cart
    static async getCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart.php`, {
                method: 'GET',
                headers: this.getAuthHeader()
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get cart error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    // Add item to cart
    static async addToCart(menuItemId, quantity, customizations = null, specialInstructions = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart.php`, {
                method: 'POST',
                headers: this.getAuthHeader(),
                body: JSON.stringify({
                    menu_item_id: menuItemId,
                    quantity: quantity,
                    customizations: customizations,
                    special_instructions: specialInstructions
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Add to cart error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    // Update cart item
    static async updateCartItem(orderItemId, quantity = null, customizations = null, specialInstructions = null) {
        try {
            const body = {};
            if (quantity !== null) body.quantity = quantity;
            if (customizations !== null) body.customizations = customizations;
            if (specialInstructions !== null) body.special_instructions = specialInstructions;

            const response = await fetch(`${API_BASE_URL}/cart_item.php?id=${orderItemId}`, {
                method: 'PUT',
                headers: this.getAuthHeader(),
                body: JSON.stringify(body)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update cart item error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    // Remove item from cart
    static async removeFromCart(orderItemId) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart_item.php?id=${orderItemId}`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Remove from cart error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    // Checkout - place order
    static async checkout(deliveryAddress, deliveryPhone, deliveryInstructions, paymentMethod) {
        try {
            const response = await fetch(`${API_BASE_URL}/checkout.php`, {
                method: 'POST',
                headers: this.getAuthHeader(),
                body: JSON.stringify({
                    delivery_address: deliveryAddress,
                    delivery_phone: deliveryPhone,
                    delivery_instructions: deliveryInstructions,
                    payment_method: paymentMethod
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Checkout error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    // Get user's orders
    static async getOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'GET',
                headers: this.getAuthHeader()
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get orders error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }

    // Get cart item count
    static async getCartCount() {
        const cart = await this.getCart();
        if (cart.success && cart.data && cart.data.items) {
            return cart.data.items.reduce((total, item) => total + parseInt(item.quantity), 0);
        }
        return 0;
    }

    // Calculate cart total
    static calculateCartTotal(items) {
        if (!items || items.length === 0) return 0;
        return items.reduce((total, item) => total + parseFloat(item.total_price), 0);
    }
}

export default OrderService;
