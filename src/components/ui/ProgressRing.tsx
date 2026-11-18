import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/animations/AnimatedNumber';
import { smoothEase } from '@/components/animations/transitions';

export interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value = 92,
  size = 140,
  strokeWidth = 14,
  label,
  sublabel = 'Operational Efficiency',
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transition-all"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--brand-light-red)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated red progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--brand-red)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.3, ease: smoothEase, delay: 0.2 }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.2, ease: smoothEase }}
            className="text-2xl font-bold tracking-tight text-text-primary"
          >
            {label !== undefined ? (
              label
            ) : (
              <AnimatedNumber
                value={value}
                duration={1200}
                delay={250}
                formatter={(v) => `${Math.round(v)}%`}
              />
            )}
          </motion.span>
        </div>
      </div>
      {sublabel && (
        <p className="mt-2 text-xs font-semibold text-text-secondary text-center max-w-[120px] leading-tight">
          {sublabel}
        </p>
      )}
    </div>
  );
};
