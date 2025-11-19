'use client';
import AnimatedGeneraEachWord from '@/components/animations/animation/AnimatedGeneraEachWord';
import { useSettingApp } from '@/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BoxChatAI from './fimo-v2/BoxChatAI';
import LoadingThreeDotsJumping from './LoadingThreeDotsJumping';
import { useGetChatBot } from '@/managers/api/bot-AI/useGetChatBot';

const ToggleBotAI = ({ dataLang }) => {
  // const [openDrawer, setOpenDrawer] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { data: dataSetting, isLoading } = useSettingApp();

  const { data: dataChatBot, isLoading: isLoadingChatBot } = useGetChatBot();

  const dispatch = useDispatch();
  const openDrawer = useSelector(state => state.stateBoxChatAi.open);
  const { isGreeting } = useSelector(state => state.stateBoxChatAi);

  // Bật chat bot lên khi có "chatbot"
  useEffect(() => {
    if (!!dataChatBot?.chatbot && !isGreeting) {
      dispatch({ type: 'chatbot/openBoxChatAi', payload: true });
    }
  }, [dataChatBot, isGreeting]);

  useEffect(() => {
    let interval;
    let timeoutText;
    let timeoutHide;

    const runCycle = () => {
      setShowBubble(true);
      setShowText(false);

      timeoutText = setTimeout(() => {
        setShowText(true);
      }, 3000);

      timeoutHide = setTimeout(() => {
        setShowBubble(false);
      }, 8000);
    };
    // chỉ chạy nếu không hover
    if (!isHovering) {
      runCycle();
      interval = setInterval(runCycle, 15000);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutText);
      clearTimeout(timeoutHide);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovering]);

  return (
    <>
      {/* toggle */}
      {isImageLoaded && !openDrawer && (
        <div
          className='fixed bottom-6 right-6 z-50 cursor-pointer'
          // onClick={() => setOpenDrawer(true)}
          onClick={() => dispatch({ type: 'chatbot/openBoxChatAi', payload: true })}
          onMouseEnter={() => {
            // xử lý hover toggle
            setIsHovering(true);
            setShowBubble(true);
            setShowText(true);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            //xử lý khi không hover
            setShowText(false);
            setShowBubble(false);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            // Sau 3s mới set lại isHovering = false
            timeoutRef.current = setTimeout(() => {
              setIsHovering(false);
            }, 3000);
          }}
        >
          <div className='relative flex flex-col items-center w-fit justify-center'>
            {/* ✅ BUBBLE */}

            {/* background */}
            <div className='absolute left-1/2 -translate-x-1/2  bottom-[10px] z-[-1]'>
              <div className='rounded-full bg-linear-border-toggle-bot p-[6px] w-[78px] h-[78px] aspect-1'>
                <div className='bg-linear-background-toggle-bot rounded-full size-full'></div>
              </div>
            </div>

            {/* Bot Mascot */}
            <div className='relative z-10 w-[90px] h-[90px] rounded-full' id='bot-anchor'>
              <AnimatePresence>
                {showBubble && (
                  <div className='absolute top-[-5px] left-0 -translate-x-[calc(100%-10px)] w-fit h-fit bg-transparent'>
                    <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} exit={{ opacity: 0.3 }} transition={{ duration: 0.5 }} className='relative'>
                      {showText ? (
                        <AnimatedGeneraEachWord
                          className='text-[#064E3B] px-3 py-3 rounded-l-xl rounded-tr-xl bg-[#EBFEF2] border border-[#064E3B] shadow-md'
                          classNameWrapper='rounded-l-xl rounded-tr-xl'
                          text={`${dataLang?.S_message_chat_bot_hello || 'S_message_chat_bot_hello'}, ${dataSetting?.assistant_fmrp_short || 'Fimo'} ${
                            dataLang?.S_message_chat_bot_quest || 'S_message_chat_bot_quest'
                          }`}
                        />
                      ) : (
                        <motion.div
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0.9 }}
                          transition={{ duration: 0.6 }}
                          className=' px-3 py-3 rounded-l-xl rounded-tr-xl bg-[#EBFEF2] border border-[#064E3B]'
                        >
                          <LoadingThreeDotsJumping classNameDot1='bg-[#54E79E]' classNameDot2='bg-[#21B972]' classNameDot3='bg-[#027A48]' />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <div className='w-[90px] h-[90px] rounded-full '>
                <Image
                  alt='bot'
                  src='/bot-ai/toggle.gif'
                  width={900}
                  height={680}
                  className='w-[90px] h-[90px] bg-transparent rounded-full'
                  // quality={100}
                  loading='eager'
                  // onLoad={() => setIsImageLoaded(true)}
                  priority
                />
              </div>
            </div>
            {/* Label Text */}
            <div className='relative rounded-2xl bg-linear-border-toggle-bot p-[2px]  h-fit w-fit'>
              <div className='bg-linear-background-toggle-bot rounded-2xl size-full py-[6px] px-2 w-fit'>
                <p className='text-white font-normal font-deca text-xs whitespace-nowrap'>{dataSetting?.assistant_fmrp ?? 'Trợ lý AI Fimo'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hidden preloader image */}
      <Image
        alt='preload'
        src='/bot-ai/toggle.gif'
        width={900}
        height={680}
        className='hidden'
        loading='eager'
        onLoad={() => setIsImageLoaded(true)}
        priority // optional: ưu tiên tải ảnh
      />
      {/* drawer */}
      <BoxChatAI openChatBox={openDrawer} dataLang={dataLang} dataSetting={dataSetting} chatId={dataChatBot?.chatbot?.id} />
    </>
  );
};

export default ToggleBotAI;
