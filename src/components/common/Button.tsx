import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-blue-600/20',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80',
    outline: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-sm',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
    link: 'text-blue-600 hover:underline p-0 h-auto bg-transparent',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-5 text-base gap-2.5',
    icon: 'h-9 w-9 p-0',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
