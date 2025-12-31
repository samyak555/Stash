import React from 'react';

// Logo import - supports both /public/ and /src/assets/logo/
// Try public folder first (most reliable), then fallback to assets
const getLogoPath = (iconOnly = false) => {
  // Try public folder first
  if (iconOnly) {
    return '/icon.svg'; // or /icon.png, /icon.webp
  }
  return '/logo.svg'; // or /logo.png, /logo.webp
};

const Logo = ({ size = 'default', className = '', showText = true, iconOnly = false }) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    default: 'w-14 h-14',
    large: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const imageSrc = getLogoPath(iconOnly);
  const fallbackGradient = 'bg-gradient-to-br from-aqua via-teal to-soft-green';

  return (
    <div className={`flex items-center ${showText ? 'space-x-3' : ''} ${className}`} style={{ background: 'transparent' }}>
      <div className={`${sizeClasses[size] || sizeClasses.default} flex-shrink-0`} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
        <img
          src={imageSrc}
          alt="Stash"
          className="w-full h-full object-contain"
          style={{ 
            background: 'transparent',
            border: 'none',
            borderRadius: '0',
            boxShadow: 'none',
            outline: 'none'
          }}
          onError={(e) => {
            // Try alternative formats
            const src = e.target.src;
            if (src.includes('logo.svg') || src.includes('icon.svg')) {
              e.target.src = src.replace('.svg', '.png');
            } else if (src.includes('logo.png') || src.includes('icon.png')) {
              e.target.src = src.replace('.png', '.webp');
            } else {
              // Final fallback: show gradient icon
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent && !parent.querySelector('.logo-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = `logo-fallback w-full h-full flex items-center justify-center ${fallbackGradient} rounded-lg`;
                fallback.innerHTML = '<span class="text-white font-bold text-xs">S</span>';
                parent.appendChild(fallback);
              }
            }
          }}
        />
      </div>
      
      {showText && (
        <span className="text-lg font-semibold bg-gradient-to-r from-aqua via-teal to-soft-green bg-clip-text text-transparent tracking-tight">
          Stash
        </span>
      )}
    </div>
  );
};

export default Logo;
