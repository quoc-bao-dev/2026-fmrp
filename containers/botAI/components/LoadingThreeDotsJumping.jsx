import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
const LoadingThreeDotsJumping = ({ classNameDot1, classNameDot2, classNameDot3 }) => {
  const dotVariants = {
    jump: {
      y: -5,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div animate='jump' transition={{ staggerChildren: -0.2, staggerDirection: -1 }} className='flex justify-center items-center gap-x-[2px] w-fit h-[20px]'>
      <motion.div className={twMerge('size-1 rounded-full will-change-transform bg-[#919EAB]', classNameDot1)} variants={dotVariants} />
      <motion.div className={twMerge('size-1 rounded-full will-change-transform bg-[#637381]', classNameDot2)} variants={dotVariants} />
      <motion.div className={twMerge('size-1 rounded-full will-change-transform bg-[#1C252E]', classNameDot3)} variants={dotVariants} />
    </motion.div>
  );
};
export default LoadingThreeDotsJumping;
