import React from 'react';

// Single source of truth: Logo from /src/assets/logo/
// Uses Vite's static asset import system
// Fallback to /public/ if assets folder doesn't have files

const Logo = ({ size = 'default', className = '', showText = true, iconOnly = false }) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    default: 'w-14 h-14',
    large: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  // Use public folder path (Vite will serve from public or assets)
  // Priority: Try assets first via import, fallback to public
  const getImageSrc = () => {
    if (iconOnly) {
      // Try icon files
      return '/icon.svg'; // Will try .png, .webp on error
    }
    return '/logo.svg'; // Will try .png, .webp on error
  };

  const imageSrc = getImageSrc();
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
          // Try alternative formats
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
