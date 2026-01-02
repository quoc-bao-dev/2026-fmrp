import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiShiftSchedule from '@/Api/apiShiftSchedule/apiShiftSchedule';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} DeleteShiftSchedulePayload
 * @property {string|number} staff_id - Staff ID
 * @property {string} date - Date in YYYY-MM-DD format (e.g., "2025-12-31")
 * @property {string|number} shift_id - Shift ID
 */

/**
 * @typedef {Object} DeleteShiftScheduleResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} message - Response message
 */

/**
 * Custom hook for deleting shift schedule
 * @description Manages shift schedule deletion operations with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate schedule table query after success
 * @returns {Object} Hook return object
 * @returns {Function} returns.deleteShiftSchedule - Function to delete shift schedule
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { deleteShiftSchedule, isLoading, data, error } = useDeleteShiftSchedule({
 *   onSuccess: (response) => console.log('Shift schedule deleted successfully'),
 *   onError: (error) => console.error('Failed to delete shift schedule')
 * });
 *
 * // Delete shift schedule
 * const handleDelete = async () => {
 *   await deleteShiftSchedule({
 *     staff_id: 77,
 *     date: "2025-12-31",
 *     shift_id: 3
 *   });
 * };
 */
export const useDeleteShiftSchedule = (options = {}) => {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const { onSuccess: onSuccessCallback, onError: onErrorCallback, invalidateQueries = true } = options;

  const deleteShiftScheduleMutation = useMutation({
    mutationKey: ['api_delete_shift_schedule'],
    mutationFn: async payload => {
      const res = await apiShiftSchedule.apiDeleteShiftSchedule(payload);
      return res;
    },
    onSuccess: data => {
      if (data?.success === true) {
        showToast('success', data?.message || 'Xóa ca làm việc thành công');

        if (invalidateQueries) {
          // Invalidate và refetch schedule table query để cập nhật dữ liệu
          queryClient.invalidateQueries({ queryKey: ['apiGetScheduleTable'], exact: false });
          queryClient.refetchQueries({ queryKey: ['apiGetScheduleTable'], exact: false });
        }

        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      } else {
        showToast('error', data?.message || 'Xóa ca làm việc thất bại');
        const error = new Error(data?.message || 'Failed to delete shift schedule');
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      }
    },
    onError: error => {
      showToast('error', 'Đã xảy ra lỗi khi xóa ca làm việc');
      if (onErrorCallback) {
        onErrorCallback(error);
      }
    },
  });

  const deleteShiftSchedule = async payload => {
    deleteShiftScheduleMutation.mutate(payload);
  };

  return {
    deleteShiftSchedule,
    isLoading: deleteShiftScheduleMutation.isPending,
    data: deleteShiftScheduleMutation.data,
    error: deleteShiftScheduleMutation.error,
  };
};
