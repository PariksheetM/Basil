import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import NavCartButton from './NavCartButton';
import AuthService from '../services/authService';
import './MainNavbar.css';

const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'About', path: '/home' },
    { label: 'Event', path: '/select-occasion' },
    { label: 'CustomMenu', path: '/custom-event' },
];

const MainNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = AuthService.isLoggedIn();

    return (
        <header className="main-navbar">
            <div className="main-navbar-inner">
                <div className="main-navbar-left">
                    <BrandLogo labelClassName="brandmark-label" imgClassName="brandmark-image" />
                    <nav className="main-navbar-links" aria-label="Primary">
                        {navItems.map((item) => {
                            const isActive = item.path === '/home'
                                ? location.pathname === '/home'
                                : location.pathname === item.path;

                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => navigate(item.path)}
                                    className={`main-navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
                <div className="main-navbar-actions">
                    {isLoggedIn ? (
                        <NavCartButton />
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate('/login', { state: { redirectAfterLogin: location.pathname } })}
                            className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#154212] text-white text-sm font-semibold hover:bg-[#1d5a18] transition-all shadow-sm"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default MainNavbar;
