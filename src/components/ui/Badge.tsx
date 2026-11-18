import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'growth' | 'neutral' | 'burgundy' | 'outline' | 'danger';
  isPositive?: boolean;
  showArrow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'growth',
  isPositive = true,
  showArrow = false,
  ...props
}) => {
  const variants = {
    growth: isPositive
      ? 'bg-success-light text-success border border-success/30'
      : 'bg-red-50 text-red-600 border border-red-200',
    neutral: 'bg-brand-bg text-text-secondary border border-brand-border',
    burgundy: 'bg-burgundy-primary/10 text-burgundy-primary border border-burgundy-primary/20',
    outline: 'bg-transparent text-text-secondary border border-brand-border',
    danger: 'bg-brand-light-red text-brand-red border border-brand-red/20',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 font-semibold text-[11px] leading-none px-2 py-1 rounded-md transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {showArrow && (
        isPositive ? <ArrowUpRight className="w-3 h-3 stroke-[2.5]" /> : <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
      )}
      <span>{children}</span>
    </div>
  );
};

