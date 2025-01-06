import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.61, 1, 0.88, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.4,
      ease: [0.61, 1, 0.88, 1],
    },
  },
};

const Layout = ({ children, language }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const containerWidth = useBreakpointValue({ base: '100%', md: '90%', lg: '80%' });

  return (
    <Box
      as={motion.div}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      minH="100vh"
      bg={bg}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <Container maxW={containerWidth} py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
