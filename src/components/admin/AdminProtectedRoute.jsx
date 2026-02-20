import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../../services/authService';

const AdminProtectedRoute = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            if (!AuthService.isLoggedIn()) {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }
            const result = await AuthService.verifySession();
            const role = result?.data?.role || 'user';
            setIsAuthorized(result.success && role === 'admin');
            setIsLoading(false);
            if (!result.success || role !== 'admin') {
                await AuthService.logout();
            }
        };
        check();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
