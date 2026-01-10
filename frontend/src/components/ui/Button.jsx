import { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props
}, ref) => {

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-xl
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-95
    transform hover:scale-[1.02]
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'pointer-events-none' : ''}
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600
      hover:from-blue-600 hover:via-blue-700 hover:to-purple-700
      text-white shadow-lg shadow-blue-500/30
      hover:shadow-xl hover:shadow-blue-500/40
      focus:ring-blue-500
    `,
    secondary: `
      bg-gradient-to-r from-slate-700 to-slate-800
      hover:from-slate-600 hover:to-slate-700
      text-white shadow-lg shadow-slate-500/20
      hover:shadow-xl hover:shadow-slate-500/30
      focus:ring-slate-500
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-600
      hover:from-green-600 hover:to-emerald-700
      text-white shadow-lg shadow-green-500/30
      hover:shadow-xl hover:shadow-green-500/40
      focus:ring-green-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-600
      hover:from-red-600 hover:to-rose-700
      text-white shadow-lg shadow-red-500/30
      hover:shadow-xl hover:shadow-red-500/40
      focus:ring-red-500
    `,
    warning: `
      bg-gradient-to-r from-yellow-500 to-orange-500
      hover:from-yellow-600 hover:to-orange-600
      text-white shadow-lg shadow-yellow-500/30
      hover:shadow-xl hover:shadow-yellow-500/40
      focus:ring-yellow-500
    `,
    ghost: `
      bg-white/5 hover:bg-white/10
      text-white border border-white/10
      hover:border-white/20
      focus:ring-white/20
    `,
    outline: `
      bg-transparent
      border-2 border-blue-500/50 hover:border-blue-500
      text-blue-400 hover:text-blue-300
      hover:bg-blue-500/10
      focus:ring-blue-500
    `,
    glow: `
      bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
      hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400
      text-white
      shadow-[0_0_30px_rgba(59,130,246,0.5)]
      hover:shadow-[0_0_40px_rgba(59,130,246,0.7)]
      animate-pulse-slow
      focus:ring-cyan-500
    `,
    genZ: `
      bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500
      hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600
      text-white font-bold
      shadow-[0_0_25px_rgba(168,85,247,0.6)]
      hover:shadow-[0_0_35px_rgba(168,85,247,0.8)]
      transform hover:scale-105 hover:rotate-1
      focus:ring-purple-500
    `,
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs min-h-[28px]',
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-base min-h-[42px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[56px]',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
