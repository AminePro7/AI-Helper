import React from 'react';
import { motion } from 'framer-motion';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { useInView } from 'react-intersection-observer';

const AnimatedCard = ({ children, delay = 0, ...props }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const bg = useColorModeValue('white', 'gray.800');
  const shadow = useColorModeValue('lg', 'dark-lg');

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  };

  const hoverVariants = {
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <Box
      as={motion.div}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover="hover"
      variants={{
        ...cardVariants,
        ...hoverVariants,
      }}
      bg={bg}
      borderRadius="lg"
      boxShadow={shadow}
      overflow="hidden"
      {...props}
    >
      {children}
    </Box>
  );
};

export default AnimatedCard;
