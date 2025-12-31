import { useQuery } from '@tanstack/react-query';
import apiShiftSchedule from '@/Api/apiShiftSchedule/apiShiftSchedule';
import { optionsQuery } from '@/configs/optionsQuery';

/**
 * Custom hook for getting schedule table
 * @description Manages schedule table retrieval with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Object} [options.params] - Query parameters for the API call
 * @param {string} [options.params.date] - Start date filter (YYYY-MM-DD format)
 * @param {number|string} [options.params.branch_id] - Branch ID filter
 * @param {number|string} [options.params.staff_id] - Staff ID filter
 * @param {boolean} [options.enabled=true] - Whether the query is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data with structure: { success: boolean, data: { headers: [], rows: [] } }
 * @returns {Object} [returns.data.data.headers] - Array of schedule headers (days) with label and date
 * @returns {Object} [returns.data.data.rows] - Array of staff schedule rows with staff_id, staff_name, avatar, and shifts
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch the data
 * @example
 * // Basic usage
 * const { data, isLoading, error } = useGetScheduleTable({
 *   enabled: true
 * });
 *
 * // Access data structure
 * if (data?.success) {
 *   const headers = data.data.headers; // [{ label: "T2 29/12", date: "2025-12-29" }, ...]
 *   const rows = data.data.rows; // [{ staff_id: "1", staff_name: "foso1", shifts: [[], [], ...] }, ...]
 * }
 *
 * // With query parameters
 * const { data, isLoading } = useGetScheduleTable({
 *   params: { date: "2025-12-29", branch_id: 1 },
 *   enabled: true,
 *   onSuccess: (data) => console.log('Schedule loaded:', data.data.rows)
 * });
 */
export const useGetScheduleTable = (options = {}) => {
  const { params, enabled = true, onSuccess, onError } = options;

  const fetchScheduleTable = async () => {
    try {
      const response = await apiShiftSchedule.apiGetScheduleTable(params);
      return response;
    } catch (error) {
      throw new Error(error);
    }
  };

  const query = useQuery({
    queryKey: ['apiGetScheduleTable', params],
    queryFn: fetchScheduleTable,
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
