import React from 'react';
import { Link } from 'react-router-dom';

const BrandLogo = ({
    to = '/home',
    className = '',
    imgClassName = 'h-9 w-auto',
    labelClassName = 'text-xl font-bold tracking-tight text-slate-900',
    showWordmark = false,
    highlightText = '',
}) => {
    return (
        <Link to={to} aria-label="Catalyst" className={`flex items-center gap-3 ${className}`}>
            <img src="/logo.webp" alt="Catalyst" className={`${imgClassName} object-contain`} />
            <span className="sr-only">Catalyst</span>
            {showWordmark && (
                <span className={labelClassName}>
                    Catalyst
                    {highlightText && <span className="text-[#f27f0d]">{highlightText}</span>}
                </span>
            )}
        </Link>
    );
};

export default BrandLogo;
