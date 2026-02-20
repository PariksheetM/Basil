# PHP Backend Setup Instructions

## Prerequisites
1. **XAMPP** or **WAMP** installed (includes Apache, PHP, and MySQL)
2. **MySQL Workbench** (already installed)

## Database Setup

### Step 1: Start MySQL and Apache
1. Open XAMPP/WAMP Control Panel
2. Start **Apache** server
3. Start **MySQL** server

### Step 2: Create Database Using MySQL Workbench
1. Open **MySQL Workbench**
2. Connect to your local MySQL server (usually `localhost:3306`, username: `root`, password: ``)
3. Click on **File > Open SQL Script**
4. Navigate to `backend/database/schema.sql` and open it
5. Click the **Execute** button (lightning bolt icon) to run the script
6. This will create:
   - Database: `food_ordering_db`
   - Tables: `users`, `user_sessions`, `orders`

### Alternative: Import via phpMyAdmin
1. Open browser and go to `http://localhost/phpmyadmin`
2. Click on **Import** tab
3. Choose the `schema.sql` file
4. Click **Go** button

## Backend Configuration

### Step 3: Configure Environment Variables
1. A `.env` file has been created at `backend/.env`
2. Update these settings if your MySQL configuration is different:
   ```env
   DB_HOST=localhost              # MySQL host
   DB_NAME=food_ordering_db      # Database name
   DB_USER=root                  # MySQL username
   DB_PASS=                      # MySQL password (empty by default)
   
   CORS_ORIGIN=http://localhost:5173  # Frontend URL
   SESSION_EXPIRY_HOURS=24            # Session expiration time
   ```
3. The database connection automatically loads from `.env` file
4. **Note**: `.env.example` is also provided as a template

### Step 4: Place Backend Files
1. Copy the entire `backend` folder to your XAMPP/WAMP htdocs directory
   - **XAMPP**: `C:\xampp\htdocs\Prototype\backend\`
   - **WAMP**: `C:\wamp64\www\Prototype\backend\`

### Step 5: Test Backend API
Open your browser and test these URLs:
- `http://localhost/Prototype/backend/api/signup.php` (should show error for empty data)
- `http://localhost/Prototype/backend/api/login.php` (should show error for empty data)

## Frontend Configuration

### Step 6: Update API Base URL (if needed)
1. Open `src/services/authService.js`
2. If your backend path is different, update the `API_BASE_URL`:
   ```javascript
   const API_BASE_URL = 'http://localhost/Prototype/backend/api';
   ```

### Step 7: Install Frontend Dependencies
```bash
npm install
```

### Step 8: Run Frontend Development Server
```bash
npm run dev
```

## Testing the Application

### Test Signup:
1. Open `http://localhost:5173/signup`
2. Fill in the form:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: 123456
3. Click "Create Account"
4. You should see success message and redirect to login

### Test Login:
1. Open `http://localhost:5173/`
2. Enter credentials:
   - Email: john@example.com
   - Password: 123456
3. Click "Login"
4. You should be redirected to the home page

### Test Protected Routes:
1. Try accessing `http://localhost:5173/home` without logging in
2. You should be redirected to login page
3. After logging in, you can access all protected pages

### Test Logout:
To implement logout, you can add this to any component:
```javascript
import AuthService from '../services/authService';

const handleLogout = async () => {
    await AuthService.logout();
    navigate('/');
};
```

## Troubleshooting

### CORS Issues:
If you get CORS errors, make sure:
1. Apache is running
2. The backend files are in the correct htdocs folder
3. The API_BASE_URL in `authService.js` matches your backend location

### Database Connection Issues:
1. Check MySQL is running in XAMPP/WAMP
2. Verify database credentials in `database.php`
3. Ensure `food_ordering_db` database exists

### Session Not Working:
1. Clear browser localStorage
2. Check browser console for errors
3. Verify API responses in Network tab

## API Endpoints

### Authentication APIs:
- **POST** `/api/signup.php` - Register new user
- **POST** `/api/login.php` - Login and get session token
- **GET** `/api/verify_session.php` - Verify session validity
- **POST** `/api/logout.php` - Logout and invalidate session

### Menu APIs:
- **GET** `/api/menu.php` - Get all menu categories and items

### Cart APIs (All require authentication):
- **GET** `/api/cart.php` - Get current user's cart
- **POST** `/api/cart.php` - Add item to cart
- **PUT** `/api/cart_item.php?id={id}` - Update cart item (quantity, customizations) ✏️ **Makes orders editable!**
- **DELETE** `/api/cart_item.php?id={id}` - Remove item from cart

### Order APIs:
- **POST** `/api/checkout.php` - Place order (convert cart to order)
- **GET** `/api/orders.php` - Get user's order history

📖 **See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed API documentation with request/response examples.**

## Database Schema

### users table
- `id` - Auto increment primary key
- `full_name` - User's full name
- `email` - User's email (unique)
- `password` - Hashed password
- `phone` - Phone number
- `address` - Address
- `created_at` - Timestamp
- `updated_at` - Timestamp

### user_sessions table
- `id` - Auto increment primary key
- `user_id` - Foreign key to users table
- `session_token` - Unique session token
-

### menu_categories table
- `id` - Auto increment primary key
- `name` - Category name (Meal Box, Snack Box, Bowls, Buffet)
- `description` - Category description
- `image_url` - Category image
- `display_order` - Display order
- `is_active` - Active status

### menu_items table
- `id` - Auto increment primary key
- `category_id` - Foreign key to menu_categories
- `name` - Item name
- `description` - Item description
- `price` - Item price
- `image_url` - Item image
- `is_available` - Availability status
- `is_vegetarian` - Vegetarian flag
- `is_vegan` - Vegan flag
- `spice_level` - Spice level (none/mild/medium/hot/extra_hot)
- `calories` - Calorie count
- `preparation_time` - Time in minutes
- `display_order` - Display order

### orders table
- `id` - Auto increment primary key
- `user_id` - Foreign key to users table
- `order_number` - Unique order number
- `total_amount` - Order total (includes tax)
- `subtotal` - Subtotal before tax
- `tax_amount` - Tax amount (5%)
- `delivery_fee` - Delivery fee
- `discount_amount` - Discount applied
- `status` - Order status (cart/pending/confirmed/preparing/ready/delivering/delivered/cancelled)
- `payment_status` - Payment status (pending/paid/failed/refunded)
- `payment_method` - Payment method
- `delivery_address` - Delivery address
- `delivery_phone` - Delivery phone
- `delivery_instructions` - Special delivery instructions
- `notes` - Order notes
- `estimated_delivery_time` - Estimated delivery time
- `created_at` - Timestamp
- `updated_at` - Timestamp

### order_items table (Editable Items!)
- `id` - Auto increment primary key
- `order_id` - Foreign key to orders table
- `menu_item_id` - Foreign key to menu_items table
- `quantity` - Item quantity (can be updated)
- `unit_price` - Price per unit
- `total_price` - Total price for quantity
- `customizations` - JSON field for customizations (editable)
- `special_instructions` - Special instructions (editable)
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Security Features Implemented

1. **Password Hashing**: Passwords are hashed using bcrypt
2. **Session Tokens**: 64-character random tokens for authentication
3. **Session Expiration**: Sessions expire after 24 hours
4. **SQL Injection Protection**: Using PDO prepared statements
5. **CORS Configuration**: Configured for localhost development
6. **Input Validation**: Email format, password length validation

## Next Steps

You can extend this backend by adding:
1. Password reset functionality
2. Email verification
3. Order management endpoints
4. ✨ Features Implemented

### ✅ Complete Order Management System
- Users can add items to cart
- **Items are fully editable** - change quantity, customizations, instructions
- Items can be removed from cart
- Cart persists across sessions
- Real-time cart total calculation with tax
- Complete order history

### ✅ Menu Management
- 4 categories pre-loaded (Meal Box, Snack Box, Bowls, Buffet)
- 15+ sample menu items included
- Vegetarian/Vegan flags
- Spice level indicators
- Calorie information
- Price management

### ✅ Frontend Integration
- **OrderService** - Complete API service layer
- **CartContext** - React Context for global cart state
- **ProtectedRoute** - Route protection component
- All pages can now be connected to backend!

## 📚 Documentation Files Created

1. **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Complete setup instructions
2. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Detailed API documentation with examples
3. **[backend/.env](backend/.env)** - Environment configuration
4. **[backend/.env.example](backend/.env.example)** - Environment template

## 🎯 Next Steps - Integrating with Your Pages

Now you can integrate the backend with your frontend pages:

### Example: MealBoxPage with Cart
```javascript
import { useCart } from '../contexts/CartContext';
import OrderService from '../services/orderService';

const MealBoxPage = () => {
    const { addToCart, cartCount } = useCart();
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        const loadMenu = async () => {
            const result = await OrderService.getMenu();
            if (result.success) {
                const mealBoxCategory = result.data.find(cat => cat.name === 'Meal Box');
                setMenuItems(mealBoxCategory.items);
            }
        };
        loadMenu();
    }, []);

    const handleAddToCart = async (itemId) => {
        await addToCart(itemId, 1);
        alert('Added to cart!');
    };

    return (
        <div>
            <h1>Meal Box - Cart ({cartCount})</h1>
            {menuItems.map(item => (
                <div key={item.id}>
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                    <button onClick={() => handleAddToCart(item.id)}>
                        Add to Cart
                    </button>
                </div>
            ))}
        </div>
    );
};
```

### Example: Editable Cart Page
```javascript
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
    const { cart, updateCartItem, removeFromCart } = useCart();

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        await updateCartItem(itemId, newQuantity);
    };

    const handleRemove = async (itemId) => {
        await removeFromCart(itemId);
    };

    return (
        <div>
            <h1>Your Cart (Fully Editable!)</h1>
            {cart?.items?.map(item => (
                <div key={item.id}>
                    <h3>{item.item_name}</h3>
                    <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                    />
                    <button onClick={() => handleRemove(item.id)}>Remove</button>
                </div>
            ))}
            <p>Total: ₹{cart?.total_amount}</p>
        </div>
    );
};
```

## 🚀 You Can Now:
1. ✅ Add items to cart from any page
2. ✅ Edit order quantities on any page
3. ✅ Modify customizations and instructions
4. ✅ Remove items from cart
5. ✅ View cart across all pages (using CartContext)
6. ✅ Place orders with delivery details
7. ✅ View order history
8. ✅ All with secure authentication!