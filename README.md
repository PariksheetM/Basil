# 🍽️ Food Ordering System - Complete Backend Implementation

A complete PHP + MySQL backend with React frontend integration for a food ordering platform with **fully editable cart functionality**.

---

## ⚡ Quick Start

```bash
# 1. Start XAMPP/WAMP (Apache + MySQL)
# 2. Import database
#    MySQL Workbench → Open backend/database/schema.sql → Execute

# 3. Copy backend to htdocs
#    Copy backend folder to: C:\xampp\htdocs\Prototype\backend\

# 4. Start frontend
npm run dev

# 5. Open browser
#    http://localhost:5173
```

**📖 Detailed Guide:** [QUICKSTART.md](QUICKSTART.md)

---

## 🎯 What's Included

### ✅ Complete Backend (PHP + MySQL)
- 11 REST API endpoints
- 6 database tables with relationships
- Secure authentication with sessions
- Environment configuration (.env)
- Sample data (15+ menu items)

### ✅ Frontend Integration (React)
- AuthService - Complete authentication
- OrderService - Cart & order management
- CartContext - Global state management
- ProtectedRoute - Route protection
- Updated Login/Signup pages

### ✅ Key Features
- **Fully Editable Cart** - Change quantity, customizations, instructions ✏️
- Secure session-based authentication 🔒
- Protected routes - No unauthorized access 🛡️
- Real-time cart synchronization 🔄
- Order history tracking 📊
- Menu management system 📋

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | 5-minute setup guide |
| **[BACKEND_SETUP.md](BACKEND_SETUP.md)** | Detailed setup instructions |
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | Complete API reference with examples |
| **[INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md)** | Step-by-step integration guide |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | What was built and why |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture diagrams |

---

## 🗄️ Database Schema

```sql
users               -- User accounts
user_sessions       -- Active sessions (24hr expiry)
menu_categories     -- 4 categories (Meal Box, Snack Box, Bowls, Buffet)
menu_items          -- 15+ items with prices, dietary info
orders              -- Customer orders with delivery details
order_items         -- Editable cart items (quantity, customizations, instructions)
```

**Sample Data:** 15+ menu items from ₹80 to ₹600

---

## 🔌 API Endpoints

### Authentication
- `POST /api/signup.php` - Register user
- `POST /api/login.php` - Login & get session token
- `GET /api/verify_session.php` - Verify session
- `POST /api/logout.php` - Logout

### Menu
- `GET /api/menu.php` - Get all menu items

### Cart (Requires Auth)
- `GET /api/cart.php` - View cart
- `POST /api/cart.php` - Add to cart
- `PUT /api/cart_item.php?id={id}` - **Edit cart item** ✏️
- `DELETE /api/cart_item.php?id={id}` - Remove from cart

### Orders (Requires Auth)
- `POST /api/checkout.php` - Place order
- `GET /api/orders.php` - Order history

**📖 Full Documentation:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 💻 Frontend Usage

### Setup
```javascript
// App.jsx already wrapped with CartProvider ✅
import { CartProvider } from './contexts/CartContext';

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                {/* Your routes */}
            </BrowserRouter>
        </CartProvider>
    );
}
```

### Add to Cart
```javascript
import { useCart } from '../contexts/CartContext';

function MenuPage() {
    const { addToCart, cartCount } = useCart();

    const handleAdd = async (itemId) => {
        await addToCart(itemId, 1);
        alert('Added to cart!');
    };

    return (
        <div>
            <span>Cart: {cartCount}</span>
            <button onClick={() => handleAdd(1)}>Add Item</button>
        </div>
    );
}
```

### Edit Cart (⭐ Key Feature)
```javascript
import { useCart } from '../contexts/CartContext';

function CartPage() {
    const { cart, updateCartItem, removeFromCart } = useCart();

    const handleUpdate = async (itemId, newQty) => {
        await updateCartItem(itemId, newQty);
    };

    const handleEditCustomization = async (itemId) => {
        await updateCartItem(itemId, null, { spice_level: 'hot' }, 'Extra spicy');
    };

    return (
        <div>
            {cart?.items?.map(item => (
                <div key={item.id}>
                    <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdate(item.id, e.target.value)}
                    />
                    <button onClick={() => handleEditCustomization(item.id)}>
                        Edit
                    </button>
                    <button onClick={() => removeFromCart(item.id)}>
                        Remove
                    </button>
                </div>
            ))}
            <p>Total: ₹{cart?.total_amount}</p>
        </div>
    );
}
```

### Place Order
```javascript
import OrderService from '../services/orderService';

async function handleCheckout() {
    const result = await OrderService.checkout(
        '123 Main St',          // address
        '1234567890',           // phone
        'Ring doorbell',        // instructions
        'cash_on_delivery'      // payment method
    );
    
    if (result.success) {
        alert('Order placed!');
        navigate('/orders');
    }
}
```

---

## 🎨 What Makes Orders Editable

Users can modify their cart items **before checkout**:

### ✏️ Change Quantity
```javascript
await updateCartItem(itemId, 3); // Change to 3 items
```

### ✏️ Update Customizations
```javascript
await updateCartItem(itemId, null, { 
    spice_level: 'hot',
    size: 'large' 
});
```

### ✏️ Modify Instructions
```javascript
await updateCartItem(itemId, null, null, 'No onions please');
```

### ✏️ All Together
```javascript
await updateCartItem(itemId, 2, { spice: 'medium' }, 'Extra rice');
```

---

## 🔐 Security Features

- ✅ Bcrypt password hashing
- ✅ Session token authentication (24hr expiry)
- ✅ SQL injection protection (PDO prepared statements)
- ✅ CORS configuration
- ✅ Input validation
- ✅ Protected API endpoints

---

## 📊 Sample Menu Data

| Category | Items | Price Range |
|----------|-------|-------------|
| **Meal Box** | 4 items | ₹150 - ₹300 |
| **Snack Box** | 4 items | ₹80 - ₹180 |
| **Bowls** | 4 items | ₹120 - ₹160 |
| **Buffet** | 3 items | ₹350 - ₹600 |

Each item includes:
- Price, description, image URL
- Vegetarian/vegan indicators
- Spice level (none/mild/medium/hot/extra hot)
- Calorie information

---

## 🛠️ Tech Stack

**Backend:**
- PHP 7.4+
- MySQL 8.0+
- Apache (via XAMPP/WAMP)

**Frontend:**
- React 18
- React Router
- Context API

**Development:**
- MySQL Workbench
- VS Code
- Vite

---

## 📁 Project Structure

```
Prototype/
├── backend/
│   ├── .env                    # Database credentials
│   ├── config/
│   │   └── database.php       # DB connection
│   ├── api/                   # 11 API endpoints
│   └── database/
│       └── schema.sql         # DB schema + sample data
│
├── src/
│   ├── services/
│   │   ├── authService.js     # Auth API calls
│   │   └── orderService.js    # Order API calls
│   ├── contexts/
│   │   └── CartContext.jsx    # Global cart state
│   └── components/
│       ├── ProtectedRoute.jsx
│       ├── LoginPage.jsx
│       └── SignupPage.jsx
│
├── QUICKSTART.md
├── BACKEND_SETUP.md
├── API_DOCUMENTATION.md
├── INTEGRATION_CHECKLIST.md
├── IMPLEMENTATION_SUMMARY.md
├── ARCHITECTURE.md
└── README.md (this file)
```

---

## 🚀 Integration Steps

1. ✅ Setup backend (5 minutes)
2. ✅ Test APIs (2 minutes)
3. 🔄 Integrate pages (see [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md))
4. ✅ Test features
5. 🎉 Deploy!

---

## 🧪 Testing

### Test User Flow:
1. Sign up → john@example.com / 123456
2. Login with credentials
3. Browse menu items
4. Add 3 items to cart
5. Edit quantity of one item ✏️
6. Edit customizations ✏️
7. Remove one item
8. Checkout with delivery details
9. View order history

### Test in MySQL Workbench:
```sql
-- View all users
SELECT * FROM users;

-- View active carts
SELECT * FROM orders WHERE status = 'cart';

-- View cart items
SELECT * FROM order_items WHERE order_id = 1;
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| API 404 | Check backend folder location |
| CORS error | Verify .htaccess exists |
| DB connection error | Check .env credentials |
| Session expired | Check system time, re-login |
| npm install fails | Run execution policy command |

**Full Troubleshooting:** [QUICKSTART.md](QUICKSTART.md#-common-issues--solutions)

---

## 📞 Documentation Quick Links

- 🚀 **[QUICKSTART.md](QUICKSTART.md)** - Start here! 5-minute setup
- 📖 **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - All API endpoints
- ✅ **[INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md)** - Integration guide
- 📊 **[ARCHITECTURE.md](ARCHITECTURE.md)** - System diagrams

---

## ✨ Features Highlight

### ⭐ Fully Editable Cart
Unlike most systems where items are locked once added, this system allows users to:
- Change quantities at any time
- Modify customizations (spice level, size, etc.)
- Update special instructions
- Remove items easily

### 🔄 Real-time Synchronization
- Cart updates instantly across all pages
- Total recalculates automatically
- Changes persist in database

### 🔒 Secure Authentication
- Session-based authentication
- 24-hour token expiry
- Protected routes
- Secure password storage

---

## 🎓 Learning Resources

The codebase includes extensive examples for:
- REST API design
- Database relationships
- React Context API
- Session management
- CRUD operations

---

## 🎉 Ready to Use!

Everything is set up and ready. Just:
1. Follow [QUICKSTART.md](QUICKSTART.md) for setup
2. Use [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md) to connect your pages
3. Refer to [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details

**All backend is complete - just connect your UI!** 🚀

---

## 📄 License

This is a prototype/educational project.

---

## 🙏 Support

- 📖 Check documentation files for detailed help
- 🐛 Issues? See TROUBLESHOOTING sections
- 💡 Need examples? See API_DOCUMENTATION.md

---

**Built with ❤️ - Complete backend ready for your food ordering app!**
