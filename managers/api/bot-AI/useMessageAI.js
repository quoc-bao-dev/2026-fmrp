import apiChatAI from '@/Api/ai/apiChatAI';
import { useQuery } from '@tanstack/react-query';
import { _ServerInstance as axiosCustom } from '@/services/axios';

export const fetchStartMessageAI = async type => {
  try {
    const response = await apiChatAI.apiNewStartChat({
      data: { type },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API bắt đầu chat:', error);
    throw error;
  }
};

export const useStartMessageAI = ({ type, enable, authState }) => {
  return useQuery({
    queryKey: ['startChatAI', authState?.user_email || ''],
    queryFn: () => fetchStartMessageAI(type),
    enabled: enable,
  });
};

export const fetchNewMessageAI = async ({ type, nextStep, sessionId, message, chatScenariosId, step, params }) => {
  try {
    const response = await apiChatAI.apiChatTextBotAI({
      data: {
        type: type,
        step_next: nextStep,
        session_id: sessionId,
        message,
        chat_scenarios_id: chatScenariosId,
        step: step,
        params: params ?? null,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const completeStepChatBot = async ({ data, api }) => {
  try {
    const response = await apiChatAI.apiCompleteChatBot({ data, api });
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Gửi tin nhắn chatbot bằng FormData
 * @param {Object} params - Tham số gửi tin nhắn
 * @param {string} params.nextWait - URL endpoint để gửi tin nhắn
 * @param {Object|null} params.dataPost - Dữ liệu POST (sẽ được spread vào FormData)
 * @param {string|null} params.sessionRobot - Session robot ID
 * @param {string} params.message - Nội dung tin nhắn
 * @returns {Promise} Promise trả về response từ server
 */
export const sendChatbotMessage = async ({ nextWait, dataPost, sessionRobot, message }) => {
  if (!nextWait || !message) {
    throw new Error('nextWait và message là bắt buộc');
  }

  try {
    // Tạo FormData
    const formData = new FormData();

    // Thêm các field từ data_post (spread)
    if (dataPost && typeof dataPost === 'object') {
      Object.keys(dataPost).forEach(key => {
        formData.append(key, dataPost[key]);
      });
    }

    // Thêm session_robot
    if (sessionRobot) {
      formData.append('session_robot', sessionRobot);
    }

    // Thêm message
    formData.append('message', message.trim());

    // Gửi request POST với FormData
    const response = await axiosCustom('POST', nextWait, formData);

    // Log response
    console.log('=== Response từ server ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('========================');

    return response.data;
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw error;
  }
};
