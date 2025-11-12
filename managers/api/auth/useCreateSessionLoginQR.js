import { useMutation } from '@tanstack/react-query';
import apiLoginQR from '@/Api/apiLoginQR/apiLoginQR';
import useToast from '@/hooks/useToast';

/**
 * Custom hook for Create Session LoginQR
 * @description Manages createSession operation for QR login with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.createSession - Function to trigger create session
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {any} returns.data - Response data (typed later)
 * @returns {Error} returns.error - Error object if any
 * @example
 * const { createSession, isLoading, data, error } = useCreateSessionLoginQR({
 * 	onSuccess: (res) => console.log('Created session', res),
 * 	onError: (err) => console.error(err),
 * });
 *
 * // Trigger
 * createSession();
 */
export const useCreateSessionLoginQR = (options = {}) => {
  const showToast = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async payload => {
      const res = await apiLoginQR.createSession(payload || {});
      return res;
    },
    onSuccess: data => {
      // Keep toasts minimal until types are defined
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: error => {
      showToast('error', 'Không thể tạo phiên đăng nhập QR');
      if (options.onError) options.onError(error);
    },
  });

  const createSession = async payload => {
    createSessionMutation.mutate(payload || {});
  };

  return {
    createSession,
    isLoading: createSessionMutation.isPending,
    data: createSessionMutation.data,
    error: createSessionMutation.error,
  };
};
