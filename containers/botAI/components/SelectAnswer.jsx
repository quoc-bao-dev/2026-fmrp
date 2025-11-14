import SendMessengerIcon from '@/components/icons/common/SendMessengerIcon';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const SelectAnswer = ({ className, children, typeAnswer, onClick, icon, stepNext }) => {
  return (
    <div
      className={twMerge(
        'group  rounded-xl border border-[#919EAB] border-opacity-20 py-4 px-3 flex flex-row justify-between xs:min-w-[370px] min-w-full w-full cursor-pointer bg-[#FFFFFF] text-[#25387A]',
        typeAnswer === 1 ? 'hover:border-typo-green-3 hover:text-typo-green-3 ' : 'hover:border-typo-red-1 hover:text-typo-red-1',
        className
      )}
      onClick={() =>
        onClick({
          idSemiProduct: typeAnswer,
          message: children,
          stepNext: stepNext,
        })
      }
    >
      <div className={twMerge('flex items-center flex-row gap-x-2 text-[#141522]  ', typeAnswer === 1 ? 'group-hover:text-typo-green-3' : 'group-hover:text-typo-red-1')}>
        <div className='size-5'>{icon}</div>
        <p className={twMerge('font-deca xs:text-sm font-normal text-xs', typeAnswer === 1 ? 'group-hover:text-typo-green-3' : 'group-hover:text-typo-red-1')}>{children}</p>
      </div>

      {/* <SendMessengerIcon /> */}
      <motion.div className='transform transition-transform duration-300 ease-in-out group-hover:translate-x-2'>
        <SendMessengerIcon />
      </motion.div>
    </div>
  );
};

export default SelectAnswer;
