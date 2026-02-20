# 📋 Integration Checklist

## Setup Phase
- [ ] XAMPP/WAMP installed and Apache + MySQL running
- [ ] Database created using `schema.sql` in MySQL Workbench
- [ ] Backend folder copied to `htdocs/Prototype/backend/`
- [ ] `.env` file configured (if password needed)
- [ ] Frontend runs successfully (`npm run dev`)
- [ ] Can access `http://localhost:5173`

## Backend Testing
- [ ] Can access `http://localhost/Prototype/backend/api/menu.php`
- [ ] Signup works - creates user in database
- [ ] Login works - returns session token
- [ ] Session verification works
- [ ] Can view users in MySQL Workbench
- [ ] Sample menu data loaded (15+ items)

## Frontend Integration - Pages to Update

### HomePage.jsx
- [ ] Add "Browse Menu" section
- [ ] Show cart count in header/nav
- [ ] Add logout button using `AuthService.logout()`
- [ ] Display user name using `AuthService.getUserData()`

### MealBoxPage.jsx
- [ ] Load meal box items using `OrderService.getMenu()`
- [ ] Display items with prices
- [ ] Add "Add to Cart" button for each item
- [ ] Show success message on add
- [ ] Display cart count

### SnackBoxPage.jsx
- [ ] Load snack box items using `OrderService.getMenu()`
- [ ] Display items with prices
- [ ] Add "Add to Cart" button for each item
- [ ] Show success message on add
- [ ] Display cart count

### BowlPage.jsx
- [ ] Load bowls items using `OrderService.getMenu()`
- [ ] Display items with prices
- [ ] Add "Add to Cart" button for each item
- [ ] Show success message on add
- [ ] Display cart count

### BuffetPage.jsx
- [ ] Load buffet items using `OrderService.getMenu()`
- [ ] Display items with prices
- [ ] Add "Add to Cart" button for each item
- [ ] Show success message on add
- [ ] Display cart count

### CustomizeMealPage.jsx
- [ ] Load cart using `useCart()`
- [ ] Display cart items
- [ ] Add quantity input (editable)
- [ ] Add customization options (editable)
- [ ] Add special instructions field (editable)
- [ ] Implement "Update Item" using `updateCartItem()`
- [ ] Add "Remove Item" button using `removeFromCart()`
- [ ] Show real-time total

### OrderDetailsPage.jsx
- [ ] Load cart using `useCart()`
- [ ] Display all items in cart
- [ ] Show quantity for each item (editable)
- [ ] Implement quantity update using `updateCartItem()`
- [ ] Add remove button using `removeFromCart()`
- [ ] Show subtotal, tax, total
- [ ] Add "Proceed to Checkout" button

### CheckoutPage.jsx
- [ ] Load cart summary using `useCart()`
- [ ] Add delivery address input
- [ ] Add phone number input
- [ ] Add delivery instructions textarea
- [ ] Add payment method selector
- [ ] Implement checkout using `OrderService.checkout()`
- [ ] Show loading state during checkout
- [ ] Redirect to orders page on success
- [ ] Clear cart after successful order

### OrdersPage.jsx
- [ ] Load orders using `OrderService.getOrders()`
- [ ] Display order list with details
- [ ] Show order number, date, status
- [ ] Display items in each order
- [ ] Show order total
- [ ] Add filters (all/pending/delivered)
- [ ] Add order status badges

### AccountPage.jsx
- [ ] Display user info using `AuthService.getUserData()`
- [ ] Show full name
- [ ] Show email
- [ ] Add logout button using `AuthService.logout()`
- [ ] Redirect to login on logout

## Navigation Component (if you have one)
- [ ] Add cart icon with count from `useCart()`
- [ ] Display user name
- [ ] Add logout option
- [ ] Highlight active page

## CartContext Integration
- [ ] Verify CartProvider wraps entire app (in App.jsx) ✅
- [ ] Import `useCart` in components that need cart
- [ ] Use `cartCount` for displaying cart badge
- [ ] Use `addToCart()` when adding items
- [ ] Use `updateCartItem()` for editing
- [ ] Use `removeFromCart()` for deleting
- [ ] Use `refreshCart()` if manual refresh needed

## Features to Test

### Authentication
- [ ] User can sign up with valid email
- [ ] User gets error for existing email
- [ ] User gets error for weak password
- [ ] User can login with credentials
- [ ] User stays logged in on page refresh
- [ ] User redirected to login when accessing protected page
- [ ] User can logout successfully
- [ ] Session expires after 24 hours

### Menu Browsing
- [ ] All categories load correctly
- [ ] All items display with details
- [ ] Prices show correctly
- [ ] Vegetarian/vegan indicators work
- [ ] Images load (or placeholders show)

### Cart Operations
- [ ] Can add item to cart
- [ ] Cart count updates after adding
- [ ] Can add multiple items
- [ ] Can add same item multiple times
- [ ] Cart persists on page refresh
- [ ] Cart persists after logout/login

### Editing Cart (⭐ KEY FEATURE)
- [ ] Can change item quantity
- [ ] Quantity change updates total
- [ ] Can add/edit customizations
- [ ] Can add/edit special instructions
- [ ] Changes reflect immediately
- [ ] Total recalculates correctly
- [ ] Can remove item from cart
- [ ] Cart updates after removal

### Checkout
- [ ] Can enter delivery address
- [ ] Can enter phone number
- [ ] Can add delivery instructions
- [ ] Can select payment method
- [ ] Can place order successfully
- [ ] Cart clears after checkout
- [ ] Redirects to orders page

### Order History
- [ ] Past orders display
- [ ] Order details are complete
- [ ] Order status shows correctly
- [ ] Can view items in each order
- [ ] Order totals are accurate

## Error Handling
- [ ] Network errors show user-friendly message
- [ ] Authentication errors redirect to login
- [ ] Form validation works
- [ ] Loading states show during API calls
- [ ] Success messages show after actions
- [ ] Error messages are clear and helpful

## UI/UX Enhancements
- [ ] Loading spinners during API calls
- [ ] Success notifications (toast/alert)
- [ ] Error notifications (toast/alert)
- [ ] Disable buttons during loading
- [ ] Confirm before removing item
- [ ] Empty states for empty cart
- [ ] Empty states for no orders
- [ ] Smooth transitions/animations

## Performance
- [ ] API calls don't duplicate
- [ ] Cart refreshes only when needed
- [ ] Menu loads once and caches
- [ ] Images are optimized
- [ ] No console errors
- [ ] No console warnings

## Security
- [ ] Session token stored securely
- [ ] Protected routes work correctly
- [ ] Users can't access other users' data
- [ ] Session expires properly
- [ ] Logout clears all data

## Database Verification
- [ ] New users appear in `users` table
- [ ] Sessions appear in `user_sessions` table
- [ ] Orders appear in `orders` table
- [ ] Order items appear in `order_items` table
- [ ] Cart items have status='cart'
- [ ] Placed orders have status='pending'

## Code Quality
- [ ] No unused imports
- [ ] Console.logs removed (except errors)
- [ ] Code is properly formatted
- [ ] Variable names are clear
- [ ] Functions have clear purposes
- [ ] Comments added where needed

## Documentation
- [ ] README updated with setup instructions
- [ ] API documentation is accurate
- [ ] Code comments are helpful
- [ ] Team members can understand code

## Final Testing Scenarios

### Scenario 1: New User Journey
1. [ ] Sign up as new user
2. [ ] Login with credentials
3. [ ] Browse menu items
4. [ ] Add 3 different items to cart
5. [ ] Edit quantity of one item
6. [ ] Add customization to another item
7. [ ] Remove one item
8. [ ] Proceed to checkout
9. [ ] Enter delivery details
10. [ ] Place order
11. [ ] View order in order history

### Scenario 2: Edit Cart Extensively
1. [ ] Login
2. [ ] Add item to cart
3. [ ] Change quantity from 1 to 3
4. [ ] Add customization (spice level)
5. [ ] Add special instructions
6. [ ] Verify total updates
7. [ ] Change quantity to 1
8. [ ] Remove customization
9. [ ] Clear instructions
10. [ ] Remove item

### Scenario 3: Multiple Sessions
1. [ ] Login on browser 1
2. [ ] Add items to cart
3. [ ] Login on browser 2 (same user)
4. [ ] Verify cart shows same items
5. [ ] Edit item on browser 1
6. [ ] Refresh browser 2
7. [ ] Verify changes sync

### Scenario 4: Session Expiry
1. [ ] Login
2. [ ] Wait 24+ hours (or manually delete session)
3. [ ] Try to access protected page
4. [ ] Verify redirect to login

## Production Readiness (Future)
- [ ] Environment variables for production
- [ ] Database credentials secured
- [ ] CORS configured for production domain
- [ ] Error logging implemented
- [ ] API rate limiting considered
- [ ] Database backups scheduled
- [ ] SSL certificate installed
- [ ] Production domain configured

---

## Quick Integration Code Snippets

### Add to Any Page Header:
```javascript
import { useCart } from '../contexts/CartContext';

function MyPage() {
    const { cartCount } = useCart();
    
    return (
        <nav>
            <span>Cart ({cartCount})</span>
        </nav>
    );
}
```

### Add to Menu Pages:
```javascript
import { useCart } from '../contexts/CartContext';
import OrderService from '../services/orderService';

function MenuPage() {
    const { addToCart } = useCart();
    const [items, setItems] = useState([]);

    useEffect(() => {
        OrderService.getMenu().then(result => {
            if (result.success) {
                setItems(result.data[0].items); // First category
            }
        });
    }, []);

    const handleAdd = async (itemId) => {
        const result = await addToCart(itemId, 1);
        if (result.success) {
            alert('Added to cart!');
        }
    };

    return (
        <div>
            {items.map(item => (
                <div key={item.id}>
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                    <button onClick={() => handleAdd(item.id)}>
                        Add to Cart
                    </button>
                </div>
            ))}
        </div>
    );
}
```

### Add to Cart Page (Editable):
```javascript
import { useCart } from '../contexts/CartContext';

function CartPage() {
    const { cart, updateCartItem, removeFromCart } = useCart();

    const handleQuantityChange = async (itemId, newQty) => {
        await updateCartItem(itemId, parseInt(newQty));
    };

    const handleRemove = async (itemId) => {
        if (confirm('Remove this item?')) {
            await removeFromCart(itemId);
        }
    };

    return (
        <div>
            {cart?.items?.map(item => (
                <div key={item.id}>
                    <h3>{item.item_name}</h3>
                    <input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                    <p>₹{item.total_price}</p>
                    <button onClick={() => handleRemove(item.id)}>Remove</button>
                </div>
            ))}
            <p>Total: ₹{cart?.total_amount}</p>
        </div>
    );
}
```

---

✅ Once all checkboxes are checked, your integration is complete!
