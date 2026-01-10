import React from 'react';

export const Icon = ({ icon, className = "", size = 20, strokeWidth = 1.5, ...props }) => {
    const icons = {
        trophy: (
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18m-10 5V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5m-10 0v5a2 1 0 0 0 2 2h6a2 1 0 0 0 2-2V9m-4 12v-3" />
        ),
        flame: (
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3.3-1.12.5-1.62 1.15-2.05.65.45.85.95.85 1.85ZM12 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
        ),
        target: (
            <>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
            </>
        ),
        zap: (
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        ),
        award: (
            <>
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </>
        ),
        check: (
            <polyline points="20 6 9 17 4 12" />
        ),
        chevronRight: (
            <path d="M9 18l6-6-6-6" />
        ),
        trendingUp: (
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        ),
        star: (
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        ),
        crown: (
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
        ),
        medal: (
            <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
        ),
        shield: (
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        ),
        briefcase: (
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        ),
        user: (
            <>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </>
        ),
        wallet: (
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        ),
        calendar: (
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        )
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            {icons[icon] || null}
        </svg>
    );
};

export default Icon;
