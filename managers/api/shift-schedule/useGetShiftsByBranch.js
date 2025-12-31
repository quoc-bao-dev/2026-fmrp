import { useQuery } from '@tanstack/react-query';
import apiShiftSchedule from '@/Api/apiShiftSchedule/apiShiftSchedule';
import { optionsQuery } from '@/configs/optionsQuery';

/**
 * Custom hook for getting shifts by branch
 * @description Manages shifts retrieval filtered by branch IDs with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Object} [options.params] - Query parameters for the API call
 * @param {number[]|string[]} [options.params.branch_id] - Array of branch IDs to filter shifts
 * @param {boolean} [options.enabled=true] - Whether the query is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data with structure: { success: boolean, data: ShiftData[] }
 * @returns {ShiftData[]} [returns.data.data] - Array of shift data objects with id, name, time_start, time_end, branch_id
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch the data
 * @example
 * // Basic usage with single branch
 * const { data, isLoading, error } = useGetShiftsByBranch({
 *   params: { branch_id: [59] },
 *   enabled: true
 * });
 *
 * // With multiple branches
 * const { data, isLoading } = useGetShiftsByBranch({
 *   params: { branch_id: [59, 61] },
 *   enabled: true,
 *   onSuccess: (data) => console.log('Shifts loaded:', data.data)
 * });
 *
 * // Access data structure
 * if (data?.success) {
 *   const shifts = data.data; // [{ id: "3", name: "Ca sáng 2", time_start: "08:00:00", time_end: "12:30:00", branch_id: "61" }, ...]
 *   shifts.forEach(shift => {
 *     console.log(`${shift.name}: ${shift.time_start} - ${shift.time_end}`);
 *   });
 * }
 */
export const useGetShiftsByBranch = (options = {}) => {
  const { params, enabled = true, onSuccess, onError } = options;

  const fetchShiftsByBranch = async () => {
    try {
      const response = await apiShiftSchedule.apiGetShiftsByBranch(params);
      return response;
    } catch (error) {
      throw new Error(error);
    }
  };

  const query = useQuery({
    queryKey: ['apiGetShiftsByBranch', params],
    queryFn: fetchShiftsByBranch,
    enabled: enabled,
    ...optionsQuery,
    onSuccess: data => {
      if (onSuccess) onSuccess(data);
    },
    onError: error => {
      if (onError) onError(error);
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
