# 🚀 Quick Start Guide

## Setup in 5 Minutes!

### 1️⃣ Start XAMPP/WAMP
- Open XAMPP/WAMP Control Panel
- Start **Apache**
- Start **MySQL**

### 2️⃣ Create Database
**Option A: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to localhost (root, no password)
3. File → Open SQL Script
4. Open `backend/database/schema.sql`
5. Click Execute (⚡ icon)
6. Database created with sample menu items! ✅

**Option B: Using phpMyAdmin**
1. Go to `http://localhost/phpmyadmin`
2. Click Import
3. Upload `backend/database/schema.sql`
4. Click Go

### 3️⃣ Copy Backend Files
Copy the `backend` folder to:
- **XAMPP**: `C:\xampp\htdocs\Prototype\backend\`
- **WAMP**: `C:\wamp64\www\Prototype\backend\`

### 4️⃣ Configure .env (Optional)
If your MySQL password is NOT empty:
1. Open `backend/.env`
2. Update `DB_PASS=your_password`

### 5️⃣ Start Frontend
```bash
npm run dev
```

### 6️⃣ Test It!
1. Open `http://localhost:5173`
2. Click "Sign up"
3. Create account (john@example.com / 123456)
4. Login
5. Browse menu items
6. Add to cart
7. Edit your order! ✏️

---

## 🎉 You're Done!

### What You Can Do Now:
✅ User signup/login  
✅ Browse 15+ menu items across 4 categories  
✅ Add items to cart  
✅ **Edit cart items** (quantity, customizations, instructions)  
✅ Remove items from cart  
✅ Place orders  
✅ View order history  
✅ Secure authentication with sessions  

---

## 📁 Project Structure

```
Prototype/
├── backend/
│   ├── .env                    # Database configuration
│   ├── .env.example           # Configuration template
│   ├── .htaccess              # CORS settings
│   ├── config/
│   │   └── database.php       # DB connection with .env loader
│   ├── api/
│   │   ├── signup.php         # User registration
│   │   ├── login.php          # User login
│   │   ├── logout.php         # User logout
│   │   ├── verify_session.php # Session verification
│   │   ├── menu.php           # Get menu items
│   │   ├── cart.php           # Get/Add to cart
│   │   ├── cart_item.php      # Update/Delete cart items (EDITABLE!)
│   │   ├── checkout.php       # Place order
│   │   └── orders.php         # Order history
│   └── database/
│       ├── schema.sql         # Database schema + sample data
│       └── test_queries.sql   # Useful SQL queries
├── src/
│   ├── services/
│   │   ├── authService.js     # Authentication API calls
│   │   └── orderService.js    # Order & cart API calls
│   ├── contexts/
│   │   └── CartContext.jsx    # Global cart state
│   └── components/
│       ├── ProtectedRoute.jsx # Route protection
│       ├── LoginPage.jsx      # Updated with backend
│       ├── SignupPage.jsx     # Updated with backend
│       └── ...all your pages
├── BACKEND_SETUP.md           # Detailed setup guide
├── API_DOCUMENTATION.md       # Complete API docs
└── QUICKSTART.md             # This file!
```

---

## 🔧 Common Issues & Solutions

### ❌ "npm install" not working
**Solution:** Run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ API returns 404
**Check:**
- Is Apache running?
- Backend folder in correct location?
- URL: `http://localhost/Prototype/backend/api/menu.php`

### ❌ Cannot connect to database
**Check:**
- Is MySQL running?
- Database `food_ordering_db` exists?
- Credentials in `.env` are correct

### ❌ CORS errors
**Check:**
- `.htaccess` file exists in backend folder
- Apache mod_headers is enabled
- CORS_ORIGIN in `.env` matches frontend URL

### ❌ Session expired immediately
**Check:**
- System date/time is correct
- SESSION_EXPIRY_HOURS in `.env`

---

## 🧪 Testing with Sample Data

The database comes with sample menu items:

**Meal Box (4 items)**
- Classic Meal Box - ₹150
- Deluxe Meal Box - ₹200
- Non-Veg Meal Box - ₹250
- Premium Meal Box - ₹300

**Snack Box (4 items)**
- Samosa Box - ₹80
- Spring Roll Box - ₹100
- Pakora Mix - ₹90
- Chicken Wings - ₹180

**Bowls (4 items)**
- Veg Fried Rice Bowl - ₹120
- Chicken Fried Rice Bowl - ₹160
- Paneer Tikka Bowl - ₹140
- Noodle Bowl - ₹130

**Buffet (3 items)**
- Veg Buffet - ₹350
- Non-Veg Buffet - ₹450
- Premium Buffet - ₹600

---

## 📖 Documentation

- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Complete setup instructions
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - All API endpoints with examples

---

## 🎯 Next: Integrate Your Pages

Use the examples in [API_DOCUMENTATION.md](API_DOCUMENTATION.md) to:
1. Load menu items in your pages
2. Add cart functionality
3. Make orders editable
4. Display order history

All the backend is ready - just connect your UI! 🚀
