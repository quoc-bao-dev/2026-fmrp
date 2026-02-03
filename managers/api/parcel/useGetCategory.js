import { useQuery } from '@tanstack/react-query';
import apiCategory from '@/Api/apiParcel/apiCategory';
import { optionsQuery } from '@/configs/optionsQuery';

/**
 * @typedef {Object} CategoryData
 * @property {string|number} id - Category ID (0 for "Tất cả", "1" for "Sản Xuất", etc.)
 * @property {string} name - Category name
 */

/**
 * @typedef {Object} GetCategoryResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {CategoryData[]} data - Array of category data objects
 */

/**
 * Custom hook for getting parcel categories
 * @description Manages category retrieval with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Object} [options.params] - Query parameters for the API call
 * @param {string} [options.params.search] - Search term to filter categories
 * @param {number} [options.params.limit] - Limit number of results
 * @param {number} [options.params.offset] - Offset for pagination
 * @param {boolean} [options.enabled=true] - Whether the query is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {GetCategoryResponse} returns.data - Response data with structure: { success: boolean, data: CategoryData[] }
 * @returns {boolean} [returns.data.success] - Success status
 * @returns {CategoryData[]} [returns.data.data] - Array of category data objects with id and name
 * @returns {Error} returns.error - Error object if any
 * @returns {Function} returns.refetch - Function to refetch the data
 * @example
 * // Basic usage
 * const { data, isLoading, error } = useGetCategory({
 *   enabled: true
 * });
 *
 * // With query parameters
 * const { data, isLoading } = useGetCategory({
 *   params: { search: "electronics", limit: 10 },
 *   enabled: true,
 *   onSuccess: (data) => console.log('Categories loaded:', data.data)
 * });
 *
 * // Access data structure
 * if (data?.success) {
 *   const categories = data.data; // [{ id: 0, name: "Tất cả" }, { id: "1", name: "Sản Xuất" }, ...]
 *   categories.forEach(category => {
 *     console.log(`${category.name}: ${category.id}`);
 *   });
 * }
 */
export const useGetCategory = (options = {}) => {
    const { params, enabled = true, onSuccess, onError } = options;

    const fetchCategory = async () => {
        try {
            const response = await apiCategory.apiGetCategory(params);
            return response;
        } catch (error) {
            throw new Error(error);
        }
    };

    const query = useQuery({
        queryKey: ['apiGetCategory', params],
        queryFn: fetchCategory,
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
