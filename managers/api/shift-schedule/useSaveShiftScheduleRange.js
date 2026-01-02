import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiShiftSchedule from '@/Api/apiShiftSchedule/apiShiftSchedule';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} SaveShiftScheduleRangePayload
 * @property {string} start_date - Start date in YYYY-MM-DD format (e.g., "2025-12-29")
 * @property {string} end_date - End date in YYYY-MM-DD format (e.g., "2025-12-31")
 * @property {Array<string|number>} staff_id - Array of staff IDs
 * @property {string|number} shift_id - Shift ID
 */

/**
 * @typedef {Object} SaveShiftScheduleRangeResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} message - Response message
 */

/**
 * Custom hook for saving shift schedule range
 * @description Manages shift schedule range saving operations with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate schedule table query after success
 * @returns {Object} Hook return object
 * @returns {Function} returns.saveShiftScheduleRange - Function to save shift schedule range
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { saveShiftScheduleRange, isLoading, data, error } = useSaveShiftScheduleRange({
 *   onSuccess: (response) => console.log('Shift schedules saved successfully'),
 *   onError: (error) => console.error('Failed to save shift schedules')
 * });
 *
 * // Save shift schedule range
 * const handleSave = async () => {
 *   await saveShiftScheduleRange({
 *     start_date: "2025-12-29",
 *     end_date: "2025-12-31",
 *     staff_id: [77, 78, 79],
 *     shift_id: 3
 *   });
 * };
 */
export const useSaveShiftScheduleRange = (options = {}) => {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const { onSuccess: onSuccessCallback, onError: onErrorCallback, invalidateQueries = true } = options;

  const saveShiftScheduleRangeMutation = useMutation({
    mutationKey: ['api_save_shift_schedule_range'],
    mutationFn: async payload => {
      const res = await apiShiftSchedule.apiSaveShiftScheduleRange(payload);
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
        const error = new Error(data?.message || 'Failed to save shift schedule range');
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

  const saveShiftScheduleRange = async payload => {
    saveShiftScheduleRangeMutation.mutate(payload);
  };

  return {
    saveShiftScheduleRange,
    isLoading: saveShiftScheduleRangeMutation.isPending,
    data: saveShiftScheduleRangeMutation.data,
    error: saveShiftScheduleRangeMutation.error,
  };
};
