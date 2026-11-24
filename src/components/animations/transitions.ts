import { Variants } from "framer-motion";

/**
 * High-performance smooth cubic bezier easing curve.
 * Starts with momentum and glides effortlessly to rest with zero jarring deceleration.
 */
export const smoothEase = [0.22, 1, 0.36, 1] as const;

export const gentleSpring = {
  type: "spring",
  stiffness: 280,
  damping: 24,
  mass: 0.8,
} as const;

export const snappySpring = {
  type: "spring",
  stiffness: 400,
  damping: 28,
} as const;

/**
 * Orchestrated parent container for staggered children reveals
 */
export const dashboardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0,
    },
  },
};

/**
 * Standard section slide-and-fade reveal
 */
export const dashboardSectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: smoothEase,
    },
  },
};

/**
 * Staggered grid container for cards / items
 */
export const staggeredGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

/**
 * Card entrance variant
 */
export const cardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: smoothEase,
    },
  },
};

/**
 * Fluid incoming card entrance variant specifically tuned for payment cards.
 * Combines vertical glide, subtle scale expansion, and gentle momentum.
 */
export const incomingCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 26,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.52,
      ease: smoothEase,
    },
  },
};

/**
 * Carousel container orchestrator for sequential incoming card reveals
 */
export const incomingCarouselVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.06,
    },
  },
};
