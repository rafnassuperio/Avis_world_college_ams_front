import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  size?: 'sm' | 'md';
  placeholder?: string;
  usePortal?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onChange,
  className,
  buttonClassName,
  menuClassName,
  size = 'sm',
  placeholder = 'Select option',
  usePortal = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Coordinates when using createPortal to escape parent clipping
  const [menuCoords, setMenuCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    width: number;
  } | null>(null);

  const selectedOption =
    options.find((opt) => opt.value === value) ||
    (value ? undefined : options.length > 0 && !placeholder ? options[0] : undefined);

  // Synchronously compute portal position anchored to containerRef
  const updateCoords = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const clientWidth = document.documentElement.clientWidth || window.innerWidth;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    const spaceBelow = clientHeight - rect.bottom;
    const openUp = spaceBelow < 180 && rect.top > 180;
    const menuWidth = Math.max(rect.width, 140);

    const left = Math.max(8, Math.min(rect.left, clientWidth - menuWidth - 8));

    setMenuCoords({
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? clientHeight - rect.top + 4 : undefined,
      left,
      width: menuWidth,
    });
  }, []);

  const handleToggle = () => {
    if (!isOpen && usePortal) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  // Keep portal menu aligned during scroll or viewport resize
  useEffect(() => {
    if (isOpen && usePortal) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
      return () => {
        window.removeEventListener('scroll', updateCoords, true);
        window.removeEventListener('resize', updateCoords);
      };
    }
  }, [isOpen, usePortal, updateCoords]);

  // Click outside and escape key handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const menuContent = (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={
        usePortal && menuCoords
          ? {
              position: 'fixed',
              top: menuCoords.top !== undefined ? `${menuCoords.top}px` : undefined,
              bottom: menuCoords.bottom !== undefined ? `${menuCoords.bottom}px` : undefined,
              left: menuCoords.left !== undefined ? `${menuCoords.left}px` : undefined,
              width: `${menuCoords.width}px`,
              zIndex: 9999,
            }
          : undefined
      }
      className={cn(
        usePortal
          ? 'max-h-60 overflow-y-auto rounded-xl border border-brand-border bg-white p-1 shadow-2xl focus:outline-none'
          : 'absolute right-0 z-50 mt-1.5 min-w-[140px] max-h-60 overflow-y-auto rounded-xl border border-brand-border bg-white p-1 shadow-lg shadow-burgundy/10 focus:outline-none',
        menuClassName
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left',
              isSelected
                ? 'bg-brand-light-red text-brand-red font-semibold'
                : 'text-text-primary hover:bg-brand-bg'
            )}
          >
            <span className="truncate">{option.label}</span>
            {isSelected && <Check className="w-3.5 h-3.5 text-brand-red shrink-0 ml-1.5" />}
          </button>
        );
      })}
    </motion.div>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block text-left',
        isOpen && !usePortal && 'z-50',
        className
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'inline-flex items-center justify-between gap-1.5 rounded-full border border-brand-border bg-brand-bg hover:bg-brand-border/30 text-text-primary font-medium transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-brand-red/20',
          size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2',
          buttonClassName
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-text-secondary transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {usePortal ? (
        typeof document !== 'undefined' && isOpen && menuCoords ? (
          createPortal(menuContent, document.body)
        ) : null
      ) : (
        <AnimatePresence>{isOpen && menuContent}</AnimatePresence>
      )}
    </div>
  );
};

