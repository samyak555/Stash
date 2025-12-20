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
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.15 }}>
        <img
          src="/logo.png"
          alt="Stash"
          className="object-cover"
          style={{ 
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            filter: 'drop-shadow(0 0 200px rgba(99, 102, 241, 0.4))'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`relative ${sizeClasses[size] || sizeClasses.default}`}>
        <img
          src="/logo.png"
          alt="Stash"
          className="w-full h-full object-contain drop-shadow-lg"
          onError={(e) => {
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            if (parent && !parent.querySelector('.fallback')) {
              const fallback = document.createElement('div');
              fallback.className = 'fallback w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center';
              fallback.innerHTML = '<span class="text-2xl">💰</span>';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-extrabold leading-tight">
            <span className="text-blue-400">Stas</span>
            <span className="text-purple-400">h</span>
          </span>
          <span className="text-xs font-bold text-gray-400 -mt-0.5 tracking-wide">FINANCE</span>
        </div>
      )}
    </div>
  );
};

export default Logo;

