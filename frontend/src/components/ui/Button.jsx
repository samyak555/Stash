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

  // Base styles: Focus on accessibility (outline-none, focus-visible), transition, font
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg text-sm
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0E1116]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98]
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'cursor-wait' : ''}
  `;

  // Variants: Clean, professional, minimal gradients
  const variants = {
    primary: `
      bg-blue-600 hover:bg-blue-500
      text-white shadow-sm shadow-blue-500/20
      border border-transparent
      focus:ring-blue-500
    `,
    secondary: `
      bg-slate-800 hover:bg-slate-700
      text-white border border-slate-700
      shadow-sm
      focus:ring-slate-500
    `,
    success: `
      bg-emerald-600 hover:bg-emerald-500
      text-white shadow-sm shadow-emerald-500/20
      border border-transparent
      focus:ring-emerald-500
    `,
    danger: `
      bg-rose-600 hover:bg-rose-500
      text-white shadow-sm shadow-rose-500/20
      border border-transparent
      focus:ring-rose-500
    `,
    ghost: `
      bg-transparent hover:bg-white/5
      text-slate-400 hover:text-white
      border border-transparent
      focus:ring-slate-500
    `,
    outline: `
      bg-transparent hover:bg-white/5
      border border-slate-700 hover:border-slate-600
      text-slate-300 hover:text-white
      focus:ring-blue-500
    `,
    // Deprecated "fun" variants mapped to professional ones to prevent breaking changes
    glow: `
      bg-blue-600 hover:bg-blue-500
      text-white shadow-lg shadow-blue-500/40
      border border-transparent
    `,
    genZ: `
      bg-indigo-600 hover:bg-indigo-500
      text-white border border-transparent
    `,
    warning: `
      bg-amber-600 hover:bg-amber-500 text-white
    `
  };

  // Sizes: Compact and standard
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-base',
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
            className="animate-spin -ml-1 h-4 w-4"
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
          {leftIcon && <span className="flex-shrink-0 -ml-1">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0 -mr-1">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
