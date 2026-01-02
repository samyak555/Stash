import React from 'react';

// Import logo from /src/assets/logo/ - Single source of truth
import logoSrc from '../assets/logo/logo.png';
import iconSrc from '../assets/logo/icon.png';

const Logo = ({ size = 'default', className = '', showText = true, iconOnly = false }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    default: 'w-16 h-16',
    large: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  const imageSrc = iconOnly ? iconSrc : logoSrc;

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
          // If image fails to load, hide it completely - no fallback placeholder
          e.target.style.display = 'none';
        }}
      />
      
      {showText && (
        <span className="text-lg font-semibold text-gradient-brand tracking-tight">
          Stash
        </span>
      )}
    </div>
  );
};

export default Logo;
