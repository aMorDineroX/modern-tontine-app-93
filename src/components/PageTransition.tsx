import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Composant pour animer les transitions entre les pages
 * 
 * @component
 * @param {PageTransitionProps} props - Propriétés du composant
 * @returns {JSX.Element} Composant PageTransition
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  const location = useLocation();
  
  // Variantes d'animation pour les transitions de page
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0], // Courbe d'accélération personnalisée
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };
  
  // Variantes d'animation pour les éléments enfants
  const childVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    },
    out: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className={className}
      >
        {React.Children.map(children, (child, i) => (
          <motion.div
            key={i}
            variants={childVariants}
            initial="initial"
            animate="in"
            exit="out"
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
