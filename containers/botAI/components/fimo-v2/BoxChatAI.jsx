'use client';
import LoadingDataChatBot from '@/components/icons/common/LoadingDataChatBot';
import { PRODUCT_ANALYSIS } from '@/constants/TypeChatBot/typeChatBot';
import { useActiveRobotDetail } from '@/managers/api/bot-AI/useActiveRobotDetail';
import useHandleNext from '@/managers/api/bot-AI/useHandleNext';
import { fetchStartMessageAI, sendChatbotMessage } from '@/managers/api/bot-AI/useMessageAI';
import { calculateMessageRenderTime, delay, handleDelay } from '@/utils/helpers/common';
import { useHandleChatbotResponse } from '@/utils/helpers/handleChatbotResponse';
import { Drawer, Input } from 'antd';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaArrowUp } from 'react-icons/fa6';
import { IoClose, IoReloadOutline } from 'react-icons/io5';
import { PiSparkleBold } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';
import { twMerge } from 'tailwind-merge';
import AvatarBotAI from '../AvatarBotAI';
import Messenger from '../Messenger';
import ResultChatBot from '../ResultChatBot';

const { TextArea } = Input;
const drawerStyles = {
  mask: {
    backdropFilter: 'blur(10px)',
  },
};

const BoxChatAI = ({ openChatBox, setOpenChatBox, dataLang, dataSetting, chatId }) => {
  const endRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const handleChatbotResponse = useHandleChatbotResponse();
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasFetchedFirstMessage = useRef(false);
  const [isAnimationCompleted, setAnimationCompleted] = useState(false);
  const [resultDataChatBot, setResultDataChatBot] = useState(false);
  const [textUser, setTextUser] = useState('');
  const [productAnalysis, setProductAnalysis] = useState({});
  const [isLastMessageAnimationDone, setIsLastMessageAnimationDone] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const authState = useSelector(state => state.auth);

  const { data: dataActiveRobotDetail, isLoading: isLoadingActiveRobotDetail } = useActiveRobotDetail({
    id: chatId,
    enabled: !!chatId,
  });

  // Lấy tin nhắn dựa trên id
  const { messenger, options, response, isLoadingGeneraAnswer, sendChat, nextWait, dataPost, sessionRobot, isChat, isGreeting } = useSelector(state => state.stateBoxChatAi);
  const handleNext = useHandleNext();

  // Hàm xử lý gửi tin nhắn mới
  const handleSend = async () => {
    if (!textUser.trim() || !nextWait) {
      console.warn('Không thể gửi: thiếu textUser hoặc nextWait');
      return;
    }

    // Kiểm tra đang gửi thì không cho gửi tiếp
    if (isSendingMessage) {
      return;
    }

    const messageText = textUser.trim();

    try {
      // Set pending state
      setIsSendingMessage(true);

      const response = await sendChatbotMessage({
        nextWait,
        dataPost,
        sessionRobot,
        message: messageText,
      });

      // Thêm message của user vào store để hiển thị
      dispatch({
        type: 'chatbot/addUserMessage',
        payload: messageText,
      });
      // Clear input sau khi gửi thành công
      setTextUser('');

      if (isChat === 2) {
        dispatch({ type: 'chatbot/setSendChat', payload: null });
        // Clear các state sau khi gửi thành công
        dispatch({
          type: 'chatbot/setNextWait',
          payload: null,
        });
        dispatch({
          type: 'chatbot/setDataPost',
          payload: null,
        });
        dispatch({
          type: 'chatbot/setIsChat',
          payload: null,
        });
      }

      // Xử lý response sử dụng hook chung
      handleChatbotResponse({ response });

      if (response?.next) {
        handleNext(response);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      // Có thể hiển thị thông báo lỗi cho user ở đây
    } finally {
      // Tắt pending state
      setIsSendingMessage(false);
    }
  };

  const onRedirect = () => {
    dispatch({ type: 'chatbot/openBoxChatAi', payload: false });
    router.push('/products');
  };

  const onRetry = async () => {
    setResultDataChatBot(false);
    setTextUser('');
    setAnimationCompleted(false);
    setProductAnalysis({});

    // Reset Redux chatbot
    dispatch({ type: 'chatbot/reset' });

    // Bắt đầu lại lời chào như lúc mở chat box
    try {
      const res = await fetchStartMessageAI(PRODUCT_ANALYSIS); // gọi API giống hook
      const scenario = res?.chat_scenarios;

      if (scenario) {
        handleDelay({
          delay: 2000,
          setIsLoading: value => dispatch({ type: 'chatbot/setIsLoadingGeneraAnswer', payload: value }),
          actionFn: () =>
            dispatch({
              type: 'chatbot/addInitialBotMessage',
              payload: {
                message: scenario.message,
                options: scenario.options,
                chat_scenarios_id: scenario.chat_scenarios_id,
                session_id: scenario.session_id,
                step: scenario.step,
              },
            }),
        });
      }
    } catch (err) {
      console.error('Lỗi khi khởi tạo lại đoạn chat mới:', err);
    }
  };

  // Reset trạng thái khi messenger thay đổi
  useEffect(() => {
    setAnimationCompleted(false);
    setIsLastMessageAnimationDone(false);
  }, [messenger]);

  // Sử dụng hook để xử lý next response
  const startInitialScenario = useCallback(
    async (force = false) => {
      if (!openChatBox || isLoadingActiveRobotDetail || !dataActiveRobotDetail) {
        return;
      }

      // Check isGreeting trong store - nếu đã load rồi thì không load nữa
      if (!force && isGreeting) {
        return;
      }

      if (!force && hasFetchedFirstMessage.current) {
        return;
      }

      hasFetchedFirstMessage.current = true;

      const initialMessage = dataActiveRobotDetail?.data?.message;
      if (!initialMessage) {
        return;
      }

      dispatch({ type: 'chatbot/setIsLoadingGeneraAnswer', payload: true });
      await delay(2000);
      dispatch({ type: 'chatbot/setIsLoadingGeneraAnswer', payload: false });
      dispatch({
        type: 'chatbot/addInitialBotMessage',
        payload: {
          message: initialMessage,
          options: dataActiveRobotDetail?.data?.options,
          chat_scenarios_id: dataActiveRobotDetail?.data?.chat_scenarios_id,
          session_id: dataActiveRobotDetail?.data?.session_id,
          step: dataActiveRobotDetail?.data?.step,
          response: dataActiveRobotDetail?.data?.response,
        },
      });

      await delay(calculateMessageRenderTime(initialMessage));
      const next = dataActiveRobotDetail.next;

      if (next) {
        handleNext(dataActiveRobotDetail);
      }
    },
    [openChatBox, isLoadingActiveRobotDetail, dataActiveRobotDetail, dispatch, handleNext, isGreeting]
  );

  // [load-first-message] fetch lời chào đầu tiên
  useEffect(() => {
    startInitialScenario();
  }, [startInitialScenario]);

  const handleReload = async () => {
    if (isReloading) return;

    setIsReloading(true);
    try {
      setResultDataChatBot(false);
      setTextUser('');
      setAnimationCompleted(false);
      setProductAnalysis({});
      setIsLastMessageAnimationDone(false);

      dispatch({ type: 'chatbot/reset' });
      hasFetchedFirstMessage.current = false;

      await startInitialScenario(true);
    } catch (error) {
      console.error('Lỗi khi reload kịch bản chatbot:', error);
    } finally {
      setIsReloading(false);
    }
  };

  useEffect(() => {
    if (endRef.current) {
      endRef.current?.scrollIntoView({ behavior: '' });
    }
  }, [endRef]);

  useEffect(() => {
    const lastMessage = messenger[messenger.length - 1];
    if (lastMessage?.sender === 'user' && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messenger]);

  //scroll tới vị trí loading
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messenger, isLoadingGeneraAnswer]);

  return (
    <Drawer
      title={
        <div className='flex items-center justify-between gap-3 pt-3 pb-4 border-b border-[#919EAB] relative border-opacity-25 w-full'>
          <div className='flex items-center gap-3 '>
            <AvatarBotAI />
            <p className='text-xl font-semibold text-typo-blue-5 font-deca'>{dataSetting?.assistant_fmrp ?? 'Trợ lý AI Fimo'}</p>
          </div>

          <button className='!bg-white p-1 rounded-full shadow hover:bg-gray-100' onClick={() => dispatch({ type: 'chatbot/openBoxChatAi', payload: false })}>
            <IoClose />
          </button>
        </div>
      }
      placement='right'
      onClose={() => dispatch({ type: 'chatbot/openBoxChatAi', payload: false })}
      open={openChatBox}
      styles={drawerStyles}
      width={820}
      closable={false}
      className='!bg-opacity-90 !bg-[#ffffff]'
      headerStyle={{
        background: 'transparent',
        borderBottom: 'none',
        padding: '12px 24px',
      }}
      footerStyle={{
        background: 'transparent',
        borderTop: 'none',
        padding: '0px 0px',
        zIndex: 999999,
        position: 'relative',
      }}
      zIndex={9999}
      footer={
        <div className='px-6 pb-6 pt-2 z-[999999] relative'>
          <div className='relative rounded-xl p-5 bg-linear-background-chat space-y-3'>
            {isDevelopment && (
              <div className='absolute -top-10 left-0 z-50'>
                <button
                  type='button'
                  onClick={handleReload}
                  disabled={isReloading || isLoadingActiveRobotDetail}
                  className={twMerge(
                    'rounded-lg p-[10px] text-lg transition-all duration-300 ease-in-out shadow',
                    isReloading || isLoadingActiveRobotDetail ? 'bg-background-gray-4 text-typo-gray-6 cursor-not-allowed opacity-50' : 'bg-white text-typo-blue-5 hover:bg-gray-100'
                  )}
                >
                  {isReloading ? <AiOutlineLoading3Quarters className='animate-spin' /> : <IoReloadOutline />}
                </button>
              </div>
            )}
            <div className='text-typo-blue-5 font-medium text-base flex flex-row items-center gap-x-2'>
              <PiSparkleBold />
              <p className='text-typo-black-4 font-deca text-base'>{dataLang?.S_title_input_bot_chat || 'S_title_input_bot_chat'}</p>
            </div>
            <div className='relative w-full z-[10000]'>
              <TextArea
                value={textUser}
                onChange={e => setTextUser(e?.target?.value)}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (textUser.trim() && sendChat === 1 && !isSendingMessage) {
                      handleSend();
                    }
                  }
                }}
                placeholder={dataLang?.S_placehoder_input_bot_chat}
                autoSize={{ minRows: 5, maxRows: 6 }}
                className={twMerge(
                  'w-full placeholder:font-deca font-deca font-normal text-sm text-[#1C252E]',
                  (sendChat !== 1 || isSendingMessage) && '!bg-gray-100 !text-gray-400 cursor-not-allowed'
                )}
                disabled={sendChat !== 1 || isSendingMessage}
              />
              <div className='absolute bottom-2 right-2 w-fit z-10'>
                <button
                  disabled={sendChat !== 1 || isSendingMessage || !textUser.trim()}
                  className={twMerge(
                    ' rounded-lg p-[10px] text-lg transition-all duration-1000 ease-in-out',
                    textUser && sendChat === 1 && !isSendingMessage
                      ? 'bg-linear-background-button-send text-white shadow-custom-inner-blue'
                      : 'bg-background-gray-4 text-typo-gray-6 shadow-none cursor-not-allowed opacity-50'
                  )}
                  onClick={() => handleSend()}
                >
                  {isSendingMessage ? <AiOutlineLoading3Quarters className='animate-spin' /> : <FaArrowUp />}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className={twMerge('space-y-6 min-h-full  w-full flex flex-col items-start', resultDataChatBot ? ' justify-center' : 'justify-end')}>
        <AnimatePresence mode='sync'>
          {messenger.map((msg, index) => (
            <Messenger
              key={index}
              isMe={msg.sender === 'user'}
              isLoading={msg.isPending}
              onAnimationComplete={() => {
                const isLast = index === messenger.length - 1;

                if (isLast && options?.type === 'radio') {
                  setAnimationCompleted(true);
                }
                if (isLast && msg.sender === 'ai' && !msg.hasResponse) {
                  setIsLastMessageAnimationDone(true);
                }
              }}
              ResponseAI={msg?.hasResponse ? response : null}
              options={options}
              isAnimationCompleted={isAnimationCompleted}
              botName={dataSetting?.assistant_fmrp_short ?? 'Fimo'}
              dataLang={dataLang}
              response={msg?.response}
              disableOptions={index < messenger.length - 1 || isLoadingGeneraAnswer}
            >
              {msg.text}
            </Messenger>
          ))}

          {/* Đã bỏ flow chọn option cũ */}
          {options.isFinished && !resultDataChatBot && isLastMessageAnimationDone && (
            <Messenger isMe={false} isLoading={false} icon={<LoadingDataChatBot />} nextText={true} botName={dataSetting?.assistant_fmrp_short ?? 'Fimo'} dataLang={dataLang}>
              {dataLang?.S_message_loading_import_data_bot || 'S_message_loading_import_data_bot'}
            </Messenger>
          )}
          {isLoadingGeneraAnswer && (
            <div>
              <Messenger isLoading={true} botName={dataSetting?.assistant_fmrp_short ?? 'Fimo'} dataLang={dataLang} />
            </div>
          )}
          <div key='end-marker' ref={endRef} />
        </AnimatePresence>
        {resultDataChatBot && <ResultChatBot productAnalysis={productAnalysis} onRedirect={onRedirect} onRetry={onRetry} dataLang={dataLang} />}
      </div>
    </Drawer>
  );
};

export default BoxChatAI;
