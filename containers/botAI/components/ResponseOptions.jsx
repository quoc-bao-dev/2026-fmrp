'use client';
import CheckIconMessenger from '@/components/icons/common/CheckIconMessenger';
import { isAiSender, isUserSender } from '@/constants/TypeChatBot/chatbotResponseTypes';
import useHandleNext from '@/managers/api/bot-AI/useHandleNext';
import { _ServerInstance as axiosCustom } from '@/services/axios';
import { calculateMessageRenderTime, delay } from '@/utils/helpers/common';
import { useHandleChatbotResponse } from '@/utils/helpers/handleChatbotResponse';
import { motion } from 'framer-motion';
import parse from 'html-react-parser';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import SelectAnswer from './SelectAnswer';

const ResponseOptions = ({ response, onSelectOption, disabled }) => {
  const dispatch = useDispatch();
  const handleNext = useHandleNext();
  const [loadingOptionId, setLoadingOptionId] = useState(null);
  const handleChatbotResponse = useHandleChatbotResponse();

  const handleSelectOption = async (option, optionKey) => {
    if (loadingOptionId !== null) return;
    setLoadingOptionId(optionKey);
    onSelectOption?.(option);
    const { next } = option;

    // Xử lý next nếu có
    if (next && typeof next === 'string') {
      try {
        // Fetch next response
        const res = await axiosCustom('GET', next);
        setLoadingOptionId(null);

        const nextResponse = res.data;

        if (nextResponse?.data) {
          const messageData = nextResponse.data;

          // Dựa vào type_send để xác định ai gửi và dispatch action tương ứng
          if (isAiSender(messageData.type_send)) {
            // AI gửi - thêm message AI
            // Delay show loading
            dispatch({ type: 'chatbot/setIsLoadingGeneraAnswer', payload: true });
            await delay(2000);
            // Tắt loading
            dispatch({ type: 'chatbot/setIsLoadingGeneraAnswer', payload: false });

            // xử lý response ở đây
            handleChatbotResponse({ response: nextResponse });
            // Delay để tính thời gian render message (chỉ cho AI message)
            await delay(calculateMessageRenderTime(messageData.message));
          } else if (isUserSender(messageData.type_send)) {
            // Người dùng gửi - thêm message user (không cần delay)
            dispatch({
              type: 'chatbot/addUserMessage',
              payload: messageData.message,
            });
          }

          // Check trong nextResponse nếu có next thì gọi handleNext
          if (nextResponse.next) {
            handleNext(nextResponse);
          }
        }
      } catch (err) {
        console.error('Lỗi khi gọi next response:', err);
        dispatch({ type: 'chatbot/setIsLoadingGeneraAnswer', payload: false });
      } finally {
        setLoadingOptionId(null);
      }
    } else {
      setLoadingOptionId(null);
    }
  };

  if (!response?.options || !Array.isArray(response.options) || response.options.length === 0) {
    return null;
  }

  if (response?.event_show !== 'select') {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }} className='mt-4 w-full flex flex-col gap-y-3'>
      {response.options.map((option, index) => {
        const optionContent = parse(option.content || option.name || '');
        const optionKey = option.id ?? index;
        const isDisabled = !option.next || typeof option.next !== 'string' || disabled || loadingOptionId !== null;

        return (
          <SelectAnswer
            key={optionKey}
            icon={<CheckIconMessenger />}
            typeAnswer={1}
            onClick={() => {
              handleSelectOption(option, optionKey);
            }}
            stepNext={option.next && typeof option.next === 'string' ? option.next : null}
            disabled={isDisabled}
            isLoading={loadingOptionId === optionKey}
          >
            {optionContent}
          </SelectAnswer>
        );
      })}
    </motion.div>
  );
};

export default ResponseOptions;
