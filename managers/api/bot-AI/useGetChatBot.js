import { useQuery } from '@tanstack/react-query';
import apiChatBot from '@/Api/apiChatbot/apiChatBot';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} UseGetChatBotOptions
 * @property {import('@/Api/apiChatbot/apiChatBot').GetChatBotParams} [params] - Query parameters forwarded to the API
 * @property {boolean} [enabled=true] - Whether the query is enabled
 * @property {Function} [onSuccess] - Callback invoked when the request succeeds
 * @property {Function} [onError] - Callback invoked when the request fails
 */

/**
 * Custom hook for Get ChatBot
 * @description Manages chatbot configuration fetching with loading states and error handling
 * @param {UseGetChatBotOptions} [options] - Hook options
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - API response data
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch data manually
 * @example
 * // Basic usage
 * const { data, isLoading } = useGetChatBot();
 *
 * // Fetch with query params and custom callbacks
 * const { data, refetch } = useGetChatBot({
 *   params: { type: 'PRODUCT_ANALYSIS' },
 *   enabled: !!authState?.auth,
 *   onSuccess: (response) => console.log('Chatbot loaded', response),
 *   onError: (error) => console.error('Failed to load chatbot', error),
 * });
 */

export const useGetChatBot = (options = {}) => {
  const showToast = useToast();
  const { params = {}, enabled = true, onSuccess, onError } = options;

  const queryResult = useQuery({
    queryKey: ['apiGetChatBot', params],
    queryFn: async () => {
      const res = await apiChatBot.apiGetChatBot(params);
      return res;
    },
    enabled,
    onSuccess: data => {
      if (data?.isSuccess) {
        if (onSuccess) onSuccess(data);
      } else {
        const message = data?.message || 'Failed to load chatbot configuration';
        showToast('error', message);
        if (onError) onError(new Error(message));
      }
    },
    onError: error => {
      showToast('error', 'An error occurred while fetching chatbot configuration');
      if (onError) onError(error);
    },
    retry: 3,
    retryDelay: 2000,
  });

  return queryResult;
};
