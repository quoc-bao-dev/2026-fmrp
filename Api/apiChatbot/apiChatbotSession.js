import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Record<string, any>} GetChatbotSessionPayload
 */

/**
 * @typedef {Record<string, any>} GetChatbotSessionResponse
 */

const apiChatbotSession = {
  /**
   * Get Chatbot Session API
   * @description Retrieves chatbot session metadata for a given data identifier
   * @param {GetChatbotSessionPayload} [payload={}] - Request payload forwarded to backend
   * @returns {Promise<GetChatbotSessionResponse>} Promise resolving to API response
   * @throws {Error} When the API call fails
   * @example
   * const response = await apiChatbotSession.apiGetChatbotSession({
   *   data: 'PRODUCT_ANALYSIS',
   * });
   */
  async apiGetChatbotSession(payload = {}) {
    const response = await axiosCustom('POST', `/api_web/api_chatbot/get_session?csrf_protection=true`, payload);
    return response.data;
  },
};

export default apiChatbotSession;
