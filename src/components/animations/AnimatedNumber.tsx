import React, { useEffect, useState } from 'react';

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  formatter?: (val: number) => string;
  className?: string;
}

/**
 * AnimatedNumber smoothly interpolates from 0 to the target number
 * using an easeOutCubic curve and requestAnimationFrame for 60fps+ rendering.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1100,
  delay = 0,
  formatter = (val) => Math.round(val).toLocaleString(),
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;
    let timeoutId: number;

    const startAnimation = () => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic ease-out: starts briskly and glides gracefully to rest
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        const current = value * easeOutProgress;

        setDisplayValue(current);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    if (delay > 0) {
      timeoutId = window.setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, delay]);

  return <span className={className}>{formatter(displayValue)}</span>;
};

