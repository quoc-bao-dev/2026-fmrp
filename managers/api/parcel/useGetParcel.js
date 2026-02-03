import { useQuery } from '@tanstack/react-query';
import apiParcel from '@/Api/apiParcel/apiParcel';
import { optionsQuery } from '@/configs/optionsQuery';

/**
 * Custom hook for getting parcels
 * @description Manages parcel retrieval with loading states and error handling, optionally filtered by category ID
 * @param {Object} [options] - Hook options
 * @param {Object} [options.params] - Query parameters for the API call
 * @param {string|number} [options.params.id_category] - Category ID to filter parcels
 * @param {boolean} [options.enabled=true] - Whether the query is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data with structure: { isSuccess: boolean, data: ParcelData[] }
 * @returns {boolean} [returns.data.isSuccess] - Success status
 * @returns {ParcelData[]} [returns.data.data] - Array of parcel data objects
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch the data
 * @example
 * // Basic usage - get all parcels
 * const { data, isLoading, error } = useGetParcel({
 *   enabled: true
 * });
 *
 * // With category filter
 * const { data, isLoading } = useGetParcel({
 *   params: { id_category: "1" },
 *   enabled: true,
 *   onSuccess: (data) => console.log('Parcels loaded:', data.data)
 * });
 *
 * // Access data structure
 * if (data?.isSuccess) {
 *   const parcels = data.data; // [{ id: "1", id_category: "1", name: "Parcel 1", ... }, ...]
 *   parcels.forEach(parcel => {
 *     console.log(`${parcel.name} (Category: ${parcel.id_category})`);
 *   });
 * }
 */
export const useGetParcel = (options = {}) => {
    const { params, enabled = true, onSuccess, onError } = options;

    const fetchParcel = async () => {
        try {
            const response = await apiParcel.apiGetParcel(params);
            return response;
        } catch (error) {
            throw new Error(error);
        }
    };

    const query = useQuery({
        queryKey: ['apiGetParcel', params],
        queryFn: fetchParcel,
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
