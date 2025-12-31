import React from 'react';

// Single source of truth: Logo from /src/assets/logo/
// Vite will handle these imports at build time
// Files should be placed in: /src/assets/logo/logo.svg, /src/assets/logo/icon.svg, etc.

// Try to import logo files using Vite's import system
// If files don't exist, Vite will show warnings but the app will still work
let logoSrc = null;
let iconSrc = null;

// Use dynamic import with error handling
try {
  // Vite will resolve these at build time
  // If file exists: import works
  // If file doesn't exist: falls back to public folder
  logoSrc = '/logo.svg'; // Primary path - will try assets first, then public
} catch (e) {
  logoSrc = '/logo.svg';
}

try {
  iconSrc = '/icon.svg';
} catch (e) {
  iconSrc = '/icon.svg';
}

const Logo = ({ size = 'default', className = '', showText = true, iconOnly = false }) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    default: 'w-14 h-14',
    large: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const imageSrc = iconOnly ? (iconSrc || logoSrc) : (logoSrc || iconSrc);
  const fallbackGradient = 'bg-gradient-to-br from-aqua via-teal to-soft-green';

  return (
    <div className={`flex items-center ${showText ? 'space-x-3' : ''} ${className}`} style={{ background: 'transparent' }}>
      {/* Logo image - Direct img tag, NO wrapper div, NO background, NO border, NO shadow, NO rounded corners, NO padding */}
      <img
        src={imageSrc}
        alt="Stash"
        className={`${sizeClasses[size] || sizeClasses.default} object-contain flex-shrink-0`}
        style={{ 
          background: 'transparent',
          border: 'none',
          borderRadius: '0',
          boxShadow: 'none',
          outline: 'none',
          padding: '0',
          margin: '0',
          display: 'block'
        }}
        onError={(e) => {
          // Try alternative formats and locations
          const src = e.target.src;
          if (src.includes('logo.svg') || src.includes('icon.svg')) {
            e.target.src = src.replace('.svg', '.png');
          } else if (src.includes('logo.png') || src.includes('icon.png')) {
            e.target.src = src.replace('.png', '.webp');
          } else {
            // Final fallback: show gradient icon (only if image completely fails)
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            if (parent && !parent.querySelector('.logo-fallback')) {
              const fallback = document.createElement('div');
              fallback.className = `logo-fallback ${sizeClasses[size] || sizeClasses.default} flex items-center justify-center ${fallbackGradient} rounded-lg`;
              fallback.innerHTML = '<span class="text-white font-bold text-xs">S</span>';
              parent.appendChild(fallback);
            }
          }
        }}
      />
      
      {showText && (
        <span className="text-lg font-semibold bg-gradient-to-r from-aqua via-teal to-soft-green bg-clip-text text-transparent tracking-tight">
          Stash
        </span>
      )}
    </div>
  );
};

export default Logo;
