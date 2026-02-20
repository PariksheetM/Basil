import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/authService';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!AuthService.isLoggedIn()) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            const result = await AuthService.verifySession();
            setIsAuthenticated(result.success);
            setIsLoading(false);

            if (!result.success) {
                AuthService.logout();
            }
        };

        checkAuth();
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

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
