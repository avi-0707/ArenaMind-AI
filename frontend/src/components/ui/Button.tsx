import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-[0_0_15px_rgba(var(--color-primary),0.3)]',
      secondary: 'bg-muted text-muted-foreground hover:bg-muted/80',
      outline: 'border border-border hover:bg-muted hover:text-foreground',
      ghost: 'hover:bg-muted hover:text-foreground',
      danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-11 px-8 text-base',
      icon: 'h-10 w-10 justify-center',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={shouldReduceMotion || disabled ? {} : { y: -2 }}
        whileTap={shouldReduceMotion || disabled ? {} : { scale: 0.97 }}
        className={cn(
          'relative inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!shouldReduceMotion && !disabled && (
          <motion.span
            className="absolute inset-0 z-0 bg-white/10 rounded-md opacity-0"
            whileTap={{ opacity: 1, scale: 1.5 }}
            transition={{ duration: 0.3 }}
          />
        )}
        <span className="relative z-10 flex items-center">{children}</span>
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
