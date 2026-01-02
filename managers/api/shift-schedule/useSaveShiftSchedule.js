import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiShiftSchedule from '@/Api/apiShiftSchedule/apiShiftSchedule';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} SaveShiftSchedulePayload
 * @property {string|number} staff_id - Staff ID
 * @property {string} date - Date in YYYY-MM-DD format (e.g., "2025-12-31")
 * @property {string|number} shifts - Shift ID
 */

/**
 * @typedef {Object} SaveShiftScheduleResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} message - Response message
 */

/**
 * Custom hook for saving shift schedule
 * @description Manages shift schedule saving operations with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate schedule table query after success
 * @returns {Object} Hook return object
 * @returns {Function} returns.saveShiftSchedule - Function to save shift schedule
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { saveShiftSchedule, isLoading, data, error } = useSaveShiftSchedule({
 *   onSuccess: (response) => console.log('Shift schedule saved successfully'),
 *   onError: (error) => console.error('Failed to save shift schedule')
 * });
 *
 * // Save shift schedule
 * const handleSave = async () => {
 *   await saveShiftSchedule({
 *     staff_id: 77,
 *     date: "2025-12-31",
 *     shifts: 3
 *   });
 * };
 */
export const useSaveShiftSchedule = (options = {}) => {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const { onSuccess: onSuccessCallback, onError: onErrorCallback, invalidateQueries = true } = options;

  const saveShiftScheduleMutation = useMutation({
    mutationKey: ['api_save_shift_schedule'],
    mutationFn: async payload => {
      const res = await apiShiftSchedule.apiSaveShiftSchedule(payload);
      return res;
    },
    onSuccess: data => {
      if (data?.success === true) {
        showToast('success', data?.message || 'Lưu ca làm việc thành công');

        if (invalidateQueries) {
          // Invalidate và refetch schedule table query để cập nhật dữ liệu
          queryClient.invalidateQueries({ queryKey: ['apiGetScheduleTable'] });
          queryClient.refetchQueries({ queryKey: ['apiGetScheduleTable'] });
        }

        if (onSuccessCallback) {
          onSuccessCallback(data);
        }
      } else {
        showToast('error', data?.message || 'Lưu ca làm việc thất bại');
        const error = new Error(data?.message || 'Failed to save shift schedule');
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      }
    },
    onError: error => {
      showToast('error', 'Đã xảy ra lỗi khi lưu ca làm việc');
      if (onErrorCallback) {
        onErrorCallback(error);
      }
    },
  });

  const saveShiftSchedule = async payload => {
    saveShiftScheduleMutation.mutate(payload);
  };

  return {
    saveShiftSchedule,
    isLoading: saveShiftScheduleMutation.isPending,
    data: saveShiftScheduleMutation.data,
    error: saveShiftScheduleMutation.error,
  };
};
