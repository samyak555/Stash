import React from 'react';

const Logo = ({ size = 'default', className = '', showText = true, fullPage = false }) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    default: 'w-14 h-14',
    large: 'w-20 h-20',
    xl: 'w-28 h-28',
    fullPage: 'w-full h-full'
  };

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.28 }}>
        <img
          src="/logo.png"
          alt="Stash"
          className="object-contain"
          style={{ 
            width: '100vw',
            height: '100vh',
            objectFit: 'contain'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${showText ? 'space-x-3' : ''} ${className}`} style={{ background: 'transparent' }}>
      <div className={`${sizeClasses[size] || sizeClasses.default}`} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
        <img
          src="/logo.png"
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
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      {showText && (
        <span className="text-lg font-medium text-white lowercase tracking-tight">stash</span>
      )}
    </div>
  );
};

export default Logo;

