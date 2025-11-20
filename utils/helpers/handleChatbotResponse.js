import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Custom hook để xử lý response từ chatbot API
 * Xử lý các dispatch actions chung cho chatbot response
 *
 * @param {Object} params - Object chứa response
 * @param {Object} params.response - Response object từ API
 *
 * @example
 * const handleResponse = useHandleChatbotResponse();
 * handleResponse({ response: nextResponse });
 */
export const useHandleChatbotResponse = () => {
  const dispatch = useDispatch();

  return useCallback(
    ({ response }) => {
      // Xác định data object và response object để dùng trong payload
      // Nếu response có data.message thì dùng response.data làm response trong payload
      // Ngược lại dùng response
      const data = response?.data;
      const responseForPayload = data?.message ? response?.data : response;

      // Xử lý message nếu có (chỉ khi có data)
      if (data?.message) {
        dispatch({
          type: 'chatbot/addAiMessageOnly',
          payload: {
            text: data.message,
            response: responseForPayload,
          },
        });
      }

      // Set data_post vào store nếu có (dữ liệu gửi kèm cho next_wait)
      if (data?.data_post) {
        dispatch({
          type: 'chatbot/setDataPost',
          payload: data.data_post,
        });
      }

      // Set session_robot vào store nếu có (dùng để gửi kèm tin nhắn)
      if (data?.session_robot) {
        dispatch({
          type: 'chatbot/setSessionRobot',
          payload: data.session_robot,
        });
      }

      // Set next_wait vào store nếu có
      if (response?.next_wait) {
        dispatch({
          type: 'chatbot/setNextWait',
          payload: response.next_wait,
        });
      }

      // Set send_chat vào store nếu có
      if (response?.send_chat !== undefined && !!response?.next_wait) {
        dispatch({
          type: 'chatbot/setSendChat',
          payload: response.send_chat,
        });
      }

      // Set is_chat vào store nếu có
      if (response?.is_chat !== undefined && !!response?.next_wait) {
        dispatch({
          type: 'chatbot/setIsChat',
          payload: response.is_chat,
        });
      }
    },
    [dispatch]
  );
};
