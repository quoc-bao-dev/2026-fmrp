import { useQuery } from '@tanstack/react-query';
import apiInventory from '@/Api/apiManufacture/warehouse/inventory/apiInventory';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} GetDateExcelParams
 * @property {string} [warehouse_id] - Warehouse ID filter
 */

/**
 * @typedef {Object} GetDateExcelResponse
 * @property {boolean} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 * @property {Array} [data.items] - List of items for Excel template
 * @property {number} [status] - HTTP status code
 */

/**
 * Custom hook for getting Excel template data
 * @description Manages Excel template data fetching with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {GetDateExcelParams} [options.params] - Query parameters
 * @param {boolean} [options.enabled=true] - Whether the query is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - Response data
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch data
 * @example
 * // Basic usage
 * const { data, isLoading, error } = useGetDateExcel();
 *
 * // With warehouse filter
 * const { data, isLoading } = useGetDateExcel({
 *   params: { warehouse_id: "123" },
 *   onSuccess: (response) => console.log('Excel data loaded'),
 *   onError: (error) => console.error('Failed to load Excel data')
 * });
 *
 * // Conditional fetching
 * const { data, isLoading } = useGetDateExcel({
 *   params: { warehouse_id: selectedWarehouse },
 *   enabled: !!selectedWarehouse
 * });
 */
export const useGetDateExcel = (options = {}) => {
  const showToast = useToast();
  const { params = {}, enabled = true, onSuccess, onError } = options;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['apiGetDateExcel', params],
    queryFn: async () => {
      const res = await apiInventory.apiGetDateExcel(params);
      return res;
    },
    enabled,
    onSuccess: data => {
      if (data?.isSuccess) {
        if (onSuccess) onSuccess(data);
      } else {
        showToast('error', data?.message || 'Failed to get Excel data');
        if (onError) onError(new Error(data?.message || 'Failed to get Excel data'));
      }
    },
    onError: error => {
      showToast('error', 'An error occurred while fetching Excel data');
      if (onError) onError(error);
    },
    retry: 3,
    retryDelay: 2000,
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
