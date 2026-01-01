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

  // Variant styles - Brand gradient for primary
  const variantClasses = {
    primary: 'bg-gradient-to-r from-aqua via-teal-blue to-light-green text-white hover:from-aqua-400 hover:via-teal-blue-400 hover:to-light-green-400 hover:shadow-lg hover:shadow-teal-blue/20 active:scale-[0.98]',
    secondary: 'bg-card-bg text-text-primary border border-border hover:bg-card-hover hover:border-border active:scale-[0.98]',
    ghost: 'bg-transparent text-text-secondary hover:bg-card-bg hover:text-text-primary border border-transparent hover:border-border active:scale-[0.98]',
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

