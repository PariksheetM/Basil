# Food Ordering System - Backend API Documentation

## 📦 Overview

Complete backend implementation with PHP and MySQL including:
- User authentication with sessions
- Menu management system
- Shopping cart functionality
- Order management with editable items
- Secure API endpoints

---

## 🗄️ Database Schema

### Tables Created:
1. **users** - User accounts
2. **user_sessions** - Active user sessions
3. **menu_categories** - Food categories (Meal Box, Snack Box, Bowls, Buffet)
4. **menu_items** - Individual menu items with prices
5. **orders** - Customer orders
6. **order_items** - Items in each order (editable)

---

## 🔐 Environment Configuration

### `.env` File
Created at `backend/.env` with database credentials:

```env
DB_HOST=localhost
DB_NAME=food_ordering_db
DB_USER=root
DB_PASS=

CORS_ORIGIN=http://localhost:5173
SESSION_EXPIRY_HOURS=24
```

**Note:** The `.env` file is automatically loaded by the database configuration.

---

## 🚀 API Endpoints

### Authentication APIs

#### 1. **POST** `/api/signup.php`
Register a new user.

**Request:**
```json
{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "User registered successfully."
}
```

---

#### 2. **POST** `/api/login.php`
Login and get session token.

**Request:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful.",
    "data": {
        "user_id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "session_token": "abc123..."
    }
}
```

---

#### 3. **GET** `/api/verify_session.php`
Verify if session is valid.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response:**
```json
{
    "success": true,
    "message": "Session valid.",
    "data": {
        "user_id": 1,
        "full_name": "John Doe",
        "email": "john@example.com"
    }
}
```

---

#### 4. **POST** `/api/logout.php`
Logout and invalidate session.

**Headers:**
```
Authorization: Bearer {session_token}
```

---

### Menu APIs

#### 5. **GET** `/api/menu.php`
Get all menu categories and items.

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Meal Box",
            "description": "Complete meal boxes",
            "items": [
                {
                    "id": 1,
                    "name": "Classic Meal Box",
                    "description": "Rice, Dal, Vegetables...",
                    "price": "150.00",
                    "is_vegetarian": true,
                    "spice_level": "mild",
                    "calories": 650
                }
            ]
        }
    ]
}
```

---

### Cart APIs (All require authentication)

#### 6. **GET** `/api/cart.php`
Get current user's cart.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "order_number": "ORD20260204-1234",
        "total_amount": "315.00",
        "subtotal": "300.00",
        "tax_amount": "15.00",
        "status": "cart",
        "items": [
            {
                "id": 1,
                "menu_item_id": 1,
                "quantity": 2,
                "unit_price": "150.00",
                "total_price": "300.00",
                "item_name": "Classic Meal Box"
            }
        ]
    }
}
```

---

#### 7. **POST** `/api/cart.php`
Add item to cart.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Request:**
```json
{
    "menu_item_id": 1,
    "quantity": 2,
    "customizations": {
        "spice_level": "mild",
        "extra_items": ["extra_rice"]
    },
    "special_instructions": "No onions please"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Item added to cart.",
    "order_id": 1
}
```

---

#### 8. **PUT** `/api/cart_item.php?id={order_item_id}`
Update quantity or customizations of a cart item (Makes items editable!).

**Headers:**
```
Authorization: Bearer {session_token}
```

**Request (Update quantity):**
```json
{
    "quantity": 3
}
```

**Request (Update customizations):**
```json
{
    "customizations": {
        "spice_level": "hot"
    },
    "special_instructions": "Extra spicy"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Order item updated successfully."
}
```

---

#### 9. **DELETE** `/api/cart_item.php?id={order_item_id}`
Remove item from cart.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response:**
```json
{
    "success": true,
    "message": "Item removed from cart."
}
```

---

### Order APIs

#### 10. **POST** `/api/checkout.php`
Place order (convert cart to order).

**Headers:**
```
Authorization: Bearer {session_token}
```

**Request:**
```json
{
    "delivery_address": "123 Main St, City",
    "delivery_phone": "1234567890",
    "delivery_instructions": "Ring doorbell",
    "payment_method": "cash_on_delivery"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Order placed successfully.",
    "order_id": 1
}
```

---

#### 11. **GET** `/api/orders.php`
Get user's order history.

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "order_number": "ORD20260204-1234",
            "total_amount": "315.00",
            "status": "pending",
            "payment_status": "pending",
            "created_at": "2026-02-04 10:30:00",
            "item_count": 2,
            "items": [...]
        }
    ]
}
```

---

## 🎨 Frontend Integration

### Services Created:

#### 1. **AuthService** (`src/services/authService.js`)
Handles user authentication:
- `signup(fullName, email, password)`
- `login(email, password)`
- `verifySession()`
- `logout()`
- `isLoggedIn()`
- `getUserData()`

#### 2. **OrderService** (`src/services/orderService.js`)
Handles orders and cart:
- `getMenu()` - Get all menu items
- `getCart()` - Get current cart
- `addToCart(menuItemId, quantity, customizations, specialInstructions)`
- `updateCartItem(orderItemId, quantity, customizations, specialInstructions)` - **Makes orders editable!**
- `removeFromCart(orderItemId)`
- `checkout(deliveryAddress, deliveryPhone, deliveryInstructions, paymentMethod)`
- `getOrders()` - Get order history
- `getCartCount()` - Get total items in cart

#### 3. **CartContext** (`src/contexts/CartContext.jsx`)
React Context for global cart state:
- `cart` - Current cart data
- `cartCount` - Total items in cart
- `refreshCart()` - Reload cart from server
- `addToCart()` - Add item to cart
- `updateCartItem()` - Update cart item
- `removeFromCart()` - Remove item from cart
- `clearCart()` - Clear local cart state

---

## 💡 Usage Examples

### Adding Item to Cart:
```javascript
import { useCart } from '../contexts/CartContext';

const MyComponent = () => {
    const { addToCart, cartCount } = useCart();

    const handleAddToCart = async () => {
        const result = await addToCart(1, 2, null, "Extra spicy");
        if (result.success) {
            alert('Added to cart!');
        }
    };

    return (
        <div>
            <button onClick={handleAddToCart}>Add to Cart</button>
            <span>Cart: {cartCount} items</span>
        </div>
    );
};
```

### Updating Cart Item (Making it Editable):
```javascript
import { useCart } from '../contexts/CartContext';

const CartItem = ({ item }) => {
    const { updateCartItem } = useCart();

    const handleUpdateQuantity = async (newQuantity) => {
        const result = await updateCartItem(item.id, newQuantity);
        if (result.success) {
            alert('Quantity updated!');
        }
    };

    const handleUpdateCustomization = async () => {
        const result = await updateCartItem(
            item.id, 
            null, 
            { spice_level: 'hot' },
            'Make it extra spicy'
        );
        if (result.success) {
            alert('Customization updated!');
        }
    };

    return (
        <div>
            <h3>{item.item_name}</h3>
            <input 
                type="number" 
                value={item.quantity}
                onChange={(e) => handleUpdateQuantity(e.target.value)}
            />
            <button onClick={handleUpdateCustomization}>
                Edit Customization
            </button>
        </div>
    );
};
```

### Getting Menu Items:
```javascript
import OrderService from '../services/orderService';

const MenuPage = () => {
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        const loadMenu = async () => {
            const result = await OrderService.getMenu();
            if (result.success) {
                setMenu(result.data);
            }
        };
        loadMenu();
    }, []);

    return (
        <div>
            {menu.map(category => (
                <div key={category.id}>
                    <h2>{category.name}</h2>
                    {category.items.map(item => (
                        <div key={item.id}>
                            <h3>{item.name}</h3>
                            <p>₹{item.price}</p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
```

---

## ✅ Features Implemented

### ✨ Editable Orders
- ✅ Update item quantities in cart
- ✅ Modify customizations after adding
- ✅ Change special instructions
- ✅ Remove items from cart
- ✅ Cart persists across sessions
- ✅ Real-time cart total calculation

### 🔒 Security Features
- ✅ Password hashing with bcrypt
- ✅ Session-based authentication
- ✅ SQL injection protection
- ✅ CORS configuration
- ✅ Protected API endpoints
- ✅ Session expiration (24 hours)

### 📊 Database Features
- ✅ Complete menu management
- ✅ Order tracking system
- ✅ User management
- ✅ Order history
- ✅ Sample menu data included

---

## 🛠️ Setup Instructions

1. **Start XAMPP/WAMP** - Apache + MySQL
2. **Import Database** - Run `backend/database/schema.sql` in MySQL Workbench
3. **Configure .env** - Update database credentials if needed
4. **Copy Backend** - Place `backend` folder in `htdocs/Prototype/`
5. **Run Frontend** - `npm run dev`

---

## 📝 Testing Checklist

- [ ] User signup works
- [ ] User login works
- [ ] Session authentication works
- [ ] Can view menu items
- [ ] Can add items to cart
- [ ] Can update cart item quantity (Editable!)
- [ ] Can update cart item customizations (Editable!)
- [ ] Can remove items from cart
- [ ] Cart persists on page refresh
- [ ] Can place order
- [ ] Can view order history
- [ ] Protected routes work (redirect to login)

---

## 🎯 Next Steps

You can now integrate these services into your existing pages:
- Use `OrderService.getMenu()` in MealBoxPage, SnackBoxPage, etc.
- Use `useCart()` hook to show cart count in navigation
- Use `updateCartItem()` to make orders editable on any page
- Use `OrderService.getOrders()` in OrdersPage
- Use `OrderService.checkout()` in CheckoutPage

All orders are fully editable until checkout! 🎉
