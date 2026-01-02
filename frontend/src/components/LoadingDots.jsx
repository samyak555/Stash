/**
 * Three-dot loading animation component
 * Common in modern web apps (like Slack, Discord, etc.)
 */
const LoadingDots = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const dotSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className={`${dotSize} bg-cyan-400 rounded-full animate-bounce`}
        style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
      />
      <div
        className={`${dotSize} bg-cyan-400 rounded-full animate-bounce`}
        style={{ animationDelay: '160ms', animationDuration: '1.4s' }}
      />
      <div
        className={`${dotSize} bg-cyan-400 rounded-full animate-bounce`}
        style={{ animationDelay: '320ms', animationDuration: '1.4s' }}
      />
    </div>
  );
};

export default LoadingDots;

