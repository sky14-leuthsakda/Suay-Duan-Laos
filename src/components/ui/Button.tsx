import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'sos' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'default', 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    // Base styles: mobile-first, minimum 56px touch target by default, accessible focus ring
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 rounded-2xl';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-md shadow-rose-950/20 font-semibold',
      sos: 'bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 active:from-rose-600 active:to-rose-800 text-white shadow-lg shadow-rose-600/30 font-bold tracking-wide uppercase',
      secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
      outline: 'border-2 border-slate-300 hover:bg-slate-100 text-slate-800 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200',
      ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      danger: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-sm font-semibold',
      success: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm font-semibold',
      warning: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold',
    };

    // Mobile touch targets >= 56px for default and lg
    const sizes: Record<ButtonSize, string> = {
      default: 'min-h-[56px] min-w-[56px] px-6 py-3.5 text-base sm:text-lg gap-3',
      sm: 'min-h-[48px] px-4 py-2 text-sm sm:text-base gap-2',
      lg: 'min-h-[64px] min-w-[64px] px-8 py-4 text-lg sm:text-xl gap-3.5 font-bold',
      icon: 'min-h-[56px] min-w-[56px] p-3 aspect-square',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
