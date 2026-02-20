import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!AuthService.isLoggedIn()) {
            return;
        }

        const redirectToNextStep = () => {
            if (typeof window !== 'undefined') {
                const hasCity = Boolean(window.localStorage.getItem('selectedCity'));
                const hasOccasion = Boolean(
                    window.localStorage.getItem('selectedOccasionKey') || window.localStorage.getItem('selectedOccasion')
                );

                if (!hasCity) {
                    navigate('/select-city');
                    return;
                }

                if (!hasOccasion) {
                    navigate('/select-occasion');
                    return;
                }
            }

            navigate('/home');
        };

        redirectToNextStep();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await AuthService.login(email, password);
        
        setIsLoading(false);

        if (result.success) {
            if (typeof window !== 'undefined') {
                const hasCity = Boolean(window.localStorage.getItem('selectedCity'));
                const hasOccasion = Boolean(
                    window.localStorage.getItem('selectedOccasionKey') || window.localStorage.getItem('selectedOccasion')
                );

                if (!hasCity) {
                    navigate('/select-city');
                    return;
                }

                if (!hasOccasion) {
                    navigate('/select-occasion');
                    return;
                }
            }

            navigate('/home');
        } else {
            setError(result.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
            style={{ backgroundImage: "url('/bg-restaurant.png')" }}
        >
            {/* Overlay for better readability if needed/requested, but design shows clearness. 
          The provided bg is already blurred. We can add a slight dark/light overlay if contrast is low.
          Let's add a very subtle white/black overlay if necessary, but design card is white on light blur.
      */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>

            <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-8 md:p-10 animate-fade-in-up">
                {/* Header Icon */}
                <div className="flex justify-center mb-6">
                    <img src="/logo.webp" alt="Logo" className="h-9 w-30" />
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">Welcome Back</h2>
                    <p className="text-xs text-gray-500 text-sm">Please enter your details to sign in</p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <a href="#" className="text-sm font-medium text-gray-500 hover:text-green-600 transition-colors">
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                        <span className="bg-white px-4 text-gray-400">Or continue with</span>
                    </div>
                </div>

                {/* Google Button */}
                <button
                    type="button"
                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </button>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
