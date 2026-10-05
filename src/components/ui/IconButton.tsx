import { forwardRef } from 'react';
import { Button, ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  'aria-label': string; // Strictly enforce aria-label for accessibility
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = '', size = 'icon', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={`touch-target rounded-full ${className}`}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
