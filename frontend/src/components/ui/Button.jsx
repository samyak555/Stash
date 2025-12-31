import { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  // Base classes - always applied
  const baseClasses = 'h-11 px-6 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none';

  // Variant styles
  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98]',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30 active:scale-[0.98]',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10 active:scale-[0.98]',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98]',
  };

  // Size variants (keeping default for now, but extensible)
  const sizeClasses = {
    default: 'h-11 px-6',
    sm: 'h-9 px-4 text-xs',
    lg: 'h-12 px-8',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

