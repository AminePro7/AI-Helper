import { useCallback } from 'react';

export const useAnimations = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  const slideIn = (direction = 'left') => ({
    initial: { 
      x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
      y: direction === 'top' ? -100 : direction === 'bottom' ? 100 : 0,
      opacity: 0,
    },
    animate: { 
      x: 0,
      y: 0,
      opacity: 1,
    },
    exit: {
      x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
      y: direction === 'top' ? 100 : direction === 'bottom' ? -100 : 0,
      opacity: 0,
    },
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  });

  const scale = useCallback((delay = 0) => ({
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1,
      opacity: 1,
      transition: {
        delay,
        duration: 0.3,
      },
    },
    exit: { 
      scale: 0.9,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  }), []);

  const staggerChildren = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  return {
    fadeInUp,
    slideIn,
    scale,
    staggerChildren,
    staggerItem,
  };
};

export default useAnimations;
