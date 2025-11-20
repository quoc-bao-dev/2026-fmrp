import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { SendMessengerIcon } from '@/components/icons';

const SelectAnswer = ({ className, children, typeAnswer, onClick, icon, stepNext, disabled, isLoading = false }) => {
  return (
    <div
      className={twMerge(
        'group  rounded-xl border border-[#919EAB] border-opacity-20 py-4 px-3 flex flex-row justify-between xs:min-w-[370px] min-w-full w-full cursor-pointer bg-[#FFFFFF] text-[#25387A]',
        typeAnswer === 1 ? 'hover:border-typo-green-3 hover:text-typo-green-3 ' : 'hover:border-typo-red-1 hover:text-typo-red-1',
        disabled && 'opacity-50 cursor-not-allowed hover:border-[#919EAB] hover:text-[#25387A] hover:border-opacity-20',
        className
      )}
      onClick={() => {
        if (!disabled) {
          onClick({
            idSemiProduct: typeAnswer,
            message: children,
            stepNext: stepNext,
          });
        }
      }}
    >
      <div
        className={twMerge(
          'flex items-center flex-row gap-x-2 text-[#141522]  ',
          typeAnswer === 1 ? 'group-hover:text-typo-green-3' : 'group-hover:text-typo-red-1',
          disabled && 'group-hover:text-[#141522]'
        )}
      >
        <div className='size-5'>{icon}</div>
        <p
          className={twMerge('font-deca xs:text-sm font-normal text-xs', typeAnswer === 1 ? 'group-hover:text-typo-green-3' : 'group-hover:text-typo-red-1', disabled && 'group-hover:text-[#141522]')}
        >
          {children}
        </p>
      </div>

      <motion.div className={twMerge('transform transition-transform duration-300 ease-in-out group-hover:translate-x-2', (disabled || isLoading) && 'group-hover:translate-x-0')}>
        {isLoading ? <AiOutlineLoading3Quarters className='animate-spin text-typo-blue-5' /> : <SendMessengerIcon />}
      </motion.div>
    </div>
  );
};

export default SelectAnswer;
