import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hoverEffect = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'bg-white rounded-[20px] border border-brand-border p-5 shadow-[0_2px_10px_-2px_rgba(87,0,31,0.03)]',
          hoverEffect &&
            'transition-all duration-300 hover:shadow-[0_12px_24px_-6px_rgba(87,0,31,0.08)] hover:-translate-y-0.5',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

