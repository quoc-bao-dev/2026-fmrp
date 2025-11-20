import { useQuery } from '@tanstack/react-query';
import apiChatbotSession from '@/Api/apiChatbot/apiChatbotSession';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} UseGetChatbotSessionOptions
 * @property {any} data - Dynamic value appended to the payload and used to enable the query
 * @property {import('@/Api/apiChatbot/apiChatbotSession').GetChatbotSessionPayload} [payload] - Additional payload fields
 * @property {boolean} [enabled=true] - Manual toggle in addition to the automatic data check
 * @property {Function} [onSuccess] - Callback invoked on success
 * @property {Function} [onError] - Callback invoked on error
 */

/**
 * Custom hook for Get Chatbot Session
 * @description Fetches chatbot session info with enable guard based on provided `data`
 * @param {UseGetChatbotSessionOptions} options - Hook options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('@/Api/apiChatbot/apiChatbotSession').GetChatbotSessionResponse>} React Query result object
 * @example
 * const { data, isLoading } = useGetChatbotSession({
 *   data: 'PRODUCT_ANALYSIS',
 *   payload: { version: 'v2' },
 *   enabled: !!authState?.auth,
 * });
 */
export const useGetChatbotSession = (options = {}) => {
  const showToast = useToast();
  const { data, payload = {}, enabled = true, onSuccess, onError } = options;

  const shouldEnable = Boolean(data) && enabled;
  const requestPayload = data === undefined ? payload : { ...payload, data };

  return useQuery({
    queryKey: ['apiGetChatbotSession', data, payload],
    queryFn: async () => {
      const response = await apiChatbotSession.apiGetChatbotSession(requestPayload);
      return response;
    },
    enabled: shouldEnable,
    onSuccess: response => {
      if (response?.isSuccess === false) {
        const message = response?.message || 'Failed to get chatbot session';
        showToast('error', message);
        if (onError) onError(new Error(message));
        return;
      }
      if (onSuccess) onSuccess(response);
    },
    onError: error => {
      showToast('error', 'An error occurred while fetching chatbot session');
      if (onError) onError(error);
    },
    retry: 3,
    retryDelay: 2000,
  });
};
