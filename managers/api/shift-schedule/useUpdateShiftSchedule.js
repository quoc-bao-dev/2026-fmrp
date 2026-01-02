import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiShiftSchedule from '@/Api/apiShiftSchedule/apiShiftSchedule';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} UpdateShiftSchedulePayload
 * @property {string|number} staff_id - Staff ID
 * @property {string} date - Date in YYYY-MM-DD format (e.g., "2025-12-31")
 * @property {string|number} shift_id - Old shift ID (ID of the shift to be updated)
 * @property {string|number} new_shift_id - New shift ID (ID of the new shift)
 */

/**
 * @typedef {Object} UpdateShiftScheduleResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} message - Response message
 */

/**
 * Custom hook for updating shift schedule
 * @description Manages shift schedule update operations with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate schedule table query after success
 * @returns {Object} Hook return object
 * @returns {Function} returns.updateShiftSchedule - Function to update shift schedule
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { updateShiftSchedule, isLoading, data, error } = useUpdateShiftSchedule({
 *   onSuccess: (response) => console.log('Shift schedule updated successfully'),
 *   onError: (error) => console.error('Failed to update shift schedule')
 * });
 *
 * // Update shift schedule
 * const handleUpdate = async () => {
 *   await updateShiftSchedule({
 *     staff_id: 77,
 *     date: "2025-12-31",
 *     shift_id: 3,
 *     new_shift_id: 5
 *   });
 * };
 */
export const useUpdateShiftSchedule = (options = {}) => {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const { onSuccess: onSuccessCallback, onError: onErrorCallback, invalidateQueries = true } = options;

  const updateShiftScheduleMutation = useMutation({
    mutationKey: ['api_update_shift_schedule'],
    mutationFn: async payload => {
      const res = await apiShiftSchedule.apiUpdateShiftSchedule(payload);
      return res;
    },
    onSuccess: data => {
      if (data?.success === true) {
        showToast('success', data?.message || 'Cập nhật ca làm việc thành công');

        if (invalidateQueries) {
          // Invalidate và refetch schedule table query để cập nhật dữ liệu
          queryClient.invalidateQueries({ queryKey: ['apiGetScheduleTable'], exact: false });
          queryClient.refetchQueries({ queryKey: ['apiGetScheduleTable'], exact: false });
        }

        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      } else {
        showToast('error', data?.message || 'Cập nhật ca làm việc thất bại');
        const error = new Error(data?.message || 'Failed to update shift schedule');
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      }
    },
    onError: error => {
      showToast('error', 'Đã xảy ra lỗi khi cập nhật ca làm việc');
      if (onErrorCallback) {
        onErrorCallback(error);
      }
    },
  });

  const updateShiftSchedule = async payload => {
    updateShiftScheduleMutation.mutate(payload);
  };

  return {
    updateShiftSchedule,
    isLoading: updateShiftScheduleMutation.isPending,
    data: updateShiftScheduleMutation.data,
    error: updateShiftScheduleMutation.error,
  };
};
