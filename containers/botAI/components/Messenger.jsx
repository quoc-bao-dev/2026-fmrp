import AnimatedGeneraText from '@/components/animations/animation/AnimatedGeneraText';
import { motion } from 'framer-motion';
import parse from 'html-react-parser';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import AvatarBotAI from './AvatarBotAI';
import LoadingThreeDotsJumping from './LoadingThreeDotsJumping';
import TableBOM from './TableBOM';
import SelectAnswer from './SelectAnswer';
import CheckIconMessenger from '@/components/icons/common/CheckIconMessenger';
import ErrorIconMessenger from '@/components/icons/common/ErrorIconMessenger';
const Messenger = ({
  className,
  children,
  isMe = false,
  isLoading = false,
  onAnimationComplete,
  ResponseAI,
  options,
  icon,
  nextText = false,
  isAnimationCompleted,
  botName,
  dataLang,
  response,
  onSelectOption,
}) => {
  const parsedMessage = useMemo(() => {
    if (!children) return null;
    return parse(children);
  }, [children]);

  const [showTable, setShowTable] = useState(false);
  useEffect(() => {
    if (isAnimationCompleted) {
      setShowTable(true);
    }
  }, [isAnimationCompleted]);

  return (
    <div className={twMerge('flex items-start gap-2 w-full flex-row max-w-full', isMe ? 'justify-end' : 'justify-start')}>
      {!isMe && <AvatarBotAI className='size-9' classNameDot='w-[10px] h-[10px] bottom-0 right-0' />}

      <div className={twMerge('max-w-full flex flex-col gap-y-1 justify-start', className)}>
        {!isMe && (
          <div className='flex flex-row items-center gap-x-[6px]'>
            <span className='font-semibold font-deca text-typo-black-5 text-sm'>{botName ?? 'Fimo'}</span>
            <div className='h-[10px] w-[1px] bg-[#E5E5EA]' />
            <span className='text-sm font-deca font-normal text-typo-gray-7'>{dataLang?.S_bot_chat ?? 'Trợ lý AI'}</span>
          </div>
        )}
        <div
          className={twMerge(
            'p-3 font-deca text-base font-normal w-fit',
            isMe ? 'rounded-l-xl rounded-br-xl bg-[#0375F3] text-white' : 'text-typo-black-4  bg-[#F2F2F7] border-2 rounded-r-xl rounded-bl-xl border-[#919EAB] border-opacity-20'
          )}
        >
          {isLoading ? (
            <LoadingThreeDotsJumping />
          ) : isMe ? (
            <p>{children}</p>
          ) : (
            <>
              <div className='w-full flex items-center justify-start gap-x-1'>
                {icon && (
                  <motion.div
                    animate={{
                      rotate: [0, 180, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {icon}
                  </motion.div>
                )}
                <AnimatedGeneraText onAnimationComplete={onAnimationComplete}>{parsedMessage}</AnimatedGeneraText>
              </div>

              {response?.options && Array.isArray(response.options) && response.options.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }} className='mt-4 w-full flex flex-col gap-y-3'>
                  {response.options.map((option, index) => {
                    const isPositive = option.type_send === '1';
                    const optionIcon = isPositive ? <CheckIconMessenger /> : <ErrorIconMessenger />;
                    const optionContent = parse(option.content || option.name || '');
                    console.log({ option });

                    return (
                      <SelectAnswer
                        key={option.id || index}
                        icon={optionIcon}
                        typeAnswer={isPositive ? 1 : 0}
                        onClick={() => {
                          if (onSelectOption) {
                            onSelectOption({
                              id: option.id,
                              content: option.content,
                              next: option.next,
                              option: option,
                            });
                          }
                        }}
                        stepNext={option.next && typeof option.next === 'string' ? option.next : null}
                      >
                        {optionContent}
                      </SelectAnswer>
                    );
                  })}
                </motion.div>
              )}
              {ResponseAI && showTable && (
                <div className='mt-4 w-full'>
                  {ResponseAI?.stages.length > 0 && (
                    <motion.div className='flex flex-col gap-y-2' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                      <p className='font-deca text-base  font-normal text-typo-black-6'>🔁 Công đoạn sản xuất</p>

                      {ResponseAI?.stages.map((item, index) => (
                        <div className='flex flex-row gap-x-[10px] justify-start items-center' key={index}>
                          <div className='bg-[#637381]  rounded-[3px] py-[4px] px-[8px]'>
                            <p className='font-deca font-normal text-xs text-white'>{index + 1}</p>
                          </div>
                          <p className='font-deca font-normal text-sm  text-typo-black-4'>{item.name}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                    <TableBOM materialsPrimary={ResponseAI.materialsPrimary ?? []} semiProducts={ResponseAI.semiProducts ?? []} stages={ResponseAI.stages} />
                  </motion.div>
                  {/* render response */}

                  {options.messageOptions && <p className='font-deca font-normal text-base text-[#303030] mt-6'>{options.messageOptions}</p>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messenger;
