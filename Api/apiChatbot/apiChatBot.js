import { _ServerInstance as axiosCustom } from '@/services/axios';

/**
 * @typedef {Object} GetChatBotParams
 * @property {string} [type] - Optional chatbot type identifier (e.g. PRODUCT_ANALYSIS)
 * @property {string} [scenario_id] - Optional scenario identifier to retrieve a specific flow
 */

/**
 * @typedef {Object} ChatBotData
 * @property {any} [config] - Dynamic configuration payload defined by the backend
 * @property {any} [scenarios] - Chatbot scenarios or conversation definitions
 * @property {any} [metadata] - Additional metadata returned by the API
 */

/**
 * @typedef {Object} GetChatBotResponse
 * @property {boolean} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message from the server
 * @property {ChatBotData} [data] - Chatbot configuration data
 */

const apiChatBot = {
  /**
   * Get ChatBot API
   * @description Fetches chatbot configuration and available scenarios from the server
   * @param {GetChatBotParams} [params={}] - Optional query parameters passed to the endpoint
   * @returns {Promise<GetChatBotResponse>} Promise that resolves to chatbot data
   * @throws {Error} When the API call fails
   * @example
   * // Fetch default chatbot definition
   * const response = await apiChatBot.apiGetChatBot();
   *
   * // Fetch chatbot definition by type
   * const response = await apiChatBot.apiGetChatBot({ type: 'PRODUCT_ANALYSIS' });
   */
  async apiGetChatBot(params = {}) {
    const response = await axiosCustom('GET', `/api_web/Api_chatbot/GetChatBot?csrf_protection=true`, {
      params,
    });
    return response.data;
  },
};

export default apiChatBot;
