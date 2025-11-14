import { useQuery } from '@tanstack/react-query';
import apiActiveRobotDetail from '@/Api/apiChatbot/apiActiveRobotDetail';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} UseActiveRobotDetailOptions
 * @property {string} data - Identifier appended to the endpoint path (required)
 * @property {boolean} [enabled=true] - Manually toggle the query (combined with data check)
 * @property {Function} [onSuccess] - Success callback
 * @property {Function} [onError] - Error callback
 */

/**
 * Custom hook for Get Active Robot Detail
 * @description Fetches chatbot robot activation detail with automatic enable condition based on `data`
 * @param {UseActiveRobotDetailOptions} options - Hook options
 * @returns {Object} Hook return object from useQuery
 * @example
 * const { data, isLoading } = useActiveRobotDetail({
 *   data: 'PRODUCT_ANALYSIS',
 *   enabled: !!authState?.auth,
 *   onSuccess: (response) => console.log(response),
 * });
 */
export const useActiveRobotDetail = (options = {}) => {
  const showToast = useToast();
  const { id, enabled = true, onSuccess, onError } = options;

  const shouldEnable = Boolean(id) && enabled;

  return useQuery({
    queryKey: ['apiActiveRobotDetail', id],
    queryFn: async () => {
      const res = await apiActiveRobotDetail.apiGetActiveRobotDetail({ data: id });
      return res;
    },
    enabled: shouldEnable,
    onSuccess: response => {
      if (response?.isSuccess !== false) {
        if (onSuccess) onSuccess(response);
      } else {
        const message = response?.message || 'Failed to load robot detail';
        showToast('error', message);
        if (onError) onError(new Error(message));
      }
    },
    onError: error => {
      showToast('error', 'An error occurred while fetching robot detail');
      if (onError) onError(error);
    },
    retry: 3,
    retryDelay: 2000,
  });
};
