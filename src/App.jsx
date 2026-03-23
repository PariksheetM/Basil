import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
            <BrowserRouter basename="/fooddash">
                <Routes>
                    {/* Redirect root to home � no login required */}
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/select-city" element={<CitySelectionPage />} />
                    <Route path="/select-occasion" element={<OccasionSelectionPage />} />
                    <Route path="/occasion-menu" element={<OccasionMenuPage />} />
                    <Route path="/meal-box" element={<MealBoxPage />} />
                    <Route path="/snack-box" element={<SnackBoxPage />} />
                    <Route path="/bowls" element={<BowlPage />} />
                    <Route path="/buffet" element={<BuffetPage />} />
                    <Route path="/customize-meal" element={<CustomizeMealPage />} />
                    <Route path="/order-details" element={<OrderDetailsPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/account" element={<AccountPage />} />

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