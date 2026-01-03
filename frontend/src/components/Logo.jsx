import React from 'react';

// Import logo from /src/assets/logo/ - Single source of truth
import logoSrc from '../assets/logo/logo.png';
import iconSrc from '../assets/logo/icon.png';

const Logo = ({ size = 'default', className = '', showText = true, iconOnly = false, authPage = false }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    default: 'w-16 h-16',
    large: 'w-24 h-24',
    xl: 'w-36 h-36',
    'auth-large': 'w-32 h-32 md:w-40 md:h-40', // 1.5-2x larger for auth pages
  };

  const imageSrc = iconOnly ? iconSrc : logoSrc;
  const logoSize = authPage ? sizeClasses['auth-large'] : (sizeClasses[size] || sizeClasses.default);
  const textSize = authPage ? 'text-3xl md:text-4xl font-bold' : 'text-lg font-semibold';
  const spacing = authPage ? 'space-x-4 md:space-x-5' : 'space-x-3';

  return (
    <div className={`flex items-center ${showText ? spacing : ''} ${className}`} style={{ background: 'transparent' }}>
      {/* Logo image - Direct img tag, NO wrapper div, NO background, NO border, NO shadow, NO rounded corners, NO padding */}
      <img
        src={imageSrc}
        alt="Stash"
        className={`${logoSize} object-contain flex-shrink-0`}
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
          // If image fails to load, hide it completely - no fallback placeholder
          e.target.style.display = 'none';
        }}
      />
      
      {showText && (
        <span className={`${textSize} text-gradient-brand tracking-tight`}>
          Stash
        </span>
      )}
    </div>
  );
};

export default Logo;
