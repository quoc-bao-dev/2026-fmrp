import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import apiPrint from '@/Api/apiPrint/apiPrint';
import { optionsQuery } from '@/configs/optionsQuery';

/**
 * Custom hook for getting print configuration
 * @description Manages print config retrieval operations with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.enabled=true] - Whether the query is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isFetching - Fetching state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch data
 * @example
 * // Basic usage
 * const { data, isLoading, error, refetch } = useGetPrintConfig({
 *   enabled: true,
 *   onSuccess: (data) => console.log('Config retrieved successfully'),
 *   onError: (error) => console.error('Failed to get config')
 * });
 *
 * // Conditional fetching
 * const { data } = useGetPrintConfig({
 *   enabled: shouldFetch
 * });
 */
export const useGetPrintConfig = (options = {}) => {
  const fetchPrintConfig = async () => {
    try {
      const res = await apiPrint.getConfig({});
      return res;
    } catch (error) {
      throw new Error(error);
    }
  };

  const query = useQuery({
    queryKey: ['apiPrintConfig'],
    queryFn: () => fetchPrintConfig(),
    enabled: options.enabled !== undefined ? options.enabled : true,
    ...optionsQuery,
  });

  return query;
};
