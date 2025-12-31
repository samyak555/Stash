import React from 'react';

// Logo import - will use dynamic import to handle missing files gracefully
// Add your logo files to /src/assets/logo/ folder (logo.svg, logo.png, or logo.webp)
let logoImage = null;
try {
  logoImage = require('../assets/logo/logo.svg');
} catch (e) {
  try {
    logoImage = require('../assets/logo/logo.png');
  } catch (e2) {
    try {
      logoImage = require('../assets/logo/logo.webp');
    } catch (e3) {
      // Logo file not found - will use fallback
      logoImage = null;
    }
  }
}

const Logo = ({ size = 'default', className = '', showText = true }) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    default: 'w-14 h-14',
    large: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  // Fallback if logo import fails
  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <div className={`flex items-center ${showText ? 'space-x-3' : ''} ${className}`} style={{ background: 'transparent' }}>
      <div className={`${sizeClasses[size] || sizeClasses.default}`} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
        <img
          src="/logo.svg"
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
            if (src.includes('logo.svg')) {
              e.target.src = '/logo.png';
            } else if (src.includes('logo.png')) {
              e.target.src = '/logo.webp';
            } else {
              // Final fallback: hide image and show text
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent && !parent.querySelector('.logo-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'logo-fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-teal to-aqua rounded-lg';
                fallback.innerHTML = '<span class="text-white font-bold text-xs">S</span>';
                parent.appendChild(fallback);
              }
            }
          }}
        />
      </div>
      
      {showText && (
        <span className="text-lg font-semibold text-text-primary lowercase tracking-tight">stash</span>
      )}
    </div>
  );
};

export default Logo;
