import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/HomePage';
import MealBoxPage from './components/MealBoxPage';
import SnackBoxPage from './components/SnackBoxPage';
import CustomizeMealPage from './components/CustomizeMealPage';
import OrderDetailsPage from './components/OrderDetailsPage';
import CheckoutPage from './components/CheckoutPage';
import OccasionMenuPage from './components/OccasionMenuPage';
import CitySelectionPage from './components/CitySelectionPage';
import OccasionSelectionPage from './components/OccasionSelectionPage';
import BowlPage from './components/BowlPage';
import BuffetPage from './components/BuffetPage';
import OrdersPage from './components/OrdersPage';
import AccountPage from './components/AccountPage';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './contexts/CartContext';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminOrders from './components/admin/AdminOrders';
import AdminMealPlans from './components/admin/AdminMealPlans';
import AdminCustomers from './components/admin/AdminCustomers';
import AdminAnalytics from './components/admin/AdminAnalytics';
import AdminOccasions from './components/admin/AdminOccasions';
import AdminLogin from './components/admin/AdminLogin';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                    <Route path="/select-city" element={<ProtectedRoute><CitySelectionPage /></ProtectedRoute>} />
                    <Route path="/select-occasion" element={<ProtectedRoute><OccasionSelectionPage /></ProtectedRoute>} />
                    <Route path="/occasion-menu" element={<ProtectedRoute><OccasionMenuPage /></ProtectedRoute>} />
                    <Route path="/meal-box" element={<ProtectedRoute><MealBoxPage /></ProtectedRoute>} />
                    <Route path="/snack-box" element={<ProtectedRoute><SnackBoxPage /></ProtectedRoute>} />
                    <Route path="/bowls" element={<ProtectedRoute><BowlPage /></ProtectedRoute>} />
                    <Route path="/buffet" element={<ProtectedRoute><BuffetPage /></ProtectedRoute>} />
                    <Route path="/customize-meal" element={<ProtectedRoute><CustomizeMealPage /></ProtectedRoute>} />
                    <Route path="/order-details" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                    <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="meal-plans" element={<AdminMealPlans />} />
                        <Route path="occasions" element={<AdminOccasions />} />
                        <Route path="customers" element={<AdminCustomers />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;
