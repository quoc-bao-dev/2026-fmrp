import { useQuery } from "@tanstack/react-query";
import apiTransferKeepStock from "@/Api/apiSalesExportProduct/salesOrder/apiTransferKeepStock";
import { optionsQuery } from "@/configs/optionsQuery";

/**
 * Custom hook for getting transfer keep stock detail
 * @description Manages transfer keep stock detail fetching with loading states and error handling
 * @param {Object} options - Hook options
 * @param {number|string} options.id - Transfer keep stock order ID
 * @param {boolean} [options.enabled=true] - Whether the query is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - Transfer keep stock data
 * @returns {boolean} returns.isFetching - Loading state
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { data, isFetching, error } = useGetTransferKeepStock({
 *   id: 178,
 *   enabled: true
 * });
 *
 * // With callbacks
 * const { data, isFetching } = useGetTransferKeepStock({
 *   id: 178,
 *   onSuccess: (data) => console.log('Transfer loaded:', data),
 *   onError: (error) => console.error('Failed to load:', error)
 * });
 */
export const useGetTransferKeepStock = ({ id, enabled = true, onSuccess, onError }) => {
    return useQuery({
        queryKey: ['api_transfer_keep_stock', id],
        queryFn: async () => {
            const res = await apiTransferKeepStock.apiGetTransferKeepStock(id);
            return res;
        },
        enabled: enabled && !!id,
        ...optionsQuery,
        onSuccess: (data) => {
            if (data?.isSuccess && onSuccess) {
                onSuccess(data);
            }
        },
        onError: (error) => {
            if (onError) {
                onError(error);
            }
        }
    });
};
