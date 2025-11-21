import { useMutation } from '@tanstack/react-query';
import apiLoginQR from '@/Api/apiLoginQR/apiLoginQR';
import useToast from '@/hooks/useToast';

/**
 * Custom hook for Create SessionApp LoginQR
 * @description Manages createSessionApp operation for QR login (web → app) with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.createSessionApp - Function to trigger createSessionApp
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {any} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * const { createSessionApp, isLoading, data, error } = useCreateSessionAppLoginQR({
 *   onSuccess: (res) => console.log('Created session app', res),
 *   onError: (err) => console.error(err),
 * });
 *
 * // Trigger
 * createSessionApp({ session_web: '123123' });
 */
export const useCreateSessionAppLoginQR = (options = {}) => {
  const showToast = useToast();

  const createSessionAppMutation = useMutation({
    mutationFn: async payload => {
      const res = await apiLoginQR.createSessionApp(payload);
      return res;
    },
    onSuccess: data => {
      if (data?.isSuccess) {
        // showToast('success', data?.message || 'Tạo phiên đăng nhập QR (App) thành công');
      } else {
        // showToast('error', data?.message || 'Tạo phiên đăng nhập QR (App) thất bại');
      }
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: error => {
      //   showToast('error', 'Không thể tạo phiên đăng nhập QR (App)');
      if (options.onError) options.onError(error);
    },
  });

  const createSessionApp = async payload => {
    createSessionAppMutation.mutate(payload);
  };

  return {
    createSessionApp,
    isLoading: createSessionAppMutation.isPending,
    data: createSessionAppMutation.data,
    error: createSessionAppMutation.error,
  };
};
