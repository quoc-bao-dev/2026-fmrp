import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
const LoadingThreeDotsJumping = ({ classNameDot1, classNameDot2, classNameDot3 }) => {
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const dotVariants = {
    start: {
      y: [0, -3, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial='start'
      animate='start'
      className='flex justify-center items-center gap-x-[2px] w-fit h-[20px]'
    >
      <motion.div 
        className={twMerge('size-1 rounded-full will-change-transform bg-[#919EAB]', classNameDot1)} 
        variants={dotVariants}
      />
      <motion.div 
        className={twMerge('size-1 rounded-full will-change-transform bg-[#637381]', classNameDot2)} 
        variants={dotVariants}
      />
      <motion.div 
        className={twMerge('size-1 rounded-full will-change-transform bg-[#1C252E]', classNameDot3)} 
        variants={dotVariants}
      />
    </motion.div>
  );
};
export default LoadingThreeDotsJumping;
