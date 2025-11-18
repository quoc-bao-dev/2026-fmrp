import { useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { delay, calculateMessageRenderTime } from '@/utils/helpers/common';
import { _ServerInstance as axiosCustom } from '@/services/axios';
import { useHandleChatbotResponse } from '@/utils/helpers/handleChatbotResponse';

/**
 * Custom hook để xử lý next response trong chatbot
 * @param {Object} options - Object chứa các options cấu hình
 * @param {number} [options.delayTime=2000] - Thời gian delay trước khi fetch next message (ms)
 * @param {Function} [options.onError] - Callback khi có lỗi xảy ra
 * @param {Function} [options.onSuccess] - Callback khi fetch thành công
 * @param {boolean} [options.enableLogging=true] - Bật/tắt logging
 * @returns {Function} handleNext - Hàm xử lý next response
 */
const useHandleNext = options => {
  const dispatch = useDispatch();
  const { delayTime = 2000, onError, onSuccess, enableLogging = true } = options || {};
  const handleChatbotResponse = useHandleChatbotResponse();

  const dispatchRef = useRef(dispatch);
  const optionsRef = useRef(options);

  // Cập nhật ref khi options thay đổi
  useEffect(() => {
    dispatchRef.current = dispatch;
    optionsRef.current = options;
  }, [dispatch, options]);

  const handleNext = useCallback(
    async response => {
      const fetchNextMessage = async next => {
        const res = await axiosCustom('GET', next);
        return res.data;
      };

      const currentOptions = optionsRef.current;
      const currentDelayTime = currentOptions?.delayTime ?? delayTime;
      const currentEnableLogging = currentOptions?.enableLogging ?? enableLogging;

      if (currentEnableLogging) {
        console.log({ useHandleNext: response });
      }

      const next = response.next;
      if (next) {
        try {
          dispatchRef.current({ type: 'chatbot/setIsLoadingGeneraAnswer', payload: true });
          console.log('currentDelayTime');
          await delay(currentDelayTime);
          const nextResponse = await fetchNextMessage(next);

          dispatchRef.current({ type: 'chatbot/setIsLoadingGeneraAnswer', payload: false });

          // Xử lý response sử dụng hook chung
          handleChatbotResponse({ response: nextResponse });

          // Gọi callback onSuccess nếu có (gọi ở ngoài)
          if (currentOptions?.onSuccess) {
            currentOptions.onSuccess(nextResponse);
          }

          await delay(calculateMessageRenderTime(nextResponse.data.message));

          if (nextResponse.next) {
            handleNext(nextResponse);
          }
        } catch (err) {
          console.error('Lỗi khi gọi fetchNextMessage:', err);
          dispatchRef.current({ type: 'chatbot/setIsLoadingGeneraAnswer', payload: false });

          // Gọi callback onError nếu có
          if (currentOptions?.onError) {
            currentOptions.onError(err);
          }
        }
      }
    },
    [dispatch, delayTime, enableLogging, handleChatbotResponse]
  );

  return handleNext;
};

export default useHandleNext;
